const tmi = require('tmi.js');
const fetch = require('node-fetch');

const token = process.env.TWITCH_OAUTH_TOKEN;
const channel = process.env.TWITCH_CHANNEL;

const client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: "noura_mosque", 
        password: token
    },
    channels: [channel]
});

client.connect();

async function sendPrayerMessage() {
    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=4');
        const data = await response.json();
        const timings = data.data.timings;

        const prayers = [
            { name: 'الفجر', time: timings.Fajr },
            { name: 'الظهر', time: timings.Dhuhr },
            { name: 'العصر', time: timings.Asr },
            { name: 'المغرب', time: timings.Maghrib },
            { name: 'العشاء', time: timings.Isha }
        ];

        const riyadhNowStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" });
        const nowRiyadh = new Date(riyadhNowStr);

        prayers.forEach((prayer) => {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerDate = new Date(nowRiyadh.getFullYear(), nowRiyadh.getMonth(), nowRiyadh.getDate(), hours, minutes, 0);

            const timeDifference = prayerDate.getTime() - nowRiyadh.getTime();

            if (true) {
                console.log(`تم جدولة صلاة ${prayer.name} بتوقيت الرياض. ستبث بعد ${Math.round(timeDifference / 1000 / 60)} دقيقة.`);
                
                setTimeout(() => {
                    const message = `[${prayer.time}] حان الآن موعد صلاة << ${prayer.name} >> بتوقيت الرياض 🕌`;
                    client.say(channel, message);
                    console.log(`تم إرسال الرسالة: ${message}`);
                }, timeDifference);
            }
        });
    } catch (error) {
        console.error("حدث خطأ:", error);
    }
}

client.on('connected', () => {
    console.log("تم اتصال البوت بتويتش بنجاح!");
    
    client.say(channel, "🚨 البوت شغال وبيتصل بنجاح الآن! 🚨")
    .then(() => console.log("تم إرسال الرسالة التجريبية بنجاح!"))
    .catch((err) => console.error("فشل إرسال الرسالة:", err));

    sendPrayerMessage();
});
