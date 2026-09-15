import { ChineseAstrology } from './chineseAstrology';

describe('ChineseAstrology Determinism', () => {
    it('returns exact same animal and element for identical input', () => {
        const result1 = ChineseAstrology.calculate('1990-05-15T00:00:00Z');
        const result2 = ChineseAstrology.calculate('1990-05-15T00:00:00Z');
        
        expect(result1).toEqual(result2);
    });

    it('respects Feb 4 Li Chun boundary', () => {
        // Feb 3 should be previous year's animal
        const feb3 = ChineseAstrology.calculate('1990-02-03T00:00:00Z');
        const feb5 = ChineseAstrology.calculate('1990-02-05T00:00:00Z');
        
        expect(feb3.birthYear).toBe(1989);
        expect(feb5.birthYear).toBe(1990);
    });
});
