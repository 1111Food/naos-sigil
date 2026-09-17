import { CanonicalDomain } from '../domainProjection/types';
import { ActionType } from '../actionRouting/types';

export const CALIBRATION_FOUNDATION_METHODOLOGY = 'CALIBRATION_FOUNDATION_V1';

export type ObservationKind = 'BEHAVIORAL_EVENT' | 'EXPLICIT_FEEDBACK';

export type BehavioralEventType = 
    | 'ROUTE_SHOWN'
    | 'ROUTE_OPENED'
    | 'ROUTE_DISMISSED'
    | 'ROUTE_ACCEPTED'
    | 'ACTION_STARTED'
    | 'ACTION_COMPLETED';

export type ExplicitFeedbackType = 
    | 'USER_HELPFUL'
    | 'USER_NOT_HELPFUL';

export type ObservationType = BehavioralEventType | ExplicitFeedbackType;

export type FeedbackDimension = 
    | 'USEFULNESS'
    | 'RELEVANCE'
    | 'CLARITY'
    | 'ACTIONABILITY'
    | 'NONE';

export interface MethodologySnapshot {
    projectionMethodology: string;
    aggregationMethodology: string;
    routingMethodology: string;
    recipeVersionId: string; // Deterministic hash/identifier of the methodology bundle
}

export interface CalibrationObservation {
    id: string; // Deterministic or UUID
    accountScopedSubject: string; // Opaque reference to the user, strictly isolated
    
    domain: CanonicalDomain;
    actionRouteId: string;
    actionType: ActionType;

    // Historical provenance of the methodology that produced the route. MUST remain immutable.
    methodology: MethodologySnapshot;
    
    observationKind: ObservationKind;
    observationType: ObservationType;
    feedbackDimension: FeedbackDimension;
    
    // Ordinal or binary value (-1, 0, 1) to represent the observation magnitude/direction
    observationValue: number; 
    
    occurredAt: string; // ISO8601
}

export type EmpiricalStatus = 
    | 'NOT_CALIBRATED'
    | 'CALIBRATED_V1'; // Not used yet, placeholder for future scientific proof

export type CoefficientStatus = 
    | 'DESIGNED_V1'
    | 'OPTIMIZED';

export interface MethodologyRegistryState {
    currentProjection: string;
    currentAggregation: string;
    currentRouting: string;
    currentCalibrationFoundation: string;
    empiricalStatus: EmpiricalStatus;
    coefficientStatus: CoefficientStatus;
    recipeSnapshotId: string;
}

export type EvaluationSampleStatus = 
    | 'INSUFFICIENT_DATA'
    | 'ELIGIBLE_FOR_REVIEW';

export interface CalibrationCandidateRecord {
    recipeSnapshotId: string;
    domain: CanonicalDomain;
    actionType: ActionType;
    feedbackDimension: FeedbackDimension;
    explicitFeedbackCount: number;
    behavioralEventCount: number;
    sampleStatus: EvaluationSampleStatus;
}
