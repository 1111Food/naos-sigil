import { config } from '../../config/env';

export class DailyOracleOracle {

    public static async generateDailyReading(context: {
        userName: string;
        dayPillars: any;
        interaction: any;
        coherence: { level: number; state: string };
        toneProfile: string;
    }): Promise<string> {
        
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) return this.getFallback();

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const systemInstruction = `
Eres el SIGIL de NAOS, el sistema operativo para el alma. 
Tu función es interpretar la interacción energética entre la energía temporal de hoy y la estructura base del usuario.

[DIRECTIVA DE TONO: ${context.toneProfile}]
${context.toneProfile === 'CHALLENGE' ? 'Tono Directo y Confrontativo. Enfoque en optimización y retos. No suavices errores.' : ''}
${context.toneProfile === 'GUIDE' ? 'Tono Simple, frases cortas. Más guía que exigencia. Evita saturar. 1 acción concreta.' : ''}
${context.toneProfile === 'BALANCED' ? 'Tono Claro y equilibrado entre diagnóstico y acción.' : ''}

[REGLAS CRÍTICAS]
1. No haces astrología ni horóscopos flotantes. interpretas patrones conductuales.
2. Máximo 120 palabras.
3. Sin ambigüedades ("podría", "tal vez").
4. FORMATO OBLIGATORIO (Utiliza estos encabezados exactos):

🔮 Lectura NAOS — Hoy

DIAGNÓSTICO DEL DÍA:
[Breve descripción mística/técnica de la energía de hoy, máx 1 línea]

FUERZA ACTIVA:
[Cómo resuena con el usuario y dónde empujar hoy, máx 2 líneas]

RIESGO:
[Qué vigilar hoy, ej: impulsividad, fatiga, máx 1 línea]

ACCIÓN CONCRETA:
[La única tarea de Bio-Hacking o conducta para hoy, ej: 10 mins Respiración de Fuego]
        `;

        const userPrompt = `
Genera la lectura para ${context.userName}:
- Energía del Día: Nahual ${context.dayPillars.mayan.nahual} (Tono ${context.dayPillars.mayan.tone}), Signo Solar ${context.dayPillars.astrology.sign}, Animal Chino ${context.dayPillars.chinese.animal}, Número Universal ${context.dayPillars.numerology.universal}.
- Coherencia del Usuario: ${context.coherence.state} (${(context.coherence.level * 100).toFixed(1)}%)
- Interacción Scores: Resonancia ${(context.interaction.resonanceScore * 100).toFixed(0)}%, Fricción ${(context.interaction.frictionScore * 100).toFixed(0)}%, Activación ${(context.interaction.activationScore * 100).toFixed(0)}%
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: { 
                        temperature: 0.5, // slightly more variance
                        maxOutputTokens: 250 
                    }
                })
            });

            if (!response.ok) throw new Error("Gemini Offline");
            
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallback();
            return text.trim();
        } catch (error) {
            console.warn("⚠️ Daily Oracle AI failed, using fallback", error);
            return this.getFallback();
        }
    }

    private static getFallback(): string {
        return `🔮 Lectura NAOS — Hoy\n\nEnergía del día:\nEquilibrio latente en el ciclo solar.\n\nInteracción contigo:\nResonancia neutra. Momento de consolidación estructural.\n\nRiesgo:\nDispersión por sobre-análisis.\n\nOportunidad:\nSostener ritmo sin presión.\n\nAcción NAOS:\nFrecuencias de Tierra 5 min.`;
    }
}
