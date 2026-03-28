import { supabase } from '../../lib/supabase';
import { sendProactiveMessage, sendProactiveVoice } from '../sigil/telegramService';
import { SigilService } from '../sigil/service';
import { CoherenceService } from '../coherence/service';
import { SYSTEM_PROMPTS, DYNAMIC_SEGMENTS } from '../sigil/prompts';
import { TTSService } from '../sigil/ttsService';

export class NotificationEngine {

    /**
     * Checks for users that are active in a 21 or 90 day protocol cycle
     * but haven't 'sealed' or checked-in their daily metrics today.
     * Intended to run between 6 PM and 9 PM local hours conceptually.
     */
    public static async checkProtocolReminders() {
        console.log("⏰ [NOTIF_ENGINE] Evaluating Protocol Reminders...");

        // Fetch users with Telegram linked and who are active
        const { data: users, error } = await supabase
            .from('profiles')
            .select('id, nickname, full_name, telegram_chat_id, profile_data, language')
            .not('telegram_chat_id', 'is', null);

        if (error || !users) {
            console.error("🔥 [NOTIF_ENGINE] Error fetching for protocol reminders", error);
            return;
        }

        for (const user of users) {
             try {
                 // Check condition: if not closed today (Placeholder logic)
                 const hasClosedToday = false; 

                 if (!hasClosedToday && user.telegram_chat_id) {
                     const userName = user.nickname || user.full_name || 'Arquitecto';
                     const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                     
                     // Trigger Sigil message addressing the Protocol stall using bilingual templates
                     const structure = SYSTEM_PROMPTS[lang].templates.structure;
                     const discipline = SYSTEM_PROMPTS[lang].templates.discipline.replace('{current}', '7').replace('{target}', '21');
                     const promptContext = `${structure}\n${discipline}`;
                     
                     const sigil = new SigilService();
                     const sigilResponse = await sigil.processMessage(user.id, promptContext, undefined, undefined, 'maestro', false, undefined, lang);

                     console.log(`[NOTIF_ENGINE] Sending reminder to ${userName} in ${lang}`);
                     
                     const tts = new TTSService();
                     const { buffer } = await tts.generateVoice(sigilResponse);

                     const useVoice = user.profile_data?.telegram_voice_enabled !== false; 
                     if (useVoice && buffer) {
                         await sendProactiveVoice(user.telegram_chat_id, buffer, sigilResponse);
                     } else {
                         await sendProactiveMessage(user.telegram_chat_id, sigilResponse);
                     }
                 }
             } catch (e) {
                 console.error(`[NOTIF_ENGINE] Failed processing user ${user.id}`, e);
             }
        }
    }

    /**
     * Detects 24 hours of total user inactivity (no log loads)
     * and encourages returning back into rhythm to disrupt inertia.
     */
    public static async checkInactivity() {
        console.log("⏰ [NOTIF_ENGINE] Checking Inactivity across nodes...");

        // Placeholder query node: Fetch users where last_active_at > 24h ago.
        const { data: users } = await supabase
            .from('profiles')
            .select('id, telegram_chat_id, nickname, full_name, profile_data, language')
            .not('telegram_chat_id', 'is', null);

        if (!users) return;

        for (const user of users) {
            if (!user.telegram_chat_id) continue;

            const userName = user.nickname || user.full_name || 'Arquitecto';
            const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
            const structure = SYSTEM_PROMPTS[lang].templates.structure;
            const inactivity = SYSTEM_PROMPTS[lang].templates.inactivity;
            const contextMsg = `${structure}\n${inactivity}`;
            
            const sigil = new SigilService();
            const message = await sigil.processMessage(user.id, contextMsg, undefined, undefined, 'maestro', false, undefined, lang);

            const tts = new TTSService();
            const { buffer } = await tts.generateVoice(message);

            const useVoice = user.profile_data?.telegram_voice_enabled !== false;
            if (useVoice && buffer) {
                await sendProactiveVoice(user.telegram_chat_id, buffer, message);
            } else {
                await sendProactiveMessage(user.telegram_chat_id, message);
            }
        }
    }

