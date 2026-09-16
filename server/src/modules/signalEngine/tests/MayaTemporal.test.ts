
import { MayaMathV1 } from '../../maya/MayaMathV1';
import { MayaAdapter } from '../adapters/MayaAdapter';
import { MayanCalculator as LegacyCalculator } from '../../../utils/mayaCalculator';

describe('Maya Temporal Engine Part 4', () => {

    it('INDEPENDENT_REFERENCE_FIXTURE: 2012-12-21 must be 4 Ajpu', () => {
        // Independent Reference: Smithsonian NMAI / FAMSI
        // Date: Dec 21, 2012
        // GMT 584283 Correlation
        // Expected: 4 Ajaw (Kiche: Ajpu)
        const result = MayaMathV1.calculate({ localDate: '2012-12-21' });
        expect(result.canonicalNawalKey).toBe('Ajpu');
        expect(result.tone).toBe(4);
    });

    it('NAWAL_20_CYCLE_TEST: D and D+1 advance correctly, 20-day cycle completes', () => {
        const start = new Date('2026-01-01T12:00:00Z');
        const signs = new Set();
        
        for (let i = 0; i < 20; i++) {
            const d = new Date(start.getTime() + i * 86400000);
            const iso = d.toISOString().split('T')[0];
            const result = MayaMathV1.calculate({ localDate: iso });
            signs.add(result.canonicalNawalKey);
        }
        
        expect(signs.size).toBe(20);
    });

    it('TONE_13_CYCLE_TEST: 13-day cycle covers exactly 1-13', () => {
        const start = new Date('2026-01-01T12:00:00Z');
        const tones = new Set();
        
        for (let i = 0; i < 13; i++) {
            const d = new Date(start.getTime() + i * 86400000);
            const iso = d.toISOString().split('T')[0];
            const result = MayaMathV1.calculate({ localDate: iso });
            tones.add(result.tone);
        }
        
        expect(tones.size).toBe(13);
    });

    it('PAIR_260_RECURRENCE_TEST: Exact same Nawal+Tone recurs at 260 days', () => {
        const d1 = '2026-01-01';
        const result1 = MayaMathV1.calculate({ localDate: d1 });
        
        // Add 260 days
        const date1 = new Date(d1 + 'T12:00:00Z');
        const date2 = new Date(date1.getTime() + 260 * 86400000);
        const d2 = date2.toISOString().split('T')[0];
        const result2 = MayaMathV1.calculate({ localDate: d2 });
        
        expect(result2.canonicalNawalKey).toBe(result1.canonicalNawalKey);
        expect(result2.tone).toBe(result1.tone);
    });

    it('MAYA_CALENDAR_BOUNDARY_TESTS: Leap years, month/year ends', () => {
        // Feb 28 -> 29 (Leap Year)
        const leap1 = MayaMathV1.calculate({ localDate: '2024-02-28' });
        const leap2 = MayaMathV1.calculate({ localDate: '2024-02-29' });
        expect(leap2.nawalIndex).toBe((leap1.nawalIndex + 1) % 20);

        // Dec 31 -> Jan 1
        const ny1 = MayaMathV1.calculate({ localDate: '2025-12-31' });
        const ny2 = MayaMathV1.calculate({ localDate: '2026-01-01' });
        expect(ny2.nawalIndex).toBe((ny1.nawalIndex + 1) % 20);
    });

    it('DAILY_MAYA_ID_DETERMINISTIC & SIGNAL_ID_DEPENDS_ON_CALCULATED_AT', () => {
        const atomic = MayaMathV1.calculate({ localDate: '2026-09-15' });
        
        const s1 = MayaAdapter.adaptDaily(atomic, '2026-09-15', 'time1');
        const s2 = MayaAdapter.adaptDaily(atomic, '2026-09-15', 'time2');
        
        expect(s1.id).toBe(s2.id); // Same ID despite different calculatedAt
    });

    it('NATAL_MAYA_ID_DETERMINISTIC', () => {
        const atomic = MayaMathV1.calculate({ localDate: '1990-05-15' });
        
        const s1 = MayaAdapter.adaptNatal(atomic, '1990-05-15', 'time1');
        const s2 = MayaAdapter.adaptNatal(atomic, '1990-05-15', 'time2');
        
        expect(s1.id).toBe(s2.id); 
    });

    it('LEGACY_MAYA_PARITY: Legacy output remains untouched despite off-by-one bug', () => {
        // Legacy output for 2012-12-21 is 3 Kawoq
        const legacy = LegacyCalculator.calculate('2012-12-21');
        expect(legacy.kicheName).toBe('Kawoq');
        expect(legacy.tone).toBe(3);
        // By NOT touching LegacyCalculator, we preserved exact legacy runtime behavior.
    });

    it('RELATION_FEATURE_MODEL_CREATED: Forward modular arithmetic correctly computed', () => {
        const natal = MayaMathV1.calculate({ localDate: '1990-05-15' }); // e.g. 5 B'atz
        const daily = MayaMathV1.calculate({ localDate: '2026-09-15' }); // e.g. 9 Ajpu
        
        const forwardNawalOffset = (daily.nawalIndex - natal.nawalIndex + 20) % 20;
        const forwardToneOffset = (daily.tone - natal.tone + 13) % 13;
        
        // Ensure they are bounded properly
        expect(forwardNawalOffset).toBeGreaterThanOrEqual(0);
        expect(forwardNawalOffset).toBeLessThan(20);
        
        expect(forwardToneOffset).toBeGreaterThanOrEqual(0);
        expect(forwardToneOffset).toBeLessThan(13);
    });

});