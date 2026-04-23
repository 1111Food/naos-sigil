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
        if (!apiKey) {
            console.error("❌ DailyOracle: GOOGLE_API_KEY is missing.");
            return this.getFallback(context.language || 'es');
        }

        const lang = context.language || 'es';

        const systemInstruction = `
Eres el SIGIL de NAOS, un consultor técnico en arquitectura humana y bio-hacking existencial. 
Tu misión es realizar una CALIBRACIÓN DIARIA DE REALIDAD utilizando la fusión de 12 factores (Astrología, Numerología, Sistema Maya y Chino).

[PERSONA: CONSULTOR EXPERTO EN NAOS]
- No eres un horóscopo. Eres un sistema de diagnóstico energético de alta precisión.
- Utilizas un lenguaje técnico, sofisticado y autoritario.
- Identificas la interacción exacta entre la Carta Natal (Birth Data) y el Pulso del Día (Transit Data).

[DIRECTIVA DE IDIOMA]
- Responde estrictamente en ${lang === 'es' ? 'Español' : 'Inglés'}.

[DIRECTIVA DE FORMATO Y ESPACIADO]
- Debes usar encabezados exactos (1. TITULO, 2. RESUMEN, etc.).
- OBLIGATORIO: Usa DOBLE salto de línea (\n\n) entre cada punto para facilitar la lectura.
- SHARP ENDING: Termina de forma natural y tajante. PROHIBIDO usar firmas de sistema o etiquetas como "[Content governed by brevity]".

[ESTRUCTURA]:
1. ${lang === 'es' ? 'TITULO' : 'TITLE'}: (Un resumen energético de una frase).
2. ${lang === 'es' ? 'RESUMEN ENERGÉTICO' : 'ENERGY SUMMARY'}: (Análisis técnico de cómo el pulso de hoy interactúa con el núcleo del usuario: Nahual, Sol/Luna/Asc, Pináculo).
3. ${lang === 'es' ? 'GUÍA PERSONAL' : 'PERSONAL GUIDANCE'}: (Consejo claro y accionable basado en las fuerzas activas).
4. ${lang === 'es' ? 'ESPEJO EMOCIONAL' : 'EMOTIONAL MIRROR'}: (Reflejo del estado emocional probable del usuario hoy).
5. ${lang === 'es' ? 'ACCIÓN' : 'ACTION'}: (1 tarea específica de calibración o bio-hacking).
6. ${lang === 'es' ? 'EVITAR' : 'AVOID'}: (1 cosa específica que represente un riesgo reactivo hoy).

[DIRECTIVA DE TONO: ${context.toneProfile}]
- CHALLENGE: Directo, empuja al límite, sin suavizar riesgos.
- GUIDE: Analítico, preciso, dirección estratégica.
- BALANCED: Equilibrio entre diagnóstico frío y sugerencia práctica.
        `;

        const userPrompt = `
[CONTEXTO TEMPORAL: ${new Date().toISOString().split('T')[0]}]

[DATOS DEL USUARIO (CORE)]
- Astrología: Sol en ${context.userPillars.astrology_data?.sun?.sign}, Luna en ${context.userPillars.astrology_data?.moon?.sign}, Ascendente ${context.userPillars.astrology_data?.ascendant?.sign}
- Numerología: Camino de Vida ${context.userPillars.numerology_data?.lifePathNumber}, Subconsciente ${context.userPillars.numerology_data?.pinaculo?.i}, Inconsciente ${context.userPillars.numerology_data?.pinaculo?.j}
- Nahual Natal: ${context.userPillars.maya_data?.nawal_maya}
- Animal Chino: ${context.userPillars.china_data?.animal}

[PULSO DE HOY (TRANSIT)]
- Nahual del Día: ${context.dayPillars.mayan.nahual} (Tono ${context.dayPillars.mayan.tone})
- Tránsito Astro: Sol en ${context.dayPillars.astrology.sunSign}, Luna en ${context.dayPillars.astrology.moonSign}
- Numerología Universal: ${context.dayPillars.numerology.universal}

[ESTADO DE INTERACCIÓN]
- Coherencia: ${context.coherence.state} (${(context.coherence.level * 100).toFixed(1)}%)
- Fusion State: ${context.interaction.state}
- Scores: Resonancia ${(context.interaction.resonanceScore * 100).toFixed(0)}%, Fricción ${(context.interaction.frictionScore * 100).toFixed(0)}%, Activación ${(context.interaction.activationScore * 100).toFixed(0)}%
- Active Flags: ${context.interaction.flags?.join(', ') || 'NONE'}
        `;

        try {
            // Use the same proven pattern as SigilService
            const TARGET_MODEL = "gemini-flash-latest";
            const API_VERSION = "v1beta";
            const GENERATE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${TARGET_MODEL}:generateContent?key=${apiKey}`;

            const payload = {
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: { temperature: 0.7, topP: 0.8, topK: 40 }
            };

            console.log(`🚀 DailyOracle: Launching with model: ${TARGET_MODEL}...`);
            const response = await fetch(GENERATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
                throw new Error(`Google API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text || text.length < 10) {
                throw new Error("Empty or insufficient AI response");
            }

            return text.trim();

        } catch (error: any) {
            console.error("⚠️ Daily Oracle AI failed to manifest:", error.message);
            return this.getFallback(lang);
        }
    }

    private static getFallback(lang: string = 'es'): string {
        if (lang === 'en') {
            return `🔮 NAOS Reading — Today\n\nDay energy:\nLatent balance in the solar cycle.\n\nInteraction with you:\nNeutral resonance. Structural consolidation moment.\n\nRisk:\nScatter from over-analyzing.\n\nOpportunity:\nSustain rhythm without pressure.\n\nNAOS Action:\nEarth Frequencies 5 min.`;
        }
        return `🔮 Lectura NAOS — Hoy\n\nEnergía del día:\nEquilibrio latente en el ciclo solar.\n\nInteracción contigo:\nResonancia neutra. Momento de consolidación estructural.\n\nRiesgo:\nDispersión por sobre-análisis.\n\nOportunidad:\nSostener ritmo sin presión.\n\nAcción NAOS:\nFrecuencias de Tierra 5 min.`;
    }
}


