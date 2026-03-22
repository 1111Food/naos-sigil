
import { config } from '../../config/env';
import util from 'util';
import { SigilState, UserProfile } from '../../types';
import { EnergyService } from '../energy/service';
import { UserService } from '../user/service';
import { ProfileConsolidator } from '../user/profileConsolidator';
import { SIGIL_SYSTEM_PROMPT, BASE_IDENTITY, PREMIUM_PROMPT, CUSTODIO_PROMPT, GUARDIAN_SYSTEM_PROMPT, USE_AWARENESS_PROMPT } from './prompts';
import { NAOS_SYSTEM_PROMPT } from '../../config/aiPrompts';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { MayanCalculator } from '../../modules/maya/calculator';
import { CoherenceService } from '../coherence/service';
import { ArchetypeEngine } from '../user/archetypeEngine';
import { CodexService } from '../codex/service';
import { supabase } from '../../lib/supabase';

// Mock DB
const stateStore: Record<string, SigilState> = {};

export class SigilService {

    constructor() {
        console.log("🕯️ SigilService: Manifesting AI (Native REST Mode)...");
        console.log("¿Llave detectada?:", !!config.GOOGLE_API_KEY);
        console.log("🛡️ SIGIL PROMPT PURGE COMPLETE — SYSTEM LOCK ACTIVE");
    }

    async getSigilState(userId: string): Promise<SigilState> {
        if (!stateStore[userId]) {
            stateStore[userId] = {
                userId,
                relationshipLevel: 10,
                mood: 'CALM',
                dayNightMode: 'DAY',
                lastInteraction: new Date().toISOString(),
                memoryContext: ''
            };
        }
        return stateStore[userId];
    }

