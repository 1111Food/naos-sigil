import { DailyContextBuilder } from './DailyContextBuilder';
import { DateUtils } from '../../utils/DateUtils';

describe('DailyContextBuilder Determinism', () => {
    it('returns exact same structured output for identical input', async () => {
        const fullProfile = {
            profile_data: {
                birthLat: 14.6349,
                birthLng: -90.5069,
                birthDate: '1990-05-15'
            },
            astrology: {
                timezone_offset: -6,
                planets: [
                    { name: 'Sun', sign: 'Taurus', absDegree: 54.5 },
                    { name: 'Moon', sign: 'Aquarius', absDegree: 312.3 },
                    { name: 'Venus', sign: 'Aries', absDegree: 25.1 }
                ],
                ascendant: { name: 'Ascendant', sign: 'Leo', absDegree: 135.2 }
            }
        };

        const now = new Date('2026-09-15T12:00:00Z');
        const offset = -6;
        
        const layerA1 = await DailyContextBuilder.build('test_user', fullProfile, offset, 'en', 50, now);
        
        // Remove calculatedAt for deterministic deep equality
        const stripDate = (obj: any) => {
            const stripped = JSON.parse(JSON.stringify(obj));
            stripped.provenance.forEach((p: any) => delete p.calculatedAt);
            return stripped;
        };

        const stripped1 = stripDate(layerA1);
        
        const layerA2 = await DailyContextBuilder.build('test_user', fullProfile, offset, 'en', 50, now);
        const stripped2 = stripDate(layerA2);

        expect(stripped1).toEqual(stripped2);
    });
});
