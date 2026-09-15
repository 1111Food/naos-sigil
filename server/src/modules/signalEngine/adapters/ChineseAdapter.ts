import { NaosSignal } from '../models/NaosSignal';
import * as crypto from 'crypto';

export interface ChineseInput {
    animal: string;
    element: string;
    birthYear: number;
}

export class ChineseAdapter {
    static adaptAnnual(chineseData: ChineseInput, localDate: string, calculatedAt: string): NaosSignal {
        const hashInput = `CHINESE|ANNUAL|${chineseData.animal}|${chineseData.element}|${chineseData.birthYear}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

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
                engine: 'ChineseAstrology',
                methodologyId: 'CHINESE_LI_CHUN_V1',
                calculatedAt,
                inputs: { localDate, birthYearResolved: chineseData.birthYear }
            },
            payload: {
                animal: chineseData.animal,
                element: chineseData.element
            }
        };
    }
}
