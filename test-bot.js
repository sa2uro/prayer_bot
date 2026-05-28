const fetch = require('node-fetch');
const tmi = require('tmi.js');

const channel = process.env.TWITCH_CHANNEL || '#sa2uro';

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.TWITCH_CHANNEL.replace('#', ''),
        password: process.env.TWITCH_OAUTH_TOKEN
    },
    channels: [channel]
});

client.connect().catch(console.error);

async function checkPrayerTimes() {
    const nowRiyadh = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    console.log(`[فحص] الوقت الحالي بتوقيت الرياض: ${nowRiyadh.toLocaleTimeString('ar-EG', { hour12: false })}`);

    try {
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=4');
        const data = await response.json();
        const timings = data.data.timings;

        console.log(`[نجاح] تم جلب المواقيت بنجاح (الفجر: ${timings.Fajr}، المغرب: ${timings.Maghrib})`);

        const prayers = [
            { name: "الفجر", time: timings.Fajr },
            { name: "الظهر", time: timings.Dhuhr },
            { name: "العصر", time: timings.Asr },
            { name: "المغرب", time: timings.Maghrib },
            { name: "العشاء", time: timings.Isha }
        ];

        for (const prayer of prayers) {
            const message = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
            await client.say(channel, message);
            console.log(`[نجاح] تم إرسال رسالة: ${message}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log("[انتظار] تم إرسال الدفعة الحالية بنجاح. البوت مستمر في العمل وسيقوم بالفحص القادم بعد 5 دقائق تلقائياً...");

    } catch (error) {
        console.error("[خطأ] فشل في جلب مواقيت الصلاة:", error);
        // لن يتم إغلاق البوت عند حدوث خطأ عابر في الـ API لضمان استمرار الدورة في المرات القادمة
    }
}

client.on('connected', () => {
    console.log('[تويتش] تم الاتصال بنجاح. بدء التشغيل التلقائي المستمر...');
    
    // تشغيل الفحص فوراً لأول مرة عند فتح الكمبيوتر الافتراضي
    checkPrayerTimes();

    // تشغيل الفحص تلقائياً داخل الذاكرة كل 5 دقائق (5 * 60 * 1000 مللي ثانية)
    // هذا الفحص سيستمر بشكل داخلي ومضمون طوال فترة حياة الرن (6 ساعات)
    setInterval(checkPrayerTimes, 5 * 60 * 1000);
});
