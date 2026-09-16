import { NaosSignal } from '../models/NaosSignal';
import * as crypto from 'crypto';

export interface NumerologyPersonalCycles {
    personalYear: number;
    personalMonth: number;
    personalDay: number;
}

export interface NumerologyUniversalCycles {
    universalYear: number;
    universalMonth: number;
    universalDay: number;
}

export interface NumerologyTemporalInputs {
    localDate: string;
    birthDay?: number;
    birthMonth?: number;
}

export class NumerologyAdapter {
    static adaptTemporalCycles(
        personal: NumerologyPersonalCycles, 
        universal: NumerologyUniversalCycles, 
        inputs: NumerologyTemporalInputs, 
        calculatedAt: string
    ): NaosSignal[] {
        const signals: NaosSignal[] = [];

        // UNIVERSAL CYCLES
        signals.push(this.createSignal('ANNUAL', 'UNIVERSAL', 'YEAR', universal.universalYear, inputs, calculatedAt));
        signals.push(this.createSignal('MONTHLY', 'UNIVERSAL', 'MONTH', universal.universalMonth, inputs, calculatedAt));
        signals.push(this.createSignal('DAILY', 'UNIVERSAL', 'DAY', universal.universalDay, inputs, calculatedAt));

        // PERSONAL CYCLES
        signals.push(this.createSignal('ANNUAL', 'PERSONAL', 'YEAR', personal.personalYear, inputs, calculatedAt));
        signals.push(this.createSignal('MONTHLY', 'PERSONAL', 'MONTH', personal.personalMonth, inputs, calculatedAt));
        signals.push(this.createSignal('DAILY', 'PERSONAL', 'DAY', personal.personalDay, inputs, calculatedAt));

        // Ensure order determinism
        return signals.sort((a, b) => a.id.localeCompare(b.id));
    }

    private static createSignal(
        scope: 'ANNUAL' | 'MONTHLY' | 'DAILY', 
        nature: 'PERSONAL' | 'UNIVERSAL',
        period: 'YEAR' | 'MONTH' | 'DAY',
        value: number, 
        inputs: NumerologyTemporalInputs, 
        calculatedAt: string
    ): NaosSignal {
        const hashInput = `NUMEROLOGY|TEMPORAL|${nature}|${period}|${value}|${inputs.localDate}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        const isPersonal = nature === 'PERSONAL';
        
        // Construct minimum sufficient provenance inputs for reconstruction
        const provInputs: any = { 
            localDate: inputs.localDate,
            cycleNature: nature,
            cyclePeriod: period
        };
        if (isPersonal) {
            provInputs.birthDay = inputs.birthDay;
            provInputs.birthMonth = inputs.birthMonth;
        }

        return {
            id: `NUMEROLOGY.TEMPORAL.${nature}.${idHash}`,
            signalType: 'NUMEROLOGY',
            subject: 'ACCOUNT_OWNER',
            timestamp: inputs.localDate, // The local date this cycle applies to
            temporalScope: scope,
            direction: 'NEUTRAL', // Neutral atomic layer
            intensity: null, // No native continuous mathematical intensity
            specificity: null,
            provenance: {
                engine: 'NumerologyMathV1',
                methodologyId: 'NUMEROLOGY_NAOS_MASTERS_11_22_33_V1',
                calculatedAt,
                inputs: provInputs
            },
            payload: {
                cycleNature: nature,
                cyclePeriod: period,
                value,
                isMasterNumber: (value === 11 || value === 22 || value === 33)
            }
        };
    }
}
