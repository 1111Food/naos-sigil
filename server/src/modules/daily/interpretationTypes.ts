export interface SupportedInterpretationBlock {
    text: string;
    signalIds: string[];
}

export interface IntegratedPatternBlock {
    convergence: boolean;
    text: string;
    signalIds: string[];
}

export interface DailyInterpretation {
    interpretationVersion: 'v1';
    localDate: string;
    language: string;
    interpretationStatus: 'ready' | 'unavailable';

    primarySignal: SupportedInterpretationBlock & { title: string };
    integratedPattern: IntegratedPatternBlock;

    systems: {
        astrology: SupportedInterpretationBlock;
        numerology: SupportedInterpretationBlock;
        maya: SupportedInterpretationBlock;
        chinese: SupportedInterpretationBlock;
    };

    personalResonance: string; // How protocol/coherence modulates the day
    guidance: string; // Actionable advice
    reflectionQuestion: string; // Magnetic hook
}
