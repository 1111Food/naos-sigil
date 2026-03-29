import { Telegraf, Markup } from 'telegraf';
import { config } from '../../config/env';
import { supabase } from '../../lib/supabase';
import { SigilService } from './service';
import { SYSTEM_PROMPTS } from './prompts';

let bot: Telegraf | null = null;
const sigilService = new SigilService();

export const initTelegramBot = () => {
    if (bot) {
        console.log("ℹ️ Telegram Bot already initialized. Skipping...");
        return;
    }

    if (!config.TELEGRAM_BOT_TOKEN) {
        console.warn("⚠️ Telegram Bot Token not found. Telegram service deactivated.");
        return;
    }

    try {
        bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

        // Protocolo de Reconocimiento
        bot.start((ctx) => {
            console.log(`[TELEGRAM] Iniciando Protocolo de Reconocimiento para chat.id: ${ctx.chat.id}`);
            const welcome = "Greetings, Architect. To synchronize your channel with the Temple, please write your NAOS registered email.\n\nSaludos, Arquitecto. Para sincronizar tu canal con el Templo, por favor escribe tu correo de NAOS.";
            ctx.reply(welcome);
        });

        // Comando para desenlazar
        bot.command('unlink', async (ctx) => {
            const chatId = ctx.chat.id.toString();
            try {
                const { data: profile } = await supabase.from('profiles').select('language').eq('telegram_chat_id', chatId).maybeSingle();
                const lang = profile?.language === 'en' ? 'en' : 'es';
                const t = SYSTEM_PROMPTS[lang].telegram;

                const { error } = await supabase
                    .from('profiles')
                    .update({ telegram_chat_id: null })
                    .eq('telegram_chat_id', chatId);

                if (error) throw error;
                ctx.reply(t.unlink_success);
            } catch (e) {
                console.error("[TELEGRAM] Unlink Error:", e);
                ctx.reply("No se pudo romper el vínculo estelar en este momento. / Could not break the link.");
            }
        });
        
        // Comando para notificaciones
        bot.command('notificaciones', async (ctx) => {
            await ctx.reply("⚙️ *Configuración de Notificaciones*\n¿Cómo prefieres recibir las revelaciones del Sigil?", {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🔊 Notas de Voz', 'notif_voice'), Markup.button.callback('📝 Solo Texto', 'notif_text')]
                ])
            });
        });

        bot.on('text', async (ctx) => {
            const text = ctx.message.text.trim();
            const chatId = ctx.chat.id.toString();

            console.log(`[TELEGRAM] Raw message from ${chatId}: "${text}"`);

            // 1. Verificar si ya está vinculado
            const { data: profile, error: checkError } = await supabase
                .from('profiles')
                .select('id, full_name, email, language, profile_data')
                .eq('telegram_chat_id', chatId)
                .maybeSingle();

            if (checkError) console.error("[TELEGRAM] Check Error:", checkError);

            if (profile) {
                // Ya está vinculado -> Interacción conversacional con el Sigil
                console.log(`[TELEGRAM] Interactuando con Sigil para ${profile.full_name} (${profile.email})`);
                
                try {
                    const aiResponse = await sigilService.processMessage(profile.id, text, undefined, undefined, 'maestro', false, undefined, profile.language || 'es');
                    
                    // Check for Voice Preference
                    const isVoiceEnabled = (profile.profile_data as any)?.telegram_voice_enabled === true;
                    
                    if (isVoiceEnabled) {
                        console.log(`[TELEGRAM] Generando nota de voz para ${chatId}...`);
                        const tts = new (require('./ttsService').TTSService)();
                        const { buffer } = await tts.generateVoice(aiResponse, profile.language === 'en' ? 'global' : 'latam');
                        
                        if (buffer) {
                             await ctx.replyWithVoice({ source: buffer }, { caption: aiResponse.substring(0, 100) + '...' });
                             return;
                        }
                    }

                    // Fallback to text
                    await ctx.reply(aiResponse);

                } catch (err) {
                    console.error("[TELEGRAM] Sigil AI error:", err);
                    ctx.reply("El Sigil guarda silencio estelar en este momento. Intenta conectando más tarde.");
                }
                return;
            }

            // 2. Si no está vinculado, intentar validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(text)) {
                console.log(`[TELEGRAM] Intentando vincular email: ${text} con Telegram ID: ${chatId}`);

                try {
                    const { data, error } = await supabase.rpc('link_telegram_by_email', {
                        target_email: text,
                        telegram_id: chatId
                    });

                    if (error) {
                        console.error("[TELEGRAM] RPC Error:", error);
                        ctx.reply("Error en la conexión con NAOS / NAOS connection error.");
                        return;
                    }

                    if (data === true || data === 'true') {
                        // After linking, we can try to fetch the profile to get the language
                        const { data: newProfile } = await supabase.from('profiles').select('language').eq('telegram_chat_id', chatId).maybeSingle();
                        const lang = newProfile?.language === 'en' ? 'en' : 'es';
                        const t = SYSTEM_PROMPTS[lang].telegram;

                        ctx.reply(t.sync_success, {
                            parse_mode: 'Markdown',
                            ...Markup.inlineKeyboard([
                                [Markup.button.callback(t.voice_label, 'notif_voice'), Markup.button.callback(t.text_label, 'notif_text')]
                            ])
                        });
                        console.log(`[TELEGRAM] VINCULACIÓN EXITOSA: ${text} <-> ${chatId}`);
                    } else {
                        ctx.reply("Email no encontrado / Email not found. Verifica tu correo.");
                        console.log(`[TELEGRAM] VINCULACIÓN FALLIDA: Email ${text} no encontrado.`);
                    }

                } catch (dbErr) {
                    console.error("[TELEGRAM] DB Connection Error:", dbErr);
                    ctx.reply("Error de conexión / Connection error.");
                }

            } else {
                ctx.reply("Email inválido / Invalid email. Envía tu correo de NAOS.");
            }
        });

        // Manejo de Interacciones de Botones (Inline Keyboards)
        bot.on('callback_query', async (ctx) => {
            // @ts-ignore
            const action = ctx.callbackQuery.data;
            const chatId = ctx.chat?.id.toString();

            if (!chatId) return;

            try {
                // @ts-ignore (evitar tipados estrictos en data)
                const { data: current } = await supabase.from('profiles').select('profile_data').eq('telegram_chat_id', chatId).maybeSingle();
                const updatedData = { ...(current?.profile_data || {}), telegram_voice_enabled: action === 'notif_voice' };
                
                await supabase.from('profiles').update({ profile_data: updatedData }).eq('telegram_chat_id', chatId);

                await ctx.answerCbQuery();
                await ctx.editMessageText(`✅ *Preferencia Guardada*\nNotificaciones configuradas como: *${action === 'notif_voice' ? '🔊 Notas de Voz' : '📝 Solo Texto'}*.\n\nPuedes volver a cambiar esto usando /notificaciones`, { parse_mode: 'Markdown' });
            } catch (e) {
                console.error("[TELEGRAM] Callback Query Error:", e);
                await ctx.answerCbQuery("❌ Error guardando preferencia.");
            }
        });

        // deleteWebhook fixes 409 Conflict after dev restarts
        bot!.telegram.deleteWebhook().then(() => {
            bot!.launch().catch(err => {
                console.error("🔥 Telegram Bot Launch Failed:", err.message || err);
                console.warn("⚠️ Sigil Telegram Node is offline, but the Great Work continues...");
            });
            console.log("🌌 Sigil Telegram Node: CONNECTED & LISTENING.");
        }).catch(err => {
            console.error("🔥 Telegram Webhook Deletion Failed:", err);
        });

        // Graceful stop
        process.once('SIGINT', () => bot?.stop('SIGINT'));
        process.once('SIGTERM', () => bot?.stop('SIGTERM'));

    } catch (e) {
        console.error("🔥 Error initializing Telegram Bot:", e);
    }
}

