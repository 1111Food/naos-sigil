import { Telegraf } from 'telegraf';
import 'dotenv/config';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const chatId = '166709600';

async function test() {
    console.log("🕵️ SENDING RAW VOICE TO:", chatId);
    const { TTSService } = require('./modules/sigil/ttsService');
    const tts = new TTSService();
    const { buffer } = await tts.generateVoice("Esta es una prueba de voz final. Si escuchas esto, la sincronización es total.", "latam");

    if (!buffer) return console.log("❌ No buffer generated");

    try {
        const res = await bot.telegram.sendVoice(chatId, { source: buffer }, { caption: "🔉 Prueba de Voz @ 21:01" });
        console.log("✅ TG Response:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error("🔥 TG Error:", e);
    }
}

test();
