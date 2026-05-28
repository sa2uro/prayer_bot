const fetch = require('node-fetch');
const tmi = require('tmi.js');

// قراءة اسم القناة من جيت هب، وإذا لم توجد نستخدم القيمة الافتراضية
const channel = process.env.TWITCH_CHANNEL || '#sa2uro';

const client = new tmi.Client({
    options: { debug: true },
    identity: {
        username: process.env.TWITCH_CHANNEL, // تعديل: البوت يقرأ اليوزر نيم الصحيح تلقائياً
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

        console.log(`[نجاح] تم جلب المواقيت بنجاح من الـ API (الفجر: ${timings.Fajr}، المغرب: ${timings.Maghrib})`);

        const prayers = [
            { name: "الفجر", time: timings.Fajr },
            { name: "الظهر", time: timings.Dhuhr },
            { name: "العصر", time: timings.Asr },
            { name: "المغرب", time: timings.Maghrib },
            { name: "العشاء", time: timings.Isha }
        ];

        // إرسال الخمس رسائل بالتتالي
        for (const prayer of prayers) {
            const message = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
            await client.say(channel, message);
            console.log(`[نجاح] تم إرسال رسالة: ${message}`);
        }

        console.log("[اختبار] تم إرسال جميع رسايل الصلوات الخمس بنجاح.");
        
        // الحل الجذري: ننتظر ثانيتين للتأكد من وصول الرسائل لتويتش ثم نقطع الاتصال لتغلق الرن بنجاح
        setTimeout(async () => {
            console.log("[تويتش] جاري قطع الاتصال لإنهاء خطوة جيت هب بنجاح...");
            await client.disconnect();
            process.exit(0); // إنهاء البرنامج بنجاح
        }, 2000);

    } catch (error) {
        console.error("[خطأ] فشل في جلب مواقيت الصلاة:", error);
        await client.disconnect();
        process.exit(1); // إنهاء البرنامج مع تسجيل خطأ
    }
}

client.on('connected', () => {
    console.log('[تويتش] تم الاتصال بنجاح.');
    checkPrayerTimes();
});
