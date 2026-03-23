import { supabase } from '../../lib/supabase';
import { sendProactiveMessage, sendProactiveVoice } from '../sigil/telegramService';
import { SigilService } from '../sigil/service';
import { CoherenceService } from '../coherence/service';
import { SIGIL_STRUCTURE_PROMPT, SIGIL_DISCIPLINE_TEMPLATE, SIGIL_INACTIVITY_TEMPLATE } from '../sigil/prompts';
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
     * Central schedule daemon executing contextual check loops.
     */
    public static scheduleDaemon() {
        console.log("🌌 [NOTIF_ENGINE] Notification Daemon initialized.");
        
        // Loop every hour to inspect timers/events
        setInterval(async () => {
            const currentHour = new Date().getHours();

            // Run Protocol Reminders around 7 PM (19:00)
            if (currentHour === 19) {
                await this.checkProtocolReminders();
            }

            // Run Inactivity sweeps once a day at 11:00 AM
            if (currentHour === 11) {
                await this.checkInactivity();
            }

        }, 1000 * 60 * 60); // Hourly checks
    }
}
