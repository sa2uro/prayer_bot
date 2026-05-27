const fetch = require('node-fetch');

const channel = process.env.TWITCH_CHANNEL || '#sa2uro'; 

async function checkPrayerTimes() {
    const nowRiyadh = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
    console.log(`[فحص] الوقت الحالي بتوقيت الرياض: ${nowRiyadh.toLocaleTimeString('ar-EG')}`);

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

        // إرسال رسايل الصلاة الخمس مباشرة بدون شروط
        for (const prayer of prayers) {
            const message = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
            if (typeof client !== 'undefined') await client.say(channel, message);
            console.log(`[نجاح] تم إرسال رسالة: ${message}`);
        }

        console.log("[اختبار] تم إرسال جميع رسايل الصلوات الخمس بنجاح.");

    } catch (error) {
        console.error("[خطأ] فشل في جلب مواقيت الصلاة:", error);
    }
}

checkPrayerTimes();