export const sendProactiveMessage = async (
    telegramChatId: string,
    message: string,
    button?: { label: string; url: string }
): Promise<boolean> => {
    if (!bot && config.TELEGRAM_BOT_TOKEN) {
        console.log("⚠️ Telegram Bot not initialized but token exists. Attempting to restart...");
        initTelegramBot();
    }

    if (!bot) {
        console.warn("⚠️ Cannot send Telegram message. Bot is offline.");
        return false;
    }

    try {
        if (button) {
            await bot.telegram.sendMessage(telegramChatId, message,
                Markup.inlineKeyboard([
                    Markup.button.url(button.label, button.url)
                ])
            );
        } else {
            await bot.telegram.sendMessage(telegramChatId, message);
        }
        console.log(`[TELEGRAM] 🚀 Mensaje proactivo enviado telepáticamente al ID: ${telegramChatId}`);
        return true;
    } catch (e) {
        console.error(`[TELEGRAM] ❌ Error enviando mensaje a ${telegramChatId}:`, e);
        return false;
    }
}

export const sendProactiveVoice = async (
    telegramChatId: string,
    audioBuffer: Buffer,
    message?: string
): Promise<boolean> => {
    if (!bot && config.TELEGRAM_BOT_TOKEN) {
        initTelegramBot();
    }

    if (!bot) {
        console.warn("⚠️ Cannot send Telegram Voice. Bot is offline.");
        return false;
    }

    try {
        await bot.telegram.sendVoice(telegramChatId, { source: audioBuffer }, { caption: message });
        console.log(`[TELEGRAM] 🔊 Mensaje de voz enviado al ID: ${telegramChatId}`);
        return true;
    } catch (e) {
        console.error(`[TELEGRAM] ❌ Error enviando voz a ${telegramChatId}:`, e);
        return false;
    }
}
