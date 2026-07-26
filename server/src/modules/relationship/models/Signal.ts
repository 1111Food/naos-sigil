export enum SignalSourceType {
    ASTROLOGY = 'ASTROLOGY',
    NUMEROLOGY = 'NUMEROLOGY',
    MAYAN = 'MAYAN',
    CHINESE = 'CHINESE',
    HUMAN_DESIGN = 'HUMAN_DESIGN',
    BEHAVIOR = 'BEHAVIOR',
    EVENTS = 'EVENTS',
    WEARABLE = 'WEARABLE'
}

export interface Signal {
    sourceType: SignalSourceType;
    rawData: any;        // The raw calculation (e.g. planetary degrees, sleep hours)
    confidence: number;  // Confidence in this specific signal
    timestamp: Date;
    metadata?: any;
}
