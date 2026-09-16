import { AstrologyAdapter } from '../adapters/AstrologyAdapter';
import { NumerologyAdapter } from '../adapters/NumerologyAdapter';
import { MayaAdapter } from '../adapters/MayaAdapter';
import { ChineseAdapter } from '../adapters/ChineseAdapter';
import { AspectResult } from '../../astrology/TransitEngine';
import { MayaMathV1 } from '../../maya/MayaMathV1';

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
        const personal = { personalYear: 7, personalMonth: 9, personalDay: 11 };
        const universal = { universalYear: 1, universalMonth: 2, universalDay: 4 };
        const inputs = { localDate, birthDay: 15, birthMonth: 5 };
        
        const signals1 = NumerologyAdapter.adaptTemporalCycles(personal, universal, inputs, calculatedAt);
        const signals2 = NumerologyAdapter.adaptTemporalCycles(personal, universal, inputs, calculatedAt);

        expect(signals1).toEqual(signals2);
        
        const daySignal = signals1.find(s => s.payload.cycleNature === 'PERSONAL' && s.temporalScope === 'DAILY');
        expect(daySignal?.payload.isMasterNumber).toBe(true);
        expect(daySignal?.payload.value).toBe(11);
    });

    it('MayaAdapter is deterministic and covers Maya calculator', () => {
        // Direct Maya Calculator coverage (Midnight rollover policy)
        const atomic1 = MayaMathV1.calculate({ localDate: '2026-09-15' });
        const atomic2 = MayaMathV1.calculate({ localDate: '2026-09-15' });

        expect(atomic1.canonicalNawalKey).toEqual(atomic2.canonicalNawalKey);
        expect(atomic1.tone).toEqual(atomic2.tone);

        const localDate = '2026-09-15';
        const calculatedAt = '2026-09-15T12:00:00Z';
        const signal1 = MayaAdapter.adaptDaily(atomic1, localDate, calculatedAt);
        const signal2 = MayaAdapter.adaptDaily(atomic1, localDate, calculatedAt);

        expect(signal1.id).toBe(signal2.id);
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
