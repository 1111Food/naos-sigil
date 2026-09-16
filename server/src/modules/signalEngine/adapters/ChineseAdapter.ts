import { NaosSignal } from '../models/NaosSignal';
import * as crypto from 'crypto';
import { ChineseMathV1 } from '../../chinese/ChineseMathV1';

export interface ChineseInput {
    animal: string;
    element: string;
    year: number; // Represents effectiveChineseCycleYear
}

export class ChineseAdapter {
    static adaptNatal(chineseData: ChineseInput, calculatedAt: string): NaosSignal {
        // Do not include calculatedAt in the hash to ensure determinism
        const hashInput = `CHINESE|STRUCTURAL|${chineseData.animal}|${chineseData.element}|${chineseData.year}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        return {
            id: `CHINESE.STRUCTURAL.${idHash}`,
            signalType: 'CHINESE',
            subject: 'ACCOUNT_OWNER',
            timestamp: `${chineseData.year}-01-01`, // Nominal structural anchor
            temporalScope: 'STRUCTURAL',
            direction: 'NEUTRAL',
            intensity: null,
            specificity: null,
            provenance: {
                engine: 'ChineseMathV1',
                methodologyId: ChineseMathV1.METHODOLOGY_ID,
                calculatedAt,
                inputs: { type: 'natal', effectiveChineseCycleYear: chineseData.year }
            },
            payload: {
                animal: chineseData.animal,
                element: chineseData.element,
                effectiveChineseCycleYear: chineseData.year
            }
        };
    }

    static adaptAnnual(chineseData: ChineseInput, localDate: string, calculatedAt: string): NaosSignal {
        // Fix Annual Signal ID bug: Hash effective year, NOT localDate.
        // This ensures the period ID is stable for the entire Feb 4 -> Feb 3 cycle.
        const hashInput = `CHINESE|ANNUAL|${chineseData.animal}|${chineseData.element}|${chineseData.year}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        const validFrom = `${chineseData.year}-02-04`;
        const validUntil = `${chineseData.year + 1}-02-03`;

        return {
            id: `CHINESE.ANNUAL.${idHash}`,
            signalType: 'CHINESE',
            subject: 'ACCOUNT_OWNER',
            timestamp: localDate, // The day this signal was evaluated on, but represents the annual cycle
            temporalScope: 'ANNUAL',
            direction: 'NEUTRAL',
            intensity: null,
            specificity: null,
            provenance: {
                engine: 'ChineseMathV1',
                methodologyId: ChineseMathV1.METHODOLOGY_ID,
                calculatedAt,
                inputs: { localDate, effectiveChineseCycleYear: chineseData.year }
            },
            payload: {
                animal: chineseData.animal,
                element: chineseData.element,
                effectiveChineseCycleYear: chineseData.year,
                periodValidity: {
                    validFrom,
                    validUntil
                }
            }
        };
    }
}
