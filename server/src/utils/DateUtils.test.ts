import { DateUtils } from './DateUtils';

describe('DateUtils', () => {
    it('returns the correct local date when UTC is already tomorrow (UTC-8)', () => {
        // e.g. UTC is 2026-09-13T01:00:00.000Z (September 13, 1 AM)
        const now = new Date('2026-09-13T01:00:00.000Z');
        const offset = -8; // User is in PST, so it's 2026-09-12 17:00 local
        
        const localDate = DateUtils.getUserLocalDate(offset, now);
        expect(localDate).toBe('2026-09-12'); // Must remain on the 12th
    });

    it('returns the correct local date when local is already tomorrow (UTC+9)', () => {
        // e.g. UTC is 2026-09-12T23:00:00.000Z (September 12, 11 PM)
        const now = new Date('2026-09-12T23:00:00.000Z');
        const offset = +9; // User is in JST, so it's 2026-09-13 08:00 local
        
        const localDate = DateUtils.getUserLocalDate(offset, now);
        expect(localDate).toBe('2026-09-13'); // Must advance to 13th
    });

    it('handles offset 0 correctly', () => {
        const now = new Date('2026-09-12T12:00:00.000Z');
        const localDate = DateUtils.getUserLocalDate(0, now);
        expect(localDate).toBe('2026-09-12');
    });
});
