import { FastifyInstance } from 'fastify';
import { SigilService } from '../modules/sigil/service';

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
        preValidation: [validateUser],
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
    app.post('/api/telegram/link-token', { preValidation: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        try {
            const { TelegramLinkService } = require('../modules/sigil/telegramLinkService');
            const token = await TelegramLinkService.generateToken(userId);
            return reply.send({ token });
        } catch (error) {
            console.error('[TELEGRAM] Link Token Error:', error);
            return reply.status(500).send({ error: 'Could not generate token' });
        }
    });

    // Ã°Å¸â€ Â® Forecast (Time Map) Endpoints
    app.get<{ Querystring: { lang?: string } }>('/api/forecast', { preValidation: [validateUser, validatePremium] }, async (req, reply) => {
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
        preValidation: [validateUser, validatePremium],
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
    app.get<{ Querystring: { lang?: string } }>('/api/lifeline', { preValidation: [validateUser, validatePremium] }, async (req, reply) => {
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
        preValidation: [validateUser, validatePremium],
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
        // YOY Current Energy Endpoint GET (Cache Only)
    app.get<{ Querystring: { lang?: string } }>('/api/energy/current', { 
        preValidation: [validateUser],
        config: { rateLimit: { max: 20, timeWindow: '1 minute' } }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const langRaw = req.query.lang || 'es';
        const lang = ['es', 'en'].includes(langRaw) ? langRaw : 'es'; 
        
        try {
            const { supabase } = require('../lib/supabase');
            const { data: fullProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            if (!fullProfile) throw new Error('User profile not found');
            
            const { DateUtils } = require('../utils/DateUtils');
            const currentTimezoneOffset = DateUtils.getCurrentTimezoneOffset(fullProfile);
            
            const { DailyContextOrchestrator } = require('../modules/daily/DailyContextOrchestrator');
            const v2Payload = await DailyContextOrchestrator.getDailySnapshot(userId, currentTimezoneOffset, lang);
            
            if (!v2Payload) return reply.status(404).send({ exists: false, needsGeneration: true });

            
            let energy: any = {
                interpretationStatus: 'unavailable',
                rawSignals: v2Payload.layerA
            };

            const interpretation = v2Payload.interpretation;
            if (interpretation && interpretation.interpretationStatus === 'ready') {
                energy = {
                    daily: {
                        score: (interpretation as any).score ?? null,
                        title: interpretation.primarySignal?.title || (lang === 'es' ? 'Señal Diaria' : 'Daily Signal'),
                        description: interpretation.primarySignal?.text || (interpretation.primarySignal as any)?.content,
                        action: interpretation.guidance || null,
                        avoid: (interpretation as any).avoid || null
                    },
                    metrics: { focus: null, creativity: null, relationships: null },
                    interpretationStatus: 'ready',
                    rawSignals: v2Payload.layerA
                };
            }

            return { energy };
        } catch (error: any) {
            console.error('API Error (/api/energy/current GET):', error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // YOY Current Energy Endpoint POST (Generate)
    app.post<{ Body: { lang?: string } }>('/api/energy/current/generate', { 
        preValidation: [validateUser],
        config: {
            rateLimit: { max: 5, timeWindow: '1 minute' }
        }
    }, async (req, reply) => {
        const userId = (req as any).user_id;
        const langRaw = req.body.lang || 'es';
        const lang = ['es', 'en'].includes(langRaw) ? langRaw : 'es'; 
        
        try {
            const { supabase } = require('../lib/supabase');
            const { data: fullProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!fullProfile) throw new Error("User profile not found");
            
            const { DateUtils } = require('../utils/DateUtils');
            const currentTimezoneOffset = DateUtils.getCurrentTimezoneOffset(fullProfile);

            const { DailyContextOrchestrator } = require('../modules/daily/DailyContextOrchestrator');
            const v2Payload = await DailyContextOrchestrator.getOrGenerate(
                userId, 
                fullProfile, 
                currentTimezoneOffset, 
                lang
            );

            // ADAPTER: Map V2 Interpretation to Legacy Energy Shape
            let energy: any = {
                interpretationStatus: 'unavailable',
                rawSignals: v2Payload.layerA
            };
            const interpretation = v2Payload.interpretation;
            if (interpretation && interpretation.interpretationStatus === 'ready') {
                energy = {
                    daily: {
                        score: (interpretation as any).score ?? null,
                        title: interpretation.primarySignal?.title || (lang === 'es' ? 'Señal Diaria' : 'Daily Signal'),
                        description: interpretation.primarySignal?.text || (interpretation.primarySignal as any)?.content,
                        action: interpretation.guidance || null,
                        avoid: (interpretation as any).avoid || null
                    },
                    behavioral: {
                        title: interpretation.primarySignal?.behavioral_title || interpretation.primarySignal?.title || '',
                        description: interpretation.primarySignal?.behavioral_text || interpretation.primarySignal?.text || '',
                        action: interpretation.behavioral_guidance || interpretation.guidance || '',
                        avoid: interpretation.behavioral_avoid || (interpretation as any).avoid || ''
                    },
                    metrics: { 
                        focus: interpretation.metrics?.focus ?? null, 
                        creativity: interpretation.metrics?.creativity ?? null, 
                        relationships: interpretation.metrics?.relationships ?? null 
                    },
                    weekly: {
                        theme: (interpretation.integratedPattern as any)?.title || (lang === 'es' ? 'Tema Semanal' : 'Weekly Theme'),
                        description: interpretation.integratedPattern?.text || null
                    },
                    interpretationStatus: 'ready',
                    rawSignals: v2Payload.layerA
                };
            }
            return { energy };
        } catch (error: any) {
            console.error("API Error (/api/energy/current):", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    // Ã°Å¸â€ Â® Sigil Chat / Interaction Endpoint
    app.post<{ Body: { message: string, localTimestamp?: string, oracleState?: any, role?: 'maestro' | 'guardian', energyContext?: any, language?: 'es' | 'en', voice_enabled?: boolean } }>('/api/chat', { 
        preValidation: [validateUser],
        config: {
            rateLimit: {
                max: 5,
                timeWindow: '1 minute'
            }
        }
    }, async (req, reply) => {
        const { message, localTimestamp, oracleState, role, energyContext, language, voice_enabled } = req.body;
        const userId = (req as any).user_id;

        // Ã°Å¸â€ºÂ¡Ã¯Â¸Â UsageGuard Limit Check
        console.log(`Ã°Å¸â€ºÂ¡Ã¯Â¸Â Sigil API Request | User: ${userId} | Role: ${(req as any).user?.role}`);
        const limitCheck = await UsageGuardService.checkLimit(userId, 'sigil', (req as any).user?.role);
        if (!limitCheck.ok) {
            return reply.status(403).send({ error: "LÃƒÂ­mite de EnergÃƒÂ­a Agotado", message: limitCheck.message });
        }

        try {
            console.log(`Ã°Å¸Å'â‚¬ INCOMING MESSAGE from ${userId}: "${message}"`);
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

            // POINT 6 — Voice Gate: only generate TTS if client explicitly requested it
            let audioUrl: string | undefined = undefined;
            let audioBase64: string | undefined = undefined;

            if (voice_enabled === true) {
                try {
                    const tts = new TTSService();
                    const { hash, buffer } = await tts.generateVoice(userId, finalText, (req as any).userGeo?.region || 'global');
                    audioUrl = buffer ? `/api/sigil/audio/${hash}` : undefined;
                    audioBase64 = buffer ? buffer.toString('base64') : undefined;
                } catch (ttsError: any) {
                    // TTS failure must never block the text response
                    console.warn('[TTS] Voice generation failed, text response preserved:', ttsError.message);
                }
            }

            await UsageGuardService.incrementUsage(userId, 'sigil');

            return { 
                text: finalText,
                kernelAction,
                audioUrl,
                audioBase64
            };

        } catch (error: any) {
            console.error("Ã°Å¸â€ Â¥ SIGIL ERROR:", error);
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
        preValidation: [validateUser, validatePremium],
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
            console.error("Ã°Å¸â€ Â¥ LAB TRIGGER ERROR:", e);
            return reply.status(500).send({ error: e.message });
        }
    });

    // Profile
    app.get('/api/profile', { preValidation: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return UserService.getProfile(userId);
    });

    app.put<{ Body: Partial<UserProfile> }>('/api/profile', { preValidation: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return UserService.updateProfile(userId, req.body);
    });

    app.post<{ Body: Partial<UserProfile> }>('/api/profile', { preValidation: [validateUser] }, async (req, reply) => {
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
    app.get('/api/subscription', { preValidation: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        return SubscriptionService.getStatus(userId);
    });

    // [DEAD] Obsolete MOCK endpoint. Real upgrade is handled by /api/checkout and webhooks.
    // app.post('/api/subscription/upgrade', { preValidation: [validateUser] }, async (req, reply) => {
    //     const userId = (req as any).user_id;
    //     return SubscriptionService.upgradePlan(userId);
    // });

    // Custom Tuning Deletion (RLS Bypass)
    app.delete<{ Params: { id: string } }>('/api/tunings/:id', { preValidation: [validateUser] }, async (req, reply) => {
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

    app.get('/api/profiles/multiget', { preValidation: [validateUser] }, async (req, reply) => {
        const ids = (req.query as any).ids?.split(',') || [];
        const profiles = await Promise.all(ids.map((id: string) => UserService.getProfile(id)));
        return profiles.map(p => ({ id: p.id, name: p.name }));
    });

    app.get('/api/tarot/celta', async (req, reply) => {
        return TarotService.drawCelta();
    });

    // Numerology
    app.get('/api/numerology', { preValidation: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const user = await UserService.getProfile(userId);
        return NumerologyService.calculateProfile(user.birthDate, user.name);
    });

    // Coherence Index (Detailed)
    app.get('/api/coherence', { preValidation: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        try {
            await CoherenceService.applyInactivityDecay(userId);
            return await CoherenceService.getCoherence(userId);
        } catch (e) {
            console.error("Ã°Å¸â€Â¥ Coherence Route Error:", e);
            return reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    app.get('/api/naos-code', { preValidation: [validateUser, validatePremium] }, async (req, reply) => {
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
        preValidation: [validateUser],
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

    app.post('/api/onboarding/complete', { preValidation: [validateUser] }, async (req, reply) => {
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
            console.error("Ã°Å¸â€ Â¥ [API] Onboarding Complete Error:", error.message);
            return reply.status(500).send({ error: 'Failed to complete onboarding.' });
        }
    });

    // 21/90 Protocols
    app.post<{ Body: { protocolId: string, dayNumber: number, notes?: string, localDate?: string } }>('/api/protocols/seal-day', { preValidation: [validateUser, validatePremium] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const token = (req as any).token;
        try {
            const { protocolId, dayNumber, notes } = req.body;
            
            // SECURITY: SERVER-AUTHORITATIVE LOCAL DATE (Ignore client bypasses)
            const { data: fullProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
            const { DateUtils } = require('../utils/DateUtils');
            
            const currentTimezoneOffset = DateUtils.getCurrentTimezoneOffset(fullProfile);
            const serverLocalDate = DateUtils.getUserLocalDate(currentTimezoneOffset);
            
            return await ProtocolService.sealDay(userId, protocolId, dayNumber, notes, token, serverLocalDate);
        } catch (e: any) {
            console.error("🚀 Protocol Seal-Day Error:", e);
            if (e.message && e.message.includes('ALREADY_CHECKED_IN_TODAY')) {
                return reply.status(409).send({ error: 'ALREADY_CHECKED_IN_TODAY' });
            }
            return reply.status(500).send({ error: e.message });
        }
    });

    app.post<{ Body: { protocolId: string, newIntention?: string } }>('/api/protocols/evolve', { 
        preValidation: [validateUser, validatePremium],
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
            console.error("Ã°Å¸â€ Â¥ Protocol Evolution Error:", e);
            return reply.status(500).send({ error: e.message });
        }
    });

    // Multi-Profile Management (FROZEN FOR LAUNCH)
    app.post<{ Body: any }>('/api/user/profiles', { preValidation: [validateUser] }, async (req, reply) => {
        return reply.status(403).send({ error: 'FEATURE_NOT_AVAILABLE', message: 'Multi-Profile feature is currently locked.' });
    });

    app.put<{ Params: { id: string }, Body: any }>('/api/user/profiles/:id', { preValidation: [validateUser] }, async (req, reply) => {
        return reply.status(403).send({ error: 'FEATURE_NOT_AVAILABLE', message: 'Multi-Profile feature is currently locked.' });
    });

    app.delete<{ Params: { id: string } }>('/api/user/profiles/:id', { preValidation: [validateUser] }, async (req, reply) => {
        return reply.status(403).send({ error: 'FEATURE_NOT_AVAILABLE', message: 'Multi-Profile feature is currently locked.' });
    });

    app.post<{ Body: { active_sub_profile_id?: string } }>('/api/user/profiles/switch', { preValidation: [validateUser] }, async (req, reply) => {
        return reply.status(403).send({ error: 'FEATURE_NOT_AVAILABLE', message: 'Multi-Profile feature is currently locked.' });
    });


    // Ã°Å¸â€ Â® Pulso CuÃƒÂ¡ntico (Daily Oracle)
    app.get<{ Querystring: { offset?: number, lang?: string } }>('/api/oracle/daily', { preValidation: [validateUser] }, async (req, reply) => {
        try {
            // FASE 3 CUTOVER: The user's requested offset is ignored for calculation, we use current timezone.
            // We just extract timezone offset from the JWT/profile context, but here in the route we must query it if it's not in req.user.
            // Wait, we need fullProfile to pass to getOrGenerate!
            const userId = (req as any).user_id;
            const lang = (req.query.lang || 'es') as 'es' | 'en';

            const { supabase } = require('../lib/supabase');
            const { data: fullProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!fullProfile) throw new Error("User profile not found");
            
            // FASE 3: Enforce current timezone
            const { DateUtils } = require('../utils/DateUtils');
            const currentTimezoneOffset = DateUtils.getCurrentTimezoneOffset(fullProfile);

            const { DailyContextOrchestrator } = require('../modules/daily/DailyContextOrchestrator');
            const v2Payload = await DailyContextOrchestrator.getOrGenerate(
                userId, 
                fullProfile, 
                currentTimezoneOffset, 
                lang
            );

            // ADAPTER: Map V2 Interpretation to Legacy Oracle Shape
            const { interpretation } = v2Payload;
            
            const readingData = {
                texto_principal: interpretation.primarySignal.text || interpretation.primarySignal.content,
                score_energia_general: 50, // Unsupported in V2 factual core
                riesgo: interpretation.guidance,
                oportunidad: interpretation.integratedPattern.text || "...",
                prioridades_dinamicas: [], // Unsupported
                variables_astrales_utilizadas: interpretation.referencedSignalIds,
                conversational_hook: interpretation.reflectionQuestion
            };

                        // Return readingData directly so frontend FrecuenciaDiaData matches, but add localDate
            
            // --- INJECT VIGÍA CÓSMICO IN-APP ---
            const { ConsciousnessEngine } = require('../modules/sigil/ConsciousnessEngine');
            const now = new Date();
            const userLocal = new Date(now.getTime() + (3600000 * currentTimezoneOffset));
            const userHours = userLocal.getUTCHours();
            
            let currentMoment = null;
            if (userHours >= 6 && userHours < 18) currentMoment = 'MORNING';
            else if (userHours >= 18) currentMoment = 'EVENING';

            if (currentMoment) {
                // Generates if missing, returns null if already generated. We fetch it next anyway.
                await ConsciousnessEngine.trySendTransmission(userId, v2Payload.localDate, currentMoment, lang).catch((e) => console.error("ConsciousnessEngine Error:", e));
            }
            
            // Fetch today's transmissions to surface in-app
            const { data: transmissions } = await supabase
                .from('sigil_daily_transmissions')
                .select('moment, transmission')
                .eq('user_id', userId)
                .eq('date', v2Payload.localDate);

            const finalData = {
                ...readingData,
                localDate: v2Payload.localDate,
                transmissions: transmissions || []
            };

            return { status: 'ok', data: finalData };
        } catch (error: any) {
            console.error("API Error (/api/oracle/daily):", error);
            return reply.status(500).send({ error: error.message });
        }
    });
}
