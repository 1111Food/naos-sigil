// CORE_RECIPE_SECRET (DOMAIN_AGGREGATION_V1)
// Do not expose these coefficients to clients, telemetry, or public APIs.
// These are DESIGNED_V1 values, not empirically calibrated.

import { DomainRelevanceClass } from '../../domainProjection/types';

export const RELEVANCE_MODIFIERS: Record<DomainRelevanceClass, number> = {
    PRIMARY: 1.0,
    SECONDARY: 0.5,
    CONTEXTUAL: 0.2
};

export const SPECIFICITY_MODIFIERS = {
    PERSONALIZED: 1.5,
    GENERIC: 1.0
};

export const TEMPORAL_MODIFIERS: Record<string, number> = {
    TRANSIT: 1.0,
    DAILY: 1.0,
    MONTHLY: 0.8,
    ANNUAL: 0.5,
    STRUCTURAL: 1.0 // Used independently for structuralResonance
};

// Returns a capped sum (diminishing returns) for a system's combined mass.
// Limit is max possible strength contribution per system.
// With SYSTEM_CAP = 0.4 and K = 2.0:
// mass=0 -> 0.0
// mass=1 -> 0.34
// mass=2 -> 0.39
// mass=3 -> 0.399
export const SYSTEM_CAP = 0.4;
export const SYSTEM_K = 2.0;

export function applySystemSaturation(rawMass: number): number {
    if (rawMass <= 0) return 0;
    return SYSTEM_CAP * (1 - Math.exp(-SYSTEM_K * rawMass));
}

export function calculateLogisticStrength(totalMass: number): number {
    // Scales total positive + negative mass into a bounded [0, 1] curve
    // E.g., global K=2.0. If we have 3 fully saturated systems (3 * 0.4 = 1.2):
    // 1 - exp(-2.0 * 1.2) = 1 - 0.09 = 0.91 (Very High)
    if (totalMass <= 0) return 0;
    return 1 - Math.exp(-2.0 * totalMass);
}
