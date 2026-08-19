import 'dotenv/config';
import { sendProactiveMessage } from './modules/sigil/telegramService';
import { initTelegramBot } from './modules/sigil/telegramService';

async function test() {
    console.log("🧪 TELEGRAM DISPATCH TEST");
    const chatId = "16670960"; // Luis's ID from previous logs
    const msg = "🧪 TEST: Sincronización proactiva verificando canal de despacho.";
    
    try {
        console.log("🛠️ Initializing Bot...");
        initTelegramBot();
        
        console.log(`🚀 Sending to ${chatId}...`);
        const success = await sendProactiveMessage(chatId, msg);
        console.log(`📡 Result: ${success ? 'SUCCESS' : 'FAILURE'}`);
    } catch (e) {
        console.error("🔥 Error:", e);
    }
}

test();
