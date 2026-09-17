import { CanonicalDomain, DomainRelevanceClass } from '../domainProjection/types';
import { DominantDirection, ContextualAlignment, InternalDomainState } from '../domainAggregation/types';

export type ActionType = 
    | 'ACT'
    | 'PREPARE'
    | 'COMMUNICATE'
    | 'LEARN'
    | 'REGULATE'
    | 'REFLECT'
    | 'REVIEW'
    | 'CONNECT'
    | 'OBSERVE';

export type ActionPriority = 
    | 'PRIMARY'
    | 'SECONDARY'
    | 'OPTIONAL'
    | 'DEFER';

export type ActionPacing = 
    | 'DIRECT'
    | 'MEASURED'
    | 'GENTLE'
    | 'PAUSE_AND_REVIEW';

export type TargetSurface = 
    | 'SIGIL'
    | 'SANCTUARY'
    | 'PROTOCOL_21'
    | 'TIME_MAP'
    | 'ORACLE'
    | 'LABORATORY'
    | 'EXTERNAL'
    | 'NONE';

export type ActionReasonCode = 
    | 'TEMPORAL_ACTIVATION'
    | 'CONTEXT_PRESENT'
    | 'HIGH_DIRECTIONAL_CONVERGENCE'
    | 'HIGH_TENSION'
    | 'HIGH_AMBIGUITY'
    | 'LOW_COVERAGE'
    | 'LOW_SOURCE_AVAILABILITY'
    | 'STRUCTURAL_RESONANCE'
    | 'COHERENCE_PACING'
    | 'ACTIVE_PROTOCOL_CONTINUITY'
    | 'DOMINANT_CHALLENGE'
    | 'DOMINANT_SUPPORT';

export interface ActionRoute {
    id: string; // Deterministic route ID
    domain: CanonicalDomain;
    actionType: ActionType;
    priorityBand: ActionPriority;
    pacing: ActionPacing;
    targetSurface: TargetSurface;
    reasonCodes: ActionReasonCode[];
    contextualAlignment: ContextualAlignment;
    methodology: string;
}

export interface ActionRoutingInput {
    domainState: InternalDomainState;
    coherenceModifier?: 'LOW' | 'OPTIMAL' | 'HIGH';
    activeProtocol?: boolean;
}
