import { NaosSignal } from '../models/NaosSignal';
import * as crypto from 'crypto';

export interface ChineseInput {
    animal: string;
    element: string;
    year: number; // Represents either birth year or current cycle year depending on context
}

export class ChineseAdapter {
    static adaptNatal(chineseData: ChineseInput, calculatedAt: string): NaosSignal {
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
                engine: 'ChineseAstrology',
                methodologyId: 'CHINESE_LI_CHUN_V1',
                calculatedAt,
                inputs: { type: 'natal', resolvedYear: chineseData.year }
            },
            payload: {
                animal: chineseData.animal,
                element: chineseData.element
            }
        };
    }

    static adaptAnnual(chineseData: ChineseInput, localDate: string, calculatedAt: string): NaosSignal {
        const hashInput = `CHINESE|ANNUAL|${chineseData.animal}|${chineseData.element}|${chineseData.year}|${localDate}`;
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
                inputs: { localDate, resolvedYear: chineseData.year }
            },
            payload: {
                animal: chineseData.animal,
                element: chineseData.element
            }
        };
    }
}
