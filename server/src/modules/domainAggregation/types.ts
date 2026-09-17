import { CanonicalDomain, DomainEvidence } from '../domainProjection/types';

export type MeasurementStatus = 'VALID' | 'INSUFFICIENT_EVIDENCE' | 'NOT_APPLICABLE';
export type DominantDirection = 'SUPPORTIVE' | 'CHALLENGING' | 'MIXED' | 'NEUTRAL' | 'UNDETERMINED';
export type ContextualAlignment = 'PRESENT' | 'NONE';

export interface SystemAvailability {
    [systemName: string]: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface DomainAggregationInput {
    evidence: DomainEvidence[];
    systemAvailability: SystemAvailability;
}

export interface InternalDomainState {
    domain: CanonicalDomain;

    strength: number;
    structuralResonance: number;

    evidenceCoverage: number;
    sourceAvailability: number;

    directionalConvergence: { value: number; status: MeasurementStatus };
    tension: { value: number; status: MeasurementStatus };
    ambiguity: { value: number; status: MeasurementStatus };

    dominantDirection: DominantDirection;
    contextualAlignment: ContextualAlignment;

    evidenceCount: number;
    independentSourceCount: number;
    representedSystemCount: number;

    methodology: string;
    projectionMethodologies: string[];
}
