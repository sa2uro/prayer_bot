async function checkPrayerTimes() {
    const nowRiyadh = new Date();

    // جلب مواقيت الصلاة من الـ API
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
            const prayerDate = new Date(nowRiyadh.getFullYear(), nowRiyadh.getMonth(), nowRiyadh.getDate(), hours, minutes, 0);

            const timeDifferenceInMs = prayerDate.getTime() - nowRiyadh.getTime();
            const timeDifferenceInMinutes = Math.round(timeDifferenceInMs / 1000 / 60);

            if (timeDifferenceInMinutes === 0) {
                const message = `[${prayer.time}] حان الآن موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                await client.say(channel, message);
                console.log(`[نجاح] تم إرسال تنبيه الأذان: ${message}`);
                messageSent = true;
                break;
            } else if (timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 15) {
                const message = `[${prayer.time}] متبقي ${timeDifferenceInMinutes} دقيقة على موعد صلاة <<${prayer.name}>> بتوقيت الرياض 🕌`;
                await client.say(channel, message);
                console.log(`[نجاح] تم إرسال التنبيه: ${message}`);
                messageSent = true;
                break;
            }
        }
    } catch (error) {
        console.error("Error fetching prayer times:", error);
    }
}
