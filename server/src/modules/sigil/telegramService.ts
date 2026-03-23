import { Telegraf, Markup } from 'telegraf';
import { config } from '../../config/env';
import { supabase } from '../../lib/supabase';
import { SigilService } from './service';

let bot: Telegraf | null = null;
const sigilService = new SigilService();

export const initTelegramBot = () => {
    if (!config.TELEGRAM_BOT_TOKEN) {
        console.warn("⚠️ Telegram Bot Token not found. Telegram service deactivated.");
        return;
    }

    try {
        bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

        // Protocolo de Reconocimiento
        bot.start((ctx) => {
            console.log(`[TELEGRAM] Iniciando Protocolo de Reconocimiento para chat.id: ${ctx.chat.id}`);
            ctx.reply("Saludos, Arquitecto. Para sincronizar tu canal de comunicación con el Templo, por favor escribe el correo electrónico con el que fuiste registrado en NAOS.");
        });

        // Comando para desenlazar
        bot.command('unlink', async (ctx) => {
            const chatId = ctx.chat.id.toString();
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ telegram_chat_id: null })
                    .eq('telegram_chat_id', chatId);

                if (error) throw error;
                ctx.reply("Sincronización terminada. El Sigil ha dejado de vigilar este canal. Puedes volver a sincronizar con /start.");
            } catch (e) {
                console.error("[TELEGRAM] Unlink Error:", e);
                ctx.reply("No se pudo romper el vínculo estelar en este momento.");
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
            // Usamos neq('id', ...) para evitar problemas con registros nulos si los hay
            const { data: profile, error: checkError } = await supabase
                .from('profiles')
                .select('id, full_name, email, language')
                .eq('telegram_chat_id', chatId)
                .maybeSingle();

            if (checkError) console.error("[TELEGRAM] Check Error:", checkError);

            if (profile) {
                // Ya está vinculado -> Interacción conversacional con el Sigil
                console.log(`[TELEGRAM] Interactuando con Sigil para ${profile.full_name} (${profile.email})`);
                
                try {
                    const aiResponse = await sigilService.processMessage(profile.id, text, undefined, undefined, 'maestro', false, undefined, profile.language || 'es');
                    ctx.reply(aiResponse);
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
                        ctx.reply("Ha ocurrido una interferencia en el tejido de la base de datos de NAOS. Intenta más tarde.");
                        return;
                    }

                    if (data === true || data === 'true') {
                        ctx.reply("Sincronización estelar completada. El Sigil ahora vigila tus ciclos.\n\n⚙️ *Ajuste Inicial:* ¿Cómo prefieres recibir alertas?", {
                            parse_mode: 'Markdown',
                            ...Markup.inlineKeyboard([
                                [Markup.button.callback('🔊 Notas de Voz', 'notif_voice'), Markup.button.callback('📝 Solo Texto', 'notif_text')]
                            ])
                        });
                        console.log(`[TELEGRAM] VINCULACIÓN EXITOSA: ${text} <-> ${chatId}`);
                    } else {
                        ctx.reply("Esa frecuencia no se encuentra en nuestros registros. Verifica tu correo.");
                        console.log(`[TELEGRAM] VINCULACIÓN FALLIDA: Email ${text} no encontrado.`);
                    }

                } catch (dbErr) {
                    console.error("[TELEGRAM] DB Connection Error:", dbErr);
                    ctx.reply("El oráculo no puede conectar en este momento.");
                }

            } else {
                ctx.reply("La secuencia ingresada no resuena como un correo electrónico válido. Para sincronizar, envía tu email de NAOS.");
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

        bot.launch().catch(err => {
            console.error("🔥 Telegram Bot Launch Failed:", err.message || err);
            console.warn("⚠️ Sigil Telegram Node is offline, but the Great Work continues...");
        });
        console.log("🌌 Sigil Telegram Node: CONNECTED & LISTENING.");

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
