import { ISignalSource } from './ISignalSource';
import { Signal, SignalSourceType } from '../models/Signal';

export class MayanSignalSource implements ISignalSource {
    
    public async generateSignal(userA: any, userB: any): Promise<Signal> {
        const mayaA = userA.mayan || userA.pillars?.mayan;
        const mayaB = userB.mayan || userB.pillars?.mayan;
        
        return {
            sourceType: SignalSourceType.MAYAN,
            rawData: {
                personA: mayaA,
                personB: mayaB
            },
            confidence: 100,
            timestamp: new Date()
        };
    }
}
