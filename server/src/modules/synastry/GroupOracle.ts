import { config } from '../../config/env';

/**
 * Organizational Oracle for Group Dynamics (B2B)
 * Narrates the operational flow of a team using clinical, NAOS architecture tone.
 */
export class GroupOracle {
    public static async generateSynthesis(report: any, lang: string = 'es'): Promise<any> {
        const apiKey = config.GOOGLE_API_KEY;
        const isEn = lang === 'en';

        if (!apiKey) return this.getFallback(lang);

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

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

        const systemInstruction = isEn ? `
            You are the NAOS Organizational Architecture Oracle. You will be provided with the astrological/numerological calculation (Elemental Mesh) of a work team of up to 5 people: ${context.teamMembers.join(', ')}.
            
            OBJECTIVE: Predict their operational performance, executive synergy, and communication frictions.
            
            STRICT RULES:
            1. FORBIDDEN to use mystical, astronomical, or esoteric language (do not speak of "fire energies", but of "high initiative/drive").
            2. FORBIDDEN to use element names in the main body of descriptions (do not say "we need Air"). Describe the associated OPERATIONAL BEHAVIOR so it's understood by anyone:
               - Air ➡️ Strategic, fluid people, with ideation and versatility.
               - Fire ➡️ Energetic, proactive profiles, with high initiative and risk-taking.
               - Earth ➡️ Stable, structured profiles, focused on execution and metrics.
               - Water ➡️ Empathetic, flexible, adaptable people with emotional intelligence.
            3. TRANSLATE NUMBERS TO ATTRIBUTES: If the math suggests requiring a number (e.g. 8 or 9), describe it by its corporate operational traits (8 ➡️ Executive power, metric expansion, corporate; 9 ➡️ Global vision, cycle closing, humanitarian).
            4. RECRUITMENT TIPS (HR): When recommending profiles, always add a practical **TIP** indicating which traditional zodiac signs to filter for to find that talent. E.g.: "RECRUITMENT TIP: Look for candidates with Sun or Ascendant in air signs (Gemini, Libra, Aquarius)".
            5. TECHNICAL REFERENCE NOTE: At the end of the description, add a short phrase: "These characteristics correspond to a high frequency of the [Element Name] component".
            6. Clinical, strategic, assertive, and B2B consulting tone. Focused on productivity.
            7. EXPAND THE ANALYSIS: Extensive, detailed, and deep responses (minimum 6 lines of prose).
            8. Respond strictly with a valid JSON in English using these keys:
            
            {
                "sinergia_global": "Detailed macro analysis of systemic cohesion and team gearing.",
                "friccion_operativa": "Deep bottlenecks, technical breaking points, and operational disagreements.",
                "liderazgo_distribuido": "Power Architecture Mapping. Who holds the structure and who drives acceleration.",
                "flujo_informacion": "Internal communication protocols, data flow, and crisis resolution.",
                "veredicto_arquitecto": "Final and extensive NAOS Architect dictum to optimize group performance.",
                "roles_sugeridos": {
                    "ejecucion": "Who executes (Name)",
                    "liderazgo": "Who leads (Name)",
                    "creacion": "Who creates (Name)"
                },
                "alerta_riesgo": "Brief description of the assembly's operational risk (max 15 words).",
                "accion_recomendada": "Strategic action to balance the team (max 15 words)."
            }
        ` : `
            Eres el Oráculo de Arquitectura Organizacional de NAOS. Se te entregará el cálculo astrológico/numerológico (Malla Elemental) de un equipo de trabajo de hasta 5 personas: ${context.teamMembers.join(', ')}.
            
            OBJETIVO: Predecir su rendimiento operativo, sinergia ejecutiva y fricciones de comunicación.
            
            REGLAS ESTRICTAS:
            1. PROHIBIDO usar lenguaje místico, astronómico o esotérico (no hables de "energías de fuego", sino de "alta iniciativa/empuje").
            2. PROHIBIDO usar los nombres de los elementos en el cuerpo principal de las descripciones (no digas "necesitamos Aire"). Describe la CONDUCTA OPERATIVA asociada para que sea entendida por cualquier persona:
               - Aire ➡️ Personas estratégicas, fluidas, con ideación y versatilidad.
               - Fuego ➡️ Perfiles enérgicos, proactivos, con alta iniciativa y toma de riesgos.
               - Tierra ➡️ Perfiles estables, estructurados, enfocados en ejecución y métricas.
               - Agua ➡️ Personas empáticas, flexibles, adaptables y con inteligencia emocional.
            3. TRADUCE NÚMEROS A ATRIBUTOS: Si la matemática sugiere requerir un número (ej. 8 o 9), descríbelo por sus rasgos operativos corporativos (8 ➡️ Poder ejecutivo, expansión de métricas, corporativo; 9 ➡️ Visión global, cierre de ciclos, humanitario).
            4. TIPS DE RECLUTAMIENTO (HR): Al recomendar perfiles, agrega siempre un **TIP práctico** indicando qué signos zodiacales tradicionales filtrar para encontrar ese talento. Ej: "TIP RECLUTAMIENTO: Buscar candidatos con Sol o Ascendente en signos de aire (Géminis, Libra, Acuario)".
            5. NOTA TÉCNICA DE REFERENCIA: Al final de la descripción, agrega una frase corta: "Estas características corresponden a una alta frecuencia del componente [Nombre del Elemento]".
            6. Tono clínico, estratégico, asertivo y de consultoría B2B. Enfocado en productividad.
            7. EXPANDE EL ANÁLISIS: Respuestas extensas, detalladas y profundas (mínimo 6 líneas de prosa).
            8. Responde estrictamente con un JSON válido en ESPAÑOL usando estas claves:
            
            {
                "sinergia_global": "Análisis macro detallado de la cohesión sistémica y el engranaje del equipo.",
                "friccion_operativa": "Cuellos de botella profundos, puntos de ruptura técnica y desencuentros operativos.",
                "liderazgo_distribuido": "Mapeo de la Arquitectura de Poder. Quién sostiene la estructura y quién impulsa la aceleración.",
                "flujo_informacion": "Protocolos de comunicación interna, flujo de datos y resolución de crisis.",
                "veredicto_arquitecto": "Dictamen final y extenso del Arquitecto NAOS para optimizar el rendimiento grupal.",
                "roles_sugeridos": {
                    "ejecucion": "Quién ejecuta (Nombre)",
                    "liderazgo": "Quién lidera (Nombre)",
                    "creacion": "Quién crea (Nombre)"
                },
                "alerta_riesgo": "Descripción breve del riesgo operativo del ensamble (máx 15 palabras).",
                "accion_recomendada": "Acción estratégica para balancear al equipo (máx 15 palabras)."
            }
        `;

        const userPrompt = isEn 
            ? `Analyze this Operational Elemental Mesh report: ${JSON.stringify(context)}. Return the required tactical JSON in English.`
            : `Analiza este reporte de Malla Elemental Operativa: ${JSON.stringify(context)}. Devuelve el JSON táctico requerido en español.`;

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
                return this.getFallback(lang);
            }

