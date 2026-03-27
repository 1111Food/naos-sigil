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
    }): Promise<string> {
        
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) return this.getFallback(context.language || 'es');

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const lang = context.language || 'es';

        const systemInstruction = `
Eres el SIGIL de NAOS, un consultor técnico en arquitectura humana y bio-hacking existencial. 
Tu misión es realizar un ANÁLISIS COMPARATIVO PROFESIONAL entre la Carta Natal (Birth Data) del usuario y el Pulso Energético (Transit Data) de hoy.

[PERSONA: CONSULTOR EXPERTO EN NAOS]
- No eres un horóscopo. Eres un sistema de diagnóstico energético.
- Utilizas un lenguaje técnico, preciso y autoritario pero empoderador.
- Identificas fricciones y resonancias específicas entre los dos estados (Natal vs Transit).

[LOGICA DE INTERPRETACIÓN]
1. Compara el Nahual de nacimiento con el Nahual de hoy.
2. Compara el Elemento astrológico natal con el Signo de hoy.
3. Evalúa cómo el Número Universal de hoy impacta el Camino de Vida del usuario.
4. Integra la Coherencia actual del usuario (${context.coherence.state}) como el "filtro" de esta energía.

[DIRECTIVA DE TONO: ${context.toneProfile}]
- CHALLENGE: Directo, empuja a la acción, sin suavizar riesgos.
- GUIDE: Analítico, frases cortas, una dirección clara.
- BALANCED: Equilibrio entre diagnóstico frío y sugerencia práctica.

FORMATO OBLIGATORIO (Utiliza estos encabezados exactos):

${lang === 'en' ? '🔮 NAOS Reading — Today' : '🔮 Lectura NAOS — Hoy'}

${lang === 'en' ? 'DIAGNOSTIC:' : 'DIAGNÓSTICO:'}
[Análisis técnico de la interacción entre la energía natal del usuario y el pulso de hoy. Ej: "Tu elemento Fuego choca con el Nahual de Agua de hoy"]. Máx 2 líneas.

${lang === 'en' ? 'ACTIVE FORCES:' : 'FUERZAS ACTIVAS:'}
[Dónde hay tracción hoy basándote en la comparativa]. Máx 2 líneas.

${lang === 'en' ? 'REACTIVE RISKS:' : 'RIESGOS REACTIVOS:'}
[Qué debe evitar el usuario según su configuración específica hoy]. Máx 1 línea.

${lang === 'en' ? 'PROFESSIONAL GUIDANCE:' : 'CONDUCTA PROFESIONAL:'}
[La única tarea de Bio-Hacking o conducta sugerida]. Máx 1 línea.
        `;

        const userPrompt = `
[CONTEXTO TEMPORAL: ${new Date().toISOString().split('T')[0]}]

[DATOS NATALES (USER BORN DATA)]
- Astrología: Signo ${context.userPillars.astrology.sign} (${context.userPillars.astrology.element})
- Numerología: Camino de Vida ${context.userPillars.numerology?.lifePathNumber}
- Nahual Maya: ${context.userPillars.mayan?.nawal_maya}
- Animal Chino: ${context.userPillars.chinese?.animal}

[PULSO DE HOY (TRANSIT DATA)]
- Día: Nahual ${context.dayPillars.mayan.nahual} (Tono ${context.dayPillars.mayan.tone})
- Tránsito Astro: Signo ${context.dayPillars.astrology.sign}
- Tránsito Chino: Año del ${context.dayPillars.chinese.animal}
- Numerología Universal: ${context.dayPillars.numerology.universal}

[ESTADO ACTUAL]
- Coherencia: ${context.coherence.state} (${(context.coherence.level * 100).toFixed(1)}%)
- Scores de Interacción: Resonancia ${(context.interaction.resonanceScore * 100).toFixed(0)}%, Fricción ${(context.interaction.frictionScore * 100).toFixed(0)}%, Activación ${(context.interaction.activationScore * 100).toFixed(0)}%
        `;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: { 
                        temperature: 0.7, // increased variance
                        maxOutputTokens: 300 
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

    private static getFallback(lang: string = 'es'): string {
        if (lang === 'en') {
            return `🔮 NAOS Reading — Today\n\nDay energy:\nLatent balance in the solar cycle.\n\nInteraction with you:\nNeutral resonance. Structural consolidation moment.\n\nRisk:\nScatter from over-analyzing.\n\nOpportunity:\nSustain rhythm without pressure.\n\nNAOS Action:\nEarth Frequencies 5 min.`;
        }
        return `🔮 Lectura NAOS — Hoy\n\nEnergía del día:\nEquilibrio latente en el ciclo solar.\n\nInteracción contigo:\nResonancia neutra. Momento de consolidación estructural.\n\nRiesgo:\nDispersión por sobre-análisis.\n\nOportunidad:\nSostener ritmo sin presión.\n\nAcción NAOS:\nFrecuencias de Tierra 5 min.`;
    }
}
