const fetch = require('node-fetch');
const tmi = require('tmi.js');

// استدعاء المتغيرات البيئية
const channel = process.env.TWITCH_CHANNEL || '#sa2uro';
const oauthToken = process.env.TWITCH_OAUTH_TOKEN;
const botUsername = process.env.TWITCH_BOT_USERNAME || 'sa2uro'; // اسم حساب البوت الخاص بك

// إعدادات الاتصال بـ Twitch
const opts = {
    options: { debug: true },
    identity: {
        username: botUsername,
        password: `oauth:${oauthToken.replace('oauth:', '')}` // التأكد من صيغة التوكن
    },
    channels: [channel.replace('#', '')]
};

// إنشاء كائن الاتصال بتويتش
const client = new tmi.client(opts);

async function run() {
    try {
        console.log("جاري الاتصال بـ Twitch...");
        await client.connect();
        console.log("تم الاتصال بنجاح!");

        // جلب بيانات الصلاة من الـ API (تعديل الأوقات أو الرابط حسب ما يناسبك)
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Cairo&country=Egypt&method=5');
        const data = await response.json();
        const timings = data.data.timings;

        // هنا يمكنك إضافة منطق الفحص والمقارنة مع الوقت الحالي
        // كمثال لإرسال الرسالة والتأكد من إرسالها قبل الخروج:
        const message = "حان الآن موعد الأذان حسب التوقيت المحلي.";
        
        console.log(`جاري إرسال الرسالة إلى قناة ${channel}...`);
        await client.say(channel, message);
        console.log("تم إرسال الرسالة بنجاح!");

    } catch (error) {
        console.error("حدث خطأ أثناء التشغيل:", error);
    } finally {
        // قطع الاتصال بأمان بعد إتمام المهمة حتى لا يظل الأكشن معلقاً للأبد
        try {
            await client.disconnect();
            console.log("تم قطع الاتصال بـ Twitch بأمان.");
        } catch (disError) {
            console.error("خطأ أثناء قطع الاتصال:", disError);
        }
        process.exit(0);
    }
}

// تشغيل الدالة الأساسية
run();
