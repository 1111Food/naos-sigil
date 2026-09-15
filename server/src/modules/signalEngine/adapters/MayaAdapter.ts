import { NaosSignal } from '../models/NaosSignal';
import * as crypto from 'crypto';

export interface MayaInput {
    kicheName: string;
    tone: number;
    meaning: string;
}

export class MayaAdapter {
    static adaptDaily(mayaDaily: MayaInput, localDate: string, calculatedAt: string): NaosSignal {
        const hashInput = `MAYA|DAILY|${mayaDaily.kicheName}|${mayaDaily.tone}|${localDate}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        return {
            id: `MAYA.DAILY.${idHash}`,
            signalType: 'MAYA',
            subject: 'ACCOUNT_OWNER',
            timestamp: localDate,
            temporalScope: 'DAILY',
            direction: 'NEUTRAL', // Neutral baseline
            intensity: null, // No raw intensity in standard Maya day
            specificity: null,
            provenance: {
                engine: 'MayanCalculator',
                methodologyId: 'MAYA_GMT_584283_MIDNIGHT_V1',
                calculatedAt,
                inputs: { localDate }
            },
            payload: {
                nahual: mayaDaily.kicheName,
                tone: mayaDaily.tone
            }
        };
    }
}
