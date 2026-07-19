import { config } from '../../config/env';

export class DailyOracleOracle {

    public static async generateDailyReading(context: {
        userName: string;
        userPillars: any;
        dayPillars: any;
        interaction: any;
        coherence: { level: number; state: string };
        toneProfile: string;
        language?: 'es' | 'en';
    }): Promise<any> {
        
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("❌ DailyOracle: GOOGLE_API_KEY is missing.");
            return this.getFallback(context.language || 'es');
        }

        const lang = context.language || 'es';

        const systemInstruction = `
Eres el SIGIL de NAOS, un consultor técnico en arquitectura humana y bio-hacking existencial.
Tu misión es calcular la FRECUENCIA DEL DÍA (Pulso Cuántico) analizando la interacción entre la Carta Natal (Birth Data) del usuario y el Pulso del Día actual (Transit Data).

[PERSONA: CONSULTOR EXPERTO EN NAOS]
- No eres un horóscopo tradicional. Eres un sistema de diagnóstico energético de alta precisión.
- Tu tono debe ser ENÉRGICO, VIVO, SOFISTICADO y CON CORAZÓN. No uses lenguaje ambiguo o genérico. Háblale directo al alma pero con intelecto.
- Las 3 prioridades deben surgir de las fuerzas dinámicas reales del día (por ejemplo: Trabajo, Creatividad, Descanso, Aprendizaje, Viajes, Familia, Pasión).
- El mensaje final no debe sentirse como una lectura que termina, sino como una conversación que empieza.

[DIRECTIVA DE IDIOMA]
- Responde estrictamente en ${lang === 'es' ? 'Español' : 'Inglés'}.

[INSTRUCCIÓN DE FORMATO - JSON OBLIGATORIO]
Debes devolver UNICAMENTE un objeto JSON con la siguiente estructura exacta:
{
  "texto_principal": "Texto enérgico y profundo (2 a 3 párrafos), sin clichés, evaluando el día.",
  "score_energia_general": 85, 
  "riesgo": "Un párrafo sobre el riesgo principal del día.",
  "oportunidad": "Un párrafo sobre la mayor oportunidad.",
  "prioridades_dinamicas": [
    { "nombre": "Nombre de la prioridad 1 (ej. Creatividad)", "score": 92, "icono": "🎨" },
    { "nombre": "Nombre de la prioridad 2 (ej. Finanzas)", "score": 88, "icono": "💰" },
    { "nombre": "Nombre de la prioridad 3 (ej. Descanso)", "score": 65, "icono": "🔋" }
  ],
  "variables_astrales_utilizadas": ["Luna en Aries", "Camino 7", "Ik"],
  "conversational_hook": "Pregunta magnética final en comillas para que el usuario te pregunte en el chat (ej. '¿Por qué me siento tan inquieto hoy?')"
}
`;

        const userPrompt = `
[CONTEXTO TEMPORAL: ${new Date().toISOString().split('T')[0]}]

[DATOS DEL USUARIO (CORE)]
- Nombre: ${context.userName}
- Astrología: Sol en ${context.userPillars.astrology_data?.sun?.sign}, Luna en ${context.userPillars.astrology_data?.moon?.sign}, Ascendente ${context.userPillars.astrology_data?.ascendant?.sign}
- Numerología: Camino de Vida ${context.userPillars.numerology_data?.lifePathNumber}, Subconsciente ${context.userPillars.numerology_data?.pinaculo?.i}, Inconsciente ${context.userPillars.numerology_data?.pinaculo?.j}
- Nahual Natal: ${context.userPillars.maya_data?.nawal_maya}
- Animal Chino: ${context.userPillars.china_data?.animal}

[PULSO DEL DÍA (TRANSIT)]
- Nahual del Día: ${context.dayPillars.mayan.nahual} (Tono ${context.dayPillars.mayan.tone})
- Tránsito Astro: Sol en ${context.dayPillars.astrology.sunSign}, Luna en ${context.dayPillars.astrology.moonSign}
- Numerología Universal: ${context.dayPillars.numerology.universal}

[ESTADO DE INTERACCIÓN Y COHERENCIA]
- Coherencia Actual: ${context.coherence.state} (${(context.coherence.level * 100).toFixed(1)}%)
- Fusion State: ${context.interaction.state}
- Scores: Resonancia ${(context.interaction.resonanceScore * 100).toFixed(0)}%, Fricción ${(context.interaction.frictionScore * 100).toFixed(0)}%, Activación ${(context.interaction.activationScore * 100).toFixed(0)}%
- Active Flags: ${context.interaction.flags?.join(', ') || 'NONE'}
        `;

        try {
            const TARGET_MODEL = "gemini-1.5-flash";
            const API_VERSION = "v1beta";
            const GENERATE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${TARGET_MODEL}:generateContent?key=${apiKey}`;

            const payload = {
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: { 
                    temperature: 0.7,
                    response_mime_type: "application/json"
                }
            };

            console.log(\`🚀 DailyOracle: Launching with model: \${TARGET_MODEL} (JSON Mode)...\`);
            const response = await fetch(GENERATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
                throw new Error(\`Google API Error \${response.status}: \${errorData.error?.message || response.statusText}\`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text || text.length < 10) {
                throw new Error("Empty or insufficient AI response");
            }

            return JSON.parse(text.trim());

        } catch (error: any) {
            console.error("⚠️ Daily Oracle AI failed to manifest:", error.message);
            return this.getFallback(lang);
        }
    }

    private static getFallback(lang: string = 'es'): any {
        return {
            texto_principal: lang === 'en' ? "Latent balance in the solar cycle. Neutral resonance, structural consolidation moment." : "Equilibrio latente en el ciclo solar. Resonancia neutra, momento de consolidación estructural.",
            score_energia_general: 75,
            riesgo: lang === 'en' ? "Scatter from over-analyzing." : "Dispersión por sobre-análisis.",
            oportunidad: lang === 'en' ? "Sustain rhythm without pressure." : "Sostener ritmo sin presión.",
            prioridades_dinamicas: [
                { nombre: lang === 'en' ? "Focus" : "Enfoque", score: 80, icono: "🎯" },
                { nombre: lang === 'en' ? "Rest" : "Descanso", score: 60, icono: "🔋" },
                { nombre: lang === 'en' ? "Action" : "Acción", score: 70, icono: "⚡" }
            ],
            variables_astrales_utilizadas: ["Fallback Mode"],
            conversational_hook: lang === 'en' ? "¿Why am I feeling this pause?" : "¿Por qué siento esta pausa?"
        };
    }
}