    /**
     * Checks user_tunings (coherence_tunings) to trigger personalized 
     * reminders set by time schedules (e.g., '08:00,12:00').
     */
    public static async checkTuningCycles() {
        const now = new Date();
        // Server time info for fallback or comparison
        const serverHour = String(now.getHours()).padStart(2, '0');
        const serverMin = String(now.getMinutes()).padStart(2, '0');
        const serverTimeStr = `${serverHour}:${serverMin}`;

        console.log(`⏰ [NOTIF_ENGINE] Checking Tuning Cycles at server time: ${serverTimeStr}`);

        const { data: tunings } = await supabase
            .from('coherence_tunings')
            .select('*')
            .eq('is_active', true);

        if (!tunings || tunings.length === 0) return;

        const userIds = [...new Set(tunings.map(t => t.user_id))];
        const { data: users } = await supabase
            .from('profiles')
            .select('id, telegram_chat_id, nickname, full_name, profile_data, language')
            .in('id', userIds);

        if (!users) return;

        for (const user of users) {
            if (!user.telegram_chat_id) continue;

            // Group tunings for this specific user
            const userTunings = tunings.filter(t => t.user_id === user.id);
            const activeAspects: string[] = [];

            // Timezone logic
            const profileData = user.profile_data || {};
            const offset = (profileData.utcOffset !== undefined) 
                ? profileData.utcOffset 
                : (profileData.timezone_offset !== undefined ? profileData.timezone_offset : -6);
            
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const userLocal = new Date(utc + (3600000 * offset));
            const userTimeStr = `${String(userLocal.getHours()).padStart(2, '0')}:${String(userLocal.getMinutes()).padStart(2, '0')}`;

            for (const tuning of userTunings) {
                const schedules = tuning.cron_schedule.split(',');
                if (schedules.includes(userTimeStr)) {
                    activeAspects.push(tuning.aspect);
                }
            }

            if (activeAspects.length > 0) {
                console.log(`🚨 [NOTIF_ENGINE] Consolidating ${activeAspects.length} aspects for ${user.nickname || user.full_name} at ${userTimeStr}`);
                
                try {
                    const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                    
                    // NEW: Consolidate prompt
                    const aspectsStr = activeAspects.join(', ');
                    const prompt = DYNAMIC_SEGMENTS[lang].tuning_reminder(aspectsStr);
                    
                    const sigil = new SigilService();
                    const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang);

                    const tts = new TTSService();
                    const { buffer } = await tts.generateVoice(message);

                    const useVoice = user.profile_data?.telegram_voice_enabled !== false;
                    if (useVoice && buffer) {
                        await sendProactiveVoice(user.telegram_chat_id, buffer, message);
                    } else {
                        await sendProactiveMessage(user.telegram_chat_id, message);
                    }
                } catch (e) {
                    console.error(`[NOTIF_ENGINE] Failed sending consolidated tuning for ${user.id}`, e);
                }
            }
        }
    }


    /**
     * Central schedule daemon executing contextual check loops.
     */
    public static scheduleDaemon() {
        console.log("🌌 [NOTIF_ENGINE] Notification Daemon initialized.");
        
        // Loop every minute to inspect timers/events
        setInterval(async () => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // 1. Run Personalized Tuning Cycles (Personal Cron Lists)
            await this.checkTuningCycles();

            // 2. Run Protocol Reminders & Inactivity sweeps inside their own time-aware checks
            // For now, we call them every minute and they should ideally filter by user local time.
            // But to avoid overloading the DB every minute, we'll keep the server-time triggers 
            // OR implement a smarter check.
            
            // Simple approach: Run sweeps at specific server hours, but the content is already localized.
            if (currentHour === 19 && currentMinute === 0) {
                await this.checkProtocolReminders();
            }
            if (currentHour === 11 && currentMinute === 0) {
                await this.checkInactivity();
            }

        }, 1000 * 60); // Minute-by-minute checks
    }
}
