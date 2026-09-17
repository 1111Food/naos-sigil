import { 
    CalibrationObservation, 
    CalibrationCandidateRecord, 
    ObservationKind 
} from './types';
import { CalibrationRegistry } from './CalibrationRegistry';

export class CalibrationEvaluator {
    static readonly OPERATIONAL_REVIEW_THRESHOLD = 100; // Operational review only, NOT scientific validity

    /**
     * Validates that an observation is safely formed and does not conflate behavioral telemetry with explicit feedback.
     */
    static validateObservation(obs: CalibrationObservation): boolean {
        const isBehavioral = [
            'ROUTE_SHOWN', 'ROUTE_OPENED', 'ROUTE_DISMISSED', 'ROUTE_ACCEPTED', 'ACTION_STARTED', 'ACTION_COMPLETED'
        ].includes(obs.observationType);

        const isExplicit = ['USER_HELPFUL', 'USER_NOT_HELPFUL'].includes(obs.observationType);

        if (isBehavioral && obs.observationKind !== 'BEHAVIORAL_EVENT') return false;
        if (isExplicit && obs.observationKind !== 'EXPLICIT_FEEDBACK') return false;

        // Ensure no raw coefficients are embedded in the observation
        if ((obs as any).coefficients || (obs as any).rawContext) {
            return false;
        }

        return true;
    }

    /**
     * Groups observations by the recipe snapshot ID that produced them.
     * Guarantees that changing active methodology does not mutate historical methodology metadata.
     */
    static groupObservationsByMethodology(observations: CalibrationObservation[]): Map<string, CalibrationObservation[]> {
        const map = new Map<string, CalibrationObservation[]>();
        for (const obs of observations) {
            if (!this.validateObservation(obs)) continue;

            const snapshotId = obs.methodology.recipeVersionId;
            if (!map.has(snapshotId)) map.set(snapshotId, []);
            map.get(snapshotId)!.push(obs);
        }
        return map;
    }

    /**
     * Summarizes observations into a candidate record for a specific domain and action type.
     * Evaluates sample sufficiency strictly for operational review, never auto-tuning.
     */
    static evaluateSampleSufficiency(
        observations: CalibrationObservation[],
        recipeSnapshotId: string,
        domain: any, // CanonicalDomain
        actionType: any, // ActionType
        feedbackDimension: any // FeedbackDimension
    ): CalibrationCandidateRecord {
        let explicitCount = 0;
        let behavioralCount = 0;

        for (const obs of observations) {
            if (!this.validateObservation(obs)) continue;
            if (obs.methodology.recipeVersionId !== recipeSnapshotId) continue;
            if (obs.domain !== domain || obs.actionType !== actionType) continue;
            if (obs.feedbackDimension !== feedbackDimension) continue;

            if (obs.observationKind === 'EXPLICIT_FEEDBACK') {
                explicitCount++;
            } else if (obs.observationKind === 'BEHAVIORAL_EVENT') {
                behavioralCount++;
            }
        }

        // Behavior alone doesn't trigger eligible for review for validation of usefulness/relevance,
        // but for now, we sum them for the threshold check (or rely on explicit feedback primarily).
        // Let's rely strictly on EXPLICIT feedback for true review eligibility of usefulness/relevance.
        const effectiveCount = feedbackDimension !== 'NONE' ? explicitCount : explicitCount + behavioralCount;

        const sampleStatus = effectiveCount >= this.OPERATIONAL_REVIEW_THRESHOLD 
            ? 'ELIGIBLE_FOR_REVIEW' 
            : 'INSUFFICIENT_DATA';

        return {
            recipeSnapshotId,
            domain,
            actionType,
            feedbackDimension,
            explicitFeedbackCount: explicitCount,
            behavioralEventCount: behavioralCount,
            sampleStatus
        };
    }
}
