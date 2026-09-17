import { supabase } from '../../lib/supabase';
import { sendProactiveMessage, sendProactiveVoice } from '../sigil/telegramService';
import { SigilService } from '../sigil/service';
import { CoherenceService } from '../coherence/service';
import { SYSTEM_PROMPTS, DYNAMIC_SEGMENTS } from '../sigil/prompts';
import { TTSService } from '../sigil/ttsService';

import { ConsciousnessEngine, TransmissionMoment } from '../sigil/ConsciousnessEngine';

export class NotificationEngine {

    /**
     * Checks all personalized tuning cycles (Lab, Protocol 21, and Daily Reading)
     * using the user's local timezone.
     */
    public static async checkTuningCycles() {
        const now = new Date();

        // 1. Data Fetch
        const { data: tunings } = await supabase
            .from('coherence_tunings')
            .select('*')
            .eq('is_active', true);

        // Fetch all profiles with Telegram linked to check for oracle_time
        const { data: users, error } = await supabase
            .from('profiles')
            .select('id, email, telegram_chat_id, nickname, full_name, profile_data, astrology, language, oracle_time')
            .not('telegram_chat_id', 'is', null);

        if (error || !users || users.length === 0) {
            console.log(`[CRON] Revisando notificaciones... Hora Servidor: ${now.toLocaleString()} | Pendientes encontradas: 0`);
            return;
        }

        // Deduplicate by telegram_chat_id
        const uniqueUsers = this.getUniqueTelegramUsers(users);
        let matchCount = 0;

        for (const user of uniqueUsers) {
            try {
                // Timezone logic (Current timezone only, NEVER natal utcOffset)
                const { DateUtils } = require('../../utils/DateUtils');
                const offset = DateUtils.getCurrentTimezoneOffset(user);
                
                const userLocal = new Date(now.getTime() + (3600000 * offset));
                const userHours = String(userLocal.getUTCHours()).padStart(2, '0');
                const userMins = String(userLocal.getUTCMinutes()).padStart(2, '0');
                const userTimeStr = `${userHours}:${userMins}`;
                const userDateStr = userLocal.toISOString().split('T')[0];

                // Collect Active Triggers
                const userTunings = (tunings || []).filter(t => t.user_id === user.id);
                const labAspects: string[] = [];
                let isProtocolDue = false;
                let isOracleDue = false;

                // A. Check coherence_tunings (Lab & Protocol)
                for (const tuning of userTunings) {
                    if (tuning.cron_schedule.split(',').includes(userTimeStr)) {
                        if (tuning.aspect === 'protocol21') isProtocolDue = true;
                        else labAspects.push(tuning.aspect);
                        matchCount++;
                    }
                }

                // B. Check Protocol 21 Fallback (19:30) if no custom tuning exists
                if (userTimeStr === '19:30' && !userTunings.some(t => t.aspect === 'protocol21')) {
                    isProtocolDue = true;
                    matchCount++;
                }

                // C. Check Daily Reading (oracle_time)
                if (user.oracle_time && user.oracle_time.startsWith(userTimeStr)) {
                    isOracleDue = true;
                    matchCount++;
                }

                const isFixedTimeDue = ['06:00', '11:30', '18:00'].includes(userTimeStr);
                if (!isProtocolDue && !isOracleDue && labAspects.length === 0 && !isFixedTimeDue) continue;

                console.info(`ðŸŽ¯ [CRON] Match FOUND for ${user.email} at ${userTimeStr} (Offset: ${offset})`);

                const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                const sigil = new SigilService();
                const tts = new TTSService();
                const useVoice = user.profile_data?.telegram_voice_enabled !== false;

                // --- EXECUTION 1: Lab Consolidations ---
                if (labAspects.length > 0) {
                    console.info(`ðŸš€ [NOTIF] Triggering Lab: ${user.email}`);
                    const cleanAspects = labAspects.map(a => a.replace(/^lab_/, '').replace(/_\d+$/, ''));
                    const aspectsStr = [...new Set(cleanAspects)].join(', ');
                    const prompt = DYNAMIC_SEGMENTS[lang].tuning_reminder(aspectsStr);
                    const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang, undefined, { persistUserMessage: false, visibleInConversation: false, source: 'internal_notification' });
                    const success = await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                    console.info(`ðŸ“¡ [NOTIF] Lab Result for ${user.email}: ${success}`);
                    
                    const labIds = userTunings.filter(t => labAspects.includes(t.aspect)).map(t => t.id);
                    await supabase.from('coherence_tunings').update({ last_triggered_at: new Date().toISOString() }).in('id', labIds);
                }

                // --- EXECUTION 2: Protocol 21 (with Seal Check) ---
                if (isProtocolDue) {
                    // GATE: Ensure user actually has an active protocol
                    const { data: activeProtocols } = await supabase
                        .from('user_protocols')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('status', 'active')
                        .limit(1);

                    if (!activeProtocols || activeProtocols.length === 0) {
                        console.info(`â­ï¸ [NOTIF] Skipping Protocol for ${user.email} - No active protocol (likely cancelled or completed).`);
                    } else {
                        const { data: metrics } = await supabase
                            .from('daily_metrics')
                            .select('id')
                            .eq('user_id', user.id)
                            .gte('created_at', `${userDateStr}T00:00:00.000Z`)
                            .lte('created_at', `${userDateStr}T23:59:59.999Z`);

                        if (!metrics || metrics.length === 0) {
                            console.info(`ðŸ”¥ [NOTIF] Triggering Protocol: ${user.email}`);
                            const discipline = SYSTEM_PROMPTS[lang].templates.discipline.replace('{current}', '?').replace('{target}', '21');
                            const prompt = `${SYSTEM_PROMPTS[lang].templates.structure}\n${discipline}`;
                            const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang, undefined, { persistUserMessage: false, visibleInConversation: false, source: 'internal_notification' });
                            const success = await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                            console.info(`ðŸ“¨ [NOTIF] Protocol Result for ${user.email}: ${success}`);
                            
                            const p21Tuning = userTunings.find(t => t.aspect === 'protocol21');
                            if (p21Tuning) {
                                await supabase.from('coherence_tunings').update({ last_triggered_at: new Date().toISOString() }).eq('id', p21Tuning.id);
                            }
                        } else {
                            console.info(`âœ… [NOTIF] Skipping Protocol for ${user.email} - Already sealed.`);
                        }
                    }
                }

                // --- EXECUTION 3: Daily Reading (V2 Context Builder) ---
                if (isOracleDue) {
                    console.info(`ðŸ”® [NOTIF] Checking V2 Daily Context for ${user.email}`);
                    
                    try {
                        const { DailyContextOrchestrator } = require('../daily/DailyContextOrchestrator');
                        
                        const v2Payload = await DailyContextOrchestrator.getOrGenerate(
                            user.id, 
                            user, 
                            offset, 
                            lang
                        );

                        if (v2Payload.interpretation?.interpretationStatus === 'unavailable') {
                            console.warn(`[NOTIF] Interpretation unavailable for ${user.email}, skipping Telegram message.`);
                        } else {
                            const { primarySignal, guidance, reflectionQuestion } = v2Payload.interpretation;

                            // Format magnetic hook for Telegram
                            const telegramMessage = `âš¡ ${lang === 'en' ? 'Daily Frequency' : 'Frecuencia del DÃ­a'} â€” ${user.nickname || user.full_name}

${primarySignal.title}

${primarySignal.text || primarySignal.content}

${guidance}

"${reflectionQuestion}"`;

                            const success = await this.sendFullMessage(user.telegram_chat_id, telegramMessage, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                            console.info(`âœ… [NOTIF] V2 Daily Context Result for ${user.email}: ${success}`);
                        }
                    } catch (err: any) {
                        console.error(`âŒ [NOTIF] Error processing V2 Daily Context for ${user.email}:`, err.message);
                    }
                }

                // --- EXECUTION 4: Inactivity Check (LOCAL TIME 11:30) ---
                if (userTimeStr === '11:30') {
                    console.info(`â° [NOTIF] Triggering Local Inactivity sweep for ${user.email}`);
                    await this.triggerInactivity(user);
                }

                // --- EXECUTION 5: Consciousness Engine (VigÃ­a CÃ³smico) ---
                let moment: TransmissionMoment | null = null;
                if (userTimeStr === '06:00') moment = 'MORNING';
                else if (userTimeStr === '18:00') moment = 'EVENING';
                

                if (moment) {
                    console.info(`ðŸ‘ï¸ [NOTIF] Triggering VigÃ­a CÃ³smico (${moment}) for ${user.email}`);
                    try {
                        const transmission = await ConsciousnessEngine.trySendTransmission(user.id, userDateStr, moment, lang);
                        if (transmission) {
                            const telegramMessage = `ðŸ‘ï¸ **VIGÃA CÃ“SMICO** â€” ${moment}\n\n${transmission}`;
                            const success = await this.sendFullMessage(user.telegram_chat_id, telegramMessage, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                            console.info(`ðŸ“¡ [NOTIF] VigÃ­a Result for ${user.email}: ${success}`);
                        }
                    } catch(err: any) {
                        console.error(`ðŸ”¥ [NOTIF] Error processing VigÃ­a CÃ³smico for ${user.email}:`, err.message);
                    }
                }

            } catch (e) {
                console.error(`[NOTIF_ENGINE] Failed processing triggers for ${user.id}`, e);
            }
        }

        console.log(`[CRON] Revisando notificaciones... Hora Servidor: ${now.toLocaleString()} | Pendientes encontradas: ${matchCount}`);
    }

