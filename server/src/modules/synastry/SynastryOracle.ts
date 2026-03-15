import { config } from '../../config/env';
import { RelationshipType } from '../../types/synastry';

/**
 * Premium AI Oracle for Synastry v2.5
 * Narrates the 6 relational indices with the 'Architect of NAOS' persona.
 */
export class SynastryOracle {
    public static async generateSynthesis(report: any, timeWindows: any[], type: RelationshipType, nameA: string, nameB: string, archA: any, archB: any): Promise<any> {
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) return this.getFallback();

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Prepare a condensed version of the data for the prompt to save tokens and focus
        const context = {
            relationshipType: type,
            personA: { name: nameA, archetype: archA.nombre, frequency: archA.frecuencia, element: archA.elemento_dominante },
            personB: { name: nameB, archetype: archB.nombre, frequency: archB.frecuencia, element: archB.elemento_dominante },
            score: report.score,
            indices: report.indices,
            strengths: report.A_StrongCompatibilities,
            tensions: report.B_PotentialTensions,
            growth: report.C_GrowthAreas,
            temporalVibe: timeWindows.slice(0, 5).map(w => ({ date: w.date, type: w.type }))
        };

        const systemInstruction = `
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
            3. Finaliza con el propósito evolutivo de esa fricción o fluidez para este par específico.
            
            {
                "sintesis_global": "Análisis elegante de la esencia del vínculo entre ${nameA} y ${nameB} basado en sus arquetipos (máx 5 líneas).",
                "dinamica_poder": "Cómo interactúan sus arquetipos operativos. Quién sostiene la estructura y quién la expande.",
                "alerta_temporal": "Consejo ESTRATÉGICO Y ACCIONABLE para HOY basado en sus arquetipos y la relación ${type}.",
                "explicaciones_pilares": {
                    "sexual_erotic": "Narrativa sobre la sinergia creadora entre estos dos arquetipos.",
                    "intellectual_mercurial": "Narrativa sobre la estrategia mental y decodificación mutua.",
                    "emotional_lunar": "Narrativa sobre la gravedad emocional y nutrición psíquica.",
                    "karmic_saturnian": "Narrativa sobre la arquitectura de riesgos y deudas evolutivas.",
                    "spiritual_neptunian": "Narrativa sobre la integración psíquica y trascendencia del ego.",
                    "action_martial": "Narrativa sobre la dinámica de poder y pulso ejecutivo de sus roles."
                }
            }
        `;

        const userPrompt = `Analiza este registro de sinastría: ${JSON.stringify(context)}. Devuelve el JSON de síntesis.`;

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
            return this.getFallback();
        }
    }

    private static getFallback() {
        return {
            sintesis_global: "La arquitectura de este vínculo muestra una resonancia estructural sólida. Los arquetipos sugieren un flujo constante entre la voluntad y la emoción.",
            dinamica_poder: "Se detecta un equilibrio dinámico donde la fricción evolutiva actúa como motor de crecimiento mutuo.",
            alerta_temporal: "Mantengan la transparencia en los objetivos compartidos durante el próximo ciclo de Venus.",
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
