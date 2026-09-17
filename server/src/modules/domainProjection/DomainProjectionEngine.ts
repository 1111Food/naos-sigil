import { DomainEvidence } from './types';
import { NaosSignal } from '../signalEngine/models/NaosSignal';
import { PersonalContextSnapshot } from '../personalContext/types';
import { AstrologyProjector } from './rules/AstrologyProjector';
import { NumerologyProjector } from './rules/NumerologyProjector';
import { MayaProjector } from './rules/MayaProjector';
import { ChineseProjector } from './rules/ChineseProjector';
import { PersonalContextProjector } from './rules/PersonalContextProjector';

export class DomainProjectionEngine {
    static project(signals: NaosSignal[], contextSnapshot?: PersonalContextSnapshot): DomainEvidence[] {
        const evidence: DomainEvidence[] = [];

        // 1. Process Symbolic Signals
        for (const signal of signals) {
            switch (signal.signalType) {
                case 'ASTROLOGY':
                    evidence.push(...AstrologyProjector.project(signal));
                    break;
                case 'NUMEROLOGY':
                    evidence.push(...NumerologyProjector.project(signal));
                    break;
                case 'MAYA':
                    evidence.push(...MayaProjector.project(signal));
                    break;
                case 'CHINESE':
                    evidence.push(...ChineseProjector.project(signal));
                    break;
            }
        }

        // 2. Process Factual Context
        if (contextSnapshot && contextSnapshot.reasoningContext) {
            for (const item of contextSnapshot.reasoningContext) {
                evidence.push(...PersonalContextProjector.project(item));
            }
        }

        // 3. Ensure determinism (sort by ID)
        return evidence.sort((a, b) => a.id.localeCompare(b.id));
    }
}
