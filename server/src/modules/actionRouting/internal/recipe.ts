import { CanonicalDomain } from '../../domainProjection/types';
import { ActionType, TargetSurface, ActionPacing, ActionPriority, ActionReasonCode } from '../types';

export const ACTION_ROUTING_V1_METHODOLOGY = 'ACTION_ROUTING_V1';

// Secret limits and thresholds (Backend only)
export const ROUTING_THRESHOLDS = {
    HIGH_STRENGTH_ACTIVATION: 0.65,
    MIN_STRENGTH_ACTIVATION: 0.20,
    HIGH_TENSION: 0.70,
    HIGH_AMBIGUITY: 0.60,
    ADEQUATE_COVERAGE: 0.35,
    HIGH_CONVERGENCE: 0.80,
    STRUCTURAL_RESONANCE_THRESHOLD: 0.70
} as const;

export const DOMAIN_ACTION_MATRIX: Record<CanonicalDomain, ActionType[]> = {
    'ACTION_INITIATIVE': ['ACT', 'PREPARE', 'REVIEW'],
    'RELATIONSHIPS_LOVE': ['COMMUNICATE', 'CONNECT', 'REFLECT', 'OBSERVE'],
    'BUSINESS_EXPANSION': ['PREPARE', 'REVIEW', 'COMMUNICATE', 'ACT'],
    'COMMUNICATION_LEARNING': ['COMMUNICATE', 'LEARN', 'PREPARE', 'REVIEW'],
    'BODY_REGULATION': ['REGULATE', 'OBSERVE', 'REFLECT'],
    'INTROSPECTION_RECOVERY': ['REFLECT', 'OBSERVE', 'REGULATE']
};

// Maps canonical action types to verified target surfaces
// V1 safe mapping for routing
export const ACTION_SURFACE_MAPPING: Record<ActionType, TargetSurface> = {
    'ACT': 'TIME_MAP',
    'PREPARE': 'TIME_MAP',
    'COMMUNICATE': 'SIGIL',
    'LEARN': 'SIGIL',
    'REGULATE': 'SANCTUARY',
    'REFLECT': 'SIGIL',
    'REVIEW': 'LABORATORY',
    'CONNECT': 'ORACLE',
    'OBSERVE': 'SIGIL'
};

export function resolvePacing(
    tensionValue: number, 
    ambiguityValue: number, 
    convergenceValue: number,
    coverageValue: number,
    coherence?: 'LOW' | 'OPTIMAL' | 'HIGH'
): ActionPacing {
    if (coherence === 'LOW') return 'GENTLE';
    
    if (tensionValue >= ROUTING_THRESHOLDS.HIGH_TENSION) return 'PAUSE_AND_REVIEW';
    if (ambiguityValue >= ROUTING_THRESHOLDS.HIGH_AMBIGUITY) return 'MEASURED';
    
    if (
        convergenceValue >= ROUTING_THRESHOLDS.HIGH_CONVERGENCE &&
        tensionValue < ROUTING_THRESHOLDS.HIGH_TENSION &&
        coverageValue >= ROUTING_THRESHOLDS.ADEQUATE_COVERAGE
    ) {
        return 'DIRECT';
    }

    return 'MEASURED';
}

export function resolvePriority(
    strength: number,
    contextualAlignment: 'PRESENT' | 'NONE',
    structuralResonance: number
): ActionPriority {
    if (contextualAlignment === 'PRESENT' && strength >= ROUTING_THRESHOLDS.HIGH_STRENGTH_ACTIVATION) {
        return 'PRIMARY';
    }
    
    if (strength >= ROUTING_THRESHOLDS.HIGH_STRENGTH_ACTIVATION) {
        return 'SECONDARY';
    }
    
    if (contextualAlignment === 'PRESENT') {
        return 'SECONDARY'; // Factual context without temporal activation still warrants secondary priority
    }

    if (structuralResonance >= ROUTING_THRESHOLDS.STRUCTURAL_RESONANCE_THRESHOLD) {
        return 'OPTIONAL';
    }

    return 'DEFER';
}
