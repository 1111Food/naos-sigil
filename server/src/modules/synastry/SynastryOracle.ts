import { config } from '../../config/env';
import { RelationshipType } from '../../types/synastry';

/**
 * Premium AI Oracle for Synastry v2.5
 * Narrates the 6 relational indices with the 'Architect of NAOS' persona.
 */
export class SynastryOracle {
    public static async generateSynthesis(report: any, timeWindows: any[], type: RelationshipType, nameA: string, nameB: string, archA: any, archB: any, language: string = 'es'): Promise<any> {
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) return this.getFallback(language);

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const isEn = language === 'en';

        // Prepare a condensed version of the data for the prompt to save tokens and focus
        const context = {
            relationshipType: type,
            personA: { name: nameA, archetype: isEn ? archA.nombre_en : archA.nombre, frequency: archA.frecuencia, element: archA.elemento_dominante },
            personB: { name: nameB, archetype: isEn ? archB.nombre_en : archB.nombre, frequency: archB.frecuencia, element: archB.elemento_dominante },
            score: report.score,
            indices: report.indices,
            strengths: report.A_StrongCompatibilities,
            tensions: report.B_PotentialTensions,
            growth: report.C_GrowthAreas,
            temporalVibe: timeWindows.slice(0, 5).map(w => ({ date: w.date, type: w.type }))
        };

        const relationshipLabels: Record<string, { es: string, en: string }> = {
            [RelationshipType.ROMANTIC]: { es: 'Romántico', en: 'Romantic' },
            [RelationshipType.AMISTAD]: { es: 'Amistad', en: 'Friendship' },
            [RelationshipType.PARENTAL]: { es: 'Parental', en: 'Parental' },
            [RelationshipType.BUSINESS]: { es: 'Negocios', en: 'Business' }
        };
        const relLabel = relationshipLabels[type]?.[isEn ? 'en' : 'es'] || type;