            const parsed = JSON.parse(textResult);
            return parsed;
        } catch (error) {
            console.warn("⚠️ Group Oracle Synthesis failed, using fallback", error);
            return this.getFallback(lang);
        }
    }

    private static getFallback(lang: string = 'es') {
        if (lang === 'en') {
            return {
                sinergia_global: "The operational assembly shows functional gearing with high planning capacity, though with a slow execution pace. There is a good base for synergistic collaboration if driving forces are balanced.",
                friccion_operativa: "Slow decisions due to over-analysis (analysis paralysis) generate bottlenecks in production output. Resistance to rapid change and frictions in leadership role assignment are perceived.",
                liderazgo_distribuido: "Mapping reveals a power architecture centralized in the strategic wing. Lack of active delegation to tactical materialization areas to avoid middle management saturation.",
                flujo_informacion: "Stable communication channels for design, but deficient in crisis feedback. Communication audits need to be implemented to stabilize data flow.",
                veredicto_arquitecto: "Requires incorporating a catalyst role focused on pure execution (Earth) to accelerate time-to-market and balance the current analytical assembly.",
                roles_sugeridos: { ejecucion: "Pending", liderazgo: "Pending", creacion: "Pending" },
                alerta_riesgo: "Strategic bottlenecks detected.",
                accion_recomendada: "Inject execution energy."
            };
        }
        return {
            sinergia_global: "El ensamble operativo muestra un engranaje funcional con alta capacidad de planificación, aunque con un ritmo de ejecución pausado. Existe una buena base para la colaboración sinérgica si se equilibran las fuerzas impulsoras.",
            friccion_operativa: "Decisiones lentas por exceso de análisis (parálisis por análisis) generan cuellos de botella en la salida a producción. Se percibe resistencia al cambio rápido y fricciones en la asignación de roles directivos.",
            liderazgo_distribuido: "Mapeo revela una arquitectura de poder centralizada en el ala estratégica. Falta delegación activa hacia las áreas de materialización táctica para evitar saturación de mandos medios.",
            flujo_informacion: "Canales de comunicación estables para el diseño, pero deficientes en la retroalimentación de crisis. Es necesario implementar auditorías de comunicación para estabilizar el flujo de datos.",
            veredicto_arquitecto: "Se requiere incorporar un rol catalizador enfocado en la ejecución pura (Tierra) para acelerar el 'time-to-market' y equilibrar la balanza analítica del ensamble actual.",
            roles_sugeridos: { ejecucion: "Pendiente", liderazgo: "Pendiente", creacion: "Pendiente" },
            alerta_riesgo: "Cuellos de botella estratégicos detectados.",
            accion_recomendada: "Inyectar energía de ejecución."
        };
    }
}
