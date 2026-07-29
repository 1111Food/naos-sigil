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

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

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
            2. FORBIDDEN to use element names in the main body of descriptions. Describe the associated OPERATIONAL BEHAVIOR so it's understood by anyone.
            3. Clinical, strategic, assertive, and B2B consulting tone. Focused on productivity.
            4. You must return a strictly formatted JSON object matching the NAOS V4.1 RelationshipReport schema exactly.
        ` : `
            Eres el Oráculo de Arquitectura Organizacional de NAOS. Se te entregará el cálculo astrológico/numerológico (Malla Elemental) de un equipo de trabajo de hasta 5 personas: ${context.teamMembers.join(', ')}.
            
            OBJETIVO: Predecir su rendimiento operativo, sinergia ejecutiva y fricciones de comunicación.
            
            REGLAS ESTRICTAS:
            1. PROHIBIDO usar lenguaje místico, astronómico o esotérico (no hables de "energías de fuego", sino de "alta iniciativa/empuje").
            2. PROHIBIDO usar los nombres de los elementos en el cuerpo principal de las descripciones. Describe la CONDUCTA OPERATIVA asociada.
            3. Tono clínico, estratégico, asertivo y de consultoría B2B. Enfocado en productividad.
            4. Debes devolver un objeto JSON estrictamente formateado coincidiendo exactamente con el esquema de NAOS V4.1.
        `;

        const jsonTemplate = `
        {
            "executiveSummary": { "type": "", "potential": "", "risk": "", "coreMemory": "" },
            "modules": [
                {
                    "id": "leadership", "title": "Liderazgo y Poder", "icon": "Crown", "priority": 1,
                    "summary": "", "deepAnalysis": "", "keyInsights": [""], "recommendations": [""],
                    "confidence": 90, "evidence": [""], "limitations": [""], "actions": [{ "step": 1, "action": "" }]
                },
                {
                    "id": "execution", "title": "Ejecución y Entrega", "icon": "Target", "priority": 2,
                    "summary": "", "deepAnalysis": "", "keyInsights": [""], "recommendations": [""],
                    "confidence": 90, "evidence": [""], "limitations": [""], "actions": [{ "step": 1, "action": "" }]
                },
                {
                    "id": "innovation", "title": "Innovación y Estrategia", "icon": "Lightbulb", "priority": 3,
                    "summary": "", "deepAnalysis": "", "keyInsights": [""], "recommendations": [""],
                    "confidence": 90, "evidence": [""], "limitations": [""], "actions": [{ "step": 1, "action": "" }]
                }
            ],
            "scenarios": [
                { "id": "A", "title": "Crisis Operativa", "probability": 85, "strengths": [""], "risks": [""], "whatToDo": [""], "description": "" },
                { "id": "B", "title": "Escalamiento Rápido", "probability": 70, "strengths": [""], "risks": [""], "whatToDo": [""], "description": "" },
                { "id": "C", "title": "Fusión / Adquisición", "probability": 40, "strengths": [""], "risks": [""], "whatToDo": [""], "description": "" }
            ],
            "contextCompatibility": [
                { "context": "Startups", "score": 85 },
                { "context": "Corporate", "score": 60 },
                { "context": "Creative Agency", "score": 90 },
                { "context": "Crisis Management", "score": 75 }
            ],
            "topOpportunities": [""],
            "topRisks": [""],
            "actionPlan90Days": [{ "step": 1, "action": "" }]
        }
        `;

        const userPrompt = isEn 
            ? `Analyze this Operational Elemental Mesh report: ${JSON.stringify(context)}. Return the required tactical JSON in English matching this exact template:\n${jsonTemplate}`
            : `Analiza este reporte de Malla Elemental Operativa: ${JSON.stringify(context)}. Devuelve el JSON táctico requerido en español coincidiendo exactamente con este template:\n${jsonTemplate}`;

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
        return {
            executiveSummary: { type: "Fallback", potential: "Unknown", risk: "Unknown", coreMemory: "N/A" },
            modules: [],
            scenarios: [],
            contextCompatibility: [],
            topOpportunities: [],
            topRisks: [],
            actionPlan90Days: []
        };
    }
}
