// استدعاء مكتبة الـ fetch لجلب البيانات
const fetch = require('node-fetch');

// إعدادات البوت الأساسية (تأكد أن المتغيرات دي موجودة عندك برة أو سيبها لو متعرفة في بقية الملف)
const channel = process.env.TWITCH_CHANNEL || '#sa2uro'; 
// ملاحظة: تأكد أن كائن الـ client الخاص بـ tmi.js معرف عندك فوق أو تحت في الملف إذا كان هناك بقية للكود

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

        let messageSent = false;

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerDate = new Date(nowRiyadh.getFullYear(), nowRiyadh.getMonth(), nowRiyadh.getDate(), hours, minutes, 0);

            const timeDifferenceInMs = prayerDate.getTime() - nowRiyadh.getTime();
            const timeDifferenceInMinutes = Math.round(timeDifferenceInMs / 1000 / 60);

            if (timeDifferenceInMinutes === 0) {
                const message = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                if (typeof client !== 'undefined') await client.say(channel, message);
                console.log(`[نجاح] حان موعد الأذان: ${message}`);
                messageSent = true;
                break;
            } else if (timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 15) {
                const message = `[${prayer.time}] متبقي ${timeDifferenceInMinutes} دقيقة على موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                if (typeof client !== 'undefined') await client.say(channel, message);
                console.log(`[نجاح] تم رصد اقتراب الصلاة: ${message}`);
                messageSent = true;
                break;
            }
        }

        if (!messageSent) {
            console.log("[معلومة] لا توجد صلاة قريبة في الـ 15 دقيقة القادمة.");
        }

    } catch (error) {
        console.error("[خطأ] فشل في جلب مواقيت الصلاة:", error);
    }
}

// السطر السحري الناقص: تشغيل الدالة فوراً عند تشغيل الأكشن
checkPrayerTimes();
