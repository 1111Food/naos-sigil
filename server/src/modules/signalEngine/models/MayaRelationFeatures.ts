import { MayaAtomicSignal } from '../../maya/MayaMathV1';

export interface MayaTemporalRelationFeatures {
    sameNawal: boolean;
    sameTone: boolean;
    exactPairRecurrence: boolean;
    forwardNawalOffset: number; // 0-19
    forwardToneOffset: number;  // 0-12
    forwardCycleOffset: number; // 0-259
}

export class MayaRelationModel {
    static computeFeatures(natal: MayaAtomicSignal, daily: MayaAtomicSignal): MayaTemporalRelationFeatures {
        const forwardNawalOffset = (daily.nawalIndex - natal.nawalIndex + 20) % 20;
        const forwardToneOffset = (daily.tone - natal.tone + 13) % 13;
        const forwardCycleOffset = (daily.cholQijCycleIndex - natal.cholQijCycleIndex + 260) % 260;

        return {
            sameNawal: forwardNawalOffset === 0,
            sameTone: forwardToneOffset === 0,
            exactPairRecurrence: forwardCycleOffset === 0,
            forwardNawalOffset,
            forwardToneOffset,
            forwardCycleOffset
        };
    }
}