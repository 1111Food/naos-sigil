import { Telegraf } from 'telegraf';
import { config } from './config/env';

async function checkBot() {
    if (!config.TELEGRAM_BOT_TOKEN) {
        console.error("Token missing");
        return;
    }
    const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
    try {
        const me = await bot.telegram.getMe();
        console.log("Bot Info:", me.username);
        
        const chatId = '166709600';
        try {
            const chat = await bot.telegram.getChat(chatId);
            console.log("Chat found:", chat.id, (chat as any).username || (chat as any).first_name);
        } catch (e) {
            console.error("Chat NOT found for ID:", chatId, (e as any).description);
        }
    } catch (e) {
        console.error("Bot login failed:", (e as any).message);
    }
}

checkBot();
