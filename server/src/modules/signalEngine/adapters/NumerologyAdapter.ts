import { NaosSignal } from '../models/NaosSignal';
import * as crypto from 'crypto';

export interface NumerologyInputCycles {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
}

export class NumerologyAdapter {
    static adaptDailyCycles(cycles: NumerologyInputCycles, localDate: string, calculatedAt: string): NaosSignal[] {
        const signals: NaosSignal[] = [];

        // 1. Personal Year
        signals.push(this.createSignal('ANNUAL', 'personalYear', cycles.personalYear, localDate, calculatedAt));
        
        // 2. Personal Month
        signals.push(this.createSignal('MONTHLY', 'personalMonth', cycles.personalMonth, localDate, calculatedAt));

        // 3. Personal Day
        signals.push(this.createSignal('DAILY', 'personalDay', cycles.personalDay, localDate, calculatedAt));

        return signals;
    }

    private static createSignal(scope: 'ANNUAL' | 'MONTHLY' | 'DAILY', key: string, value: number, localDate: string, calculatedAt: string): NaosSignal {
        const hashInput = `NUMEROLOGY|${scope}|${key}|${value}|${localDate}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        return {
            id: `NUMEROLOGY.${scope}.${idHash}`,
            signalType: 'NUMEROLOGY',
            subject: 'ACCOUNT_OWNER',
            timestamp: localDate, // The day this signal was evaluated on
            temporalScope: scope,
            direction: 'NEUTRAL', // Numerology is informational until context is applied
            intensity: null, // Mathematical intensity not natively present in basic cycle extraction
            specificity: null,
            provenance: {
                engine: 'NumerologyMathV1',
                methodologyId: 'NUMEROLOGY_NAOS_MASTERS_11_22_33_V1',
                calculatedAt,
                inputs: { cycleType: key }
            },
            payload: {
                value,
                isMasterNumber: (value === 11 || value === 22 || value === 33)
            }
        };
    }
}
