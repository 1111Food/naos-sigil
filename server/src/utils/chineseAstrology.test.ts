import { ChineseAstrology } from './chineseAstrology';
import { ChineseMathV1 } from '../modules/chinese/ChineseMathV1';

describe('ChineseMathV1', () => {
    it('returns exact same animal and element for identical input (Determinism)', () => {
        const result1 = ChineseMathV1.calculate('1990-05-15T00:00:00Z');
        const result2 = ChineseMathV1.calculate('1990-05-15T00:00:00Z');
        
        expect(result1).toEqual(result2);
        expect(result1.effectiveChineseCycleYear).toBe(1990);
    });

    it('validates INDEPENDENT_CHINESE_YEAR_FIXTURES (2023 Water Rabbit, 2024 Wood Dragon)', () => {
        // Safe dates in the middle of the year
        const r2023 = ChineseMathV1.calculate('2023-06-01T00:00:00Z');
        expect(r2023.animal).toBe('Conejo');
        expect(r2023.element).toBe('Agua'); // Water Rabbit

        const r2024 = ChineseMathV1.calculate('2024-06-01T00:00:00Z');
        expect(r2024.animal).toBe('Dragón');
        expect(r2024.element).toBe('Madera'); // Wood Dragon
    });

    it('validates FIXED_FEB4_BOUNDARY_TEST policy (NAOS V1)', () => {
        const feb3 = ChineseMathV1.calculate('2024-02-03T00:00:00Z');
        expect(feb3.effectiveChineseCycleYear).toBe(2023);
        expect(feb3.animal).toBe('Conejo'); // Year of the Rabbit

        const feb4 = ChineseMathV1.calculate('2024-02-04T00:00:00Z');
        expect(feb4.effectiveChineseCycleYear).toBe(2024);
        expect(feb4.animal).toBe('Dragón'); // Year of the Dragon
    });

    it('validates ANIMAL_12_YEAR_RECURRENCE', () => {
        const base = ChineseMathV1.calculate('2000-06-01T00:00:00Z'); // Dragon
        const next = ChineseMathV1.calculate('2012-06-01T00:00:00Z'); // Dragon
        expect(base.animal).toBe('Dragón');
        expect(next.animal).toBe('Dragón');
    });

    it('validates ELEMENT_10_YEAR_RECURRENCE', () => {
        const base = ChineseMathV1.calculate('2000-06-01T00:00:00Z'); // Metal
        const next = ChineseMathV1.calculate('2010-06-01T00:00:00Z'); // Metal
        expect(base.element).toBe('Metal');
        expect(next.element).toBe('Metal');
    });

    it('validates ANIMAL_ELEMENT_60_YEAR_RECURRENCE', () => {
        const base = ChineseMathV1.calculate('1984-06-01T00:00:00Z'); // Wood Rat
        const next = ChineseMathV1.calculate('2044-06-01T00:00:00Z'); // Wood Rat
        expect(base.animal).toBe('Rata');
        expect(base.element).toBe('Madera');
        expect(next.animal).toBe('Rata');
        expect(next.element).toBe('Madera');
    });

    it('is robust for pre-1900 dates', () => {
        const result = ChineseMathV1.calculate('1884-06-01T00:00:00Z'); 
        // 1884 should also be Wood Rat! (1984 - 100 is not 60, wait.)
        // 1924 was Wood Rat. 1864 was Wood Rat.
        // Let's check 1864.
        const r1864 = ChineseMathV1.calculate('1864-06-01T00:00:00Z');
        expect(r1864.animal).toBe('Rata');
        expect(r1864.element).toBe('Madera');
    });
});

describe('ChineseAstrology Facade', () => {
    it('returns exact same animal and element for identical input', () => {
        const result1 = ChineseAstrology.calculate('1990-05-15T00:00:00Z');
        const result2 = ChineseAstrology.calculate('1990-05-15T00:00:00Z');
        
        expect(result1).toEqual(result2);
        expect(result1.description).toBeDefined();
    });

    it('respects Feb 4 Li Chun boundary', () => {
        // Feb 3 should be previous year's animal
        const feb3 = ChineseAstrology.calculate('1990-02-03T00:00:00Z');
        const feb5 = ChineseAstrology.calculate('1990-02-05T00:00:00Z');
        
        expect(feb3.birthYear).toBe(1989);
        expect(feb5.birthYear).toBe(1990);
    });
});
