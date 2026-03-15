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
            1. PROHIBIDO usar lenguaje romántico, sentimental o místico íntimo.
            2. Tono clínico, estratégico, asertivo y de consultoría B2B ('Arquitectura Organizacional'). El equipo es una "Máquina Operativa".
            3. Responde estrictamente con un JSON válido usando estas claves (máximo 4 líneas por clave).
            4. Utiliza el concepto de "Fuego" (Iniciativa), "Tierra" (Ejecución), "Aire" (Estrategia) y "Agua" (Cohesión).
            
            {
                "sinergia_global": "Análisis macro de la cohesión del ensamble. Eficiencia sistémica.",
                "friccion_operativa": "Puntos de ruptura técnica y cuellos de botella emocionales/intelectuales.",
                "liderazgo_distribuido": "Mapeo de la Arquitectura de Poder. Quién sostiene la estructura y quién impulsa el movimiento.",
                "flujo_informacion": "Optimización de la comunicación interna y protocolos de resolución de crisis.",
                "veredicto_arquitecto": "Dictamen final del Arquitecto NAOS para optimizar el rendimiento de esta Máquina Humana."
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
            return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
        } catch (error) {
            console.warn("⚠️ Group Oracle Synthesis failed, using fallback", error);
            return this.getFallback();
        }
    }

    private static getFallback() {
        return {
            sinergia_global: "El ensamble operativo muestra un engranaje funcional con distribución estándar de cargas cognitivas.",
            friccion_operativa: "Posibles cuellos de botella en la transición entre la planificación estratégica y la materialización táctica.",
            liderazgo_distribuido: "Estructura de poder centralizada que requiere delegación activa para evitar saturación sistémica.",
            flujo_informacion: "Canales de comunicación estables, aunque susceptibles a ruido térmico en situaciones de crisis.",
            veredicto_arquitecto: "Se requiere incorporar un catalizador externo enfocado en la ejecución pura (Tierra) para estabilizar el momentum."
        };
    }
}