    private static async triggerInactivity(user: any) {
        const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
        const prompt = `[NOTIFICACIÃ“N DE INACTIVIDAD]: ActÃºa como el Sigil. Realiza una CalibraciÃ³n de Inercia EnergÃ©tica.
        InstrucciÃ³n: Cruza la Biblia de Datos del usuario con el Pulso del DÃ­a. 
        ${SYSTEM_PROMPTS[lang].templates.structure}\n${SYSTEM_PROMPTS[lang].templates.inactivity}`;
        const sigil = new SigilService();
        const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang, undefined, { persistUserMessage: false, visibleInConversation: false, source: 'internal_notification' });
        const tts = new TTSService();
        const useVoice = user.profile_data?.telegram_voice_enabled !== false;
        await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice);
    }

    private static async sendFullMessage(chatId: string, text: string, tts: TTSService, useVoice: boolean, region: string = 'global') {
        if (useVoice) {
            const { buffer } = await tts.generateVoice(text, region);
            if (buffer) {
                return await sendProactiveVoice(chatId, buffer, text);
            }
        }
        return await sendProactiveMessage(chatId, text);
    }

    public static scheduleDaemon() {
        console.log("ðŸŒŒ [NOTIF_ENGINE] Unified Notification Daemon initialized.");
        
        // Run once immediately on start
        this.checkTuningCycles().catch(e => console.error("ðŸ”¥ [NOTIF_ENGINE] Initial check failed:", e));

        setInterval(async () => {
            try {
                await this.checkTuningCycles();
                
                const now = new Date();
                // Removed the fixed 11:30 server check. 
                // Now checkInactivity is called inside checkTuningCycles for each user locally.

            } catch (error) {
                console.error("ðŸ”¥ [NOTIF_ENGINE] Daemon Loop Error:", error);
            }
        }, 1000 * 60);
    }

    private static getUniqueTelegramUsers(users: any[]): any[] {
        // BUG FIX: Do NOT deduplicate profiles by telegram_chat_id yet.
        // We need to check tunings for ALL duplicate profiles because the user might have saved 
        // a tuning in one profile and the reading time in another.
        return users.filter(u => u.telegram_chat_id);
    }


    public static async checkInactivity() {
        console.info("â° [NOTIF_ENGINE] Checking Inactivity sweep...");
        const { data: users } = await supabase.from('profiles').select('id, email, telegram_chat_id, nickname, full_name, profile_data, language').not('telegram_chat_id', 'is', null);
        if (!users) return;
        const uniqueUsers = this.getUniqueTelegramUsers(users);
        for (const user of uniqueUsers) {
            try {
                const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                const prompt = `[NOTIFICACIÃ“N DE INACTIVIDAD]: ActÃºa como el Sigil. Realiza una CalibraciÃ³n de Inercia EnergÃ©tica.
                InstrucciÃ³n: Cruza la Biblia de Datos del usuario con el Pulso del DÃ­a. 
                ${SYSTEM_PROMPTS[lang].templates.structure}\n${SYSTEM_PROMPTS[lang].templates.inactivity}`;
                const sigil = new SigilService();
                const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang, undefined, { persistUserMessage: false, visibleInConversation: false, source: 'internal_notification' });
                const tts = new TTSService();
                const useVoice = user.profile_data?.telegram_voice_enabled !== false;
                await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice);
            } catch (e) {
                console.error(`[NOTIF_ENGINE] Inactivity sweep failed for ${user.id}`, e);
            }
        }
    }
}

