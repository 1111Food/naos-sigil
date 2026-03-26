import { supabase } from '../../lib/supabase';
import { sendProactiveMessage, sendProactiveVoice } from '../sigil/telegramService';
import { SigilService } from '../sigil/service';
import { CoherenceService } from '../coherence/service';
import { SYSTEM_PROMPTS, DYNAMIC_SEGMENTS, SIGIL_STRUCTURE_PROMPT, SIGIL_DISCIPLINE_TEMPLATE, SIGIL_INACTIVITY_TEMPLATE } from '../sigil/prompts';
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
                 // Check if user has active triggers in 21 days
                 const { data: cycles } = await supabase
                    .from('energy_logs') // Assuming energy_logs or protocol_tracker exists
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                 // Check condition: if not closed today
                 const hasClosedToday = false; // Mock/placeholder condition for check routine

                 if (!hasClosedToday && user.telegram_chat_id) {
                     const userName = user.nickname || user.full_name || 'Arquitecto';
                     
                     // Trigger Sigil message addressing the Protocol stall
                     const promptContext = `${SIGIL_STRUCTURE_PROMPT}\n${SIGIL_DISCIPLINE_TEMPLATE.replace('{current}', '7').replace('{target}', '21')}`;
                                          const sigil = new SigilService();
                      const sigilResponse = await sigil.processMessage(user.id, promptContext, undefined, undefined, 'maestro', false, undefined, user.language || 'es');

                     console.log(`[NOTIF_ENGINE] Sending reminder to ${userName}`);
                     
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
            const contextMsg = `${SIGIL_STRUCTURE_PROMPT}\n${SIGIL_INACTIVITY_TEMPLATE}`;
            
            const sigil = new SigilService();
            const message = await sigil.processMessage(user.id, contextMsg, undefined, undefined, 'maestro', false, undefined, user.language || 'es');

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

        const userMap = users.reduce((acc: any, u: any) => {
            if (u.telegram_chat_id) acc[u.id] = u;
            return acc;
        }, {});

        for (const tuning of tunings) {
            const user = userMap[tuning.user_id];
            if (!user) continue;

            // Logic: Adjust server time to user local time
            // utcOffset is expected in hours (e.g., -6)
            const offset = (user.profile_data?.utcOffset !== undefined) ? user.profile_data.utcOffset : -6;
            
            // Generate clean User Local Time
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const userLocal = new Date(utc + (3600000 * offset));
            
            const userHour = String(userLocal.getHours()).padStart(2, '0');
            const userMin = String(userLocal.getMinutes()).padStart(2, '0');
            const userTimeStr = `${userHour}:${userMin}`;

            const schedules = tuning.cron_schedule.split(',');
            const hasMatch = schedules.includes(userTimeStr);

            if (hasMatch) {
                console.log(`🚨 [NOTIF_ENGINE] Timezone Match (${offset}): ${userTimeStr} for ${user.nickname || user.full_name} (Aspect: ${tuning.aspect})`);
                
                try {
                    const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                    const prompt = DYNAMIC_SEGMENTS[lang].tuning_reminder(tuning.aspect);
                    const sigil = new SigilService();
                    const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, user.language || 'es');

                    const tts = new TTSService();
                    const { buffer } = await tts.generateVoice(message);

                    const useVoice = user.profile_data?.telegram_voice_enabled !== false;
                    if (useVoice && buffer) {
                        await sendProactiveVoice(user.telegram_chat_id, buffer, message);
                    } else {
                        await sendProactiveMessage(user.telegram_chat_id, message);
                    }
                } catch (e) {
                    console.error(`[NOTIF_ENGINE] Failed sending tuning for ${user.id}`, e);
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
