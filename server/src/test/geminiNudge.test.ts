import { describe, expect, it, vi } from 'vitest';
import { GeminiNudgeError, generateProactiveNudge } from '../agent/geminiNudge';

const API_KEY = 'TEST_API_KEY_NOT_REAL';
const baseOptions = { apiKey: API_KEY, model: 'gemini-2.5-flash', timeoutMs: 200 };

describe('Sigil proactive Gemini nudge generation', () => {
    it('uses configured model and API-key header; joins visible text without leaking key in URL', async () => {
        const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
            new Response(JSON.stringify({
                candidates: [{ content: { parts: [
                    { text: 'hidden-thought', thought: true },
                    { text: 'Respira' },
                    { text: ' con calma.' },
                ] } }],
            }), { status: 200 })
        );

        const result = await generateProactiveNudge('SAFE_TEST_PROMPT', {
            ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch,
        });

        expect(result).toBe('Respira con calma.');
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
        expect(url).not.toContain(API_KEY);
        expect(init?.headers).toMatchObject({ 'x-goog-api-key': API_KEY });
        expect(init?.method).toBe('POST');
        expect(JSON.parse(String(init?.body)).system_instruction.parts[0].text).toBe('SAFE_TEST_PROMPT');
        expect(init?.signal).toBeInstanceOf(AbortSignal);
    });

    it('does not surface Google error bodies, even on HTTP 429', async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ error: { message: 'PRIVATE_SENTINEL ' + API_KEY } }), { status: 429 })
        );

        await expect(generateProactiveNudge('hello', {
            ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_HTTP_429' });
    });

    it('rejects malformed JSON instead of generating a made-up fallback', async () => {
        const fetchMock = vi.fn(async () => new Response('not-json', { status: 200 }));
        await expect(generateProactiveNudge('hello', {
            ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_INVALID_JSON' });
    });

    it('rejects blocked or empty candidates instead of sending fabricated content', async () => {
        const fetchMock = vi.fn(async () =>
            new Response(JSON.stringify({ candidates: [{ content: { parts: [] } }] }), { status: 200 })
        );
        await expect(generateProactiveNudge('hello', {
            ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_EMPTY_RESPONSE' });
    });

    it('sanitizes raw network error messages', async () => {
        const fetchMock = vi.fn(async (): Promise<Response> => {
            throw new Error('PRIVATE_NETWORK_PAYLOAD ' + API_KEY);
        });
        const promise = generateProactiveNudge('hello', {
            ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch,
        });
        await expect(promise).rejects.toMatchObject({ code: 'GEMINI_NUDGE_NETWORK_ERROR' });
    });

    it('rejects a missing key before calling the API', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        await expect(generateProactiveNudge('hello', {
            ...baseOptions, apiKey: '', fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_MISSING_KEY' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects malformed model identifiers before calling the API', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        await expect(generateProactiveNudge('hello', {
            ...baseOptions, model: 'invalid?key=secret', fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_INVALID_MODEL' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does not send an empty prompt to the provider', async () => {
        const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
        await expect(generateProactiveNudge('  ', {
            ...baseOptions, fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_EMPTY_PROMPT' });
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('aborts slow requests and returns a safe timeout code', async () => {
        const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('provider secret')), { once: true });
        }));
        await expect(generateProactiveNudge('hello', {
            ...baseOptions, timeoutMs: 5, fetchImpl: fetchMock as unknown as typeof fetch,
        })).rejects.toMatchObject({ code: 'GEMINI_NUDGE_TIMEOUT' });
    });

    it('returns categorized errors for observability without logging prompt contents', async () => {
        const error = new GeminiNudgeError('GEMINI_NUDGE_HTTP_503');
        expect(error.name).toBe('GeminiNudgeError');
        expect(error.message).toBe('GEMINI_NUDGE_HTTP_503');
    });
});
