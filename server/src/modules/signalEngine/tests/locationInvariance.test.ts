import { TransitEngine } from '../../astrology/TransitEngine';

describe('TransitEngine Location Invariance', () => {
    it('planetary transits should be location invariant', () => {
        const date = new Date('2026-09-15T12:00:00Z');
        
        // Location 1: Guatemala City
        const lat1 = 14.6349;
        const lng1 = -90.5069;
        
        // Location 2: Tokyo
        const lat2 = 35.6762;
        const lng2 = 139.6503;

        const transits1 = TransitEngine.calculateCurrentTransits(date, lat1, lng1);
        const transits2 = TransitEngine.calculateCurrentTransits(date, lat2, lng2);

        expect(transits1).toEqual(transits2);
    });
});
