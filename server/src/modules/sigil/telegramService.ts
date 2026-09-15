import { Telegraf, Markup } from 'telegraf';
import { config } from '../../config/env';
import { supabase } from '../../lib/supabase';
import { SigilService } from './service';
import { SYSTEM_PROMPTS } from './prompts';
import { TelegramLinkService } from './telegramLinkService';
import { TTSService } from './ttsService';

let bot: Telegraf | null = null;
const sigilService = new SigilService();

// Simple in-memory deduplication for update_ids (Point 3)
const processedUpdates = new Set<number>();

// Helper to safely split long messages
const splitMessage = (text: string, maxLength: number = 4000): string[] => {
    if (text.length <= maxLength) return [text];
    const chunks: string[] = [];
    let currentChunk = "";
    const paragraphs = text.split('\n\n');
    
    for (const p of paragraphs) {
        if ((currentChunk.length + p.length + 2) > maxLength) {
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = p;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + p;
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
};

export const initTelegramBot = () => {
    if (bot) return;
    if (!config.TELEGRAM_BOT_TOKEN) return;

    try {
        bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

        bot.start(async (ctx) => {
            const chatId = ctx.chat.id.toString();
            // Using ctx.text which safely provides the message text. Or ctx.message directly.
            // @ts-ignore
            const payload = (ctx.message as any).text?.split(' ')[1]; // /start <payload>
            
            if (!payload) {
                return ctx.reply("Greetings. To synchronize your channel, please use the 'Connect Telegram' button inside the NAOS App.\n\nSaludos. Para sincronizar tu canal, usa el bot�n 'Connect Telegram' dentro de la App de NAOS.");
            }
            
            try {
                await TelegramLinkService.consumeToken(payload, chatId);
                const { data: profile } = await supabase.from('profiles').select('language').eq('telegram_chat_id', chatId).maybeSingle();
                const lang = profile?.language === 'en' ? 'en' : 'es';
                const t = SYSTEM_PROMPTS[lang].telegram;
                
                ctx.reply(t.sync_success, {
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(t.voice_label, 'notif_voice'), Markup.button.callback(t.text_label, 'notif_text')]
                    ])
                });
            } catch (err: any) {
                console.error("[TELEGRAM] Link Error:", err.message);
                if (err.message === 'chat_already_linked') {
                    ctx.reply("Este chat de Telegram ya est� vinculado a otra cuenta de NAOS. / This Telegram chat is already linked to another NAOS account.");
                } else {
                    ctx.reply("El token de enlace es inv�lido, ha expirado o ya fue usado. Por favor genera uno nuevo en la App. / The link token is invalid, expired, or already used.");
                }
            }
        });

        bot.command('unlink', async (ctx) => {
            const chatId = ctx.chat.id.toString();
            try {
                const { data: profile } = await supabase.from('profiles').select('language').eq('telegram_chat_id', chatId).maybeSingle();
                const lang = profile?.language === 'en' ? 'en' : 'es';
                const t = SYSTEM_PROMPTS[lang].telegram;

                await supabase.from('profiles').update({ telegram_chat_id: null }).eq('telegram_chat_id', chatId);
                ctx.reply(t.unlink_success);
            } catch (e) {
                ctx.reply("No se pudo romper el v�nculo. / Could not break the link.");
            }
        });
        
        bot.command('notificaciones', async (ctx) => {
            await ctx.reply("Configuraci�n de Notificaciones:\n�C�mo prefieres recibir las revelaciones del Sigil?", {
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('Notas de Voz', 'notif_voice'), Markup.button.callback('Solo Texto', 'notif_text')]
                ])
            });
        });

        bot.on('text', async (ctx) => {
            const updateId = (ctx.update as any).update_id || 0;
            if (processedUpdates.has(updateId)) return;
            processedUpdates.add(updateId);
            
            if (processedUpdates.size > 1000) {
                const firstItem = processedUpdates.values().next().value;
                if (firstItem !== undefined) processedUpdates.delete(firstItem);
            }

            const text = (ctx.message as any).text.trim();
            const chatId = ctx.chat.id.toString();

            const { data: profile } = await supabase
                .from('profiles')
                .select('id, full_name, email, language, profile_data, plan_type')
                .eq('telegram_chat_id', chatId)
                .maybeSingle();

            if (!profile) {
                ctx.reply("Tu canal no est� sincronizado. Ve a la App de NAOS > Settings > Connect Telegram.");
                return;
            }

            if (profile.plan_type !== 'premium' && profile.plan_type !== 'premium_plus' && profile.plan_type !== 'admin') {
                ctx.reply(profile.language === 'en' 
                    ? "Your current access level does not permit Sigil interaction via Telegram. Please upgrade to the Architect plan in the Temple."
                    : "Tu nivel de acceso actual no permite la interacci�n con el Sigil v�a Telegram. Por favor, adquiere el plan Arquitecto en el Templo.");
                return;
            }

            try {
                // Pass source: 'telegram'
                const aiResponse = await sigilService.processMessage(
                    profile.id, 
                    text, 
                    undefined, 
                    undefined, 
                    'maestro', 
                    false, 
                    undefined, 
                    profile.language || 'es',
                    undefined,
                    { persistUserMessage: true, visibleInConversation: true, source: 'telegram' }
                );
                
                const isVoiceEnabled = (profile.profile_data as any)?.telegram_voice_enabled === true;
                
                if (isVoiceEnabled) {
                    try {
                        const tts = new TTSService();
                        // POINT 6 FIX: Corrected parameter order (userId, text, region)
                        const region = profile.language === 'en' ? 'global' : 'latam';
                        const { buffer } = await tts.generateVoice(profile.id, aiResponse, region);
                        if (buffer) {
                            const captionText = aiResponse.substring(0, 100) + '...';
                            await ctx.replyWithVoice({ source: buffer }, { caption: captionText });
                            return;
                        }
                    } catch (ttsErr: any) {
                        console.warn('[TELEGRAM TTS] Voice generation failed, falling back to text:', ttsErr.message);
                    }
                }

                // Fallback to text: split and send safely (no parse_mode Markdown to prevent crashes)
                const chunks = splitMessage(aiResponse);
                for (const chunk of chunks) {
                    await ctx.reply(chunk);
                }

            } catch (err) {
                console.error("[TELEGRAM] Sigil AI error:", err);
                const fallbackMsg = profile.language === 'en' 
                    ? "I couldn't complete this response at the moment. You can try again."
                    : "No pude completar esta respuesta en este momento. Puedes intentarlo nuevamente.";
                ctx.reply(fallbackMsg);
            }
        });

        bot.on('callback_query', async (ctx) => {
            const action = (ctx.callbackQuery as any).data;
            const chatId = ctx.chat?.id.toString();
            if (!chatId) return;

            try {
                const { data: current } = await supabase.from('profiles').select('profile_data').eq('telegram_chat_id', chatId).maybeSingle();
                const updatedData = { ...(current?.profile_data || {}), telegram_voice_enabled: action === 'notif_voice' };
                await supabase.from('profiles').update({ profile_data: updatedData }).eq('telegram_chat_id', chatId);
                await ctx.answerCbQuery();
                await ctx.editMessageText(`Preferencia Guardada: ${action === 'notif_voice' ? 'Notas de Voz' : 'Solo Texto'} `);
            } catch (e) {
                await ctx.answerCbQuery("Error guardando preferencia.");
            }
        });

        bot!.telegram.deleteWebhook({ drop_pending_updates: true })
            .then(() => new Promise(resolve => setTimeout(resolve, 2000)))
            .then(() => {
                bot!.launch({ dropPendingUpdates: true }).catch(err => {
                    if (err?.response?.error_code === 409) {
                        setTimeout(() => bot?.launch({ dropPendingUpdates: true }).catch(() => {}), 10000);
                    }
                });
            });

        process.once('SIGINT', () => bot?.stop('SIGINT'));
        process.once('SIGTERM', () => bot?.stop('SIGTERM'));

    } catch (e) {
        console.error("Error initializing Telegram Bot:", e);
    }
}

export const sendProactiveMessage = async (telegramChatId: string, message: string, button?: { label: string; url: string }): Promise<boolean> => {
    if (!bot && config.TELEGRAM_BOT_TOKEN) initTelegramBot();
    if (!bot) return false;
    try {
        const chunks = splitMessage(message);
        for (let i = 0; i < chunks.length; i++) {
            if (i === chunks.length - 1 && button) {
                await bot.telegram.sendMessage(telegramChatId, chunks[i], Markup.inlineKeyboard([Markup.button.url(button.label, button.url)]));
            } else {
                await bot.telegram.sendMessage(telegramChatId, chunks[i]);
            }
        }
        return true;
    } catch (e) {
        return false;
    }
}

export const sendProactiveVoice = async (telegramChatId: string, audioBuffer: Buffer, message?: string): Promise<boolean> => {
    if (!bot && config.TELEGRAM_BOT_TOKEN) initTelegramBot();
    if (!bot) return false;
    try {
        const captionText = message ? message.substring(0, 100) + '...' : undefined;
        await bot.telegram.sendVoice(telegramChatId, { source: audioBuffer }, { caption: captionText });
        return true;
    } catch (e) {
        return false;
    }
}




