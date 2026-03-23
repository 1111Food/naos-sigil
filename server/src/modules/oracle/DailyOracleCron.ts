import { supabase } from '../../lib/supabase';
import { DailyOracleEngine } from './DailyOracleEngine';
import { DailyOracleOracle } from './DailyOracleOracle';
import { CoherenceService } from '../coherence/service';
import { sendProactiveMessage } from '../sigil/telegramService';

export class DailyOracleCron {
    
    /**
     * Runs the pipeline for all users with an active telegram linkage.
     * Executes once a day (e.g., at 5:00 AM).
     */
    public static async runDailyPipeline() {
        console.log("🌞 [ORACLE_CRON] Starting Daily Reading Pipeline across users...");

        const currentHour = new Date().getHours();
        const timeFilter = `${currentHour.toString().padStart(2, '0')}:00:00`;
        console.log(`🌞 [ORACLE_CRON] Checking dispatches for hour: ${timeFilter}`);

        const query = supabase
            .from('profiles')
            .select('id, full_name, nickname, astrology, numerology, mayan, telegram_chat_id, oracle_time, language')
            .not('telegram_chat_id', 'is', null);

        // Standard dispatch at 8:00 AM includes users with NULL (defaults)
        if (currentHour === 8) {
            query.or(`oracle_time.eq.${timeFilter},oracle_time.is.null`);
        } else {
            query.eq('oracle_time', timeFilter);
        }

        const { data: users, error } = await query;

        if (error) {
            console.error("🔥 [ORACLE_CRON] Error fetching users:", error);
            return;
        }

        if (!users || users.length === 0) {
            console.log("🌞 [ORACLE_CRON] No users linked with Telegram found for daily oracle.");
            return;
        }

        console.log(`🌞 [ORACLE_CRON] Found ${users.length} users to process.`);
        const dayPillars = DailyOracleEngine.getDayPillars(new Date());

        for (const user of users) {
            const userName = user.nickname || user.full_name || 'Arquitecto';
            console.log(`[ORACLE_CRON] Processing daily oracle for ${userName} (${user.id})...`);

            try {
                // 1. Fetch Coherence Context
                const coherenceData = await CoherenceService.getCoherence(user.id);
                const discipline = coherenceData.discipline_score || 50;
                const energy = coherenceData.energy_score || 50;
                const clarity = coherenceData.clarity_score || 50;

                const coherence = DailyOracleEngine.calculateCoherenceLevel(discipline, energy, clarity);

                // 2. Map user base pillars
                const elements = user.astrology?.elements;
                let dominantElement = "None";
                if (elements) {
                    const entries = Object.entries(elements);
                    if (entries.length > 0) {
                        const maxEntry = entries.reduce((a: any, b: any) => (b[1] as number) > (a[1] as number) ? b : a);
                        if ((maxEntry[1] as number) > 0) {
                            dominantElement = maxEntry[0].charAt(0).toUpperCase() + maxEntry[0].slice(1);
                        }
                    }
                }

                const userPillars = {
                    numerology: user.numerology,
                    mayan: user.mayan,
                    astrology: { element: dominantElement } 
                };

                // 3. Scoring
                const initialScores = DailyOracleEngine.calculateAdvancedInteraction(userPillars, dayPillars);
                const { adjustedScores, toneProfile } = DailyOracleEngine.getAdaptiveProfile(initialScores, coherence.state);

                // 4. Generate AI Reading
                const readingText = await DailyOracleOracle.generateDailyReading({
                    userName,
                    dayPillars,
                    interaction: adjustedScores,
                    coherence,
                    toneProfile,
                    language: user.language || 'es'
                });

                // 5. Save report (Step 11) using interaction_logs
                await supabase.from('interaction_logs').insert({
                    user_id: user.id,
                    user_message: `[ORACLE_TRIGGER_DAILY: ${new Date().toISOString().split('T')[0]}]`,
                    sigil_response: readingText
                });

                // 6. Deliver to Telegram
                if (user.telegram_chat_id) {
                    const delivered = await sendProactiveMessage(user.telegram_chat_id, readingText);
                    if (delivered) {
                        console.log(`[ORACLE_CRON] ✅ Telegram Sent to ${userName}`);
                    } else {
                        console.warn(`[ORACLE_CRON] ⚠️ Telegram failed for ${userName}`);
                    }
                }

                // --- BATCHING / PACING ---
                // Wait 1.5 seconds between dispatches to bypass Telegram structural Rate Limits
                await new Promise(resolve => setTimeout(resolve, 1500));

            } catch (err) {
                console.error(`[ORACLE_CRON] Error during processing user ${user.id}:`, err);
            }
        }

        console.log("🌞 [ORACLE_CRON] Daily Reading Pipeline Finished.");
    }

    /**
     * Schedules the daemon to run hourly.
     */
    public static scheduleDaemon() {
        const scheduleNext = () => {
            const now = new Date();
            const nextHour = new Date();
            nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Trigger at the top of the next hour

            const delay = nextHour.getTime() - now.getTime();
            const mins = Math.round(delay / 1000 / 60);
            console.log(`🌞 [ORACLE_CRON] Daemon starting. Next hour trigger in ${mins} minutes`);

            setTimeout(async () => {
                try {
                    await this.runDailyPipeline();
                } catch (err) {
                    console.error("🔥 [ORACLE_CRON] Pipeline crashed:", err);
                }
                scheduleNext(); // Schedule for the next day
            }, delay);
        };

        scheduleNext();
    }
}
