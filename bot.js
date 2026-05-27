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

// دالة لمعالجة النصوص بشكل صحيح لتفادي مشاكل توقيت الـ string
function getRiyadhDateObj() {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Riyadh',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const dt = {};
    parts.forEach(p => dt[p.type] = p.value);
    // إنشاء كائن تاريخ بناءً على أرقام توقيت الرياض المباشرة
    return new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second);
}

async function checkAndSendPrayer() {
    try {
        console.log("جاري جلب مواقيت الصلاة لتوقيت الرياض...");
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

        // الحصول على الوقت الحالي الفعلي في الرياض ككائن تاريخ دقيق
        const nowRiyadh = getRiyadhDateObj();
        console.log(`الوقت الحالي في الرياض هو: ${nowRiyadh.toLocaleTimeString('ar-EG')}`);

        let messageSent = false;

        for (const prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            // إنشاء كائن تاريخ وقت الصلاة اليوم بالرياض
            const prayerDate = new Date(nowRiyadh.getFullYear(), nowRiyadh.getMonth(), nowRiyadh.getDate(), hours, minutes, 0);

            // حساب الفرق بالدقائق بين وقت الصلاة والوقت الحالي
            const timeDifferenceInMs = prayerDate.getTime() - nowRiyadh.getTime();
            const timeDifferenceInMinutes = Math.ceil(timeDifferenceInMs / 1000 / 60);

            // الشرط: إذا كان الوقت المتبقي للصلاة أكبر من 0 وأقل من أو يساوي 15 دقيقة
            if (timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 15) {
                const message = `[${prayer.time}] متبقي ${timeDifferenceInMinutes} دقائق على موعد صلاة << ${prayer.name} >> بتوقيت الرياض 🕌`;
                
                await client.say(channel, message);
                console.log(`[نجاح] تم إرسال التنبيه: ${message}`);
                messageSent = true;
                break; // نكتفي بصلاة واحدة لو حدث تداخل نادر
            }
        }

        if (!messageSent) {
            console.log("لا توجد صلاة قادمة خلال الـ 15 دقيقة الحالية. سيتم الإغلاق.");
        }

    } catch (error) {
        console.error("حدث خطأ أثناء معالجة الصلوات:", error);
    } finally {
        // قطع الاتصال وإغلاق السكريبت لإنهاء الـ Action فوراً بعد تنفيذ المهمة
        console.log("إنهاء الجلسة وإغلاق البوت لحفظ موارد الأكشن...");
        setTimeout(() => {
            client.disconnect();
            process.exit(0);
        }, 4000); // ننتظر 4 ثواني للتأكد من وصول الرسالة لتويتش قبل الفصل
    }
}

client.on('connected', () => {
    console.log("تم اتصال البوت بتويتش بنجاح!");
    // قمنا بإلغاء الرسالة التجريبية العشوائية حتى لا تظهر في الشات كل 15 دقيقة وتسبب إزعاج للمشاهدين.
    checkAndSendPrayer();
});

client.connect();
