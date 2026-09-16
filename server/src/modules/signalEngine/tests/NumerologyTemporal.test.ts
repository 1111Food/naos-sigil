import { NumerologyAdapter } from '../adapters/NumerologyAdapter';
import { NumerologyMathV1 } from '../../numerology/NumerologyMathV1';
import { DateUtils } from '../../../utils/DateUtils';

describe('Numerology Temporal Engine', () => {
    const calculatedAt = '2026-09-15T12:00:00.000Z';
    const birthDay = 15;
    const birthMonth = 5;

    it('Personal Year/Month/Day repeatability & determinism', () => {
        const localDate = '2026-09-15';
        const p1 = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, 2026, 9, 15);
        const p2 = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, 2026, 9, 15);
        expect(p1).toEqual(p2);
        
        const u1 = NumerologyMathV1.calculateUniversalCycles(2026, 9, 15);
        const u2 = NumerologyMathV1.calculateUniversalCycles(2026, 9, 15);
        expect(u1).toEqual(u2);
    });

    it('Dec 31 -> Jan 1 boundary', () => {
        const dec31 = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, 2026, 12, 31);
        const jan1 = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, 2027, 1, 1);
        
        expect(dec31.personalYear).not.toBe(jan1.personalYear);
        expect(dec31.personalMonth).not.toBe(jan1.personalMonth);
    });

    it('Feb 28 vs Feb 29 boundary (Leap year)', () => {
        // 2024 is leap year
        const feb28 = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, 2024, 2, 28);
        const feb29 = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, 2024, 2, 29);
        
        // Month and year stay same, day differs.
        expect(feb28.personalYear).toBe(feb29.personalYear);
        expect(feb28.personalMonth).toBe(feb29.personalMonth);
        expect(feb28.personalDay).not.toBe(feb29.personalDay);
    });

    it('Master number preservation examples', () => {
        // Find a day that reduces to 11.
        const p11 = { personalYear: 11, personalMonth: 22, personalDay: 33 };
        const u11 = { universalYear: 11, universalMonth: 22, universalDay: 33 };
        const inputs = { localDate: '2026-09-15', birthDay, birthMonth };
        
        const signals = NumerologyAdapter.adaptTemporalCycles(p11, u11, inputs, calculatedAt);
        const masters = signals.filter(s => s.payload.isMasterNumber);
        expect(masters.length).toBe(6);
    });

    it('Ordinary number reduction examples', () => {
        const p = { personalYear: 7, personalMonth: 8, personalDay: 9 };
        const u = { universalYear: 1, universalMonth: 2, universalDay: 3 };
        const inputs = { localDate: '2026-09-15', birthDay, birthMonth };
        
        const signals = NumerologyAdapter.adaptTemporalCycles(p, u, inputs, calculatedAt);
        const masters = signals.filter(s => s.payload.isMasterNumber);
        expect(masters.length).toBe(0);
    });

    it('USER_LOCAL_DATE authority test (Timezone shift)', () => {
        // UTC is Sept 16, 01:00 AM.
        // User in Guatemala (-6) is Sept 15, 19:00.
        const utcDate = new Date('2026-09-16T01:00:00Z');
        const tzOffsetHours = -6; // Guatemala is UTC-6
        
        const localDateStr = DateUtils.getUserLocalDate(tzOffsetHours, utcDate);
        expect(localDateStr).toBe('2026-09-15');
        
        // This confirms that if the adapter uses localDateStr, it uses Sept 15.
        const [yearStr, monthStr, dayStr] = localDateStr.split('-');
        const currentYear = parseInt(yearStr);
        const currentMonth = parseInt(monthStr);
        const currentDay = parseInt(dayStr);
        
        const u = NumerologyMathV1.calculateUniversalCycles(currentYear, currentMonth, currentDay);
        // Ensure it calculated for 15, not 16
        const u16 = NumerologyMathV1.calculateUniversalCycles(2026, 9, 16);
        expect(u.universalDay).not.toBe(u16.universalDay);
    });

    it('SAME_LOCAL_DATE_DIFFERENT_UTC = SAME_DAILY_NUMEROLOGY', () => {
        // Two different UTC instants that map to the exact same local date
        // Instant 1: 01:00 AM UTC (In UTC-6 this is 19:00 previous day)
        // Instant 2: 05:00 AM UTC (In UTC-6 this is 23:00 previous day)
        const t1 = new Date('2026-09-16T01:00:00Z');
        const t2 = new Date('2026-09-16T05:00:00Z');
        const local1 = DateUtils.getUserLocalDate(-6, t1);
        const local2 = DateUtils.getUserLocalDate(-6, t2);
        
        expect(local1).toBe(local2);
        
        const p1 = NumerologyAdapter.adaptTemporalCycles(
            NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 9, 15),
            NumerologyMathV1.calculateUniversalCycles(2026, 9, 15),
            { localDate: local1, birthDay: 15, birthMonth: 5 },
            calculatedAt
        );
        const p2 = NumerologyAdapter.adaptTemporalCycles(
            NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 9, 15),
            NumerologyMathV1.calculateUniversalCycles(2026, 9, 15),
            { localDate: local2, birthDay: 15, birthMonth: 5 },
            calculatedAt
        );
        expect(p1).toEqual(p2);
    });

    it('LOCAL_MIDNIGHT_ROLLOVER & TIMEZONE_EXTREME_TESTS', () => {
        // Tokyo (UTC+9) vs Guatemala (UTC-6)
        // Instant: 2026-09-15 22:00:00 UTC
        // Tokyo local: 2026-09-16 07:00:00 (Next day)
        // Guate local: 2026-09-15 16:00:00 (Same day)
        const instant = new Date('2026-09-15T22:00:00Z');
        const tokyoLocal = DateUtils.getUserLocalDate(9, instant);
        const guateLocal = DateUtils.getUserLocalDate(-6, instant);
        
        expect(tokyoLocal).toBe('2026-09-16');
        expect(guateLocal).toBe('2026-09-15');
        expect(tokyoLocal).not.toBe(guateLocal);
    });

    it('PERIOD_IDENTITY: Annual and Monthly signal IDs remain stable across the period', () => {
        const p1 = NumerologyAdapter.adaptTemporalCycles(
            NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 9, 15),
            NumerologyMathV1.calculateUniversalCycles(2026, 9, 15),
            { localDate: '2026-09-15', birthDay: 15, birthMonth: 5 },
            calculatedAt
        );

        const p2 = NumerologyAdapter.adaptTemporalCycles(
            NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 9, 16), // Next day
            NumerologyMathV1.calculateUniversalCycles(2026, 9, 16),
            { localDate: '2026-09-16', birthDay: 15, birthMonth: 5 },
            calculatedAt
        );

        const p3 = NumerologyAdapter.adaptTemporalCycles(
            NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 10, 1), // Next month
            NumerologyMathV1.calculateUniversalCycles(2026, 10, 1),
            { localDate: '2026-10-01', birthDay: 15, birthMonth: 5 },
            calculatedAt
        );

        const year1 = p1.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'ANNUAL')!;
        const year2 = p2.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'ANNUAL')!;
        const year3 = p3.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'ANNUAL')!;

        // Annual ID should remain exactly the same throughout the whole year
        expect(year1.id).toBe(year2.id);
        expect(year1.id).toBe(year3.id);

        const month1 = p1.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'MONTHLY')!;
        const month2 = p2.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'MONTHLY')!;
        const month3 = p3.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'MONTHLY')!;

        // Monthly ID should remain the same for days in same month
        expect(month1.id).toBe(month2.id);
        // But change when month changes
        expect(month1.id).not.toBe(month3.id);
        
        // Day ID should change every day
        const day1 = p1.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'DAILY')!;
        const day2 = p2.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'DAILY')!;
        expect(day1.id).not.toBe(day2.id);
    });
});