        const systemInstruction = isEn ? `
            You are the NAOS Oracle (The Architect). Your purpose is to narrate the technical and profound truth behind a human bond between ${nameA} and ${nameB}.
            
            YOU ARE ANALYZING THE OPERATIVE AND SPIRITUAL CONNECTION BETWEEN:
            - User A (${nameA}): NAOS Archetype: ${archA.nombre_en || archA.nombre} (${archA.frecuencia}).
            - User B (${nameB}): NAOS Archetype: ${archB.nombre_en || archB.nombre} (${archB.frecuencia}).

            ANALYSIS DIRECTIVE: 
            Your reading of compatibility, karmic clash, and synergy must focus on how these two specific operative roles interact. 
            Identify if there is a clash of speeds (e.g., Initiator vs. Analyst) or complementary powers (e.g., Builder vs. Node).
            Generate actionable strategies for both archetypes to achieve maximum coherence without destroying each other.

            GOLDEN IDENTITY RULE:
            - Only two people exist: ${nameA} and ${nameB}. 
            - FORBIDDEN to use the word "Reflection". ALWAYS use their real names.
            
            TONO: Stoic, surgical, elegant, and deeply psychological. Speak like an elite human systems analyst.
            
            TECHNICAL CONTEXT:
            - We handle 6 pillars: Erotic (Mars/Venus), Communication (Mercury), Gravity (Moon), Risks/Karma (Saturn), Psyche (Neptune), Power (Mars/Pluto).
            - RELATIONSHIP TYPE: ${relLabel}. The entire synthesis MUST focus on this context.
            
            TASK: Generate a synthesis in JSON using real names. 
            Each pillar explanation (in "explicaciones_pilares") should be a dense narrative of 3 to 5 lines integrating their archetype dynamics.
            
            NARRATIVE STRUCTURE:
            1. Identify the technical configuration of the pillars.
            2. Translate it into a real psychological impact based on their archetypes.
            3. End with the evolutionary purpose of that friction or fluidity.

            JSON OUTPUT STRUCTURE:
            {
                "subtitulo_score": "Short interpretive phrase of the compatibility percentage (max 10 words).",
                "diagnostico": "2–4 line text explaining the primary dynamic of the bond, identifying main strength and friction clearly.",
                "acciones": [
                    "Recommendation 1: Verb + Action + Context (max 12 words)",
                    "Recommendation 2: ...",
                    "Recommendation 3: ..."
                ],
                "riesgo": "1 short paragraph (max 2 lines) explaining what can fail and in what context.",
                "traduccion_simple": "A single clear and direct sentence in everyday language, no technical terms (max 15 words).",
                "origen_calculo": {
                    "astrologia": "1 line explaining the astral origin (e.g., Your Moon in X creates tension with their Mars in Y)",
                    "numerology": "1 line explaining the numerical correspondence",
                    "maya": "1 line explaining the affinity of signs"
                },
                "explicaciones_pilares": {
                    "sexual_erotic": "Narrative about the creative synergy between these two archetypes.",
                    "intellectual_mercurial": "Narrative about mental strategy and mutual decoding.",
                    "emotional_lunar": "Narrative about emotional gravity and psychic nutrition.",
                    "karmic_saturnian": "Narrative about the architecture of risks and evolutionary debts.",
                    "spiritual_neptunian": "Narrative about psychic integration and transcendence of the ego.",
                    "action_martial": "Narrative about the power dynamic and executive pulse of their roles."
                }
            }
        ` : `
            Eres el Oráculo de NAOS (El Arquitecto). Tu propósito es narrar la verdad técnica y profunda detrás de un vínculo humano entre ${nameA} y ${nameB}.
            
            ESTÁS ANALIZANDO LA CONEXIÓN OPERATIVA Y ESPIRITUAL ENTRE:
            - Usuario A (${nameA}): Arquetipo NAOS: ${archA.nombre} (${archA.frecuencia}).
            - Usuario B (${nameB}): Arquetipo NAOS: ${archB.nombre} (${archB.frecuencia}).

            DIRECTIVA DE ANÁLISIS: 
            Tu lectura de compatibilidad, choque kármico y sinergia debe centrarse en cómo interactúan estos dos roles operativos específicos. 
            Identifica si hay choque de velocidades (ej: Iniciador vs Analista) o potencias complementarias (ej: Constructor vs Nodo).
            Genera estrategias accionables para que ambos arquetipos logren la máxima coherencia sin destruirse mutuamente.

            REGLA DE ORO DE IDENTIDAD:
            - Solo existen dos personas: ${nameA} y ${nameB}. 
            - PROHIBIDO usar la palabra "Reflejo". Usa SIEMPRE sus nombres reales.
            
            TONO: Estoico, quirúrgico, elegante y profundamente psicológico. Habla como un analista de sistemas humanos de élite.
            
            CONTEXTO TÉCNICO:
            - Manejamos 6 pilares: Erótico (Marte/Venus), Comunicación (Mercurio), Gravedad (Luna), Riesgos/Karma (Saturno), Psique (Neptuno), Poder (Marte/Plutón).
            - TIPO DE RELACIÓN: ${type}. Toda la síntesis DEBE enfocarse en este contexto.
            
            TAREA: Genera una síntesis en JSON usando los nombres reales. 
            Cada explicación de pilar (en "explicaciones_pilares") debe ser una narrativa densa de 3 a 5 líneas que integre la dinámica de sus arquetipos.
            
            ESTRUCTURA DE NARRATIVA:
            1. Identifica la configuración técnica de los pilares.
            2. Tradúcela a un impacto psicológico real basándote en sus arquetipos.
            3. Finaliza con el propósito evolutivo de esa fricción o fluidez.

            ESTRUCTURA DE SALIDA JSON:
            {
                "subtitulo_score": "Frase corta interpretativa del porcentaje de compatibilidad (máx 10 palabras).",
                "diagnostico": "Texto de 2–4 líneas que explique la dinámica principal del vínculo, identificando fortaleza y fricción principal.",
                "acciones": [
                    "Recomendación 1: Verbo + Acción + Contexto (máx 12 palabras)",
                    "Recomendación 2: ...",
                    "Recomendación 3: ..."
                ],
                "riesgo": "1 párrafo corto (máx 2 líneas) explicando qué puede fallar y en qué contexto ocurre.",
                "traduccion_simple": "1 sola frase clara y directa en lenguaje cotidiano, sin términos técnicos.",
                "origen_calculo": {
                    "astrologia": "1 línea explicando el origen astral",
                    "numerologia": "1 línea explicando la correspondencia numérica",
                    "maya": "1 línea explicando la afinidad de nahuales"
                },
                "explicaciones_pilares": {
                    "sexual_erotic": "La sinergia creadora entre estos dos arquetipos.",
                    "intellectual_mercurial": "La estrategia mental y decodificación mutua.",
                    "emotional_lunar": "La gravedad emocional y nutrición psíquica.",
                    "karmic_saturnian": "La arquitectura de riesgos y deudas evolutivas.",
                    "spiritual_neptunian": "La integración psíquica y trascendencia del ego.",
                    "action_martial": "La dinámica de poder y pulso ejecutivo de sus roles."
                }
            }
        `;

