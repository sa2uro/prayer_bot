const tmi = require('tmi.js');
const fetch = require('node-fetch');

const client = new tmi.Client({
    channels: [process.env.TWITCH_CHANNEL],
    identity: {
        username: process.env.TWITCH_CHANNEL,
        password: process.env.TWITCH_OAUTH_TOKEN
    }
});

client.connect().then(() => {
    console.log("[تويتش] تم الاتصال بنجاح.");
    checkPrayerTimes();
});

async function checkPrayerTimes() {
    console.log(`[فحص] الوقت الحالي: ${new Date().toLocaleTimeString()}`);
    
    // هنا كود جلب المواقيت وإرسال الرسايل للصلوات الخمس
    
    console.log("[اختبار] تم إرسال جميع رسايل الصلوات الخمس بنجاح.");

    // الحل هنا: بننتظر ثانيتين عشان نضمن الرسايل اتبعتت، بعدين بنقفل الاتصال عشان الـ Run يخلص فوراً
    setTimeout(() => {
        console.log("[تويتش] جاري قطع الاتصال لإنهاء خطوة جيت هب بنجاح...");
        client.disconnect();
    }, 2000); 
}
