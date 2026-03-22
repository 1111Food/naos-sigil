import { FastifyInstance } from 'fastify';
import { SigilService } from '../modules/sigil/service';
import { EnergyService } from '../modules/energy/service';
import { UserService } from '../modules/user/service';
import { SubscriptionService } from '../modules/subscription/service';
import { TarotService } from '../modules/tarot/service';
import { NumerologyService } from '../modules/numerology/service';
import { UserProfile } from '../types';

import { supabase } from '../lib/supabase';
import { validateUser, validatePremium } from '../middleware/auth';
import { CoherenceService } from '../modules/coherence/service';
import { NaosCompilerService } from '../modules/user/naosCompiler.service';
import { ProtocolService } from '../modules/protocol/service';
import { UsageGuardService } from '../modules/user/UsageGuard';
import { sendProactiveMessage } from '../modules/sigil/telegramService';

import { TTSService } from '../modules/sigil/ttsService';
const geoip = require('geoip-lite');

function detectRegionFromIP(ip: string) {
    // For localhost loopbacks, default to standard US IP so geoip returns viable results for testing
    const cleanIp = ip === '::1' || ip === '127.0.0.1' ? '142.250.190.46' : ip; 
    const geo = geoip.lookup(cleanIp);

    if (!geo) return { country: "unknown", region: "global" };

    const country = geo.country;
    let region = "global";

    if (["US", "CA"].includes(country)) region = "north_america";
    else if (["GT", "MX", "AR", "CO", "PE", "CL", "ES"].includes(country)) region = "latam";
    else if (["FR", "DE", "IT", "NL", "SE", "UK"].includes(country)) region = "europe";

    return { country, region };
}

const sigilService = new SigilService();

