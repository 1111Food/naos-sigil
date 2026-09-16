import { TransitEngine } from '../../astrology/TransitEngine';

describe('TransitEngine Location Invariance', () => {
    it('planetary transits should be perfectly location invariant (Geocentric)', () => {
        const date = new Date('2026-09-15T12:00:00Z');
        
        // Location 1: Guatemala City
        const lat1 = 14.6349;
        const lng1 = -90.5069;
        
        // Location 2: Tokyo
        const lat2 = 35.6762;
        const lng2 = 139.6503;

        const transits1 = TransitEngine.calculateCurrentTransits(date, lat1, lng1);
        const transits2 = TransitEngine.calculateCurrentTransits(date, lat2, lng2);

        // Verify all planetary outputs are precisely the same regardless of location
        expect(transits1).toEqual(transits2);

        // Find Moon and log its position for the report
        const moon1 = transits1.find(t => t.name === 'Moon');
        const moon2 = transits2.find(t => t.name === 'Moon');

        expect(moon1).toBeDefined();
        expect(moon2).toBeDefined();

        if (moon1 && moon2) {
            console.log(`MOON_GUATEMALA_LONGITUDE: ${moon1.absDegree}`);
            console.log(`MOON_TOKYO_LONGITUDE: ${moon2.absDegree}`);
            console.log(`MOON_DIFFERENCE: ${Math.abs(moon1.absDegree - moon2.absDegree)}`);
            expect(Math.abs(moon1.absDegree - moon2.absDegree)).toBeCloseTo(0, 10);
        }
    });

    it('aspects and final signals should be location invariant', () => {
        const date = new Date('2026-09-15T12:00:00Z');
        
        // Mock natal positions
        const natalPositions = {
            'Sun': 180,
            'Moon': 90,
            'Venus': 210,
            'Mars': 120,
            'Ascendant': 0
        };

        const transitsGuatemala = TransitEngine.calculateCurrentTransits(date, 14.6349, -90.5069);
        const aspectsGuatemala = TransitEngine.calculateAspects(transitsGuatemala, natalPositions);

        const transitsTokyo = TransitEngine.calculateCurrentTransits(date, 35.6762, 139.6503);
        const aspectsTokyo = TransitEngine.calculateAspects(transitsTokyo, natalPositions);

        expect(aspectsGuatemala).toEqual(aspectsTokyo);
    });
});
