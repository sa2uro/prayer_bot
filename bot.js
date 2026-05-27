const token = process.env.TWITCH_OAUTH_TOKEN;
const channel = process.env.TWITCH_CHANNEL;

async function sendPrayerMessage() {
  const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Riyadh&country=Saudi Arabia&method=4');
  const data = await response.json();
  const timings = data.data.timings;
  console.log("Prayer times fetched:", timings);
}
sendPrayerMessage();
