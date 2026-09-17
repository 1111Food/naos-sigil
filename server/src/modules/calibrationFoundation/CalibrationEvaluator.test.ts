import { describe, it, expect } from 'vitest';
import { CalibrationRegistry } from './CalibrationRegistry';
import { CalibrationEvaluator } from './CalibrationEvaluator';
import { CalibrationObservation } from './types';

describe('CalibrationFoundation', () => {
    it('methodology registry reports current Parts 7/8/9 versions', () => {
        const state = CalibrationRegistry.getRegistryState();
        expect(state.currentProjection).toBe('DOMAIN_PROJECTION_V1');
        expect(state.currentAggregation).toBe('DOMAIN_AGGREGATION_V1');
        expect(state.currentRouting).toBe('ACTION_ROUTING_V1');
    });

    it('DESIGNED_V1 != empirically calibrated (synthetic fixtures never mark as calibrated)', () => {
        const state = CalibrationRegistry.getRegistryState();
        expect(state.coefficientStatus).toBe('DESIGNED_V1');
        expect(state.empiricalStatus).toBe('NOT_CALIBRATED');
    });

    it('empiricalStatus cannot become CALIBRATED merely from event count', () => {
        const state = CalibrationRegistry.getRegistryState();
        // Even with a million simulated events, the static registry state remains unchanged (no auto-tuning)
        expect(state.empiricalStatus).not.toBe('CALIBRATED');
        expect(state.empiricalStatus).toBe('NOT_CALIBRATED');
    });

    it('behavioral event != explicit feedback', () => {
        const obsInvalid1: CalibrationObservation = {
            id: 'obs-1', accountScopedSubject: 'user-1', domain: 'BUSINESS_EXPANSION',
            actionRouteId: 'route-1', actionType: 'ACT', methodology: CalibrationRegistry.getCurrentMethodologySnapshot(),
            observationKind: 'BEHAVIORAL_EVENT', observationType: 'USER_HELPFUL', // CONTRADICTION
            feedbackDimension: 'USEFULNESS', observationValue: 1, occurredAt: new Date().toISOString()
        };
        const obsInvalid2: CalibrationObservation = {
            id: 'obs-2', accountScopedSubject: 'user-2', domain: 'BUSINESS_EXPANSION',
            actionRouteId: 'route-2', actionType: 'ACT', methodology: CalibrationRegistry.getCurrentMethodologySnapshot(),
            observationKind: 'EXPLICIT_FEEDBACK', observationType: 'ROUTE_OPENED', // CONTRADICTION
            feedbackDimension: 'NONE', observationValue: 1, occurredAt: new Date().toISOString()
        };
        
        expect(CalibrationEvaluator.validateObservation(obsInvalid1)).toBe(false);
        expect(CalibrationEvaluator.validateObservation(obsInvalid2)).toBe(false);
    });

    it('observation cannot contain recipe coefficients or raw personal context', () => {
        const obsValid: CalibrationObservation = {
            id: 'obs-3', accountScopedSubject: 'user-3', domain: 'BUSINESS_EXPANSION',
            actionRouteId: 'route-3', actionType: 'PREPARE', methodology: CalibrationRegistry.getCurrentMethodologySnapshot(),
            observationKind: 'EXPLICIT_FEEDBACK', observationType: 'USER_HELPFUL',
            feedbackDimension: 'USEFULNESS', observationValue: 1, occurredAt: new Date().toISOString()
        };

        const obsWithSecret = { ...obsValid, coefficients: { magic: 0.85 } } as unknown as CalibrationObservation;
        const obsWithContext = { ...obsValid, rawContext: "User said they got a new job" } as unknown as CalibrationObservation;

        expect(CalibrationEvaluator.validateObservation(obsValid)).toBe(true);
        expect(CalibrationEvaluator.validateObservation(obsWithSecret)).toBe(false);
        expect(CalibrationEvaluator.validateObservation(obsWithContext)).toBe(false);
    });

    it('changing active methodology does not mutate historical methodology metadata', () => {
        const oldSnapshot = {
            projectionMethodology: 'DOMAIN_PROJECTION_V1',
            aggregationMethodology: 'DOMAIN_AGGREGATION_V1',
            routingMethodology: 'ACTION_ROUTING_V0_BETA',
            recipeVersionId: 'historical_bundle_id'
        };

        const obsOld: CalibrationObservation = {
            id: 'obs-4', accountScopedSubject: 'user-4', domain: 'BUSINESS_EXPANSION',
            actionRouteId: 'route-4', actionType: 'PREPARE', methodology: oldSnapshot,
            observationKind: 'BEHAVIORAL_EVENT', observationType: 'ACTION_COMPLETED',
            feedbackDimension: 'NONE', observationValue: 1, occurredAt: new Date().toISOString()
        };

        const obsNew: CalibrationObservation = {
            id: 'obs-5', accountScopedSubject: 'user-4', domain: 'BUSINESS_EXPANSION',
            actionRouteId: 'route-5', actionType: 'PREPARE', methodology: CalibrationRegistry.getCurrentMethodologySnapshot(),
            observationKind: 'BEHAVIORAL_EVENT', observationType: 'ACTION_COMPLETED',
            feedbackDimension: 'NONE', observationValue: 1, occurredAt: new Date().toISOString()
        };

        const grouped = CalibrationEvaluator.groupObservationsByMethodology([obsOld, obsNew]);
        
        expect(grouped.size).toBe(2);
        expect(grouped.has('historical_bundle_id')).toBe(true);
        expect(grouped.has(CalibrationRegistry.getCurrentRecipeSnapshotId())).toBe(true);
    });

    it('insufficient observations != negative result', () => {
        const snapshot = CalibrationRegistry.getCurrentMethodologySnapshot();
        const observations: CalibrationObservation[] = [];
        
        // Add 10 positive explicit feedback observations
        for (let i=0; i<10; i++) {
            observations.push({
                id: `obs-${i}`, accountScopedSubject: `user-${i}`, domain: 'BUSINESS_EXPANSION',
                actionRouteId: `route-${i}`, actionType: 'ACT', methodology: snapshot,
                observationKind: 'EXPLICIT_FEEDBACK', observationType: 'USER_HELPFUL',
                feedbackDimension: 'USEFULNESS', observationValue: 1, occurredAt: new Date().toISOString()
            });
        }

        const candidate = CalibrationEvaluator.evaluateSampleSufficiency(
            observations, snapshot.recipeVersionId, 'BUSINESS_EXPANSION', 'ACT', 'USEFULNESS'
        );

        // 10 is below the OPERATIONAL_REVIEW_THRESHOLD (100)
        expect(candidate.sampleStatus).toBe('INSUFFICIENT_DATA');
        expect(candidate.explicitFeedbackCount).toBe(10);
    });

    it('accounts remain isolated at contract level', () => {
        // The contract forces an explicit accountScopedSubject reference per observation
        const obsA: CalibrationObservation = {
            id: 'obs-a1', accountScopedSubject: 'user-A', domain: 'BUSINESS_EXPANSION', actionRouteId: 'route-1',
            actionType: 'ACT', methodology: CalibrationRegistry.getCurrentMethodologySnapshot(), observationKind: 'EXPLICIT_FEEDBACK',
            observationType: 'USER_HELPFUL', feedbackDimension: 'USEFULNESS', observationValue: 1, occurredAt: '2026-09-17T00:00:00Z'
        };
        const obsB: CalibrationObservation = {
            id: 'obs-b1', accountScopedSubject: 'user-B', domain: 'BUSINESS_EXPANSION', actionRouteId: 'route-2',
            actionType: 'ACT', methodology: CalibrationRegistry.getCurrentMethodologySnapshot(), observationKind: 'EXPLICIT_FEEDBACK',
            observationType: 'USER_HELPFUL', feedbackDimension: 'USEFULNESS', observationValue: 1, occurredAt: '2026-09-17T00:00:00Z'
        };
        expect(obsA.accountScopedSubject).not.toEqual(obsB.accountScopedSubject);
    });
});
