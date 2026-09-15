import { TransitEngine } from './TransitEngine';

describe('TransitEngine Determinism', () => {
    it('returns exact same transits and aspects for identical input', () => {
        const date = new Date('2026-09-15T12:00:00Z');
        const lat = 14.6349;
        const lng = -90.5069;
        
        const transits1 = TransitEngine.calculateCurrentTransits(date, lat, lng);
        const transits2 = TransitEngine.calculateCurrentTransits(date, lat, lng);
        
        expect(transits1).toEqual(transits2);

        const natalPositions = {
            'Sun': 54.5,
            'Moon': 312.3,
            'Ascendant': 135.2
        };

        const aspects1 = TransitEngine.calculateAspects(transits1, natalPositions);
        const aspects2 = TransitEngine.calculateAspects(transits2, natalPositions);

        expect(aspects1).toEqual(aspects2);
    });
});
