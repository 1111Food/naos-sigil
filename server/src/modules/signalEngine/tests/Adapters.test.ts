import { AstrologyAdapter } from '../adapters/AstrologyAdapter';
import { NumerologyAdapter } from '../adapters/NumerologyAdapter';
import { MayaAdapter } from '../adapters/MayaAdapter';
import { ChineseAdapter } from '../adapters/ChineseAdapter';
import { AspectResult } from '../../astrology/TransitEngine';
import { MayanCalculator } from '../../../utils/mayaCalculator';

describe('Signal Engine Adapters Determinism', () => {
    const calculatedAt = '2026-09-15T12:00:00.000Z';
    const localDate = '2026-09-15';

    it('AstrologyAdapter is deterministic', () => {
        const aspects: AspectResult[] = [{
            transitPlanet: 'Mars',
            natalTarget: 'Venus',
            aspectType: 'Square',
            exactAngle: 90,
            actualSeparation: 91.5,
            orb: 1.5,
            isPriority: true
        }];

        const signals1 = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        const signals2 = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);

        expect(signals1).toEqual(signals2);
        expect(signals1[0].direction).toBe('CHALLENGING');
        expect(signals1[0].intensity).toBe(0.5); // 1.0 - (1.5 / 3.0) = 0.5
        expect(signals1[0].provenance.methodologyId).toBeDefined();
    });

    it('NumerologyAdapter is deterministic', () => {
        const cycles = { personalYear: 7, personalMonth: 9, personalDay: 11 };
        const signals1 = NumerologyAdapter.adaptDailyCycles(cycles, localDate, calculatedAt);
        const signals2 = NumerologyAdapter.adaptDailyCycles(cycles, localDate, calculatedAt);

        expect(signals1).toEqual(signals2);
        
        const daySignal = signals1.find(s => s.temporalScope === 'DAILY');
        expect(daySignal?.payload.isMasterNumber).toBe(true);
        expect(daySignal?.payload.value).toBe(11);
    });

    it('MayaAdapter is deterministic and covers Maya calculator', () => {
        // Direct Maya Calculator coverage (Midnight rollover policy)
        const mayaResult1 = MayanCalculator.calculate('2026-09-15', 'en');
        const mayaResult2 = MayanCalculator.calculate('2026-09-15', 'en');
        expect(mayaResult1.kicheName).toEqual(mayaResult2.kicheName);
        expect(mayaResult1.tone).toEqual(mayaResult2.tone);

        // Adapter coverage
        const mayaInput = { kicheName: mayaResult1.kicheName, tone: mayaResult1.tone, meaning: mayaResult1.meaning };
        const signal1 = MayaAdapter.adaptDaily(mayaInput, localDate, calculatedAt);
        const signal2 = MayaAdapter.adaptDaily(mayaInput, localDate, calculatedAt);

        expect(signal1).toEqual(signal2);
        expect(signal1.provenance.methodologyId).toBe('MAYA_GMT_584283_MIDNIGHT_V1');
    });

    it('ChineseAdapter is deterministic', () => {
        const chineseData = { animal: 'Caballo', element: 'Fuego', year: 2026 };
        
        const signalAnnual1 = ChineseAdapter.adaptAnnual(chineseData, localDate, calculatedAt);
        const signalAnnual2 = ChineseAdapter.adaptAnnual(chineseData, localDate, calculatedAt);
        expect(signalAnnual1).toEqual(signalAnnual2);
        expect(signalAnnual1.provenance.methodologyId).toBe('CHINESE_LI_CHUN_V1');
        expect(signalAnnual1.temporalScope).toBe('ANNUAL');

        const signalNatal1 = ChineseAdapter.adaptNatal(chineseData, calculatedAt);
        const signalNatal2 = ChineseAdapter.adaptNatal(chineseData, calculatedAt);
        expect(signalNatal1).toEqual(signalNatal2);
        expect(signalNatal1.temporalScope).toBe('STRUCTURAL');
    });
});
