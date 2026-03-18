import { config } from '../../config/env';

/**
 * Organizational Oracle for Group Dynamics (B2B)
 * Narrates the operational flow of a team using clinical, NAOS architecture tone.
 */
export class GroupOracle {
    public static async generateSynthesis(report: any): Promise<any> {
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) return this.getFallback();

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const context = {
            teamMembers: report.teamNames,
            meshScore: report.score,
            elementalPercentages: {
                fire: report.mesh.fire,
                earth: report.mesh.earth,
                air: report.mesh.air,
                water: report.mesh.water
            },
            voids: report.mesh.voids,
            predominant: report.mesh.predominant
        };

        const systemInstruction = `
            Eres el Oráculo de Arquitectura Organizacional de NAOS. Se te entregará el cálculo astrológico/numerológico (Malla Elemental) de un equipo de trabajo de hasta 5 personas: ${context.teamMembers.join(', ')}.
            
            OBJETIVO: Predecir su rendimiento operativo, sinergia ejecutiva y fricciones de comunicación.
            
            REGLAS ESTRICTAS:
            1. PROHIBIDO usar lenguaje místico, astronómico o esotérico (no hables de "energías de fuego", sino de "alta iniciativa/empuje").
            2. PROHIBIDO usar los nombres de los elementos en el cuerpo principal de las descripciones (no digas "necesitamos Aire"). Describe la CONDUCTA OPERATIVA asociada para que sea entendida por cualquier persona:
               - Aire ➡️ Personas estratégicas, fluidas, con ideación y versatilidad.
               - Fuego ➡️ Perfiles enérgicos, proactivos, con alta iniciativa y toma de riesgos.
               - Tierra ➡️ Perfiles estables, estructurados, enfocados en ejecución y métricas.
               - Agua ➡️ Personas empáticas, flexibles, adaptables y con inteligencia emocional.
            3. TRADUCE NÚMEROS A ATRIBUTOS: Si la matemática sugiere requerir un número (ej. 8 u 8), descríbelo por sus rasgos operativos corporativos (8 ➡️ Poder ejecutivo, expansión de métricas, corporativo; 9 ➡️ Visión global, cierre de ciclos, humanitario).
            4. TIPS DE RECLUTAMIENTO (HR): Al recomendar perfiles, agrega siempre un **TIP práctico** indicando qué signos zodiacales tradicionales filtrar para encontrar ese talento. Ej: "TIP RECLUTAMIENTO: Buscar candidatos con Sol o Ascendente en signos de aire (Géminis, Libra, Acuario)".
            5. NOTA TÉCNICA DE REFERENCIA: Al final de la descripción, agrega una frase corta: "Estas características corresponden a una alta frecuencia del componente [Nombre del Elemento]".
            6. Tono clínico, estratégico, asertivo y de consultoría B2B. Enfocado en productividad.
            7. EXPANDE EL ANÁLISIS: Respuestas extensas, detalladas y profundas (mínimo 6 líneas de prosa).
            8. Responde estrictamente con un JSON válido usando estas claves tradicionales:
            
            Equivalencias Operativas de Elementos:
            - Fuego: Iniciativa, Velocidad, Toma de Riesgo.
            - Tierra: Materialización, Ejecución, Estructura, Métricas.
            - Aire: Estrategia, Innovación, Análisis, Planificación.
            - Agua: Cohesión, Empatía, Adaptabilidad, Cultura.
            
            {
                "sinergia_global": "Análisis macro detallado de la cohesión sistémica y el engranaje del equipo.",
                "friccion_operativa": "Cuellos de botella profundos, puntos de ruptura técnica y desencuentros operativos.",
                "liderazgo_distribuido": "Mapeo de la Arquitectura de Poder. Quién sostiene la estructura y quién impulsa la aceleración.",
                "flujo_informacion": "Protocolos de comunicación interna, flujo de datos y resolución de crisis.",
                "veredicto_arquitecto": "Dictamen final y extenso del Arquitecto NAOS para optimizar el rendimiento grupal."
            }
        `;

        const userPrompt = `Analiza este reporte de Malla Elemental Operativa: ${JSON.stringify(context)}. Devuelve el JSON táctico requerido.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: { temperature: 0.2, response_mime_type: "application/json" }
                })
            });

            if (!response.ok) throw new Error("Gemini Offline");
            const data = await response.json();
            const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResult) {
                console.warn("⚠️ Group Oracle: No response text, using fallback");
                return this.getFallback();
            }

            const parsed = JSON.parse(textResult);
            if (Object.keys(parsed).length === 0 || !parsed.diagnostico) {
                console.warn("⚠️ Group Oracle: Empty or old key format, using fallback");
                return this.getFallback();
            }

            return parsed;
        } catch (error) {
            console.warn("⚠️ Group Oracle Synthesis failed, using fallback", error);
            return this.getFallback();
        }
    }

    private static getFallback() {
        return {
            sinergia_global: "El ensamble operativo muestra un engranaje funcional con alta capacidad de planificación, aunque con un ritmo de ejecución pausado. Existe una buena base para la colaboración sinérgica si se equilibran las fuerzas impulsoras.",
            friccion_operativa: "Decisiones lentas por exceso de análisis (parálisis por análisis) generan cuellos de botella en la salida a producción. Se percibe resistencia al cambio rápido y fricciones en la asignación de roles directivos.",
            liderazgo_distribuido: "Mapeo revela una arquitectura de poder centralizada en el ala estratégica. Falta delegación activa hacia las áreas de materialización táctica para evitar saturación de mandos medios.",
            flujo_informacion: "Canales de comunicación estables para el diseño, pero deficientes en la retroalimentación de crisis. Es necesario implementar auditorías de comunicación para estabilizar el flujo de datos.",
            veredicto_arquitecto: "Se requiere incorporar un rol catalizador enfocado en la ejecución pura (Tierra) para acelerar el 'time-to-market' y equilibrar la balanza analítica del ensamble actual."
        };
    }
}
