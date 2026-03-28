import { supabase } from '../../lib/supabase';
import crypto from 'crypto';
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
            .select('id, full_name, nickname, astrology, numerology, mayan, nawal_maya, chinese_animal, telegram_chat_id, oracle_time, language, profile_data')
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
            
            try {
                // --- RACE CONDITION MITIGATION (JITTER) ---
                // Wait a random jitter (0-2000ms) to stagger different server instances (e.g. Render autoscaling nodes)
                const jitter = Math.floor(Math.random() * 2000);
                await new Promise(resolve => setTimeout(resolve, jitter));

                // 0. ATOMIC LOCKING: Stake a claim using a deterministic UUID in interaction_logs
                // This ensures that even if multiple processes launch simultaneously, only the first one to insert wins.
                const todayStr = new Date().toISOString().split('T')[0];
                const lockString = `ORACLE_LOCK:${user.id}:${todayStr}`;
                const hash = crypto.createHash('sha1').update(lockString).digest('hex');
                // Format hash as UUID (8-4-4-4-12)
                const lockId = `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
                
                const { error: claimError } = await supabase.from('interaction_logs').insert({
                    id: lockId,
                    user_id: user.id,
                    user_message: `[ORACLE_TRIGGER_DAILY: ${todayStr}]`,
                    sigil_response: 'Processing...'
                });

                if (claimError) {
                    // Check if it's a unique constraint violation (PGRST23505 or code 23505)
                    if ((claimError as any).code === '23505' || (claimError as any).code === 'PGRST23505') {
                        console.log(`[ORACLE_CRON] ⏭️ Skipping ${userName} (${user.id}) - Lock already acquired by another instance.`);
                    } else {
                        console.error(`[ORACLE_CRON] ❌ Error staking claim for ${userName}:`, claimError);
                    }
                    continue;
                }

                console.log(`[ORACLE_CRON] 🛡️ Atomic lock (ID: ${lockId}) acquired for ${userName}. Processing reading...`);

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

                // Correct extraction of Solar Sign from Natal Chart
                const sunPlanet = user.astrology?.planets?.find((p: any) => p.name === 'Sun');

                const userPillars = {
                    numerology: user.numerology, // Contains lifePathNumber, pinaculo
                    mayan: { 
                        nawal: user.nawal_maya || user.mayan?.kicheName || "Unknown" 
                    },
                    astrology: { 
                        sign: sunPlanet?.sign || "Unknown",
                        element: dominantElement 
                    },
                    chinese: {
                        animal: user.chinese_animal || "Unknown"
                    }
                };

                // 3. Scoring
                const initialScores = DailyOracleEngine.calculateAdvancedInteraction(userPillars, dayPillars);
                const { adjustedScores, toneProfile } = DailyOracleEngine.getAdaptiveProfile(initialScores, coherence.state);

                // 4. Generate AI Reading
                const readingText = await DailyOracleOracle.generateDailyReading({
                    userName,
                    userPillars, // Pass full Natal Data
                    dayPillars,  // Pass Today's Pulse
                    interaction: adjustedScores,
                    coherence,
                    toneProfile,
                    language: user.language || 'es'
                });

                // 5. Update lock to actual report
                const { error: updateError } = await supabase
                    .from('interaction_logs')
                    .update({
                        sigil_response: readingText
                    })
                    .eq('id', lockId);

                if (updateError) {
                    console.error("[ORACLE_CRON] ❌ Failed to finalize report by ID:", updateError);
                }

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
