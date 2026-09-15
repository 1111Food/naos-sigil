export type NaosSignalType = 
    | 'ASTROLOGY' 
    | 'NUMEROLOGY' 
    | 'MAYA' 
    | 'CHINESE' 
    | 'PERSONAL_CONTEXT' 
    | 'NAOS_ARCHETYPE';

export type TemporalScope = 
    | 'STRUCTURAL'    // Permanent (Natal, Lifepath, Archetype)
    | 'ANNUAL'        // Year-long cycle
    | 'MONTHLY'       // Month-long cycle
    | 'DAILY'         // 24-hour block
    | 'TRANSIT';      // Specific astronomical event or momentary aspect

/**
 * Normalizes the direction of a signal.
 * Kept as mathematical vectors rather than subjective "good/bad" judgments.
 * Ranges from -1.0 to 1.0 if scalar, or represented categorically.
 * For Part 1, we use categorical vectors that can later be scalarized.
 */
export type SignalDirection = 
    | 'SUPPORTIVE'    // Easy flow, harmony, trines, favorable cycles
    | 'CHALLENGING'   // Tension, resistance, squares, difficult cycles
    | 'NEUTRAL'       // Informational, no inherent tension
    | 'MIXED';        // Conjunctions or complex states that depend on inputs

export interface SignalProvenance {
    engine: string;           // e.g. "TransitEngine"
    methodologyId: string;    // e.g. "ASTRO_TRANSIT_V1"
    calculatedAt: string;     // ISO String
    inputs: Record<string, any>; // The raw parameters used (e.g., exact angle, birth location)
}

export interface NaosSignal {
    /** Deterministic identifier. Format: {signalType}.{temporalScope}.{unique_hash} */
    id: string;
    
    /** The core domain of the signal */
    signalType: NaosSignalType;
    
    /** Launch target is ACCOUNT_OWNER */
    subject: 'ACCOUNT_OWNER';
    
    /** The specific timestamp or local date this signal applies to */
    timestamp: string; 
    
    /** How long this signal lasts */
    temporalScope: TemporalScope;
    
    /** Mathematical direction of the energy */
    direction: SignalDirection;
    
    /** 
     * Honest intensity derived from math (e.g. orb tightness). 
     * NULL if it cannot be deterministically computed yet.
     */
    intensity: number | null; 
    
    /** 
     * How specific this is to the user (e.g. a transit to a specific natal degree = high specificity. 
     * A universal year = low specificity). Null for Part 1. 
     */
    specificity: number | null; 
    
    /** Origin trace */
    provenance: SignalProvenance;
    
    /** The actual payload / facts (e.g. { aspect: "Square", planets: ["Mars", "Saturn"] }) */
    payload: Record<string, any>;
}
