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
    const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi 
Arabia&method=4');
    const data = await response.json();
    const timings = data.data.timings;

 const prayers = [
        { name: 'الفجر', time: timings.Fajr },
        { name: 'الظهر', time: timings.Dhuhr },
        { name: 'العصر'
, time: timings.Asr },
        { name: 'المغرب', time: timings.Maghrib },
        { name: 'العشاء', time: timings.Isha }
    ];

    prayers.forEach((prayer) => {
  const message = \[${prayer.time}] حان الآن موعد صلاة << ${prayer.name} >> بتوقيت الرياض 🕌;
        client.say(channel, message);
        console.log(Sending message: ${message});
    });
}

sendPrayerMessage();
