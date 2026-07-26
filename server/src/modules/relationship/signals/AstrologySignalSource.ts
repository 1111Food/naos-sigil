import { ISignalSource } from './ISignalSource';
import { Signal, SignalSourceType } from '../models/Signal';

export class AstrologySignalSource implements ISignalSource {
    
    public async generateSignal(userA: any, userB: any): Promise<Signal> {
        // Extract astrology data from profiles
        const astroA = userA.astrology || userA.pillars?.astrology;
        const astroB = userB.astrology || userB.pillars?.astrology;
        
        // Check for missing birth times to adjust confidence
        const hasTimeA = userA.birthTime !== undefined && userA.birthTime !== null;
        const hasTimeB = userB.birthTime !== undefined && userB.birthTime !== null;
        
        const confidence = (hasTimeA && hasTimeB) ? 100 : 50;
        
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
