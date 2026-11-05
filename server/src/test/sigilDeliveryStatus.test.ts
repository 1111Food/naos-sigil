import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../config/env';
import { supabase } from '../lib/supabase';
import { sendProactiveMessage, sendProactiveVoice } from '../modules/sigil/telegramService';
import { deliveryReceipt, getProactiveDeliveryStatus } from '../modules/sigil/deliveryStatus';

describe('Sigil proactive delivery receipts', () => {
    it('reports delivery only when a linked recipient was actually sent to', () => {
        expect(getProactiveDeliveryStatus(true, true)).toBe('sent');
        expect(getProactiveDeliveryStatus(true, false)).toBe('failed');
        expect(getProactiveDeliveryStatus(false, false)).toBe('unlinked');
        expect(getProactiveDeliveryStatus(false, true)).toBe('unlinked');
    });

    it('returns a non-error receipt only for confirmed Telegram sends', () => {
        expect(deliveryReceipt('sent')).toEqual({
            content: [{ type: 'text', text: 'TELEGRAM_DELIVERY_SENT' }],
            isError: false
        });
        for (const status of ['failed', 'unlinked'] as const) {
            expect(deliveryReceipt(status).isError).toBe(true);
            expect(deliveryReceipt(status).content[0].text).not.toContain('recipient');
        }
    });
});

describe('Telegram outbound suppression contract', () => {
    const initialFlags = {
        TELEGRAM_RUNTIME_ENABLED: config.TELEGRAM_RUNTIME_ENABLED,
        TELEGRAM_TEST_MODE: config.TELEGRAM_TEST_MODE
    };

    beforeEach(() => {
        config.TELEGRAM_RUNTIME_ENABLED = false;
        config.TELEGRAM_TEST_MODE = false;
    });

    afterEach(() => {
        config.TELEGRAM_RUNTIME_ENABLED = initialFlags.TELEGRAM_RUNTIME_ENABLED;
        config.TELEGRAM_TEST_MODE = initialFlags.TELEGRAM_TEST_MODE;
        vi.restoreAllMocks();
    });

    it('reports outbound text as NOT delivered when runtime is disabled', async () => {
        const spy = vi.spyOn(supabase, 'from');
        expect(await sendProactiveMessage('unlinked-test-chat', 'mock message')).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('reports outbound voice as NOT delivered when runtime is disabled', async () => {
        const spy = vi.spyOn(supabase, 'from');
        expect(await sendProactiveVoice('unlinked-test-chat', Buffer.from('fake-audio'))).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('reports outbound text as NOT delivered when test recipient does not match', async () => {
        config.TELEGRAM_TEST_MODE = true;
        const spy = vi.spyOn(supabase, 'from').mockReturnValue({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: { telegram_chat_id: 'permitted-chat' }, error: null })
                })
            })
        } as any);
        expect(await sendProactiveMessage('other-chat', 'mock message')).toBe(false);
        expect(spy).toHaveBeenCalledWith('profiles');
    });

    it('reports outbound voice as NOT delivered when test recipient does not match', async () => {
        config.TELEGRAM_TEST_MODE = true;
        const spy = vi.spyOn(supabase, 'from').mockReturnValue({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: { telegram_chat_id: 'permitted-chat' }, error: null })
                })
            })
        } as any);
        expect(await sendProactiveVoice('other-chat', Buffer.from('fake-audio'))).toBe(false);
        expect(spy).toHaveBeenCalledWith('profiles');
    });
});
