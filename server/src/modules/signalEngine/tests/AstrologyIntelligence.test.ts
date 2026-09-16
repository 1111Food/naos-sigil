import { AstrologyAdapter } from '../adapters/AstrologyAdapter';
import { AspectResult } from '../../astrology/TransitEngine';

describe('Astrology Intelligence Engine (Part 2)', () => {
    const calculatedAt = '2026-09-15T12:00:00.000Z';
    const localDate = '2026-09-15';

    const createAspect = (
        transitPlanet: string,
        natalTarget: string,
        aspectType: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition' | string,
        orb: number
    ): AspectResult => ({
        transitPlanet,
        natalTarget,
        aspectType: aspectType as any,
        exactAngle: 0,
        actualSeparation: 0,
        orb,
        isPriority: false
    });

    it('Fixture 1 & 2: Exact and loose conjunction', () => {
        const aspects = [
            createAspect('Mars', 'Venus', 'Conjunction', 0),
            createAspect('Saturn', 'Sun', 'Conjunction', 2.8)
        ];
        const signals = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        
        const exactConj = signals.find(s => s.provenance.inputs.orb === 0);
        const looseConj = signals.find(s => s.provenance.inputs.orb === 2.8);

        expect(exactConj?.intensity).toBe(1.0);
        expect(looseConj?.intensity).toBeCloseTo(0.067, 3); // 1.0 - 2.8/3.0
        expect(exactConj?.direction).toBe('MIXED');
    });

    it('Fixture 3 & 4: Exact and loose trine', () => {
        const aspects = [
            createAspect('Jupiter', 'Moon', 'Trine', 0.1),
            createAspect('Uranus', 'Mercury', 'Trine', 2.9)
        ];
        const signals = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        
        expect(signals[0].direction).toBe('SUPPORTIVE');
        expect(signals[1].direction).toBe('SUPPORTIVE');
        expect(signals.find(s => s.provenance.inputs.orb === 0.1)?.intensity).toBeCloseTo(0.967, 3);
        expect(signals.find(s => s.provenance.inputs.orb === 2.9)?.intensity).toBeCloseTo(0.033, 3);
    });

    it('Fixture 5, 6, 7: Exact square, opposition, sextile', () => {
        const aspects = [
            createAspect('Mars', 'Sun', 'Square', 0),
            createAspect('Saturn', 'Moon', 'Opposition', 1.5),
            createAspect('Venus', 'Mars', 'Sextile', 1.0)
        ];
        const signals = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        
        expect(signals.find(s => s.payload.aspectType === 'Square')?.direction).toBe('CHALLENGING');
        expect(signals.find(s => s.payload.aspectType === 'Opposition')?.direction).toBe('CHALLENGING');
        expect(signals.find(s => s.payload.aspectType === 'Sextile')?.direction).toBe('SUPPORTIVE');
    });

    it('Fixture 8 & 9: Multiple simultaneous aspects (Supportive + Challenging preserved)', () => {
        const aspects = [
            createAspect('Mars', 'Saturn', 'Square', 1.0),
            createAspect('Jupiter', 'Sun', 'Trine', 0.5)
        ];
        const signals = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        
        expect(signals.length).toBe(2);
        expect(signals.some(s => s.direction === 'CHALLENGING')).toBe(true);
        expect(signals.some(s => s.direction === 'SUPPORTIVE')).toBe(true);
    });

    it('Fixture 10: No relevant aspects', () => {
        const signals = AstrologyAdapter.adaptAspects([], localDate, calculatedAt);
        expect(signals.length).toBe(0);
    });

    it('Fixture 11: Unknown/Future aspect safety', () => {
        const aspects = [
            createAspect('Pluto', 'Sun', 'Quincunx', 0)
        ];
        const signals = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        
        expect(signals[0].direction).toBe('NEUTRAL');
        expect(signals[0].payload.interpretationStatus).toBe('UNMAPPED');
    });

    it('Fixture 12: Deterministic sort and repeatable calculation', () => {
        const aspects = [
            createAspect('Mars', 'Sun', 'Square', 0),
            createAspect('Saturn', 'Moon', 'Opposition', 1.5),
            createAspect('Venus', 'Mars', 'Sextile', 1.0)
        ];
        
        // Reverse order of inputs
        const aspectsReversed = [...aspects].reverse();

        const signals1 = AstrologyAdapter.adaptAspects(aspects, localDate, calculatedAt);
        const signals2 = AstrologyAdapter.adaptAspects(aspectsReversed, localDate, calculatedAt);

        // They must be identical due to internal ID sorting
        expect(signals1).toEqual(signals2);
    });
});
