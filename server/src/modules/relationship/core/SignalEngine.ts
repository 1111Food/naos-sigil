import { Signal } from '../models/Signal';
import { ISignalSource } from '../signals/ISignalSource';
import { AstrologySignalSource } from '../signals/AstrologySignalSource';
import { NumerologySignalSource } from '../signals/NumerologySignalSource';
import { MayanSignalSource } from '../signals/MayanSignalSource';
import { ChineseSignalSource } from '../signals/ChineseSignalSource';

/**
 * SignalEngine is responsible for ingesting, normalizing, and 
 * routing all raw signals (Astrology, Numerology, Check-ins, etc.) 
 * into the NAOS ecosystem.
 */
export class SignalEngine {
    
    private sources: ISignalSource[] = [
        new AstrologySignalSource(),
        new NumerologySignalSource(),
        new MayanSignalSource(),
        new ChineseSignalSource()
    ];

    /**
     * Processes two user profiles and extracts all available signals.
     */
    public async processSignals(userA: any, userB: any): Promise<Signal[]> {
        const signals: Signal[] = [];
        
        for (const source of this.sources) {
            try {
                const signal = await source.generateSignal(userA, userB);
                signals.push(signal);
            } catch (error) {
                console.error(`Error generating signal:`, error);
            }
        }
        
        return signals;
    }
}
