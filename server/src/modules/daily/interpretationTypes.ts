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

    primarySignal?: SupportedInterpretationBlock & { 
        title: string;
        behavioral_title?: string;
        behavioral_text?: string;
    };
    integratedPattern?: IntegratedPatternBlock;

    systems?: {
        astrology: SupportedInterpretationBlock;
        numerology: SupportedInterpretationBlock;
        maya: SupportedInterpretationBlock;
        chinese: SupportedInterpretationBlock;
    };

    personalResonance?: string;
    
    // Symbolic
    guidance?: string; 
    avoid?: string;
    
    // Behavioral
    behavioral_guidance?: string;
    behavioral_avoid?: string;

    // Metrics for Alineacin Total (DEPRECATED)
    metrics?: {
        focus: number;
        creativity: number;
        relationships: number;
    };

    reflectionQuestion?: string; 
}
