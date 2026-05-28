const fetch = require('node-fetch');
const tmi = require('tmi.js');

const channel = process.env.TWITCH_CHANNEL || '#sa2uro';
const oauthToken = process.env.TWITCH_OAUTH_TOKEN;

const client = new tmi.Client({
    options: { debug: false },
    identity: {
        username: channel.replace('#', ''),
        password: oauthToken
    },
    channels: [channel]
});

let sentPrayersToday = [];
let lastCheckDate = null;

async function checkPrayerTimes() {
    const nowRiyadh = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    const currentDateStr = nowRiyadh.toDateString();

    if (lastCheckDate !== currentDateStr) {
        sentPrayersToday = [];
        lastCheckDate = currentDateStr;
    }

    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=4');
        const data = await response.json();
        const timings = data.data.timings;

        const prayers = [
            { name: "الفجر", time: timings.Fajr },
            { name: "الظهر", time: timings.Dhuhr },
            { name: "العصر", time: timings.Asr },
            { name: "المغرب", time: timings.Maghrib },
            { name: "العشاء", time: timings.Isha }
        ];

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            
            if (nowRiyadh.getHours() === hours && nowRiyadh.getMinutes() === minutes) {
                if (!sentPrayersToday.includes(prayer.name)) {
                    const messageToSend = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                    console.log(`[جاري الإرسال] ${messageToSend}`);
                    await client.say(channel, messageToSend);
                    sentPrayersToday.push(prayer.name);
                    break;
                }
            }
        }

    } catch (error) {
        console.error("[خطأ] فشل في جلب المواقيت:", error);
    }
}

async function startBot() {
    console.log("[بدء التشغيل] جاري الاتصال بتويتش...");
    await client.connect();
    console.log("[نجاح] متصل بتويتش. بانتظار مواقيت الصلاة...");

    // يفحص كل دقيقة عشان يضمن الدقة في التوقيت
    setInterval(checkPrayerTimes, 60000);
}

startBot();
