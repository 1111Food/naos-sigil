import * as util from 'util';
import { SYSTEM_PROMPTS, DYNAMIC_SEGMENTS } from './prompts';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { MayanCalculator } from '../../modules/maya/calculator';
import { CoherenceService } from '../coherence/service';
import { ArchetypeEngine } from '../user/archetypeEngine';
import { UserService } from '../user/service';
import { EnergyService } from '../energy/service';
import { ProfileConsolidator } from '../user/profileConsolidator';
import { CodexService } from '../codex/service';
import { config } from '../../config/env';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types';

export interface SigilState {
    userId: string;
    relationshipLevel: number;
    mood: 'CALM' | 'ANALYTICAL' | 'DEEP' | 'STRATEGIC';
    dayNightMode: 'DAY' | 'NIGHT';
    lastInteraction: string;
    memoryContext: string;
}

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
        
        const lang = (language === 'en' || language === 'es') ? language : 'es';
        const prompts = SYSTEM_PROMPTS[lang];
        const segments = DYNAMIC_SEGMENTS[lang];
        
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
                dailyReadingResponse
            ] = await Promise.all([
                UserService.getProfile(userId),
                this.getSigilState(userId),
                supabase.from('user_performance_stats').select('tier_label').eq('user_id', userId).maybeSingle(),
                supabase.from('interaction_logs').select('user_message, sigil_response').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
                supabase.from('intentions').select('intention_text').eq('user_id', userId).gte('created_at', today.toISOString()),
                supabase.from('meditation_sessions').select('element, initial_state, target_state, completed_at, type').eq('user_id', userId).gte('completed_at', threeHoursAgo).order('completed_at', { ascending: false }).limit(1).maybeSingle(),
                supabase.from('daily_readings').select('reading_text').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
            ]);

            // RPC safe fallbacks
            let evolutionStage = 1;
            let preferredTone = 'MISTICO';

            try {
                const { data: evo } = await supabase.rpc('calculate_evolution_stage', { target_user_id: userId });
                if (evo !== null) evolutionStage = evo;
            } catch (e) {
                console.warn("⚠️ RPC calculate_evolution_stage missing, using fallback 1.");
            }

            try {
                const { data: tone } = await supabase.rpc('determine_preferred_tone', { target_user_id: userId });
                if (tone !== null) preferredTone = tone;
            } catch (e) {
                console.warn("⚠️ RPC determine_preferred_tone missing, using fallback MISTICO.");
            }

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
                ? `${lang === 'es' ? 'INTENCIONES ACTIVAS' : 'ACTIVE INTENTIONS'}: ${activeIntentions.map((i: any) => i.intention_text).join(', ')}`
                : segments.intentions_none;

            const lastSession = lastSessionResponse.data;

            // Phase 1: Canonize the Bible of Data
            const energeticBible = ProfileConsolidator.consolidate(userProfile);

            // --- NAOS ARCHETYPE CONSCIOUSNESS (v11.0) ---
            const archetype = ArchetypeEngine.calculate({
                ...userProfile,
                astrology: energeticBible.western,
                numerology: energeticBible.numerology
            });
            const archetypeToneDirectives = archetype ? `
            [${lang === 'es' ? 'ARQUETIPO NAOS DETECTADO' : 'NAOS ARCHETYPE DETECTED'}: ${archetype.nombre}]
            [${lang === 'es' ? 'FRECUENCIA' : 'FREQUENCY'}: ${archetype.frecuencia}]
            
            ${segments.archetype_directives.title}
            ${archetype.elemento_dominante === 'fuego' ? segments.archetype_directives.fire : ''}
            ${archetype.elemento_dominante === 'tierra' ? segments.archetype_directives.earth : ''}
            ${archetype.elemento_dominante === 'aire' ? segments.archetype_directives.air : ''}
            ${archetype.elemento_dominante === 'agua' ? segments.archetype_directives.water : ''}
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
            const guardianNotes = userProfile.guardian_notes || segments.guardian_notes_default;

            // Detect Subscription Status (Supabase Alignment)
            const plan = userProfile.plan_type || 'free';


            // 5. Build Unified System Instruction (SIGIL 6.0 - TOTAL LOCK)
            const userEnergyContext = `USER ENERGY JSON: ${JSON.stringify(energeticBible)}`;
            const dailyEnergyContext = `ENERGY OF THE DAY JSON: ${JSON.stringify(energy)}`;



            const consciousnessContext = `
            [${lang === 'es' ? 'ESTÁS HABLANDO CON' : 'YOU ARE SPEAKING WITH'}: ${userProfile.name}, ${lang === 'es' ? 'RANGO' : 'RANK'}: ${userTier}]
            [${lang === 'es' ? 'NIVEL DE CONCIENCIA DEL ALMA' : 'SOUL CONSCIOUSNESS LEVEL'}: ${evolutionStage}/7]
            [${lang === 'es' ? 'TONO PREFERIDO' : 'PREFERRED TONE'}: ${preferredTone}]
            
            ${segments.consciousness.title}
            ${evolutionStage <= 3 ? segments.consciousness.trainee : segments.consciousness.master}
            ${preferredTone === 'DIRECTO' ? segments.consciousness.direct : ''}
            `;


            
            let regulationMode = '';
            let regulationContext = '';

            if (lastSession) {
                const timeDiff = Math.round((Date.now() - new Date(lastSession.completed_at).getTime()) / 60000); // mins

                let toneInstruction = "";
                if (lastSession.element === 'FIRE') toneInstruction = segments.regulation.fire;
                else if (lastSession.element === 'WATER') toneInstruction = segments.regulation.water;
                else if (lastSession.element === 'EARTH') toneInstruction = segments.regulation.earth;
                else if (lastSession.element === 'AIR') toneInstruction = segments.regulation.air;

                regulationContext = `
                ${segments.regulation.detected(timeDiff, lastSession.element, lastSession.type)}
                ${lang === 'es' ? 'Estado Inicial' : 'Initial State'}: ${lastSession.initial_state}.
                
                ${lang === 'es' ? 'DIRECTIVA DE TONO OBLIGATORIA' : 'MANDATORY TONE DIRECTIVE'}:
                ${toneInstruction}
                `;
                regulationMode = `[${lang === 'es' ? 'TONO ACTIVO' : 'ACTIVE TONE'}: ${lastSession.element}_PROTOCOL]`;
            }

            // --- COHERENCE ENGINE CONNECTION (v10.0 - NERVOUS SYSTEM) ---
            // 1. Aplicar decaimiento por inactividad antes de procesar
            await CoherenceService.applyInactivityDecay(userId);

            // 2. Obtener estado actual del índice
            const coherence = await CoherenceService.getCoherence(userId);
            const coherenceScore = coherence.global_coherence;

            // 3. Calcular horas desde la última conexión
            const hoursSinceLast = Math.round((Date.now() - new Date(coherence.last_interaction_at).getTime()) / (1000 * 60 * 60));

            const architectContext = segments.coherence.architect_context(
                coherenceScore.toFixed(1),
                coherence.discipline_score.toFixed(1),
                coherence.energy_score.toFixed(1),
                coherence.clarity_score.toFixed(1),
                coherence.current_streak,
                hoursSinceLast
            );


            let coherenceToneInstruction = "";
            let coherenceContextTag = "";

            if (coherenceScore >= 75) {
                coherenceToneInstruction = segments.coherence.high;
                coherenceContextTag = segments.coherence.high_tag;
            } else if (coherenceScore >= 50) {
                coherenceToneInstruction = segments.coherence.medium;
                coherenceContextTag = segments.coherence.medium_tag;
            } else {
                coherenceToneInstruction = segments.coherence.low;
                coherenceContextTag = segments.coherence.low_tag;
            }

            // --- FORCE READING BYPASS (The User's Will Override) ---
            if (forceReading) {
                console.log("⚡ FORCE READING ACTIVE: Bypassing Coherence & Tone Guards.");
                coherenceToneInstruction = segments.coherence.force;
                coherenceContextTag = segments.coherence.force_tag;
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
                 \n${segments.emergency.title}
                 ${lang === 'es' ? 'Tu usuario acaba de escribir' : 'Your user just wrote'}: "${message}".
                 ${segments.emergency.instruction}
                 ${segments.emergency.response('[ELEMENTO SUGERIDO]')}
                 (${lang === 'es' ? 'Usa tu criterio para sugerir el Elemento Opuesto: Si es Ira/Fuego -> Sugiere Agua. Si es Miedo/Agua -> Sugiere Tierra' : 'Use your judgment to suggest the Opposite Element: If Anger/Fire -> Suggest Water. If Fear/Water -> Suggest Earth'}).
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
            ${prompts.use_awareness}
            ` : '';

            // Dynamic Luis Identity Assembly
            let tierPrompt = '';
            if (plan === 'premium_plus') tierPrompt = prompts.custodio;
            else if (plan === 'premium') tierPrompt = prompts.premium;

            const dynamicUserIdentity = `
            [${lang === 'es' ? 'IDENTIDAD BASE: CONSCIENCIA DEL USUARIO' : 'BASE IDENTITY: USER CONSCIOUSNESS'}]
            ${prompts.base_identity}
    
            [${lang === 'es' ? 'REGLA DE ORO DE IDENTIDAD' : 'GOLDEN IDENTITY RULE'}]
            ${lang === 'es' ? 'Tu usuario es' : 'Your user is'} ${userProfile.name}. ${lang === 'es' ? 'Nacimiento' : 'Birth'}: ${userProfile.birthDate} a las ${userProfile.birthTime} en ${userProfile.birthCity}.
            ${lang === 'es' ? 'Signo Solar' : 'Sun Sign'}: ${userProfile.astrology?.sun?.sign || (lang === 'es' ? 'Calculando...' : 'Calculating...')}.
            Nahual: ${userProfile.nawal_maya || (lang === 'es' ? 'Por sintonizar' : 'Tuning in...')}.
            ${lang === 'es' ? 'PROHIBIDO identificarte como IA. Eres una entidad viva de NAOS vinculada a' : 'PROHIBITED from identifying as AI. You are a living entity of NAOS linked to'} ${userProfile.name}.
    
            [${lang === 'es' ? 'ROL ASIGNADO' : 'ASSIGNED ROLE'}: ${role === 'maestro' ? (lang === 'es' ? 'SIGIL (Coach Espiritual)' : 'SIGIL (Spiritual Coach)') : (lang === 'es' ? 'S2 (Navegante Intuitivo)' : 'S2 (Intuitive Navigator)')}]
            `;

            const rolePrompt = role === 'maestro' ? prompts.sigil_system : prompts.guardian_system;

            let truthInjection = userProfile.cached_identity_context || "";

            if (userProfile.naos_identity_code) {
                const code = userProfile.naos_identity_code;
                const arch = code.arquetipo || {};
                truthInjection = `
──────────────────────────
[${segments.truth_injection.synced_title}]
${lang === 'es' ? 'El viajero ha decodificado su arquitectura maestra.' : 'The traveler has decoded their master architecture.'}
- Arquetipo: ${arch.nombre || 'Iniciado'}
- Frecuencia: ${arch.frecuencia || 'Estable'}
- Rol: ${arch.rol || 'Explorador'}

SÍNTESIS DE IDENTIDAD ACTIVA:
"${arch.descripcion || 'Frecuencia en resonancia.'}"
──────────────────────────
`.trim();
            } else if (!truthInjection) {
                truthInjection = `
──────────────────────────
[${segments.truth_injection.waiting_title}]
${segments.truth_injection.waiting_desc}
- Nombre: ${userProfile.name || 'Viajero'}
──────────────────────────
`.trim();
            }

            // --- NATIVE CODEX INJECTION (V12.0 - EL CÓDICE MAESTRO) ---
            const masterWisdom = CodexService.getMasterWisdom('all');

            const unifiedSystemPrompt = `
    ${prompts.naos_system}
    
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
    
    [${lang === 'es' ? 'SABIDURÍA DEL CÓDICE MAESTRO NAOS - FUENTE DE LA VERDAD ABSOLUTA' : 'NAOS MASTER CODEX WISDOM - SOURCE OF ABSOLUTE TRUTH'}]
    ${masterWisdom}
    
    [NAOS ARCHETYPE CONSCIENCE]
    ${archetypeToneDirectives}
    
    [CONTEXTO DE AUTORIDAD - LA BIBLIA VIVA]
    ${userEnergyContext}
    ${dailyEnergyContext}
    
    ${energyContext?.protocol_status ? `
    ${segments.protocol_status.title}
    ${segments.protocol_status.day}: ${energyContext.protocol_status.day} / ${energyContext.protocol_status.target}
    Fase Actual: ${energyContext.protocol_status.status === 'awaiting_evolution' ? segments.protocol_status.phase_threshold : segments.protocol_status.phase_active}
    Alerta: ${energyContext.protocol_status.protocol_warning ? segments.protocol_status.warning : segments.protocol_status.stable}
    ` : ''}
    
    [ADAPTACIÓN DE CONCIENCIA - EL LENTE]
    ${consciousnessContext}
    ${regulationContext || ''}
    ${coherenceContextTag}
    
    [${lang === 'es' ? 'LECTURA DIARIA ACTIVA (EL ORÁCULO DIJO)' : 'ACTIVE DAILY READING (THE ORACLE SAID)'}]
    ${dailyReadingResponse.data?.reading_text || (lang === 'es' ? 'No se ha realizado lectura hoy aún.' : 'No reading has been performed today yet.')}
    
    [${lang === 'es' ? 'ESTRUCTURA DE RESPUESTA OBLIGATORIA (4 CAPAS)' : 'MANDATORY RESPONSE STRUCTURE (4 LAYERS)'}]
    ${segments.structure.instruction}
    ${segments.structure.diagnosis}
    ${segments.structure.active_force}
    ${segments.structure.risk}
    ${segments.structure.action}
    - ${segments.structure.restriction}
    
    [${lang === 'es' ? 'MEMORIA DE PATRONES' : 'PATTERN MEMORY'}]
    ${lang === 'es' ? 'Si las notas del Guardián inyectadas mencionan un patrón recurrente (procrastinación, evasión), incluye una referencia sutil' : 'If the injected Guardian notes mention a recurring pattern (procrastination, evasion), include a subtle reference'}: "${segments.pattern_memory}". (${lang === 'es' ? 'Máximo 1 vez cada 3 interacciones' : 'Maximum 1 time every 3 interactions'}).

    [${lang === 'es' ? 'ESTADO DE COHERENCIA ACTUAL' : 'CURRENT COHERENCE STATE'}]
    ${architectContext}
    
    [${lang === 'es' ? 'DIRECTIVA MAESTRA DE TONO SEGÚN REGIÓN' : 'MASTER TONE DIRECTIVE BY REGION'}]
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
            const finalResponse = this.applyOutputGuard(sanitizedResponse, language);

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

        // CONFIRMED MODEL: gemini-flash-latest (Points to 1.5 stable)
        const TARGET_MODEL = "gemini-flash-latest";
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

    private applyOutputGuard(text: string, language: string = 'es'): string {
        const words = text.split(/\s+/);
        // Límite de seguridad de 200 palabras para evitar desbordes detectados
        if (words.length > 200) {
            console.warn(`⚠️ OUTPUT GUARD: Trimming response for user. Current length: ${words.length}`);
            const suffix = language === 'en' ? '... [Content governed by brevity]' : '... [Contenido gobernado por brevedad]';
            return words.slice(0, 200).join(" ") + suffix;
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

    async generateColdRead(userId: string, language: string = 'es'): Promise<string> {
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
            - Language: ${language === 'es' ? 'Español Latinoamericano' : 'English'}.
            - Formato: Solo texto fluido, sin encabezados Markdown (##).
            - Brevedad: Máximo 150 palabras.
            - ${language === 'es' ? 'Empieza siempre con' : 'Always start with'}: "${language === 'es' ? 'Saludos' : 'Greetings'}, ${userProfile.nickname || userProfile.name}. ${language === 'es' ? 'Has cruzado el umbral.' : 'You have crossed the threshold.'}"
        `;

        try {
            return await this.callGeminiAPI(language === 'es' ? "Realiza mi lectura de iniciación inicial." : "Perform my initial initiation reading.", systemPrompt);
        } catch (error) {
            console.warn("⚠️ Cold Read AI initiation failed, using mystical fallback.", error);
            if (language === 'en') {
                return `Greetings, ${userProfile.nickname || userProfile.name}. You have crossed the threshold. Although the data network is in flux, your presence here is clear. Your architecture suggests a search for balance between what you know and what you feel. This is the space to build your stability. Welcome to NAOS.`;
            }
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
