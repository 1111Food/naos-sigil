import { config } from '../../config/env';

export class LifelineEngine {
    static async generate(prompt: string): Promise<any> {
        const apiKey = config.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("Faltan credenciales de Gemini.");

        const modelName = "gemini-1.5-pro"; // Deep generation model for lifeline pinnacles
        const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const payload = {
            system_instruction: { parts: [{ text: prompt }] },
            contents: [{ role: "user", parts: [{ text: "Genera el Eje Evolutivo y el Ciclo actual de 9 años." }] }],
            generationConfig: { 
                temperature: 0.7, 
                topP: 0.8, 
                topK: 40,
                response_mime_type: "application/json"
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout for heavy generation

        let attempt = 0;
        const maxAttempts = 3;

        while (attempt < maxAttempts) {
            try {
                attempt++;
                // Fallback to older model if 2.5 is overloaded on attempt 2+
                const activeModel = attempt > 1 ? "gemini-1.5-flash" : modelName;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

                console.log(`⏳ LifelineEngine: Calling ${activeModel} for Macro Evolution Axis (Attempt ${attempt})...`);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(`Lifeline API Error on attempt ${attempt}:`, errorData);
                    
                    if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
                        console.log(`⚠️ Gemini API Limit/Overload (${response.status}). Retrying with fallback model in ${attempt * 1.5}s...`);
                        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
                        continue;
                    }
                    
                    throw new Error("Error en la red estelar al calcular el Eje Evolutivo.");
                }

                const data = await response.json();
                const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!textResponse) throw new Error("El Oráculo no devolvió la arquitectura evolutiva.");

                try {
                    let cleanText = textResponse.trim();
                    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
                    if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
                    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

                    const jsonResult = JSON.parse(cleanText);
                    clearTimeout(timeoutId);
                    return jsonResult;
                } catch (parseError) {
                    console.error("Failed to parse Lifeline JSON:", textResponse);
                    throw new Error("El Eje Evolutivo se generó con una estructura inestable.");
                }
            } catch (e: any) {
                if (attempt >= maxAttempts) {
                    clearTimeout(timeoutId);
                    console.warn("⚠️ LifelineEngine: Gemini call reached max attempts. Returning local narrative fallback.");
                    return LifelineEngine.generateLocalFallback();
                }
            }
        }
        return LifelineEngine.generateLocalFallback();
    }

    private static generateLocalFallback(): any {
        return {
            pinnacles: [
                {
                    phase: 1,
                    age_range: "0 - 31 años",
                    title: "Pináculo I: Cimentación y Desarrollo del Ser",
                    archetypal_theme: "Despertar del Potencial Individual",
                    core_challenge: "Superación de condicionamientos iniciales y desarrollo de la independencia.",
                    master_strategy: "Establecer bases sólidas de autoconocimiento y disciplina interior.",
                    integration_key: "Confianza en el propio criterio y soberanía mental."
                },
                {
                    phase: 2,
                    age_range: "32 - 40 años",
                    title: "Pináculo II: Consolidación y Manifestación",
                    archetypal_theme: "Expansión de la Misión de Vida",
                    core_challenge: "Equilibrar la ambición material con el propósito espiritual.",
                    master_strategy: "Construir sistemas y proyectos con impacto de largo alcance.",
                    integration_key: "Liderazgo consciente y maestría operativa."
                },
                {
                    phase: 3,
                    age_range: "41 - 49 años",
                    title: "Pináculo III: Transmutación y Sabiduría",
                    archetypal_theme: "Cosecha Alquímica y Mentoría",
                    core_challenge: "Trascender el ego individual para servir como guía de otros.",
                    master_strategy: "Integrar las lecciones vividas en una síntesis de sabiduría.",
                    integration_key: "Transmisión de conocimiento y legado viviente."
                },
                {
                    phase: 4,
                    age_range: "50+ años",
                    title: "Pináculo IV: Maestría Trascendente",
                    archetypal_theme: "Trascendencia y Libertad Espiritual",
                    core_challenge: "Liberación de apegos y plenitud en el propósito superior.",
                    master_strategy: "Vivir en sintonía pura con el orden cósmico.",
                    integration_key: "Paz imperturbable y coherencia total."
                }
            ],
            current_cycle: {
                year_number: 1,
                title: "Año Personal 1: Inicio de Nuevo Ciclo de 9 Años",
                theme: "Siembra, Nuevas Oportunidades y Renovación Total",
                description: "Estás en el primer año de una gran espiral evolutiva de 9 años. Es el momento perfecto para iniciar proyectos, refundar intenciones y asumir nuevos liderazgos.",
                recommendations: [
                    "Define con claridad impecable tus metas para la década.",
                    "Abandona patrones y relaciones obsoletas del ciclo anterior.",
                    "Toma la iniciativa con valentía y determinación."
                ]
            }
        };
    }
}
