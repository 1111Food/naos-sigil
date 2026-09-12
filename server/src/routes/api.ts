import { FastifyInstance } from 'fastify';
import { SigilService } from '../modules/sigil/service';
import { EnergyService } from '../modules/energy/service';
import { UserService } from '../modules/user/service';
import { SubscriptionService } from '../modules/subscription/service';
import { TarotService } from '../modules/tarot/service';
import { NumerologyService } from '../modules/numerology/service';
import { UserProfile } from '../types';

import { config } from '../config/env';
import { supabase } from '../lib/supabase';
import { validateUser, validatePremium } from '../middleware/auth';
import { CoherenceService } from '../modules/coherence/service';
import { NaosCompilerService } from '../modules/user/naosCompiler.service';
import { ProtocolService } from '../modules/protocol/service';
import { UsageGuardService } from '../modules/user/UsageGuard';
import { sendProactiveMessage } from '../modules/sigil/telegramService';
import { ForecastService } from '../modules/forecast/service';
import { LifelineService } from '../modules/lifeline/service';
import { TTSService } from '../modules/sigil/ttsService';
import { RequestDeduplicator } from '../lib/deduplicator';
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

    // Ã°Å¸â€”ÂºÃ¯Â¸Â GeoIP Middleware
    app.addHook('preHandler', async (req: any) => {
        // req.userGeo = detectRegionFromIP(req.ip);
        req.userGeo = { country: "unknown", region: "global" };
    });

    // Serve Cached TTS Audio file buffer
    app.get<{ Params: { hash: string } }>('/api/sigil/audio/:hash', {
        preHandler: [validateUser],
        config: {
            rateLimit: {
                max: 15,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const { hash } = req.params;
        const tts = new TTSService();
        const audioPath = tts.getAudioPath(userId, hash);

        if (!audioPath) {
            return reply.status(404).send({ error: "Audio no encontrado o no autorizado" });
        }

        const fs = require('fs');
        const buffer = fs.readFileSync(audioPath);
        return reply.type('audio/mpeg').send(buffer);
    });

    app.get('/ping', async () => ({ status: 'vibrant', message: `Cosmos is alive on Port ${config.PORT}` }));

    // Generate Telegram Linking Token
    app.post('/api/telegram/link-token', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const crypto = require('crypto');
        const token = crypto.randomBytes(16).toString('hex'); // 128-bit entropy
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const { supabaseAdmin } = require('../lib/supabase');
        const { data: profile, error } = await supabaseAdmin.from('profiles').select('profile_data').eq('id', userId).single();
        if (error || !profile) return reply.status(500).send({ error: 'Profile not found' });

        const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes TTL

        const newProfileData = {
            ...(profile.profile_data || {}),
            telegram_link: { token: tokenHash, expires_at }
        };

        const { error: updateError } = await supabaseAdmin.from('profiles').update({ profile_data: newProfileData }).eq('id', userId);
        if (updateError) return reply.status(500).send({ error: 'Could not generate token' });

        return reply.send({ token, expires_at });
    });

    // Ã°Å¸â€ Â® Forecast (Time Map) Endpoints
    app.get<{ Querystring: { lang?: string } }>('/api/forecast', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const userRole = (req as any).user?.role;
        const isPremium = userRole === 'premium' || userRole === 'admin';
        const lang = req.query.lang || 'es';
        
        try {
            const map = await ForecastService.getTimeMap(userId, lang);
            if (!map) {
                return reply.status(404).send({ error: "No forecast found", needsGeneration: true });
            }
            
            // Server-side Premium Enforcement: Censor months > 0 for free users
            if (!isPremium && map?.months && Array.isArray(map.months)) {
                for (let i = 1; i < map.months.length; i++) {
                    map.months[i].insight = lang === 'en' ? "Premium Required" : "Modo Arquitecto Requerido";
                    map.months[i].theme = lang === 'en' ? "Premium Required" : "Modo Arquitecto Requerido";
                    map.months[i].keywords = [];
                }
            }

            return { map };
        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ Error getting forecast:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    app.post<{ Body: { lang?: string } }>('/api/forecast/generate', { 
        preHandler: [validateUser, validatePremium],
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const userRole = (req as any).user?.role;
        const isPremium = userRole === 'premium' || userRole === 'admin';
        const lang = req.body.lang || 'es';
        
        try {
            const map = await RequestDeduplicator.execute(`forecast_${userId}_${lang}`, () => ForecastService.generateTimeMap(userId, lang));
            
            // Server-side Premium Enforcement: Censor months > 0 for free users
            if (!isPremium && map?.months && Array.isArray(map.months)) {
                for (let i = 1; i < map.months.length; i++) {
                    map.months[i].insight = lang === 'en' ? "Premium Required" : "Modo Arquitecto Requerido";
                    map.months[i].theme = lang === 'en' ? "Premium Required" : "Modo Arquitecto Requerido";
                    map.months[i].keywords = [];
                }
            }
            
            return { map };
        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ Error generating forecast:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // Ã°Å¸Â§Â¬ Lifeline (Eje Evolutivo) Endpoints
    app.get<{ Querystring: { lang?: string } }>('/api/lifeline', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const lang = req.query.lang || 'es';
        
        try {
            const map = await LifelineService.getLifeline(userId, lang);
            if (!map) {
                return { exists: false, needsGeneration: true };
            }
            return { exists: true, map };
        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ Error getting lifeline:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    app.post<{ Body: { lang?: string } }>('/api/lifeline/generate', { 
        preHandler: [validateUser, validatePremium],
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const lang = req.body.lang || 'es';
        
        try {
            const map = await RequestDeduplicator.execute(`lifeline_${userId}_${lang}`, () => LifelineService.generateLifeline(userId, lang));
            return { map };
        } catch (error: any) {
            console.error("Ã°Å¸â€ Â¥ Error generating lifeline:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // 🌟 Current Energy Endpoint
    app.get<{ Querystring: { lang?: string } }>('/api/energy/current', { 
        preHandler: [validateUser, validatePremium],
        config: {
            rateLimit: {
                max: 10,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const langRaw = req.query.lang || 'es';
        const lang = ['es', 'en'].includes(langRaw) ? langRaw : 'es'; // SEC-F2B.1: Strict validation
        
        try {
            const energy = await EnergyService.getCurrentEnergy(userId, lang);
            return { energy };
        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ Error getting current energy:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // Ã°Å¸â€Â® Sigil Chat / Interaction Endpoint
    app.post<{ Body: { message: string, localTimestamp?: string, oracleState?: any, role?: 'maestro' | 'guardian', energyContext?: any, language?: 'es' | 'en' } }>('/api/chat', { 
        preHandler: [validateUser],
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const { message, localTimestamp, oracleState, role, energyContext, language } = req.body;
        const userId = (req as any).user_id;

        // Ã°Å¸â€ºÂ¡Ã¯Â¸Â UsageGuard Limit Check
        console.log(`Ã°Å¸â€ºÂ¡Ã¯Â¸Â Sigil API Request | User: ${userId} | Role: ${(req as any).user?.role}`);
        const limitCheck = await UsageGuardService.checkLimit(userId, 'sigil', (req as any).user?.role);
        if (!limitCheck.ok) {
            return reply.status(403).send({ error: "LÃƒÂ­mite de EnergÃƒÂ­a Agotado", message: limitCheck.message });
        }

        try {
            console.log(`Ã°Å¸Å’â‚¬ INCOMING MESSAGE from ${userId}: "${message}"`);
            const res = await sigilService.processMessage(userId, message, localTimestamp, oracleState, role, false, energyContext, language || 'es', (req as any).userGeo);

            let finalText = res;
            let kernelAction = undefined;

            if (res && res.startsWith('[KERNEL_ACTION:')) {
                const match = res.match(/\[KERNEL_ACTION:(.*)\]/);
                if (match && match[1]) {
                    try {
                        kernelAction = JSON.parse(match[1]);
                        finalText = kernelAction.intent || (kernelAction.payload?.mode === 'SUGGEST' ? "Tengo una sugerencia para ti." : "Ejecutando acciÃƒÂ³n...");
                    } catch (e) {
                        console.error("Error parsing KERNEL_ACTION:", e);
                    }
                }
            }

            // Generate TTS Audio Buffer for the response
            const tts = new TTSService();
            const { hash, buffer } = await tts.generateVoice(userId, finalText, (req as any).userGeo?.region || 'global');

            await UsageGuardService.incrementUsage(userId, 'sigil');

            return { 
                text: finalText,
                kernelAction,
                audioUrl: buffer ? `/api/sigil/audio/${hash}` : undefined,
                audioBase64: buffer ? buffer.toString('base64') : undefined
            };

        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ SIGIL ERROR:", error);
            // Deep file logging
            try {
                const fs = require('fs');
                const logPath = require('path').join(process.cwd(), 'critical_error.log');
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] SIGIL ERROR: ${error.message}\n${error.stack}\n`);
            } catch (e) {}

            if (error.message?.includes('LIMITE_CUOTA')) {
                return reply.status(429).send({
                    error: "El OrÃƒÂ¡culo ha alcanzado su lÃƒÂ­mite de expansiÃƒÂ³n hoy.",
                    details: "QUOTA_EXCEEDED"
                });
            }

            return reply.status(500).send({
                error: "La red estelar estÃƒÂ¡ inestable. Revisa tu conexiÃƒÂ³n mÃƒÂ­stica.",
                details: error.message
            });
        }
    });


    // Ã°Å¸â€Â® Sigil Chat DEMO / Review Mode Endpoint
    app.post<{ Body: { message: string, localTimestamp?: string, oracleState?: any, role?: 'maestro' | 'guardian', energyContext?: any, language?: 'es' | 'en' } }>('/api/demo/sigil', { 
        config: {
            rateLimit: {
                max: parseInt(process.env.VITE_REVIEW_LLM_MAX_REQUESTS || '10'),
                timeWindow: '1 hour'
            }
        }
    }, async (req, reply) => {
        if (process.env.VITE_REVIEW_MODE !== 'true') {
            return reply.status(403).send({ error: "Review Mode no estÃƒÂ¡ activo en el servidor." });
        }

        const { message, localTimestamp, oracleState, role, energyContext, language } = req.body;
        
        // Fija la identidad de la DEMO de forma absoluta desde el backend, ignorando cualquier cosa del cliente.
        const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

        try {
            console.log(`Ã°Å¸Å’â‚¬ INCOMING DEMO MESSAGE from IP: "${message}"`);
            
            // Forzamos el userId a DEMO_USER_ID y un flag de demo (isDemo = true) si processMessage lo soporta
            // O podemos usar un generador estÃƒÂ¡tico para ahorrar tokens en revisiÃƒÂ³n.
            if (process.env.VITE_REVIEW_MOCK_SIGIL === 'true') {
                return { 
                    text: `*Respuesta de prueba (MOCK_SIGIL activo)*. Has dicho: "${message}". En modo producciÃƒÂ³n, esta respuesta vendrÃƒÂ­a del LLM real con el perfil demo.`,
                    kernelAction: undefined
                };
            }

            // AquÃƒÂ­ pasamos isDemo=true al sigilService si tuviÃƒÂ©ramos un flag, pero por ahora usamos el ID dummy.
            // Para evitar llenar la DB real o fallos de foreign keys, sigilService deberÃƒÂ­a manejar el demo_id graciosamente.
            // Actualmente processMessage espera que userId exista en profiles. Para la DEMO, quizÃƒÂ¡s es mejor usar un LLM directo sin history persistente o confiar en que SigilService puede manejar usuarios anÃƒÂ³nimos/demos.
            // Como no estoy seguro de si processMessage explotarÃƒÂ¡ con un UUID que no estÃƒÂ¡ en la base de datos, lo mÃƒÂ¡s seguro es proveer una respuesta directa con Gemini si isMockSigil no estÃƒÂ¡ forzado, O usar processMessage si sabemos que lo soporta.
            // Por requerimiento del usuario "con rate-limiting estricto global por IP".
            
            // Llama a processMessage con el DEMO_USER_ID. Si processMessage asume que existe en Supabase y falla, entonces
            // necesitaremos hacer bypass del history guardado, pero por el momento le pasamos DEMO_USER_ID.
            // Se asume que el DEMO_USER_ID estÃƒÂ¡ creado en la DB, o SigilService es tolerante a fallos de escritura de logs.
            
            // Se usarÃƒÂ¡ una llamada bÃƒÂ¡sica de Gemini para aislar la Demo de la base de datos
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
            const model = genAI.getGenerativeModel({ model: config.GEMINI_MODEL });
            const prompt = `Eres NAOS Sigil, un orÃƒÂ¡culo de autoconocimiento, operando en modo DEMO. Responde con sabidurÃƒÂ­a, en el idioma ${language || 'es'}, de forma misteriosa pero ÃƒÂºtil a esto: "${message}"`;
            const result = await model.generateContent(prompt);
            const finalText = result.response.text();
            
            return { 
                text: finalText,
                kernelAction: undefined
            };
        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ Demo Chat Error:", error);
            return reply.status(500).send({ error: error.message });
        }
    });


    // Prompt 5: Lab Session Trigger
    app.post<{ Body: { element: string } }>('/api/trigger/lab-session', { 
        preHandler: [validateUser, validatePremium],
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
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

            const promptContext = `[SESIÃƒâ€œN LABORATORIO]: El usuario ha iniciado una prÃƒÂ¡ctica de ${element}. Genera una instrucciÃƒÂ³n mÃƒÂ­stica de 1-2 lÃƒÂ­neas para su respiraciÃƒÂ³n.`;
            const message = await sigilService.processMessage(userId, promptContext);
            
            await sendProactiveMessage(user.telegram_chat_id, message);
            return { status: 'ok', sent: true };
        } catch (e: any) {
            console.error("Ã°Å¸â€Â¥ LAB TRIGGER ERROR:", e);
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

            // 2. Reportar actividad para Disciplina (si entra es porque estÃƒÂ¡ activo)
            await CoherenceService.updateScore(userId, 'discipline', 1);
            await CoherenceService.updateStreak(userId);

            return EnergyService.getDailySnapshot(user, coherence.global_coherence);
        } catch (e) {
            console.error("Ã°Å¸â€Â¥ Energy Route Error:", e);
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
        console.log('✅ PROFILE UPDATE REQUEST | ID:', userId.split('-')[0]);
        try {
            const result = await UserService.updateProfile(userId, req.body);
            return result;
        } catch (err) {
            console.error('Ã°Å¸â€Â¥ Error en POST /api/profile:', err);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    // Subscription
    app.get('/api/subscription', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return SubscriptionService.getStatus(userId);
    });

    // [DEAD] Obsolete MOCK endpoint. Real upgrade is handled by /api/checkout and webhooks.
    // app.post('/api/subscription/upgrade', { preHandler: [validateUser] }, async (req, reply) => {
    //     const userId = (req as any).user_id;
    //     return SubscriptionService.upgradePlan(userId);
    // });

    // Custom Tuning Deletion (RLS Bypass)
    app.delete<{ Params: { id: string } }>('/api/tunings/:id', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        try {
            const { error } = await supabase.from('coherence_tunings').delete().eq('id', req.params.id).eq('user_id', userId);
            if (error) throw error;
            return { status: 'ok' };
        } catch (e: any) {
            console.error("Ã°Å¸â€Â¥ Error deleting tuning:", e);
            return reply.status(500).send({ error: e.message });
        }
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
            console.error("Ã°Å¸â€Â¥ Coherence Route Error:", e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/naos-code', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const forceRefresh = (req.query as any).refresh === 'true';
        const lang = (req.query as any).lang || 'es';

        // Check Admin
        const isAdmin = (req as any).user?.role === 'admin';

        // Ã°Å¸â€ºÂ¡Ã¯Â¸Â UsageGuard Limit Check
        if (forceRefresh && !isAdmin) { 
             const limitCheck = await UsageGuardService.checkLimit(userId, 'naos_code', (req as any).user?.role);
             if (!limitCheck.ok) {
                 return reply.status(403).send({ error: "LÃƒÂ­mite de EnergÃƒÂ­a Agotado", message: limitCheck.message });
             }
        }

        console.log(`Ã°Å¸Â§Â¬ [NAOS_CODE_START] CompilaciÃƒÂ³n solicitada para: ${userId} | Refresh: ${forceRefresh} | Lang: ${lang}`);
        try {

            const res = await NaosCompilerService.compile(userId, forceRefresh, lang as any);
            if (forceRefresh) {
                 await UsageGuardService.incrementUsage(userId, 'naos_code');
            }
            return res;
        } catch (e: any) {
            console.error("Ã°Å¸â€Â¥ NAOS Compiler Route Error:", e);
            return reply.status(500).send({ error: 'Failed to compile NAOS Identity', details: e.message });
        }
    });

    // Debug & Health
    app.get('/api/health-check/ai', async (req, reply) => {
        try {
            // SEC-007: Removed direct sigilService.generateResponse to prevent public unauthenticated Gemini API abuse.
            // Health check now only validates server runtime presence.
            return { status: 'alive', message: 'Sigil system is active' };
        } catch (error: any) {
            return reply.status(500).send({ status: 'dead', error: error.message });
        }
    });

    // Onboarding Cold Read (Secured)
    app.get('/api/onboarding/cold-read', {
        preHandler: [validateUser],
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        console.log(`?o [API] Cold Read request for User: ${userId}`);
        try {
            const result = await sigilService.generateColdRead(userId);
            console.log(`ǽ"? [API] Cold Read generated successfully for ${userId}`);
            return result;
        } catch (error: any) {
            console.error("?? [API] Cold Read Error:", error.message, error.stack);
            return reply.status(500).send({ error: 'Failed to generate initial initiation.', details: error.message });
        }
    });

    app.post('/api/onboarding/complete', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        console.log(`Ã°Å¸â€œÂ¡ [API] Completing onboarding for User: ${userId}`);
        try {
            const result = await UserService.updateProfile(userId, { onboarding_completed: true });
            console.log(`Ã¢Å“â€¦ [API] Onboarding marked complete for ${userId}`);

            // Fire-and-forget: Pre-compile NAOS Identity so it's ready when they enter the dashboard
            NaosCompilerService.compile(userId, true).then(() => {
                console.log(`Ã¢Å“â€¦ [API] Background NAOS Identity compiled for ${userId}`);
            }).catch(e => console.error("Ã°Å¸â€Â¥ [API] Background NAOS compile failed:", e));

            return { status: 'ok', onboarding_completed: result.onboarding_completed };
        } catch (error: any) {
            console.error("Ã°Å¸â€Â¥ [API] Onboarding Complete Error:", error.message);
            return reply.status(500).send({ error: 'Failed to complete onboarding.' });
        }
    });

    // 21/90 Protocols
    app.post<{ Body: { protocolId: string, dayNumber: number, notes?: string } }>('/api/protocols/seal-day', { preHandler: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const token = (req as any).token;
        try {
            const { protocolId, dayNumber, notes } = req.body;
            return await ProtocolService.sealDay(userId, protocolId, dayNumber, notes, token);
        } catch (e: any) {
            console.error("Ã°Å¸â€Â¥ Protocol Seal-Day Error:", e);
            return reply.status(500).send({ error: e.message });
        }
    });

    app.post<{ Body: { protocolId: string, newIntention?: string } }>('/api/protocols/evolve', { 
        preHandler: [validateUser, validatePremium],
        config: {
            rateLimit: {
                max: 3,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const token = (req as any).token;
        try {
            const { protocolId, newIntention } = req.body;
            return await ProtocolService.evolveProtocol(userId, protocolId, newIntention || '', token);
        } catch (e: any) {
            console.error("Ã°Å¸â€Â¥ Protocol Evolution Error:", e);
            return reply.status(500).send({ error: e.message });
        }
    });

    // Multi-Profile Management
    app.post<{ Body: any }>('/api/user/profiles', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        try {
            return await UserService.addSubProfile(userId, req.body);
        } catch (e: any) {
            return reply.status(400).send({ error: e.message });
        }
    });

    app.put<{ Params: { id: string }, Body: any }>('/api/user/profiles/:id', { preHandler: [validateUser] }, async (req, reply) => {
         const userId = (req as any).user_id;
         try {
             return await UserService.editSubProfile(userId, req.params.id, req.body);
         } catch (e: any) {
             return reply.status(400).send({ error: e.message });
         }
    });

    app.delete<{ Params: { id: string } }>('/api/user/profiles/:id', { preHandler: [validateUser] }, async (req, reply) => {
         const userId = (req as any).user_id;
         try {
             return await UserService.deleteSubProfile(userId, req.params.id);
         } catch (e: any) {
             return reply.status(400).send({ error: e.message });
         }
    });


    // Ã°Å¸â€Â® Pulso CuÃƒÂ¡ntico (Daily Oracle)
    app.get<{ Querystring: { offset?: number, lang?: string } }>('/api/oracle/daily', { preHandler: [validateUser] }, async (req, reply) => {
        try {
            const offset = Number(req.query.offset) || 0;
            const lang = (req.query.lang || 'es') as 'es' | 'en';
            const userLocal = new Date(new Date().getTime() + (offset * 3600000));
            
            const { DailyOracleEngine } = require('../modules/oracle/DailyOracleEngine');
            const readingData = await DailyOracleEngine.getOrGenerateDailyReading((req as any).user_id, userLocal, offset, lang);

            return { status: 'ok', data: readingData };
        } catch (error: any) {
            console.error("API Error (/api/oracle/daily):", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    app.post<{ Body: { active_sub_profile_id?: string } }>('/api/user/profiles/switch', { preHandler: [validateUser] }, async (req, reply) => {
         const userId = (req as any).user_id;
         try {
             return await UserService.switchProfile(userId, req.body.active_sub_profile_id);
         } catch (e: any) {
             return reply.status(400).send({ error: e.message });
         }
    });
}


