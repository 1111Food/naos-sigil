import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyContextLayerA, DailySignal } from './types';
import { DailyInterpretation, SupportedInterpretationBlock } from './interpretationTypes';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy');

export class DailyInterpreter {
    static async interpret(layerA: DailyContextLayerA): Promise<DailyInterpretation> {
        if (!process.env.GEMINI_API_KEY) return this.getFallback(layerA);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        let attempts = 0;
        let lastError = '';

        while (attempts < 2) {
            attempts++;
            const prompt = this.buildPrompt(layerA, lastError);

            try {
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt.user }] }],
                    systemInstruction: { role: 'system', parts: [{ text: prompt.system }] },
                    generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
                });

                const textResponse = result.response.text();
                let parsed: any;
                try {
                    parsed = JSON.parse(textResponse);
                } catch (e) {
                    lastError = "Invalid JSON returned.";
                    continue; // Retry
                }

                // VALIDATION
                const validationError = this.validateOutput(parsed, layerA);
                if (validationError) {
                    lastError = `Validation failed: ${validationError}`;
                    continue; // Retry
                }

                parsed.interpretationStatus = 'ready';
                return parsed as DailyInterpretation;

            } catch (e: any) {
                console.error(`Gemini interpretation attempt ${attempts} failed:`, e);
                lastError = e.message;
            }
        }

        console.warn(`[DailyInterpreter] Exhausted retries. Returning fallback.`);
        return this.getFallback(layerA);
    }

    private static validateOutput(parsed: any, layerA: DailyContextLayerA): string | null {
        const validIdsMap = new Map(layerA.provenance.map(p => [p.id, p]));

        const checkBlock = (block: any, expectedSystem?: string): string | null => {
            if (!block || !Array.isArray(block.signalIds)) return "Missing or invalid signalIds array.";
            if (block.signalIds.length === 0 && expectedSystem) return `Block requires at least 1 signalId.`;
            
            for (const id of block.signalIds) {
                const signal = validIdsMap.get(id);
                if (!signal) return `Hallucinated signal ID: ${id}`;
                if (expectedSystem && signal.system !== expectedSystem) return `Signal ${id} does not belong to system ${expectedSystem}`;
            }
            return null;
        };

        let err = checkBlock(parsed.primarySignal);
        if (err) return `primarySignal: ${err}`;
        if (parsed.primarySignal.signalIds.length === 0) return "primarySignal must have at least 1 signalId.";

        err = checkBlock(parsed.systems?.astrology, 'astrology');
        if (err) return `astrology: ${err}`;
        
        err = checkBlock(parsed.systems?.numerology, 'numerology');
        if (err) return `numerology: ${err}`;

        err = checkBlock(parsed.systems?.maya, 'maya');
        if (err) return `maya: ${err}`;

        err = checkBlock(parsed.systems?.chinese, 'chinese');
        if (err) return `chinese: ${err}`;

        const pattern = parsed.integratedPattern;
        if (!pattern || typeof pattern.convergence !== 'boolean') return "integratedPattern missing convergence boolean.";
        err = checkBlock(pattern);
        if (err) return `integratedPattern: ${err}`;
        
        if (pattern.convergence) {
            if (pattern.signalIds.length < 2) {
                return "integratedPattern with convergence=true must have at least 2 signalIds.";
            }
            // Check that they belong to at least 2 different systems
            const systemsFound = new Set<string>();
            for (const id of pattern.signalIds) {
                const signal = validIdsMap.get(id);
                if (signal) systemsFound.add(signal.system);
            }
            if (systemsFound.size < 2) {
                return "integratedPattern with convergence=true must reference signals from at least 2 DISTINCT systems.";
            }
        }

        return null;
    }

    private static buildPrompt(layerA: DailyContextLayerA, lastError: string) {
        const system = `
You are NAOS, an existential bio-hacking consultant and esoteric synthesizer.
Your task is to INTERPRET the provided factual Daily Context (Layer A) into a strict JSON.

CRITICAL TRACEABILITY RULES:
1. ONLY use supplied signals from Layer A. NEVER invent astrological events, numbers, or Nahuales.
2. If Layer A does not contain a specific transit, DO NOT mention it.
3. GRANULARITY: Astrology (daily), Numerology (day/month/year), Maya (daily), Chinese (ANNUAL ONLY).
4. Do NOT duplicate factual claims in the JSON (e.g. don't add "planet": "Venus"). Output only text and signalIds.
5. EVERY interpretation block must provide an array of 'signalIds' that EXACTLY match the IDs provided in Layer A's provenance.
6. SYSTEM-SCOPED REFERENCES: 'systems.astrology.signalIds' can ONLY contain astrology IDs. Same for numerology, maya, and chinese.
7. PRIMARY SIGNAL must have >= 1 signalId.
8. INTEGRATED PATTERN: Set 'convergence': true ONLY if there is strong thematic convergence between at least 2 signals. If no convergence, set false and describe the tension.
9. Language: Write all textual interpretations in ${layerA.language === 'en' ? 'English' : 'Spanish'}.

Output Schema:
{
  "interpretationVersion": "v1",
  "localDate": "${layerA.localDate}",
  "language": "${layerA.language}",
  "primarySignal": { "title": "...", "text": "...", "signalIds": ["id1"] },
  "integratedPattern": { "convergence": true, "text": "...", "signalIds": ["id1", "id2"] },
  "systems": {
    "astrology": { "text": "...", "signalIds": ["astro_id"] },
    "numerology": { "text": "...", "signalIds": ["num_id"] },
    "maya": { "text": "...", "signalIds": ["maya_id"] },
    "chinese": { "text": "...", "signalIds": ["chinese_id"] }
  },
  "personalResonance": "...",
  "guidance": "...",
  "reflectionQuestion": "..."
}
`;
        let user = JSON.stringify(layerA, null, 2);
        if (lastError) {
            user += `\n\nLAST ATTEMPT FAILED WITH ERROR: ${lastError}\nPLEASE FIX THE JSON TO STRICTLY OBEY SIGNAL ID RULES.`;
        }
        return { system, user };
    }

    private static getFallback(layerA: DailyContextLayerA): DailyInterpretation {
        const lang = layerA.language;
        return {
            interpretationVersion: 'v1',
            localDate: layerA.localDate,
            language: lang,
            interpretationStatus: 'unavailable',
            primarySignal: {
                title: lang === 'en' ? 'Synchronizing Systems' : 'Sincronizando Sistemas',
                text: lang === 'en' ? 'Your cosmic signals have been calculated, but the interpretation engine is currently calibrating.' : 'Tus señales cósmicas han sido calculadas, pero el motor de interpretación está calibrando.',
                signalIds: []
            },
            integratedPattern: { convergence: false, text: '', signalIds: [] },
            systems: { 
                astrology: { text: '', signalIds: [] }, 
                numerology: { text: '', signalIds: [] }, 
                maya: { text: '', signalIds: [] }, 
                chinese: { text: '', signalIds: [] } 
            },
            personalResonance: '',
            guidance: lang === 'en' ? 'Observe your surroundings today.' : 'Observa tu entorno hoy.',
            reflectionQuestion: lang === 'en' ? 'What do you feel in the silence?' : '¿Qué sientes en el silencio?'
        };
    }
}
