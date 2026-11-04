/** Narrow REST adapter for proactive Sigil messages (no direct Telegram or database writes). */
export interface GeminiNudgeOptions {
    apiKey: string;
    model: string;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
}

export class GeminiNudgeError extends Error {
    constructor(public readonly code: string) {
        super(code);
        this.name = 'GeminiNudgeError';
    }
}

export async function generateProactiveNudge(
    systemPrompt: string,
    { apiKey, model, fetchImpl = fetch, timeoutMs = 20_000 }: GeminiNudgeOptions
): Promise<string> {
    if (!apiKey) throw new GeminiNudgeError('GEMINI_NUDGE_MISSING_KEY');
    if (!model || !/^[A-Za-z0-9._-]+$/.test(model)) {
        throw new GeminiNudgeError('GEMINI_NUDGE_INVALID_MODEL');
    }
    if (!systemPrompt.trim()) throw new GeminiNudgeError('GEMINI_NUDGE_EMPTY_PROMPT');

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetchImpl(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: 'Genera el recordatorio asíncrono respetando mi arquitectura.' }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
            }),
            signal: controller.signal,
        });

        // Never surface response bodies: Google error payloads can contain sensitive request details.
        if (!response.ok) throw new GeminiNudgeError('GEMINI_NUDGE_HTTP_' + response.status);

        let data: any;
        try {
            data = await response.json();
        } catch {
            throw new GeminiNudgeError('GEMINI_NUDGE_INVALID_JSON');
        }
        const parts: unknown = data?.candidates?.[0]?.content?.parts;
        const text = Array.isArray(parts)
            ? parts.filter(p => !p?.thought && typeof p?.text === 'string').map(p => p.text).join('').trim()
            : '';
        if (!text) throw new GeminiNudgeError('GEMINI_NUDGE_EMPTY_RESPONSE');
        return text;
    } catch (error) {
        if (error instanceof GeminiNudgeError) throw error;
        if (controller.signal.aborted) throw new GeminiNudgeError('GEMINI_NUDGE_TIMEOUT');
        throw new GeminiNudgeError('GEMINI_NUDGE_NETWORK_ERROR');
    } finally {
        clearTimeout(timeout);
    }
}
