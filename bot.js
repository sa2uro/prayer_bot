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

async function checkPrayerTimes() {
    const nowRiyadh = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    console.log(`[فحص] الوقت الحالي بتوقيت الرياض: ${nowRiyadh.toLocaleTimeString('ar-EG', { hour12: false })}`);

    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=4');
        const data = await response.json();
        const timings = data.data.timings;

        console.log(`[نجاح] تم جلب المواقيت بنجاح (الفجر: ${timings.Fajr}، الظهر: ${timings.Dhuhr}، العصر: ${timings.Asr}، المغرب: ${timings.Maghrib}، العشاء: ${timings.Isha})`);

        const prayers = [
            { name: "الفجر", time: timings.Fajr },
            { name: "الظهر", time: timings.Dhuhr },
            { name: "العصر", time: timings.Asr },
            { name: "المغرب", time: timings.Maghrib },
            { name: "العشاء", time: timings.Isha }
        ];

        let messageToSend = "";
        let prayerName = "";

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerDate = new Date(nowRiyadh.getFullYear(), nowRiyadh.getMonth(), nowRiyadh.getDate(), hours, minutes, 0);

            const timeDifferenceInMs = prayerDate.getTime() - nowRiyadh.getTime();
            const timeDifferenceInMinutes = Math.ceil(timeDifferenceInMs / 1000 / 60);

            if (timeDifferenceInMinutes === 0 || (nowRiyadh.getHours() === hours && nowRiyadh.getMinutes() === minutes)) {
                messageToSend = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                prayerName = prayer.name;
                break;
            } 
            else if (timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 5) {
                messageToSend = `[${prayer.time}] متبقي ${timeDifferenceInMinutes} دقائق على صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                prayerName = prayer.name;
                break;
            }
        }

        if (messageToSend !== "") {
            console.log(`[جاري الاتصال] محاولة الاتصال بتويتش لإرسال رسالة صلاة ${prayerName}...`);
            await client.connect();
            await client.say(channel, messageToSend);
            console.log(`[نجاح] تم إرسال الرسالة إلى الشات بنجاح: ${messageToSend}`);
            
            // نمهل الكود ثانيتين لضمان خروج البيانات من السيرفر تماماً قبل قطع الاتصال والإغلاق
            setTimeout(async () => {
                try {
                    await client.disconnect();
                } catch (e) {}
                console.log("[إغلاق] تم إنهاء الرن بنجاح.");
                process.exit(0);
            }, 2000);

        } else {
            console.log("[معلومة] لا يوجد أذان حالي أو قريب في الـ 5 دقائق القادمة، لم يتم إرسال أي رسائل.");
            process.exit(0);
        }

    } catch (error) {
        console.error("[خطأ] فشل في العملية:", error);
        process.exit(1);
    }
}

checkPrayerTimes();