export async function apiRoutes(app: FastifyInstance) {

    // 🗺️ GeoIP Middleware
    app.addHook('preHandler', async (req: any) => {
        req.userGeo = detectRegionFromIP(req.ip);
    });

    // Serve Cached TTS Audio file buffer
    app.get<{ Params: { hash: string } }>('/api/sigil/audio/:hash', async (req, reply) => {
        const { hash } = req.params;
        const tts = new TTSService();
        const audioPath = tts.getAudioPath(hash);

        if (!audioPath) {
            return reply.status(404).send({ error: "Audio no encontrado" });
        }

        const fs = require('fs');
        const buffer = fs.readFileSync(audioPath);
        return reply.type('audio/mpeg').send(buffer);
    });

    app.get('/api/test-supabase', async (req, reply) => {
        console.log("🧪 Manual Test: Attempting Real Insert to Supabase...");
        const testPayload = {
            id: '77777777-7777-7777-7777-777777777777', // Special Test ID
            full_name: "Test User AntiGravity",
            birth_date: "1990-01-01",
            birth_time: "12:00",
            birth_location: "Audit City",
            profile_data: { test: true, auditor: "AntiGravity" },
            updated_at: new Date().toISOString()
        };

        try {
            console.log("🚀 TEST PAYLOAD:", JSON.stringify(testPayload, null, 2));
            const { data, error } = await supabase
                .from('profiles')
                .upsert(testPayload)
                .select();

            if (error) {
                console.error("❌ Manual Test Failed:", JSON.stringify(error, null, 2));
                return reply.status(500).send({ status: 'error', error });
            }

            console.log("✅ Manual Test Success. Data:", JSON.stringify(data, null, 2));
            return { status: 'ok', message: 'Insert/Upsert Successful', data };
        } catch (e) {
            console.error("🔥 Manual Test Crash:", e);
            return reply.status(500).send({ status: 'crash', error: e });
        }
    });


    // Chat
    app.post<{ Body: { message: string, localTimestamp?: string, oracleState?: any, role?: 'maestro' | 'guardian', energyContext?: any, language?: 'es' | 'en' } }>('/api/chat', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const { message, localTimestamp, oracleState, role, energyContext, language } = req.body;
        const userId = (req as any).user_id;

        // 🛡️ UsageGuard Limit Check
        const limitCheck = await UsageGuardService.checkLimit(userId, 'sigil');
        if (!limitCheck.ok) {
            return reply.status(403).send({ error: "Límite de Energía Agotado", message: limitCheck.message });
        }

        try {
            const res = await sigilService.processMessage(userId, message, localTimestamp, oracleState, role, false, energyContext, language || 'es', (req as any).userGeo);

            // Generate TTS Audio Buffer for the response
            const tts = new TTSService();
            const { hash, buffer } = await tts.generateVoice(res, (req as any).userGeo?.region || 'global');

            await UsageGuardService.incrementUsage(userId, 'sigil');

            // 📊 Usage Logs Analytics (Prompt 13)
            supabase.from('usage_logs').insert({
                user_id: userId,
                country: (req as any).userGeo?.country || 'unknown',
                region: (req as any).userGeo?.region || 'global',
                language: language || 'es',
                endpoint: '/api/chat'
            }).then(({ error }) => {
                if (error) console.error("⚠️ [Analytics] Failed to log usage:", error);
            });

            return { 
                text: res, 
                audioUrl: buffer ? `/api/sigil/audio/${hash}` : undefined,
                audioBase64: buffer ? buffer.toString('base64') : undefined
            };
        } catch (error: any) {
            console.error("🔥 SIGIL ERROR:", error);

            if (error.message?.includes('LIMITE_CUOTA')) {
                return reply.status(429).send({
                    error: "El Oráculo ha alcanzado su límite de expansión hoy. Tu energía es tan profunda que hemos agotado los recursos temporales. Revisa tu plan o intenta de nuevo en unos minutos.",
                    details: "QUOTA_EXCEEDED"
                });
            }

            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'debug_sigil.log');
                fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] ${error.message}\nStack: ${error.stack}\n`);
            } catch (e) {
                console.error("Log failed", e);
            }

            return reply.status(500).send({
                error: "La red estelar está inestable. Revisa tu conexión mística.",
                details: error.message
            });
        }
    });

    // Prompt 5: Lab Session Trigger
    app.post<{ Body: { element: string } }>('/api/trigger/lab-session', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const { element } = req.body;
        const userId = (req as any).user_id;

        try {
            const { data: user, error } = await supabase
                .from('profiles')
                .select('telegram_chat_id')
                .eq('id', userId)
                .single();

            if (error || !user?.telegram_chat_id) {
                return reply.status(400).send({ error: "Telegram no vinculado" });
            }

            const promptContext = `[SESIÓN LABORATORIO]: El usuario ha iniciado una práctica de ${element}. Genera una instrucción mística de 1-2 líneas para su respiración.`;
            const message = await sigilService.processMessage(userId, promptContext);
            
            await sendProactiveMessage(user.telegram_chat_id, message);
            return { status: 'ok', sent: true };
        } catch (e: any) {
            console.error("🔥 LAB TRIGGER ERROR:", e);
            return reply.status(500).send({ error: e.message });
        }
    });

    // Energy
    app.get('/api/energy', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        try {
            const user = await UserService.getProfile(userId);

            // 1. Aplicar decaimiento por inactividad y obtener estado
            await CoherenceService.applyInactivityDecay(userId);
            const coherence = await CoherenceService.getCoherence(userId);

            // 2. Reportar actividad para Disciplina (si entra es porque está activo)
            await CoherenceService.updateScore(userId, 'discipline', 1);
            await CoherenceService.updateStreak(userId);

            return EnergyService.getDailySnapshot(user, coherence.global_coherence);
        } catch (e) {
            console.error("🔥 Energy Route Error:", e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // Profile
    app.get('/api/profile', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return UserService.getProfile(userId);
    });

    app.put<{ Body: Partial<UserProfile> }>('/api/profile', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return UserService.updateProfile(userId, req.body);
    });

    app.post<{ Body: Partial<UserProfile> }>('/api/profile', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        console.log('✅ DATO RECIBIDO DEL CLIENTE:', req.body.name || 'Sin nombre', '| ID:', userId);
        try {
            const result = await UserService.updateProfile(userId, req.body);
            return result;
        } catch (err) {
            console.error('🔥 Error en POST /api/profile:', err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // Subscription
    app.get('/api/subscription', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return SubscriptionService.getStatus(userId);
    });

    app.post('/api/subscription/upgrade', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return SubscriptionService.upgradePlan(userId);
    });

    // Tarot
    app.get('/api/tarot/yes-no', async (req, reply) => {
        return TarotService.drawYesNo();
    });

    app.get('/api/profiles/multiget', { preHandler: [validateUser] }, async (req, reply) => {
        const ids = (req.query as any).ids?.split(',') || [];
        const profiles = await Promise.all(ids.map((id: string) => UserService.getProfile(id)));
        return profiles.map(p => ({ id: p.id, name: p.name }));
    });

    app.get('/api/tarot/celta', async (req, reply) => {
        return TarotService.drawCelta();
    });

    // Numerology
    app.get('/api/numerology', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const user = await UserService.getProfile(userId);
        return NumerologyService.calculateProfile(user.birthDate, user.name);
    });

    // Coherence Index (Detailed)
    app.get('/api/coherence', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        try {
            await CoherenceService.applyInactivityDecay(userId);
            return await CoherenceService.getCoherence(userId);
        } catch (e) {
            console.error("🔥 Coherence Route Error:", e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/naos-code', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const forceRefresh = (req.query as any).refresh === 'true';

        // 🛡️ UsageGuard Limit Check
        if (forceRefresh) { // Only count against quota if they are FORCING a full AI recompile
             const limitCheck = await UsageGuardService.checkLimit(userId, 'naos_code');
             if (!limitCheck.ok) {
                 return reply.status(403).send({ error: "Límite de Energía Agotado", message: limitCheck.message });
             }
        }

        console.log(`🧬 [NAOS_CODE_START] Compilación solicitada para: ${userId} | Refresh: ${forceRefresh}`);
        try {
            const res = await NaosCompilerService.compile(userId, forceRefresh);
            if (forceRefresh) {
                 await UsageGuardService.incrementUsage(userId, 'naos_code');
            }
            return res;
        } catch (e: any) {
            console.error("🔥 NAOS Compiler Route Error:", e);
            return reply.status(500).send({ error: 'Failed to compile NAOS Identity', details: e.message });
        }
    });

    // Debug & Health
    app.get('/api/health-check/ai', async (req, reply) => {
        try {
            const res = await sigilService.generateResponse("ping", "health-check-system");
            return { status: 'ok', response: res };
        } catch (e: any) {
            return reply.status(500).send({ status: 'error', error: e.message });
        }
    });

    app.get('/api/debug/state', { preHandler: [validateUser] }, async (req, reply) => {
        return UserService.getRawState();
    });

    // Onboarding (TEMP DEBUG: No auth)
    app.get('/api/onboarding/cold-read', async (req, reply) => {
        // Mocking a userId if not present for testing
        const userId = (req as any).user_id || (req.query as any).userId || '77777777-7777-7777-7777-777777777777';
        console.log(`📡 [API] Cold Read request for User: ${userId}`);
        try {
            const result = await sigilService.generateColdRead(userId);
            console.log(`✅ [API] Cold Read generated successfully for ${userId}`);
            return result;
        } catch (error: any) {
            console.error("🔥 [API] Cold Read Error:", error.message, error.stack);
            return reply.status(500).send({ error: 'Failed to generate initial initiation.', details: error.message });
        }
    });

    app.post('/api/onboarding/complete', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        console.log(`📡 [API] Completing onboarding for User: ${userId}`);
        try {
            const result = await UserService.updateProfile(userId, { onboarding_completed: true });
            console.log(`✅ [API] Onboarding marked complete for ${userId}`);

            // Fire-and-forget: Pre-compile NAOS Identity so it's ready when they enter the dashboard
            NaosCompilerService.compile(userId, true).then(() => {
                console.log(`✅ [API] Background NAOS Identity compiled for ${userId}`);
            }).catch(e => console.error("🔥 [API] Background NAOS compile failed:", e));

            return { status: 'ok', onboarding_completed: result.onboarding_completed };
        } catch (error: any) {
            console.error("🔥 [API] Onboarding Complete Error:", error.message);
            return reply.status(500).send({ error: 'Failed to complete onboarding.' });
        }
    });

    // 21/90 Protocols
    app.post<{ Body: { protocolId: string, dayNumber: number, notes?: string } }>('/api/protocols/seal-day', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const token = (req as any).token;
        try {
            const { protocolId, dayNumber, notes } = req.body;
            return await ProtocolService.sealDay(userId, protocolId, dayNumber, notes, token);
        } catch (e: any) {
            console.error("🔥 Protocol Seal-Day Error:", e);
            return reply.status(500).send({ error: e.message });
        }
    });

    app.post<{ Body: { protocolId: string } }>('/api/protocols/evolve', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const token = (req as any).token;
        try {
            const { protocolId } = req.body;
            return await ProtocolService.evolveProtocol(userId, protocolId, token);
        } catch (e: any) {
            console.error("🔥 Protocol Evolution Error:", e);
            return reply.status(500).send({ error: e.message });
        }
    });
}