        const userPrompt = isEn 
            ? `Analyze this synastry record: ${JSON.stringify(context)}. Return the synthesis JSON.`
            : `Analiza este registro de sinastría: ${JSON.stringify(context)}. Devuelve el JSON de síntesis.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: { temperature: 0.3, response_mime_type: "application/json" }
                })
            });

            if (!response.ok) throw new Error("Gemini Offline");
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
            const cleanText = rawText.replace(/Reflejo/gi, nameB);
            return JSON.parse(cleanText);
        } catch (error) {
            console.warn("⚠️ Oracle Synthesis failed, using fallback", error);
            return this.getFallback(language);
        }
    }


    private static getFallback(language: string = 'es') {
        const isEn = language === 'en';
        if (isEn) {
            return {
                subtitulo_score: "Structural resonance detected.",
                diagnostico: "The architecture of this bond shows base compatibility. A constant flow between will and emotion is detected.",
                acciones: [
                    "Maintain transparency in shared goals",
                    "Establish clear leadership roles",
                    "Avoid discussions under emotional pressure"
                ],
                riesgo: "Speed clash in critical decision making.",
                traduccion_simple: "You understand each other well, but need to coordinate the pace.",
                explicaciones_pilares: {
                    "sexual_erotic": "Base synergy remains in a state of operative latency, awaiting an external catalyst.",
                    "intellectual_mercurial": "Communication flows through conventional channels, with potential for tactical deepening.",
                    "emotional_lunar": "There is a reciprocal containment that ensures the stability of the relational core.",
                    "karmic_saturnian": "Shared lessons manifest as well-defined mutual responsibilities.",
                    "spiritual_neptunian": "The connection transcends the immediate, seeking a purpose beyond matter.",
                    "action_martial": "Executive pulse is balanced, allowing for coherent decision making."
                }
            };
        }

        return {
            subtitulo_score: "Resonancia estructural detectada.",
            diagnostico: "La arquitectura de este vínculo muestra compatibilidad base. Se detecta un flujo constante entre la voluntad y la emoción.",
            acciones: [
                "Mantener transparencia en objetivos compartidos",
                "Establecer roles claros de liderazgo",
                "Evitar discusiones bajo presión emocional"
            ],
            riesgo: "Choque de velocidades en la toma de decisiones críticas.",
            traduccion_simple: "Se entienden bien, pero deben coordinar el ritmo.",
            explicaciones_pilares: {
                "sexual_erotic": "La sinergia base se mantiene en un estado de latencia operativa, esperando un catalizador externo.",
                "intellectual_mercurial": "La comunicación fluye por canales convencionales, con potencial de profundización táctica.",
                "emotional_lunar": "Existe una contención recíproca que asegura la estabilidad del núcleo relacional.",
                "karmic_saturnian": "Las lecciones compartidas se manifiestan como responsabilidades mutuas bien definidas.",
                "spiritual_neptunian": "La conexión trasciende lo inmediato, buscando un propósito más allá de la materia.",
                "action_martial": "El impulso ejecutivo se encuentra equilibrado, permitiendo una toma de decisiones coherente."
            }
        };
    }

}
