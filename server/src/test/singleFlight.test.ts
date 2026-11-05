import { describe, expect, it, vi } from 'vitest';
import { createSingleFlight } from '../agent/singleFlight';

describe('Sigil scheduler single-flight guard', () => {
    it('runs the first cycle and skips an overlapping tick', async () => {
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        const work = vi.fn(async () => { await gate; });
        const tick = createSingleFlight(work);

        const first = tick();
        expect(await tick()).toBe(false);
        expect(await tick()).toBe(false);
        expect(work).toHaveBeenCalledTimes(1);

        release();
        expect(await first).toBe(true);
        expect(await tick()).toBe(true);
        expect(work).toHaveBeenCalledTimes(2);
    });

    it('releases the guard even when a cycle rejects', async () => {
        const work = vi.fn()
            .mockRejectedValueOnce(new Error('private test failure'))
            .mockResolvedValue(undefined);
        const tick = createSingleFlight(work);
        await expect(tick()).rejects.toThrow('private test failure');
        expect(await tick()).toBe(true);
        expect(work).toHaveBeenCalledTimes(2);
    });

    it('does not serialize independent scheduler instances', async () => {
        const a = vi.fn(async () => {});
        const b = vi.fn(async () => {});
        const [one, two] = [createSingleFlight(a), createSingleFlight(b)];
        expect(await Promise.all([one(), two()])).toEqual([true, true]);
        expect(a).toHaveBeenCalledTimes(1);
        expect(b).toHaveBeenCalledTimes(1);
    });

    it('skips concurrent attempts without queueing them for later', async () => {
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        const work = vi.fn(async () => gate);
        const tick = createSingleFlight(work);
        const first = tick();
        const skipped = await Promise.all(Array.from({ length: 20 }, () => tick()));
        expect(skipped.every(result => result === false)).toBe(true);
        release();
        await first;
        expect(work).toHaveBeenCalledTimes(1);
    });

    it('returns success on a resolved cycle', async () => {
        const tick = createSingleFlight(async () => {});
        expect(await tick()).toBe(true);
    });
});
