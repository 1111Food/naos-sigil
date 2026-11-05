import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationEngine } from '../modules/notifications/NotificationEngine';
import { TTSService, isSafeVoiceCacheUserId } from '../modules/sigil/ttsService';
import { sendProactiveMessage, sendProactiveVoice } from '../modules/sigil/telegramService';
import { config } from '../config/env';

vi.mock('../modules/sigil/telegramService', () => ({
    sendProactiveMessage: vi.fn(async () => true),
    sendProactiveVoice: vi.fn(async () => true),
}));

type SendFullMessage = (
    userId: string,
    chatId: string,
    text: string,
    tts: TTSService,
    useVoice: boolean,
    region?: string
) => Promise<boolean>;

const sendFullMessage = (NotificationEngine as unknown as {
    sendFullMessage: SendFullMessage
}).sendFullMessage.bind(NotificationEngine);

describe('Scheduled Sigil notifications voice contract', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('synthesizes the full user message, not the region code, and sends audio to the right chat', async () => {
        const buffer = Buffer.from('synthetic voice bytes');
        const generateVoice = vi.fn().mockResolvedValue({ buffer, hash: 'synthetic-hash' });
        const message = 'Esta es tu lectura personalizada del día';
        const result = await sendFullMessage(
            'recipient-uuid', 'recipient-chat', message,
            { generateVoice } as unknown as TTSService, true, 'latam'
        );
        expect(result).toBe(true);
        expect(generateVoice).toHaveBeenCalledExactlyOnceWith('recipient-uuid', message, 'latam');
        expect(sendProactiveVoice).toHaveBeenCalledExactlyOnceWith('recipient-chat', buffer, message);
        expect(sendProactiveMessage).not.toHaveBeenCalled();
    });

    it('falls back to the original text when the voice provider is unavailable', async () => {
        const generateVoice = vi.fn().mockResolvedValue({ buffer: null, hash: 'unused' });
        const text = 'Tu recordatorio verdadero';
        await sendFullMessage('recipient-uuid', 'recipient-chat', text,
            { generateVoice } as unknown as TTSService, true, 'global');
        expect(generateVoice).toHaveBeenCalledExactlyOnceWith('recipient-uuid', text, 'global');
        expect(sendProactiveMessage).toHaveBeenCalledExactlyOnceWith('recipient-chat', text);
        expect(sendProactiveVoice).not.toHaveBeenCalled();
    });

    it('never invokes synthesis when the user prefers text-only notifications', async () => {
        const generateVoice = vi.fn();
        const text = 'Solo texto';
        await sendFullMessage('recipient-uuid', 'recipient-chat', text,
            { generateVoice } as unknown as TTSService, false, 'latam');
        expect(generateVoice).not.toHaveBeenCalled();
        expect(sendProactiveMessage).toHaveBeenCalledExactlyOnceWith('recipient-chat', text);
    });
});

describe('ElevenLabs cache isolation and privacy', () => {
    const originalKey = config.ELEVENLABS_API_KEY;

    afterEach(() => {
        config.ELEVENLABS_API_KEY = originalKey;
        vi.restoreAllMocks();
    });

    it('accepts opaque user IDs and rejects path separators and message-like names', () => {
        expect(isSafeVoiceCacheUserId('fd03cb0d-35a8-4f61-810b-2f0ff185a05d')).toBe(true);
        expect(isSafeVoiceCacheUserId('user_2026')).toBe(true);
        for (const invalid of ['', '..', '../another-user', '..\\another-user', 'user/id', '/tmp/tts', 'a text with spaces', 'x'.repeat(129)]) {
            expect(isSafeVoiceCacheUserId(invalid)).toBe(false);
        }
    });

    it('rejects an invalid cache owner before calling ElevenLabs', async () => {
        config.ELEVENLABS_API_KEY = 'TEST_KEY_NOT_REAL';
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
            throw new Error('fetch must not occur');
        });
        const tts = new TTSService();
        const result = await tts.generateVoice('../unsafe', 'private user message', 'latam');
        expect(result).toMatchObject({ buffer: null, error: 'INVALID_USER_CACHE_ID' });
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(tts.getAudioPath('../unsafe', 'a'.repeat(32))).toBeNull();
    });

    it('never surfaces provider response bodies in errors or logs', async () => {
        config.ELEVENLABS_API_KEY = 'TEST_KEY_NOT_REAL';
        const privateText = 'PRIVATE_SENTINEL_VOICE_TEXT';
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
            new Response('PRIVATE_PROVIDER_BODY with secret', { status: 401 })
        );
        const logSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const tts = new TTSService();
        const result = await tts.generateVoice('test-voice-user', privateText, 'global');
        expect(result.error).toBe('TTS_PROVIDER_HTTP_401');
        expect(result.buffer).toBeNull();
        expect(fetchSpy).toHaveBeenCalledTimes(2);
        const logs = logSpy.mock.calls.flat().map(String).join(' ');
        expect(logs).not.toContain(privateText);
        expect(logs).not.toContain('PRIVATE_PROVIDER_BODY');
        expect(logs).not.toContain('TEST_KEY_NOT_REAL');
    });
});
