import { ISignalSource } from './ISignalSource';
import { Signal, SignalSourceType } from '../models/Signal';

export class AstrologySignalSource implements ISignalSource {
    
    public async generateSignal(userA: any, userB: any): Promise<Signal> {
        // Extract astrology data from profiles
        const astroA = userA.astrology || userA.pillars?.astrology;
        const astroB = userB.astrology || userB.pillars?.astrology;
        
        // Check for missing birth times to adjust confidence
        const hasTimeA = userA.birthTime !== undefined && userA.birthTime !== null && userA.birthTime !== '';
        const hasTimeB = userB.birthTime !== undefined && userB.birthTime !== null && userB.birthTime !== '';
        
        const confidence = (hasTimeA && hasTimeB) ? 100 : 50;
        
        // Mask uncertain data when time is missing (like Moon/Ascendant)
        if (!hasTimeA && astroA && astroA.planets) {
            const moon = astroA.planets.find((p: any) => p.name === 'Moon');
            if (moon) moon.sign = 'UNCERTAIN';
        }
        if (!hasTimeB && astroB && astroB.planets) {
            const moon = astroB.planets.find((p: any) => p.name === 'Moon');
            if (moon) moon.sign = 'UNCERTAIN';
        }

        return {
            sourceType: SignalSourceType.ASTROLOGY,
            rawData: {
                personA: astroA,
                personB: astroB
            },
            confidence,
            timestamp: new Date(),
            metadata: {
                limitations: confidence < 100 ? ['Hora de nacimiento estimada para uno o ambos usuarios'] : []
            }
        };
    }
}
