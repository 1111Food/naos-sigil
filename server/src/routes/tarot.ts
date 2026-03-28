import { FastifyInstance } from 'fastify';
import { SigilService } from '../modules/sigil/service';
import { validateUser } from '../middleware/auth';
import { UsageGuardService } from '../modules/user/UsageGuard';

const sigilService = new SigilService();

interface TarotCard {
    id: number;
    name: string;
    meaning?: string;
}

import { supabase } from '../lib/supabase';
import { MAJOR_ARCANA_MEANINGS, NAOS_ARCHETYPE_MEANINGS, MAJOR_ARCANA_MEANINGS_EN, NAOS_ARCHETYPE_MEANINGS_EN } from '../utils/tarotMeanings';
import { TTSService } from '../modules/sigil/ttsService';
// Removed invalid i18n import for backend

interface TarotRequest {
    question: string;
    engine: 'ARCANOS' | 'ARQUETIPOS';
    spreadType: string;
    cards: TarotCard[];
    mode?: 'DIRECT' | 'INTERPRETATIVE';
    forceReading?: boolean;
}

export async function tarotRoutes(app: FastifyInstance) {
    // Debug GET route to verify endpoint is active
    app.get('/', async (request, reply) => {
        return { status: 'Tarot Oracle Online', message: 'The spirits are listening.' };
    });

    app.post<{ Body: TarotRequest }>('/', { preHandler: [validateUser] }, async (request, reply) => {
        return handleAnalyze(request, reply);
    });

    app.post<{ Body: TarotRequest }>('/analyze', { preHandler: [validateUser] }, async (request, reply) => {
        return handleAnalyze(request, reply);
    });

    async function handleAnalyze(request: any, reply: any) {
        const { question, engine, spreadType, cards, mode, forceReading, bypassCoherence } = request.body;
        const userId = (request as any).user_id;

        // 🛡️ UsageGuard Limit Check
        const limitCheck = await UsageGuardService.checkLimit(userId, 'tarot');
        if (!limitCheck.ok) {
            return reply.status(403).send({ error: "Límite de Energía Agotado", message: limitCheck.message });
        }

        const selectedEngine = engine || 'ARCANOS';
        const toneDirective = selectedEngine === 'ARQUETIPOS' 
            ? 'Usa un TONO TÁCTICO, OPERATIVO y basado en ROLES. Enfócate en la acción y el posicionamiento.' 
            : 'Usa un TONO MÍSTICO, TRASCENDENTAL y profundo. Enfócate en la energía universal y el destino.';

        const spreadLabel = spreadType === 'COMPASS' ? 'El Compás NAOS (Fuego, Tierra, Aire, Agua)' : spreadType;

        // Map bypassCoherence (new frontend prop) to forceReading (backend logic)
        const finalForceReading = forceReading || bypassCoherence || false;

        let language = 'es'; // Default

        console.log(`🔮 Tarot/Ritual POST. Intent: "${question}", Engine: ${selectedEngine}, Spread: ${spreadType}`);

        try {
            // 0. Fetch User Language Profile for safe AI instruction
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('language')
                .eq('id', userId)
                .maybeSingle();

            // 0. Prioritize language from request body, then user profile, then default to 'es'
            // @ts-ignore - language might not be in interface yet
            language = request.body.language || userProfile?.language || 'es';

            const prompts = {
                es: {
                    request: "SOLICITUD DE INTERPRETACIÓN ORACULAR",
                    engine: "MOTOR",
                    tone: "DIRECTIVA DE TONO",
                    intent: "Pregunta/Intención",
                    spread: "Tirada",
                    mode: "Modo",
                    revealed: selectedEngine === 'ARQUETIPOS' ? 'Arquetipos NAOS revelados' : 'Arcanos revelados',
                    compassPositions: ["Fuego (Voluntad/Arranque)", "Tierra (Estructura/Realidad)", "Aire (Lógica/Redes)", "Agua (Intuición/Entorno)"],
                    yesNoPositions: ["Tesis (Luz/Acción)", "Antítesis (Sombra/Obstáculo)"],
                    footer: "Por favor, interpreta estas revelaciones siguiendo estrictamente el formato de GOBERNANZA DE SIGIL."
                },
                en: {
                    request: "ORACULAR INTERPRETATION REQUEST",
                    engine: "ENGINE",
                    tone: "TONE DIRECTIVE",
                    intent: "Question/Intent",
                    spread: "Spread",
                    mode: "Mode",
                    revealed: selectedEngine === 'ARQUETIPOS' ? 'Revealed NAOS Archetypes' : 'Revealed Arcana',
                    compassPositions: ["Fire (Will/Start)", "Earth (Structure/Reality)", "Air (Logic/Networks)", "Water (Intuition/Environment)"],
                    yesNoPositions: ["Thesis (Light/Action)", "Antithesis (Shadow/Obstacle)"],
                    footer: "Please interpret these revelations strictly following the SIGIL GOVERNANCE format."
                }
            }[language === 'en' ? 'en' : 'es'];

            const toneDirectives = {
                es: {
                    ARQUETIPOS: 'Usa un TONO TÁCTICO, OPERATIVO y basado en ROLES. Enfócate en la acción y el posicionamiento.',
                    ARCANOS: 'Usa un TONO MÍSTICO, TRASCENDENTAL y profundo. Enfócate en la energía universal y el destino.'
                },
                en: {
                    ARQUETIPOS: 'Use a TACTICAL, OPERATIONAL, and ROLE-based TONE. Focus on action and positioning.',
                    ARCANOS: 'Use a MYSTICAL, TRANSCENDENTAL, and deep TONE. Focus on universal energy and destiny.'
                }
            }[language === 'en' ? 'en' : 'es'];

            const finalToneDirective = selectedEngine === 'ARQUETIPOS' ? toneDirectives.ARQUETIPOS : toneDirectives.ARCANOS;

            const message = `
            ${prompts.request}:
            [${prompts.engine}: ${selectedEngine}]
            [${prompts.tone}: ${finalToneDirective}]
            
            ${prompts.intent}: "${question}"
            ${prompts.spread}: ${spreadLabel}
            ${prompts.mode}: ${mode || 'INTERPRETATIVE'}
            
            ${prompts.revealed}:
            ${cards.map((c: any, i: number) => {
                let position = `${i + 1}.`;
                if (spreadType === 'COMPASS') {
                    position = prompts.compassPositions[i] || position;
                } else if (spreadType === 'YES_NO') {
                    position = prompts.yesNoPositions[i] || position;
                }
                return `${position} ${c.name}`;
            }).join('\n')}

            ${prompts.footer}
            `;

            // Generate response using Sigil Central (processMessage)
            console.log("Attempting to contact Gemini (Sigil Central)...");
            const response = await sigilService.processMessage(userId, message, undefined, undefined, 'maestro', finalForceReading, undefined, language);
            console.log("Gemini response received.");

            // Generate TTS Audio Buffer for the response
            const tts = new TTSService();
            // @ts-ignore - userGeo is injected by hook
            const region = (request as any).userGeo?.region || 'global';
            const { hash, buffer } = await tts.generateVoice(response, region);

            await UsageGuardService.incrementUsage(userId, 'tarot');
            return {
                interpretation: response,
                audioUrl: buffer ? `/api/sigil/audio/${hash}` : undefined,
                audioBase64: buffer ? buffer.toString('base64') : undefined
            };

        } catch (error: any) {
            console.error("❌ Tarot Route Error:", error);

            const isQuota = error.message?.includes('LIMITE_CUOTA');
            const isTimeout = error.name === 'AbortError';

            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'debug_sigil.log');
                fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] TAROT_ERROR: ${error.message} (Quota: ${isQuota})\n`);
            } catch (e) {
                console.error("Log failed", e);
            }

            // SMART FALLBACK (Plan B): Construct a meaningful response from hardcoded data
            const meaningSet = selectedEngine === 'ARQUETIPOS' 
                ? (language === 'en' ? NAOS_ARCHETYPE_MEANINGS_EN : NAOS_ARCHETYPE_MEANINGS)
                : (language === 'en' ? MAJOR_ARCANA_MEANINGS_EN : MAJOR_ARCANA_MEANINGS);
            const fallbackMeaning = cards.map((c: any) => `• **${c.name}**: ${meaningSet[c.id] || "Misterio profundo..."}`).join("\n\n");


            let errorNarrative = language === 'en' 
                ? "The signals of the ether are weak at this moment."
                : "Las señales del éter son débiles en este instante.";

            if (isQuota) {
                errorNarrative = language === 'en'
                    ? "The Oracle has consumed its daily energy and requires meditation (Quota Limit reached)."
                    : "El Oráculo ha consumido su energía diaria y requiere meditación (Límite de Cuota alcanzado).";
            } else if (isTimeout) {
                errorNarrative = language === 'en'
                    ? "The connection to the astral plane has taken too long to manifest."
                    : "La conexión con el plano astral ha tardado demasiado en manifestarse.";
            }

            const fallbackResponse = language === 'en' ? `
            ${errorNarrative} 
            
            However, the imprint of the ${selectedEngine === 'ARQUETIPOS' ? 'Archetypes' : 'Arcana'} is clear:

            ${fallbackMeaning}

            Tune in with these symbols; your own intuition is the final interpreter in this moment of silence.
            The network will sync again soon.
            ` : `
            ${errorNarrative} 
            
            Sin embargo, la impronta de los ${selectedEngine === 'ARQUETIPOS' ? 'Arquetipos' : 'Arcanos'} es clara:

            ${fallbackMeaning}

            Sintoniza con estos símbolos; tu propia intuición es el intérprete final en este momento de silencio.
            La red volverá a sincronizarse pronto.
            `;

            await UsageGuardService.incrementUsage(userId, 'tarot');
            return reply.status(200).send({
                interpretation: fallbackResponse
            });
        }
    }

    app.get('/history', { preHandler: [validateUser] }, async (request, reply) => {
        const userId = (request as any).user_id;
        
        const { data, error } = await supabase
            .from('rituals_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error("❌ Error al recuperar el historial de rituales:", error);
            return reply.status(500).send({ error: "No se pudo recuperar el registro akáshico." });
        }

        return data;
    });

    app.post('/save', { preHandler: [validateUser] }, async (request, reply) => {
        const userId = (request as any).user_id;
        const { intention, cards, engine, summary } = request.body as any;

        const authHeader = request.headers.authorization;
        const { config } = require('../config/env');
        const { createClient } = require('@supabase/supabase-js');

        const supabaseClient = createClient(
            config.SUPABASE_URL || 'https://placeholder-dont-crash.supabase.co',
            config.SUPABASE_ANON_KEY || 'placeholder-dont-crash',
            {
                auth: { persistSession: false, autoRefreshToken: false },
                global: { headers: { Authorization: authHeader || '' } }
            }
        );

        if (!intention || !cards || !engine || !summary) {
            return reply.status(400).send({ error: "Datos incompletos para sellar el ritual." });
        }

        try {
            console.log(`💾 [RITUAL_SAVE] Inicia sellado para usuario: ${userId}`);
            
            // FIFO Logic: Get counts
            const { count, error: countError } = await supabaseClient
                .from('rituals_history')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (countError) {
                console.error("❌ [RITUAL_SAVE] Error al contar registros:", countError);
                throw countError;
            }

            console.log(`📊 [RITUAL_SAVE] Registros actuales: ${count || 0}`);

            // If we have 3 or more, delete the oldest
            if (count && count >= 3) {
                console.log("♻️ [RITUAL_SAVE] Límite FIFO alcanzado (3). Eliminando el más antiguo...");
                const { data: oldest, error: findOldestError } = await supabaseClient
                    .from('rituals_history')
                    .select('id')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (findOldestError) {
                    console.error("❌ [RITUAL_SAVE] Error buscando el más antiguo:", findOldestError);
                    throw findOldestError;
                }

                if (oldest && oldest.length > 0) {
                    const { error: deleteError } = await supabaseClient
                        .from('rituals_history')
                        .delete()
                        .eq('id', oldest[0].id);
                    
                    if (deleteError) {
                        console.error("❌ [RITUAL_SAVE] Error al eliminar registro FIFO:", deleteError);
                    } else {
                        console.log(`✅ [RITUAL_SAVE] Registro eliminado ID: ${oldest[0].id}`);
                    }
                }
            }

            // Insert new record
            console.log("📝 [RITUAL_SAVE] Insertando nuevo ritual...");
            const { data, error: insertError } = await supabaseClient
                .from('rituals_history')
                .insert([{
                    user_id: userId,
                    intention,
                    cards,
                    engine,
                    summary: summary.substring(0, 5000), // Safety cap
                    created_at: new Date().toISOString()
                }])
                .select();

            if (insertError) {
                console.error("❌ [RITUAL_SAVE] Error al insertar nuevo ritual:", insertError);
                throw insertError;
            }

            console.log("✨ [RITUAL_SAVE] Ritual sellado con éxito.");
            return { success: true, record: data[0] };
        } catch (error: any) {
            console.error("❌ [RITUAL_SAVE] Error global en el guardado:", error);
            return reply.status(500).send({ error: "No se pudo sellar el ritual en el registro akáshico." });
        }
    });
}
