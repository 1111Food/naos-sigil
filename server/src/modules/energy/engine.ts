import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const modelName = "gemini-2.5-flash";

interface EnergyPayload {
    profile: any;
    currentDate: string;
    lang: string;
}

export const EnergyEngine = {
    async generate(payload: EnergyPayload): Promise<any> {
        if (!apiKey) throw new Error("Gemini API key is missing");

        const prompt = `
        You are the NAOS Quantum AI, analyzing the current energy (Micro Evolution Axis).
        Language: ${payload.lang}
        
        Profile data:
        - Name: ${payload.profile.first_name}
        - Date of Birth: ${payload.profile.date_of_birth}
        - Time of Birth: ${payload.profile.time_of_birth}
        
        Today's Date: ${payload.currentDate}

        Based on Astrological daily transits, Numerology personal day/week, and Chinese daily energy for the user's chart, provide a deeply insightful daily and weekly energy map.
        
        Must return ONLY a JSON object (no markdown) with this structure:
        {
            "daily": {
                "score": number, // 0 to 100 overall alignment/energy score today
                "title": "Short title of the day's vibe (e.g., Focus & Execution)",
                "description": "2-3 sentences explaining the primary energy of the day.",
                "action": "A specific action or habit to perform today",
                "avoid": "What to avoid today"
            },
            "weekly": {
                "theme": "The core theme of the current week",
                "description": "Paragraph explaining the week's transits and how to navigate them."
            },
            "metrics": {
                "focus": number, // 0-100
                "creativity": number, // 0-100
                "relationships": number // 0-100
            }
        }
        `;

        const maxAttempts = 3;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            try {
                attempt++;
                const activeModel = attempt > 1 ? "gemini-1.5-flash" : modelName;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            responseMimeType: "application/json"
                        }
                    }),
                    signal: controller.signal
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error(`Energy API Error on attempt ${attempt}:`, errorData);
                    
                    if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
                        console.log(`⚠️ Gemini API Limit/Overload (${response.status}). Retrying with fallback model in ${attempt * 1.5}s...`);
                        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
                        continue;
                    }
                    throw new Error("Error en la red estelar al calcular la energía actual.");
                }

                const data = await response.json();
                const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!textResponse) throw new Error("El Oráculo no devolvió la energía actual.");

                try {
                    let cleanText = textResponse.trim();
                    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
                    if (cleanText.startsWith('```')) cleanText = cleanText.substring(3);
                    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);

                    const jsonResult = JSON.parse(cleanText);
                    clearTimeout(timeoutId);
                    return jsonResult;
                } catch (parseError) {
                    console.error("Failed to parse Energy JSON:", textResponse);
                    throw new Error("La energía se generó con una estructura inestable.");
                }
            } catch (e: any) {
                if (attempt >= maxAttempts || e.name === 'AbortError') {
                    throw e;
                }
            }
        }
    }
}