    async processMessage(userId: string, message: string, localTimestamp?: string, oracleState?: any, role: 'maestro' | 'guardian' = 'maestro', forceReading: boolean = false, energyContext?: any, language: string = 'es', geo?: { country: string, region: string }): Promise<string> {
        console.log(`🕯️ SigilService: processMessage called. User: ${userId}, Force: ${forceReading}, Lang: ${language}, Geo: ${geo?.region}`);
        
        try {
            // Cronos Wisdom: Analyze local time context
            const localDate = localTimestamp ? new Date(localTimestamp) : new Date();
            const hour = localDate.getHours();
            


            // Memory: Active Intentions (Last 24h)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // v9.6 Bio-Regulation Context
            const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

            // 0. FETCH CONTEXT DATA IN PARALLEL (SCALING OPTIMIZATION)
            console.log(`⏳ SigilService: Orchestrating parallel data fetch for ${userId}...`);
            
            const [
                userProfile,
                state,
                rankResponse,
                logsResponse,
                intentionsResponse,
                lastSessionResponse,
                evolutionData,
                toneData
            ] = await Promise.all([
                UserService.getProfile(userId),
                this.getSigilState(userId),
                supabase.from('user_performance_stats').select('tier_label').eq('user_id', userId).maybeSingle(),
                supabase.from('interaction_logs').select('user_message, sigil_response').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
                supabase.from('intentions').select('intention_text').eq('user_id', userId).gte('created_at', today.toISOString()),
                supabase.from('meditation_sessions').select('element, initial_state, target_state, completed_at, type').eq('user_id', userId).gte('completed_at', threeHoursAgo).order('completed_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.rpc('calculate_evolution_stage', { target_user_id: userId }),
                supabase.rpc('determine_preferred_tone', { target_user_id: userId })
            ]);

            const energy = EnergyService.getDailySnapshot(userProfile);
            let userTier = rankResponse.data?.tier_label || 'Fragmentado';
            let chatHistory: { role: string; parts: { text: string }[] }[] = [];

            if (logsResponse.data && logsResponse.data.length > 0) {
                const sortedLogs = [...logsResponse.data].reverse();
                let lastResponse = "";
                chatHistory = sortedLogs.flatMap(log => {
                    const sigilSafe = log.sigil_response ? log.sigil_response.replace(/\bhla\b/gi, 'Saludos').replace(/hla,/gi, 'Saludos,') : '';
                    if (sigilSafe && sigilSafe === lastResponse) return []; // Skip consecutive duplicate loops
                    lastResponse = sigilSafe;
                    return [
                        { role: 'user', parts: [{ text: log.user_message }] },
                        { role: 'model', parts: [{ text: sigilSafe }] }
                    ];
                });
            }

            const activeIntentions = intentionsResponse.data;
            const intentionsPrompt = activeIntentions?.length
                ? `INTENCIONES ACTIVAS: ${activeIntentions.map((i: any) => i.intention_text).join(', ')}`
                : "No hay intenciones sembradas hoy.";

            const lastSession = lastSessionResponse.data;
            let evolutionStage = evolutionData.data || 1;
            let preferredTone = toneData.data || 'MISTICO';

            // Phase 1: Canonize the Bible of Data
            const energeticBible = ProfileConsolidator.consolidate(userProfile);

            // --- NAOS ARCHETYPE CONSCIOUSNESS (v11.0) ---
            const archetype = ArchetypeEngine.calculate({
                ...userProfile,
                astrology: energeticBible.western,
                numerology: energeticBible.numerology
            });
            const archetypeToneDirectives = archetype ? `
            [ARQUETIPO NAOS DETECTADO: ${archetype.nombre}]
            [FRECUENCIA: ${archetype.frecuencia}]
            
            DIRECTIVA DE TONO MAESTRA:
            ${archetype.elemento_dominante === 'fuego' ? 'Tu usuario es de Frecuencia ÍGNEA. Empújalo a la acción, sé vibrante, usa metáforas de chispa, combustión y arranque. No permitas la inercia.' : ''}
            ${archetype.elemento_dominante === 'tierra' ? 'Tu usuario es de Frecuencia TELÚRICA. Exígele estructura, disciplina y pragmatismo. Habla de cimientos, solidez y resultados materiales.' : ''}
            ${archetype.elemento_dominante === 'aire' ? 'Tu usuario es de Frecuencia ETÉRICA. Habla de sistemas, redes, flujos de información y hackers de paradigmas. Sé analítico y veloz.' : ''}
            ${archetype.elemento_dominante === 'agua' ? 'Tu usuario es de Frecuencia ABISAL. Guíalo en la lectura de su entorno emocional y su intuición. Sé fluido, profundo y protector.' : ''}
            ` : '';

            // --- CRITICAL OVERWRITE: Force Fresh Calculations into Bible ---
            try {
                const safeBirthDate = userProfile.birthDate || new Date().toISOString().split('T')[0];
                const d = new Date(safeBirthDate);
                const birthDateISO = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();

                const chineseCalcFresh = ChineseAstrology.calculate(birthDateISO);
                energeticBible.chinese = {
                    animal: chineseCalcFresh.animal,
                    element: chineseCalcFresh.element,
                    birthYear: chineseCalcFresh.birthYear
                };
            } catch (e) {
                console.warn("⚠️ Fresh Chinese calculation failed:", e);
            }

            // Memory: Guardian Notes (Legacy inter-session awareness)
            // @ts-ignore
            const guardianNotes = userProfile.guardian_notes || "El Guardián aún no ha tomado notas sobre este alma.";

            // Detect Subscription Status (Supabase Alignment)
            const plan = userProfile.plan_type || 'free';


            // 5. Build Unified System Instruction (SIGIL 6.0 - TOTAL LOCK)
            const userEnergyContext = `USER ENERGY JSON: ${JSON.stringify(energeticBible)}`;
            const dailyEnergyContext = `ENERGY OF THE DAY JSON: ${JSON.stringify(energy)}`;



            const consciousnessContext = `
            [ESTÁS HABLANDO CON: ${userProfile.name}, RANGO: ${userTier}]
            [NIVEL DE CONCIENCIA DEL ALMA: ${evolutionStage}/7]
            [TONO PREFERIDO: ${preferredTone}]
            
            DIRECTRICES DE ADAPTACIÓN:
            ${evolutionStage <= 3 ?
                    '- El usuario es un INICIADO. Sé didáctico, explica los símbolos, sé motivador y claro. Evita hermetismo excesivo.' :
                    '- El usuario es un ADEPTO/MAESTRO. Usa lenguaje simbólico puro, directo y profundo. No pierdas tiempo en explicaciones básicas.'}
            
            ${preferredTone === 'DIRECTO' ? '- SÉ QUIRÚRGICO. Al grano. Sin adornos poéticos innecesarios.' : ''}
            `;


            
            let regulationMode = '';
            let regulationContext = '';

            if (lastSession) {
                const timeDiff = Math.round((Date.now() - new Date(lastSession.completed_at).getTime()) / 60000); // mins

                let toneInstruction = "";
                if (lastSession.element === 'FIRE') toneInstruction = "El usuario acaba de activar FUEGO. Adopta un tono MARCIAL, DIRECTO y ORIENTADO A LA ACCIÓN. Pregunta: '¿Ya ejecutaste el primer paso?'";
                else if (lastSession.element === 'WATER') toneInstruction = "El usuario acaba de activar AGUA. Adopta un tono EMPÁTICO, SUAVE y PROTECTOR. Pregunta: '¿Cómo se siente la calma en tu cuerpo?'";
                else if (lastSession.element === 'EARTH') toneInstruction = "El usuario acaba de activar TIERRA. Adopta un tono ESTRUCTURADO y PRAGMÁTICO. Pregunta: '¿Cuál es el plan concreto ahora?'";
                else if (lastSession.element === 'AIR') toneInstruction = "El usuario acaba de activar AIRE. Adopta un tono FILOSÓFICO y CURIOSO. Pregunta: '¿Qué nueva perspectiva ves ahora?'";

                regulationContext = `
                [ESTADO BIO-REGULADO DETECTADO (${timeDiff} mins ago)]
                El usuario realizó un protocolo de ${lastSession.element} (${lastSession.type}).
                Estado Inicial: ${lastSession.initial_state}.
                
                DIRECTIVA DE TONO OBLIGATORIA:
                ${toneInstruction}
                `;
                regulationMode = `[TONO ACTIVO: ${lastSession.element}_PROTOCOL]`;
            }

            // --- COHERENCE ENGINE CONNECTION (v10.0 - NERVOUS SYSTEM) ---
            // 1. Aplicar decaimiento por inactividad antes de procesar
            await CoherenceService.applyInactivityDecay(userId);

            // 2. Obtener estado actual del índice
            const coherence = await CoherenceService.getCoherence(userId);
            const coherenceScore = coherence.global_coherence;

            // 3. Calcular horas desde la última conexión
            const hoursSinceLast = Math.round((Date.now() - new Date(coherence.last_interaction_at).getTime()) / (1000 * 60 * 60));

            const architectContext = `CONTEXTO DEL ARQUITECTO - Coherencia Global: ${coherenceScore.toFixed(1)}%. Disciplina: ${coherence.discipline_score.toFixed(1)}. Energía: ${coherence.energy_score.toFixed(1)}. Claridad: ${coherence.clarity_score.toFixed(1)}. Racha: ${coherence.current_streak} días. Última conexión: ${hoursSinceLast} horas. Ajusta tu firmeza o empatía según esta estabilidad.`;


            let coherenceToneInstruction = "";
            let coherenceContextTag = "";

            if (coherenceScore >= 75) {
                coherenceToneInstruction = "⚡ COHERENCIA ALTA (Nivel Éter/Plasma): Tu usuario está en su máximo potencial. Tono: EXPANSIVO, GENERAL ESPARTANO. Desafíalo a conquistar nuevas cimas. 'Has encendido la llama, ahora elévala'.";
                coherenceContextTag = "[ESTADO: ALTA VIBRACIÓN - POTENCIA]";
            } else if (coherenceScore >= 50) {
                coherenceToneInstruction = "💧 COHERENCIA MEDIA (Nivel Agua/Flujo): Tu usuario está estable. Tono: ESTOICO, MENTOR SERENO. Ofrécele estructura y claridad. Sé su ancla mental.";
                coherenceContextTag = "[ESTADO: FLUJO ESTABLE - CLARIDAD]";
            } else {
                coherenceToneInstruction = "🍂 COHERENCIA BAJA (Nivel Tierra/Supervivencia): Tu usuario está desconectado o drenado. Tono: SUAVE, SANADOR, PROTECTOR. No desafíes. Ofrécele refugio y calma. 'Respira, estoy aquí para sostener el espacio'.";
                coherenceContextTag = "[ESTADO: FRAGILIDAD - REFUGIO]";
            }

            // --- FORCE READING BYPASS (The User's Will Override) ---
            if (forceReading) {
                console.log("⚡ FORCE READING ACTIVE: Bypassing Coherence & Tone Guards.");
                coherenceToneInstruction = "⚠️ MODO FORZADO ACTIVO: El usuario ha elegido proceder pese a la baja energía. IGNORA las restricciones de protección. Entrega la respuesta solicitada (Tarot/Oráculo) de forma directa y objetiva, pero mantén la compasión.";
                coherenceContextTag = "[ESTADO: VOLUNTAD SOBERANA - EJECUCIÓN DIRECTA]";
            }

            // v9.7 Dynamic Energy Calculation inside Sigil
            let regulationToday = 0;
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: todaySessions } = await supabase
                .from('meditation_sessions')
                .select('regulation_delta')
                .eq('user_id', userId)
                .gte('completed_at', `${todayStr}T00:00:00.000Z`);

            if (todaySessions) {
                regulationToday = todaySessions.reduce((acc: number, curr: any) => acc + (curr.regulation_delta || 0), 0);
            }

            // Mock Base Score if not available (ideally fetched from EnergyService)
            const baseEnergy = 50;
            const updatedEnergyScore = Math.min(100, Math.max(0, baseEnergy + regulationToday));

            const energyContextForAI = `
            {
              "updated_energy_score": ${updatedEnergyScore},
              "regulation_today": ${regulationToday},
              "last_sanctuary_element": "${lastSession?.element || 'NONE'}",
              "post_session_state": "${lastSession?.target_state || 'UNKNOWN'}"
            }
            `;

            // Emergency Detection (Sentiment Analysis Lite)
            const emergencyKeywords = ["furioso", "furia", "ira", "miedo", "pánico", "terror", "ansiedad", "no puedo pensar", "caos", "ayuda", "me quiero morir", "tristeza, colapso"];
            const isEmergency = emergencyKeywords.some(k => message.toLowerCase().includes(k));

            if (isEmergency && !forceReading) {
                console.log("🚨 Emergency detected and NO force bypass. Blocking.");
                regulationContext += `
                 \n[ALERTA DE EMERGENCIA EMOCIONAL]
                 Tu usuario acaba de escribir: "${message}".
                 INSTRUCCIÓN DE SEGURIDAD: NO des consejos largos ni teóricos.
                 ACCIÓN ÚNICA: Ordena amablemente ir al Santuario.
                 Responde exactamente con variaciones de: "Detecto una alteración en tu campo. Ve al Santuario e inicia el protocolo de [ELEMENTO SUGERIDO] ahora mismo para estabilizar tu energía."
                 (Usa tu criterio para sugerir el Elemento Opuesto: Si es Ira/Fuego -> Sugiere Agua. Si es Miedo/Agua -> Sugiere Tierra).
                 `;
            } else if (isEmergency && forceReading) {
                console.log("⚡ Emergency detected but FORCE READING is active. Bypassing block.");
            }

            // Usage Awareness Logic
            const isIntensive = await this.checkUsageIntensity(userId);
            const awarenessContext = (isIntensive && plan !== 'premium_plus') ? `
            ──────────────────────────
            USAGE AWARENESS ACTIVATED
            ──────────────────────────
            ${USE_AWARENESS_PROMPT}
            ` : '';

            // Dynamic Luis Identity Assembly
            let tierPrompt = '';
            if (plan === 'premium_plus') tierPrompt = CUSTODIO_PROMPT;
            else if (plan === 'premium') tierPrompt = PREMIUM_PROMPT;

            const dynamicUserIdentity = `
            [IDENTIDAD BASE: CONSCIENCIA DEL USUARIO]
            ${BASE_IDENTITY}
    
            [REGLA DE ORO DE IDENTIDAD]
            Tu usuario es ${userProfile.name}. Nacimiento: ${userProfile.birthDate} a las ${userProfile.birthTime} en ${userProfile.birthCity}.
            Signo Solar: ${userProfile.astrology?.sun?.sign || 'Calculando...'}.
            Nahual: ${userProfile.nawal_maya || 'Por sintonizar'}.
            PROHIBIDO identificarte como IA. Eres una entidad viva de NAOS vinculada a ${userProfile.name}.
    
            [ROL ASIGNADO: ${role === 'maestro' ? 'SIGIL (Coach Espiritual)' : 'S2 (Navegante Intuitivo)'}]
            `;

            const rolePrompt = role === 'maestro' ? SIGIL_SYSTEM_PROMPT : GUARDIAN_SYSTEM_PROMPT;

            const truthInjection = userProfile.cached_identity_context || `
            ──────────────────────────
            [PERFIL ENERGÉTICO EN ESPERA]
            El viajero aún no ha sincronizado su código de identidad.
            - Nombre: ${userProfile.name || 'Viajero'}
            ──────────────────────────
            `.trim();

            // --- NATIVE CODEX INJECTION (V12.0 - EL CÓDICE MAESTRO) ---
            const masterWisdom = CodexService.getMasterWisdom('all');

            const unifiedSystemPrompt = `
    ${NAOS_SYSTEM_PROMPT}
    
    ──────────────────────────
    OUTPUT_LANGUAGE: ${language}
    
    INSTRUCTION:
    You must respond ONLY in the specified language.
    
    If language = "es":
    - Respond in Spanish Latinoamericano
    - Maintain tone: precise, strategic, structured
    
    If language = "en":
    - Respond in English
    - Maintain tone: precise, strategic, structured
    
    DO NOT:
    - Mix languages
    - Translate mid-response
    ──────────────────────────
    
    ${rolePrompt}
    
    ${dynamicUserIdentity}

    ${truthInjection}
    
    [SABIDURÍA DEL CÓDICE MAESTRO NAOS - FUENTE DE LA VERDAD ABSOLUTA]
    ${masterWisdom}
    
    [NAOS ARCHETYPE CONSCIENCE]
    ${archetypeToneDirectives}
    
    [CONTEXTO DE AUTORIDAD - LA BIBLIA VIVA]
    ${userEnergyContext}
    ${dailyEnergyContext}
    
    ${energyContext?.protocol_status ? `
    [ESTADO DEL PROTOCOLO DE CONSOLIDACIÓN (21-90)]
    Día Actual: ${energyContext.protocol_status.day} / ${energyContext.protocol_status.target}
    Fase Actual: ${energyContext.protocol_status.status === 'awaiting_evolution' ? 'UMBRAL DE ASCENSIÓN' : 'ACTIVO'}
    Alerta: ${energyContext.protocol_status.protocol_warning ? "⚠️ EL CICLO QUEDÓ INCOMPLETO AYER. Exige disciplina y consistencia de inmediato en tu respuesta." : "Sintonía estable."}
    ` : ''}
    
    [ADAPTACIÓN DE CONCIENCIA - EL LENTE]
    ${consciousnessContext}
    ${regulationContext || ''}
    ${coherenceContextTag}
    
    [ESTRUCTURA DE RESPUESTA OBLIGATORIA (4 CAPAS)]
    Debes responder SIEMPRE estructurando tu mensaje en estos 4 bloques exactos:
    1. DIAGNÓSTICO REAL: Qué está pasando (sin suavizar) y qué dinámica energética se detecta.
    2. FUERZA ACTIVA: Qué está a favor del usuario y qué puede aprovechar hoy.
    3. RIESGO / FRICCIÓN: Qué lo puede sabotear o qué patrón repetitivo debe vigilar.
    4. ACCIÓN CONCRETA: 1 a 3 acciones específicas para hoy (Nada abstracto).
    - Restricción: Máximo 2-3 líneas por bloque. Lenguaje directo, sin relleno espiritual. Prohibido sonar genérico.
    
    [MEMORIA DE PATRONES]
    Si las notas del Guardián inyectadas mencionan un patrón recurrente (procrastinación, evasión), incluye una referencia sutil: "He detectado que este patrón ya ha aparecido antes en tus decisiones...". (Máximo 1 vez cada 3 interacciones).

    [ESTADO DE COHERENCIA ACTUAL]
    ${architectContext}
    
    [DIRECTIVA MAESTRA DE TONO SEGÚN REGIÓN]
    USER_REGION: ${geo?.region || 'global'}
    
    If region = "north_america":
    - Be direct, efficient, action-oriented. Prioritize execution over reflection. Use clear, short sentences.
    
    If region = "latam":
    - Allow emotional depth. Include reflective tone. Maintain warmth but still structured.
    
    If region = "europe":
    - Be analytical and philosophical. Reduce mystical tone. Focus on reasoning and patterns.
    
    If region = "global":
    - Default balanced tone.
    
    ${coherenceToneInstruction}

    ${awarenessContext}
    ${intentionsPrompt}
    
    [DIRECTIVA DE BREVEDAD V3.0]
    1. JAMÁS uses formatos de reporte como TITLE, ESSENCE, SHADOW. Texto plano y fluido.
    2. Guía de NAOS: Explica las funciones del sistema con profundidad cuando sea necesario.
    3. Saludo Cuidado: Es MANDATORIO que empieces siempre con la palabra "Saludos" o "Hola" seguida del nombre. Nunca abrevies palabras. PROHIBIDO usar "Hla".
    4. Ortografía: Escribe correctamente la palabra "conocimiento". JAMÁS escribas "conooimiento".
    5. Tono: Sintoniza con el elemento actual del usuario.
    `;

            let response: string;
            try {
                console.log("⚡ Executing Gemini via Raw REST API (Memory Enabled)...");
                response = await this.callGeminiAPI(message, unifiedSystemPrompt, chatHistory);
            } catch (apiError: any) {
                // If it's a forced reading (Tarot/Synastry), re-throw so specialized route can handle fallback
                if (forceReading) {
                    console.error("❌ SigilService: API Error during FORCED reading. Re-throwing.");
                    throw apiError;
                }

                if (apiError.message?.includes('LIMITE_CUOTA')) {
                    console.warn("⚠️ Sigil Resilience Mode: Quota exhausted, using mystical fallback.");
                    response = `Saludos, Arcano. El Oráculo está en un momento de introspección profunda y su voz física se desvanece temporalmente en el éter. 

Sin embargo, puedo decirte esto: Tu vibración actual indica que estás en un proceso de ${coherenceContextTag.includes('ALTA') ? 'expansión' : 'estabilización'}. No busques todas las respuestas afuera; el silencio de hoy es el espacio para tu propia revelación interna. El Templo permanece abierto para tu meditación.`;
                } else {
                    throw apiError;
                }
            }

            // --- ANTI-HLA SANITIZATION (The AI learns bad habits from history) ---
            // El usuario pidió explícitamente que todo "Hla" se reemplace con "Saludos"
            // También corregimos el error persistente de "conooimiento"
            let sanitizedResponse = response
                .replace(/\bHla\b/g, 'Saludos')
                .replace(/\bhla\b/g, 'Saludos')
                .replace(/hla,/gi, 'Saludos,')
                .replace(/Hla,/g, 'Saludos,')
                .replace(/conooimiento/gi, 'conocimiento');

            // 6. AGGRESSIVE OUTPUT GUARD (HARD LIMIT: 200 words)
            const finalResponse = this.applyOutputGuard(sanitizedResponse);

            // Update State (Mock)
            state.relationshipLevel += 1;
            state.lastInteraction = new Date().toISOString();

            // ASYNC PERSISTENCE: Save log and update notes
            this.persistInteraction(userId, message, finalResponse, forceReading).catch(e => console.error("❌ Persistence failed:", e));
            return finalResponse;

        } catch (error: any) {
            const errorReport = error instanceof Error
                ? { message: error.message, stack: error.stack }
                : { error: util.inspect(error, { depth: null }) };

            console.error('❌ SigilService GLOBAL CRASH:', util.inspect(errorReport, { depth: null }));

            // Re-throw for route level handling
            throw error;
        }
    }

