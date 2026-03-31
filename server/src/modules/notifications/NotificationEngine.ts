import { supabase } from '../../lib/supabase';
import { sendProactiveMessage, sendProactiveVoice } from '../sigil/telegramService';
import { SigilService } from '../sigil/service';
import { CoherenceService } from '../coherence/service';
import { SYSTEM_PROMPTS, DYNAMIC_SEGMENTS } from '../sigil/prompts';
import { TTSService } from '../sigil/ttsService';
import { DailyOracleEngine } from '../oracle/DailyOracleEngine';
import { DailyOracleOracle } from '../oracle/DailyOracleOracle';

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
                // Timezone logic
                const profileData = user.profile_data || {};
                const astroData = user.astrology || {};
                const offset = (profileData.utcOffset !== undefined) 
                    ? profileData.utcOffset 
                    : (astroData.timezone_offset !== undefined ? astroData.timezone_offset : -6);
                
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

                if (!isProtocolDue && !isOracleDue && labAspects.length === 0) continue;

                console.info(`🎯 [CRON] Match FOUND for ${user.email} at ${userTimeStr} (Offset: ${offset})`);

                const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                const sigil = new SigilService();
                const tts = new TTSService();
                const useVoice = user.profile_data?.telegram_voice_enabled !== false;

                // --- EXECUTION 1: Lab Consolidations ---
                if (labAspects.length > 0) {
                    console.info(`🚀 [NOTIF] Triggering Lab: ${user.email}`);
                    const cleanAspects = labAspects.map(a => a.replace(/^lab_/, '').replace(/_\d+$/, ''));
                    const aspectsStr = [...new Set(cleanAspects)].join(', ');
                    const prompt = DYNAMIC_SEGMENTS[lang].tuning_reminder(aspectsStr);
                    const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang);
                    const success = await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                    console.info(`📡 [NOTIF] Lab Result for ${user.email}: ${success}`);
                    
                    const labIds = userTunings.filter(t => labAspects.includes(t.aspect)).map(t => t.id);
                    await supabase.from('coherence_tunings').update({ last_triggered_at: new Date().toISOString() }).in('id', labIds);
                }

                // --- EXECUTION 2: Protocol 21 (with Seal Check) ---
                if (isProtocolDue) {
                    const { data: metrics } = await supabase
                        .from('daily_metrics')
                        .select('id')
                        .eq('user_id', user.id)
                        .gte('created_at', `${userDateStr}T00:00:00.000Z`)
                        .lte('created_at', `${userDateStr}T23:59:59.999Z`);

                    if (!metrics || metrics.length === 0) {
                        console.info(`🚀 [NOTIF] Triggering Protocol: ${user.email}`);
                        const discipline = SYSTEM_PROMPTS[lang].templates.discipline.replace('{current}', '?').replace('{target}', '21');
                        const prompt = `${SYSTEM_PROMPTS[lang].templates.structure}\n${discipline}`;
                        const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang);
                        const success = await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                        console.info(`📡 [NOTIF] Protocol Result for ${user.email}: ${success}`);
                        
                        const p21Tuning = userTunings.find(t => t.aspect === 'protocol21');
                        if (p21Tuning) {
                            await supabase.from('coherence_tunings').update({ last_triggered_at: new Date().toISOString() }).eq('id', p21Tuning.id);
                        }
                    } else {
                        console.info(`⏹️ [NOTIF] Skipping Protocol for ${user.email} - Already sealed.`);
                    }
                }

                // --- EXECUTION 3: Daily Reading (12-Factor Oracle) ---
                if (isOracleDue) {
                    const todayStr = userLocal.toISOString().split('T')[0];
                    
                    // 1. Check Cache
                    const { data: cached } = await supabase
                        .from('daily_readings')
                        .select('reading_text')
                        .eq('user_id', user.id)
                        .gte('created_at', `${todayStr}T00:00:00.000Z`)
                        .lte('created_at', `${todayStr}T23:59:59.999Z`)
                        .maybeSingle();

                    let reading: string;

                    if (cached) {
                        console.info(`📦 [NOTIF] Using cached Oracle for ${user.email}`);
                        reading = cached.reading_text;
                    } else {
                        console.info(`🚀 [NOTIF] Generating 12-Factor Oracle for ${user.email}`);
                        
                        // Fetch full profile for 12-factor data
                        const { data: fullProfile } = await supabase
                            .from('profiles')
                            .select('astrology, numerology, mayan, chinese_animal, chinese_element')
                            .eq('id', user.id)
                            .single();

                        const profileForEngine = {
                            astrology_data: fullProfile?.astrology,
                            numerology_data: fullProfile?.numerology,
                            maya_data: fullProfile?.mayan,
                            china_data: { animal: fullProfile?.chinese_animal, element: fullProfile?.chinese_element }
                        };

                        const dayPillars = await DailyOracleEngine.getDayPillars(userLocal);
                        const interaction = DailyOracleEngine.calculateFusion(profileForEngine, dayPillars);
                        const coherenceData = await CoherenceService.getCoherence(user.id);
                        const coherence = {
                            state: coherenceData.global_coherence >= 75 ? 'HIGH' : coherenceData.global_coherence < 45 ? 'LOW' : 'MEDIUM',
                            level: coherenceData.global_coherence / 100
                        };
                        const { toneProfile } = DailyOracleEngine.getAdaptiveProfile(interaction, coherence.state);

                        reading = await DailyOracleOracle.generateDailyReading({
                            userName: user.nickname || user.full_name,
                            userPillars: fullProfile,
                            dayPillars,
                            interaction,
                            coherence,
                            toneProfile,
                            language: lang
                        });

                        // Cache Result
                        await supabase.from('daily_readings').insert({
                            user_id: user.id,
                            reading_text: reading,
                            pillars_data: { dayPillars, interaction }
                        });
                    }

                    const success = await this.sendFullMessage(user.telegram_chat_id, reading, tts, useVoice, lang === 'en' ? 'global' : 'latam');
                    console.info(`📡 [NOTIF] 12-Factor Oracle Result for ${user.email}: ${success}`);
                }

            } catch (e) {
                console.error(`[NOTIF_ENGINE] Failed processing triggers for ${user.id}`, e);
            }
        }

        console.log(`[CRON] Revisando notificaciones... Hora Servidor: ${now.toLocaleString()} | Pendientes encontradas: ${matchCount}`);
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
        console.log("🌌 [NOTIF_ENGINE] Unified Notification Daemon initialized.");
        
        // Run once immediately on start
        this.checkTuningCycles().catch(e => console.error("🔥 [NOTIF_ENGINE] Initial check failed:", e));

        setInterval(async () => {
            try {
                await this.checkTuningCycles();
                
                const now = new Date();
                if (now.getHours() === 11 && now.getMinutes() === 30) {
                    await this.checkInactivity();
                }
            } catch (error) {
                console.error("🔥 [NOTIF_ENGINE] Daemon Loop Error:", error);
            }
        }, 1000 * 60);
    }

    private static getUniqueTelegramUsers(users: any[]): any[] {
        const uniqueMap = new Map<string, any>();
        for (const user of users) {
            if (!user.telegram_chat_id) continue;
            const existing = uniqueMap.get(user.telegram_chat_id);
            if (!existing || (user.language && !existing.language)) {
                uniqueMap.set(user.telegram_chat_id, user);
            }
        }
        return Array.from(uniqueMap.values());
    }

    public static async checkInactivity() {
        console.info("⏰ [NOTIF_ENGINE] Checking Inactivity sweep...");
        const { data: users } = await supabase.from('profiles').select('id, email, telegram_chat_id, nickname, full_name, profile_data, language').not('telegram_chat_id', 'is', null);
        if (!users) return;
        const uniqueUsers = this.getUniqueTelegramUsers(users);
        for (const user of uniqueUsers) {
            try {
                const lang = ((user.language === 'en' || user.language === 'es') ? user.language : 'es') as 'es' | 'en';
                const prompt = `${SYSTEM_PROMPTS[lang].templates.structure}\n${SYSTEM_PROMPTS[lang].templates.inactivity}`;
                const sigil = new SigilService();
                const message = await sigil.processMessage(user.id, prompt, undefined, undefined, 'maestro', false, undefined, lang);
                const tts = new TTSService();
                const useVoice = user.profile_data?.telegram_voice_enabled !== false;
                await this.sendFullMessage(user.telegram_chat_id, message, tts, useVoice);
            } catch (e) {
                console.error(`[NOTIF_ENGINE] Inactivity sweep failed for ${user.id}`, e);
            }
        }
    }
}
