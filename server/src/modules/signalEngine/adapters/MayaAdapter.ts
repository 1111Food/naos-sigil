import { NaosSignal } from '../models/NaosSignal';
import { MayaMathV1, MayaAtomicSignal } from '../../maya/MayaMathV1';
import * as crypto from 'crypto';

export class MayaAdapter {
    static adaptDaily(atomic: MayaAtomicSignal, localDate: string, calculatedAt: string): NaosSignal {
        const hashInput = `MAYA|DAILY|${atomic.canonicalNawalKey}|${atomic.tone}|${localDate}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        return {
            id: `MAYA.DAILY.${idHash}`,
            signalType: 'MAYA',
            subject: 'ACCOUNT_OWNER',
            timestamp: localDate,
            temporalScope: 'DAILY',
            direction: 'NEUTRAL',
            intensity: null,
            specificity: null,
            provenance: {
                engine: 'MayaMathV1',
                methodologyId: MayaMathV1.METHODOLOGY_ID,
                calculatedAt,
                inputs: { localDate }
            },
            payload: {
                nawal: atomic.canonicalNawalKey,
                nawalIndex: atomic.nawalIndex,
                tone: atomic.tone,
                cholQijCycleIndex: atomic.cholQijCycleIndex
            }
        };
    }

    static adaptNatal(atomic: MayaAtomicSignal, birthLocalDate: string, calculatedAt: string): NaosSignal {
        const hashInput = `MAYA|NATAL|${atomic.canonicalNawalKey}|${atomic.tone}|${birthLocalDate}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);

        return {
            id: `MAYA.STRUCTURAL.${idHash}`,
            signalType: 'MAYA',
            subject: 'ACCOUNT_OWNER',
            timestamp: birthLocalDate,
            temporalScope: 'STRUCTURAL',
            direction: 'NEUTRAL',
            intensity: null,
            specificity: null,
            provenance: {
                engine: 'MayaMathV1',
                methodologyId: MayaMathV1.METHODOLOGY_ID,
                calculatedAt,
                inputs: { birthLocalDate }
            },
            payload: {
                nawal: atomic.canonicalNawalKey,
                nawalIndex: atomic.nawalIndex,
                tone: atomic.tone,
                cholQijCycleIndex: atomic.cholQijCycleIndex
            }
        };
    }
}