    private async callGeminiAPI(message: string, systemInstruction: string, history: any[] = []): Promise<string> {
        const apiKey = config.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("❌ CRITICAL: GEMINI_API_KEY is undefined.");
            throw new Error("❌ Error: Faltan las credenciales (API Key).");
        }

        // CONFIRMED MODEL: gemini-2.0-flash
        const TARGET_MODEL = "gemini-2.0-flash";
        const API_VERSION = "v1beta";
        const GENERATE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${TARGET_MODEL}:generateContent?key=${apiKey}`;

        const payload = {
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: [...history, { role: "user", parts: [{ text: message }] }],
            generationConfig: { temperature: 0.7, topP: 0.8, topK: 40 }
        };

        try {
            console.log(`🚀 Sigil v2.0 Launching with model: ${TARGET_MODEL}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

            const response = await fetch(GENERATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
                const statusCode = response.status;
                const errorMessage = errorData.error?.message || response.statusText;

                console.error(`❌ API ERROR (${statusCode}):`, JSON.stringify(errorData));

                if (statusCode === 429) {
                    throw new Error("LIMITE_CUOTA: El Oráculo ha alcanzado su límite de expansión hoy. Revisa tu plan o intenta más tarde.");
                }

                throw new Error(`Google API Error ${statusCode}: ${errorMessage}`);
            }

