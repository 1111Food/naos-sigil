import { ISignalSource } from './ISignalSource';
import { Signal, SignalSourceType } from '../models/Signal';

export class NumerologySignalSource implements ISignalSource {
    
    public async generateSignal(userA: any, userB: any): Promise<Signal> {
        const numA = userA.numerology || userA.pillars?.numerology;
        const numB = userB.numerology || userB.pillars?.numerology;
        
        // Numerology is usually 100% confident if derived from birth date/name
        return {
            sourceType: SignalSourceType.NUMEROLOGY,
            rawData: {
                personA: numA,
                personB: numB
            },
            confidence: 100,
            timestamp: new Date()
        };
    }
}
