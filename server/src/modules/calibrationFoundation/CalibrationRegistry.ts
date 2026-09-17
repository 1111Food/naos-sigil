import { MethodologyRegistryState, MethodologySnapshot } from './types';
import * as crypto from 'crypto';

export class CalibrationRegistry {
    // Current Active Methodologies
    static readonly PROJECTION_METHODOLOGY = 'DOMAIN_PROJECTION_V1';
    static readonly AGGREGATION_METHODOLOGY = 'DOMAIN_AGGREGATION_V1';
    static readonly ROUTING_METHODOLOGY = 'ACTION_ROUTING_V1';
    static readonly CALIBRATION_METHODOLOGY = 'CALIBRATION_FOUNDATION_V1';

    /**
     * Deterministic Snapshot ID of the currently deployed recipe methodology versions.
     * Does NOT serialize secret coefficients.
     */
    static getCurrentRecipeSnapshotId(): string {
        const payload = `${this.PROJECTION_METHODOLOGY}|${this.AGGREGATION_METHODOLOGY}|${this.ROUTING_METHODOLOGY}`;
        return `recipe_bundle_${crypto.createHash('sha256').update(payload).digest('hex').substring(0, 12)}`;
    }

    /**
     * Gets the current immutable snapshot of the active methodology bundle.
     * This snapshot must be embedded in any observation emitted at this time.
     */
    static getCurrentMethodologySnapshot(): MethodologySnapshot {
        return {
            projectionMethodology: this.PROJECTION_METHODOLOGY,
            aggregationMethodology: this.AGGREGATION_METHODOLOGY,
            routingMethodology: this.ROUTING_METHODOLOGY,
            recipeVersionId: this.getCurrentRecipeSnapshotId()
        };
    }

    /**
     * Returns the global registry state, explicitly noting that V1 is DESIGNED and NOT empirically calibrated.
     */
    static getRegistryState(): MethodologyRegistryState {
        return {
            currentProjection: this.PROJECTION_METHODOLOGY,
            currentAggregation: this.AGGREGATION_METHODOLOGY,
            currentRouting: this.ROUTING_METHODOLOGY,
            currentCalibrationFoundation: this.CALIBRATION_METHODOLOGY,
            empiricalStatus: 'NOT_CALIBRATED',
            coefficientStatus: 'DESIGNED_V1',
            recipeSnapshotId: this.getCurrentRecipeSnapshotId()
        };
    }
}