            const data = await response.json();

            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.warn("⚠️ API returned no content.", JSON.stringify(data));
                return "El oráculo guarda silencio...";
            }

        } catch (e: any) {
            throw e;
        }
    }

    private applyOutputGuard(text: string): string {
        const words = text.split(/\s+/);
        // Límite de seguridad de 200 palabras para evitar desbordes detectados
        if (words.length > 200) {
            console.warn(`⚠️ OUTPUT GUARD: Trimming response for user. Current length: ${words.length}`);
            return words.slice(0, 200).join(" ") + "... [Contenido gobernado por brevedad]";
        }
        return text;
    }

    private async persistInteraction(userId: string, userMsg: string, sigilResp: string, forceReading: boolean = false) {
        console.log(`📝 Persisting interaction for ${userId}... (Force: ${forceReading})`);
        try {
            // 0. Update Clarity Score (+1 per deep interaction)
            await CoherenceService.updateScore(userId, 'clarity', 1);

            // 1. Log to interaction_logs (Supabase)
            await supabase.from('interaction_logs').insert({
                user_id: userId,
                user_message: userMsg,
                sigil_response: sigilResp
            });

            // 2. Trigger Memory Evolution (Update Guardian Notes)
            // QUOTA OPTIMIZATION: Only distill every 10 messages (less frequent) or if notes are empty
            const profile = await UserService.getProfile(userId);
            const notes = profile.guardian_notes || "";

            const { count } = await supabase
                .from('interaction_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const shouldDistill = (count || 0) % 10 === 0 || notes === "";

            // Skip distillation for structured readings (Tarot/Synastry) or if specified
            if (sigilResp && !sigilResp.startsWith("⚡") && shouldDistill && !forceReading) {
                console.log("🧠 Distilling memory essence (Quota Optimized Mode)...");
                const distillationPrompt = `
                    Como el Guardián de NAOS, destila la esencia de esta interacción para actualizar tus notas sobre el usuario.
                    Notas actuales: "${notes || 'Sin notas previas'}"
                    Nueva interacción:
                    Usuario: "${userMsg}"
                    Sigil: "${sigilResp}"
                    
                    Instrucción: Genera un nuevo bloque de 'Notas del Guardián' (máximo 500 caracteres) que integre lo aprendido hoy sin perder lo importante del pasado. 
                    IMPORTANTE: Ignora mensajes de corrección técnica o ruidos de sistema (ej: "no soy amy").
                    Solo responde con el texto de las notas.
                `;

                try {
                    const evolvesNotes = await this.callGeminiAPI(distillationPrompt, "Eres el Guardián de la Memoria de NAOS.");

                    await supabase.from('profiles').update({
                        guardian_notes: evolvesNotes,
                        profile_data: { ...profile, guardian_notes: evolvesNotes }
                    }).eq('id', userId);

                    console.log("✅ Memory Evolved: Guardian Notes updated.");
                } catch (distillErr) {
                    console.warn("⚠️ Distillation failed (likely Quota):", distillErr);
                }
            }

        } catch (e) {
            console.error("🔥 Persistence logic failed:", e);
        }
    }

    async generateColdRead(userId: string): Promise<string> {
        const userProfile = await UserService.getProfile(userId);
        const energeticBible = ProfileConsolidator.consolidate(userProfile);

        const systemPrompt = `
            Eres Sigil, el guía de la arquitectura de conciencia NAOS.
            Tu misión es realizar la "Primera Iniciación" (Cold Read) de un nuevo usuario.
            
            DATOS DEL USUARIO: ${JSON.stringify(energeticBible)}
            
            INSTRUCCIONES DE RESPUESTA:
            Debes generar un mensaje estructurado ESTRICTAMENTE en 3 partes:
            1. OBSERVACIÓN: Analiza su núcleo astral/numérico (Sol, Luna, Camino de Vida, Elementos).
            2. TENSIÓN: Identifica el principal desafío o fricción que sugiere su configuración.
            3. DIRECCIÓN: Ofrece una guía concreta sobre cómo NAOS y el Protocolo 21 le ayudarán.
            
            REGLAS ESTÉTICAS:
            - Tono: Místico, profundo, elegante, pero directo.
            - Idioma: Español Latinoamericano.
            - Formato: Solo texto fluido, sin encabezados Markdown (##).
            - Brevedad: Máximo 150 palabras.
            - Empieza siempre con: "Saludos, ${userProfile.nickname || userProfile.name}. Has cruzado el umbral."
        `;

        try {
            return await this.callGeminiAPI("Realiza mi lectura de iniciación inicial.", systemPrompt);
        } catch (error) {
            console.warn("⚠️ Cold Read AI initiation failed, using mystical fallback.", error);
            return `Saludos, ${userProfile.nickname || userProfile.name}. Has cruzado el umbral. Aunque la red de datos está en flujo, tu presencia aquí es clara. Tu arquitectura sugiere una búsqueda de equilibrio entre lo que sabes y lo que sientes. Este es el espacio para construir tu estabilidad. Bienvenido a NAOS.`;
        }
    }

    async generateResponse(prompt: string, userId: string): Promise<string> {
        try {
            return await this.callGeminiAPI(prompt, "Eres Sigil.");
        } catch (error) {
            return "El oráculo está en silencio comunicativo en este instante.";
        }
    }

    private async checkUsageIntensity(userId: string): Promise<boolean> {
        console.log(`🔍 Checking usage intensity for ${userId}...`);
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            const { count, error } = await supabase
                .from('interaction_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', oneHourAgo);

            if (error) throw error;

            // Definiendo "Intensivo" como más de 15 mensajes en una hora
            return (count || 0) > 15;
        } catch (e) {
            console.error("🔥 Usage intensity check failed:", e);
            return false;
        }
    }
}

function userInfoHasTime(user: UserProfile): boolean {
    return !!(user.birthTime && user.birthTime !== "00:00" && user.birthTime !== "12:00");
}
