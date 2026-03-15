import { FastifyInstance } from 'fastify';
import { AstrologyService } from '../modules/astrology/astroService';
import { supabase } from '../lib/supabase';
import { validateUser } from '../middleware/auth';
import { CoherenceService } from '../modules/coherence/service';
import { UserService } from '../modules/user/service';
import { CoherenceAction, CoherenceEngine } from '../modules/coherence/CoherenceEngine';

export async function coherenceRoutes(app: FastifyInstance) {

    // GET /api/coherence/status
    app.get('/status', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;

        try {
            const profile = await UserService.getProfile(userId);

            // 1. Get detailed index
            await CoherenceService.applyInactivityDecay(userId);
            const coherence = await CoherenceService.getCoherence(userId);

            // 2. Mock Trend (could be calculated from history if needed, but keeping it simple for now)
            const trend = 'up';

            // 3. Get Astral Mood
            const mood = AstrologyService.getDailyMood();

            // 4. Calculate Volatility (Stitch Engine)
            const today = new Date();
            const daySeed = today.getDate();
            const transitsData = {
                astro_transits: { tension_value_tau: (daySeed % 10) / 10 },
                num_transits: { tension_value_tau: ((daySeed + 7) % 10) / 10 },
                maya_transits: { tension_value_tau: ((daySeed + 13) % 10) / 10 },
                chinese_transits: { tension_value_tau: ((daySeed + 21) % 10) / 10 }
            };

            const { calculateUserVolatility } = require('../services/VolatilityEngine');
            const volatility = calculateUserVolatility(profile, transitsData);

            return {
                score: coherence.global_coherence,
                index: {
                    discipline: coherence.discipline_score,
                    energy: coherence.energy_score,
                    clarity: coherence.clarity_score,
                    streak: coherence.current_streak
                },
                trend,
                astralMood: mood,
                volatility
            };

        } catch (e) {
            console.error("🔥 Coherence Status Error:", e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // POST /api/coherence/action
    // Body: { action: 'PROTOCOL_ITEM' | ... }
    app.post<{ Body: { action: CoherenceAction } }>('/action', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const { action } = req.body;

        if (!action) return reply.status(400).send({ error: 'Missing action' });

        try {
            // 1. Get Current Score
            const { data: latest } = await supabase
                .from('coherence_history')
                .select('score')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const currentScore = latest?.score ?? 50;

            // 2. Get Astral Mood
            const mood = AstrologyService.getDailyMood();

            // 3. Calculate New Score (The Law)
            const result = CoherenceEngine.calculate(currentScore, action, mood);

            // 4. Persist
            const { error } = await supabase.from('coherence_history').insert({
                user_id: userId,
                score: result.newScore,
                delta: result.adjustedDelta,
                source: action,
                astral_mood: mood
            });

            if (error) throw error;

            // 5. Manage Streak based on Protocol Action
            if (action === 'PROTOCOL_EVOLUTION') {
                await CoherenceService.updateStreak(userId, 'increment');
               // @ts-ignore
                await UserService.incrementXp(userId, 100);
            } else if (action === 'PROTOCOL_MAINTENANCE') {
                // @ts-ignore
                await CoherenceService.updateStreak(userId, 'freeze');
                await UserService.incrementXp(userId, 50);
            } else if (action === 'PROTOCOL_ENTROPIC') {
                // @ts-ignore
                await CoherenceService.updateStreak(userId, 'reset');
            } else if (action === 'PROTOCOL_ITEM') {
                await UserService.incrementXp(userId, 10);
            }

            return {
                success: true,
                newScore: result.newScore,
                delta: result.adjustedDelta,
                mood
            };

        } catch (e) {
            console.error("🔥 Coherence Action Error:", e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

}
