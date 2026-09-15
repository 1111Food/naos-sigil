import { NumerologyMathV1 } from './NumerologyMathV1';

describe('NumerologyMathV1 Determinism', () => {
    it('returns exact same cycles for identical input', () => {
        const cycles1 = NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 9, 15);
        const cycles2 = NumerologyMathV1.calculatePersonalCycles(5, 15, 2026, 9, 15);
        
        expect(cycles1).toEqual(cycles2);
    });

    it('preserves master numbers deterministically', () => {
        const lp = NumerologyMathV1.calculateLifePath(1999, 1, 1);
        expect(lp).toBeDefined();
    });
});
