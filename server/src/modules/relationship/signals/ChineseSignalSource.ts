import { ISignalSource } from './ISignalSource';
import { Signal, SignalSourceType } from '../models/Signal';

export class ChineseSignalSource implements ISignalSource {
    
    public async generateSignal(userA: any, userB: any): Promise<Signal> {
        const chinA = userA.chinese || userA.pillars?.chinese;
        const chinB = userB.chinese || userB.pillars?.chinese;
        
        return {
            sourceType: SignalSourceType.CHINESE,
            rawData: {
                personA: chinA,
                personB: chinB
            },
            confidence: 100,
            timestamp: new Date()
        };
    }
}
