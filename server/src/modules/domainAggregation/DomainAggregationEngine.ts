import { CanonicalDomain, DomainEvidence } from '../domainProjection/types';
import { DomainAggregationInput, InternalDomainState, MeasurementStatus, DominantDirection, ContextualAlignment } from './types';
import { groupIndependentUnits, IndependentEvidenceUnit } from './internal/grouping';
import { ELIGIBILITY_MATRIX } from './internal/eligibility';
import { RELEVANCE_MODIFIERS, SPECIFICITY_MODIFIERS, TEMPORAL_MODIFIERS, applySystemSaturation, calculateLogisticStrength } from './internal/recipe';

export class DomainAggregationEngine {
    static readonly METHODOLOGY = 'DOMAIN_AGGREGATION_V1';

    static aggregate(domain: CanonicalDomain, input: DomainAggregationInput): InternalDomainState {
        // 1. Validation & Filter by domain
        const domainEvidence = input.evidence.filter(e => e.domain === domain);
        const symbolicEvidence = domainEvidence.filter(e => e.sourceKind !== 'FACTUAL_CONTEXT');
        const factualContext = domainEvidence.filter(e => e.sourceKind === 'FACTUAL_CONTEXT');

        // 2. Correlation Grouping & Specificity Reconciliation
        const independentUnits = groupIndependentUnits(symbolicEvidence);

        // 3. Split Structural vs Temporal
        const structuralUnits = independentUnits.filter(u => u.temporalScope === 'STRUCTURAL');
        const temporalUnits = independentUnits.filter(u => u.temporalScope !== 'STRUCTURAL');

        // 4. Calculate Raw Contribution per System (Temporal)
        const sysTemporalAct = new Map<string, number>();
        const sysTemporalPos = new Map<string, number>();
        const sysTemporalNeg = new Map<string, number>();
        const sysTemporalAmb = new Map<string, number>();

        const addSystemMass = (map: Map<string, number>, sys: string, mass: number) => {
            map.set(sys, (map.get(sys) || 0) + mass);
        };

        const representedSystems = new Set<string>();
        const allIndependentSystems = new Set<string>(); // Temporal + Structural
        let directionalUnitCount = 0; 

        for (const unit of independentUnits) {
            allIndependentSystems.add(unit.sourceSystem);
        }

        for (const unit of temporalUnits) {
            representedSystems.add(unit.sourceSystem);
            
            const relMod = RELEVANCE_MODIFIERS[unit.relevanceClass as keyof typeof RELEVANCE_MODIFIERS] || 0.5;
            const specMod = SPECIFICITY_MODIFIERS[unit.evidenceSpecificity] || 1.0;
            const tempMod = TEMPORAL_MODIFIERS[unit.temporalScope] || 1.0;
            const unitMass = relMod * specMod * tempMod;
            
            addSystemMass(sysTemporalAct, unit.sourceSystem, unitMass);

            if (unit.direction === 'SUPPORTIVE') {
                addSystemMass(sysTemporalPos, unit.sourceSystem, unitMass);
                directionalUnitCount++;
            } else if (unit.direction === 'CHALLENGING') {
                addSystemMass(sysTemporalNeg, unit.sourceSystem, unitMass);
                directionalUnitCount++;
            } else if (unit.direction === 'MIXED') {
                addSystemMass(sysTemporalAmb, unit.sourceSystem, unitMass);
            }
        }

        // Apply System Saturation and Aggregate
        let totalAct = 0, totalPos = 0, totalNeg = 0, totalAmb = 0;

        for (const sys of representedSystems) {
            totalAct += applySystemSaturation(sysTemporalAct.get(sys) || 0);
            totalPos += applySystemSaturation(sysTemporalPos.get(sys) || 0);
            totalNeg += applySystemSaturation(sysTemporalNeg.get(sys) || 0);
            totalAmb += applySystemSaturation(sysTemporalAmb.get(sys) || 0);
        }

        // 5. Strength (Temporal)
        const strength = calculateLogisticStrength(totalAct);

        // 6. Structural Resonance
        const sysStructAct = new Map<string, number>();
        for (const unit of structuralUnits) {
            const relMod = RELEVANCE_MODIFIERS[unit.relevanceClass as keyof typeof RELEVANCE_MODIFIERS] || 0.5;
            const specMod = SPECIFICITY_MODIFIERS[unit.evidenceSpecificity] || 1.0;
            const tempMod = TEMPORAL_MODIFIERS.STRUCTURAL || 1.0;
            addSystemMass(sysStructAct, unit.sourceSystem, relMod * specMod * tempMod);
        }
        let totalStructAct = 0;
        for (const sys of sysStructAct.keys()) {
            totalStructAct += applySystemSaturation(sysStructAct.get(sys)!);
        }
        const structuralResonance = calculateLogisticStrength(totalStructAct);

        // 7. Coverage and Availability
        const eligibleSystems = ELIGIBILITY_MATRIX[domain] || [];
        const eligibleCount = eligibleSystems.length;

        let availableEligibleCount = 0;
        let representedEligibleCount = 0;

        for (const sys of eligibleSystems) {
            if (input.systemAvailability[sys] === 'AVAILABLE') {
                availableEligibleCount++;
                if (allIndependentSystems.has(sys)) {
                    representedEligibleCount++;
                }
            }
        }

        const sourceAvailability = eligibleCount > 0 ? (availableEligibleCount / eligibleCount) : 0;
        const evidenceCoverage = availableEligibleCount > 0 ? (representedEligibleCount / availableEligibleCount) : 0;

        // 8. Directional Convergence, Tension, and Ambiguity
        let convergence = { value: 0, status: 'NOT_APPLICABLE' as MeasurementStatus };
        let tension = { value: 0, status: 'NOT_APPLICABLE' as MeasurementStatus };
        let ambiguity = { value: 0, status: 'NOT_APPLICABLE' as MeasurementStatus };

        if (temporalUnits.length > 0) {
            ambiguity = { value: calculateLogisticStrength(totalAmb), status: 'VALID' };
        }

        if (directionalUnitCount >= 2 && (totalPos + totalNeg) > 0) {
            convergence = { value: Math.abs(totalPos - totalNeg) / (totalPos + totalNeg), status: 'VALID' };
            tension = { value: Math.min(totalPos, totalNeg) / Math.max(totalPos, totalNeg), status: 'VALID' };
        } else if (temporalUnits.length > 0) {
            convergence = { value: 0, status: 'INSUFFICIENT_EVIDENCE' };
            tension = { value: 0, status: 'INSUFFICIENT_EVIDENCE' };
        }

        // 9. Dominant Direction
        let dominantDirection: DominantDirection = 'UNDETERMINED';
        if (temporalUnits.length > 0) {
            if (totalAmb > totalPos && totalAmb > totalNeg) dominantDirection = 'MIXED';
            else if (totalPos > totalNeg * 1.2) dominantDirection = 'SUPPORTIVE';
            else if (totalNeg > totalPos * 1.2) dominantDirection = 'CHALLENGING';
            else if (totalPos > 0 && totalNeg > 0) dominantDirection = 'MIXED';
            else dominantDirection = 'NEUTRAL';
        } else if (structuralUnits.length > 0) {
            // Fallback to structural
            const sample = structuralUnits[0].direction as DominantDirection;
            dominantDirection = ['SUPPORTIVE', 'CHALLENGING', 'MIXED', 'NEUTRAL'].includes(sample) ? sample : 'UNDETERMINED';
        }

        // 10. Contextual Alignment
        const contextualAlignment: ContextualAlignment = factualContext.length > 0 ? 'PRESENT' : 'NONE';
        const projectionMethodologies = Array.from(new Set(input.evidence.map(e => e.methodology))).sort();

        return {
            domain, strength, structuralResonance,
            evidenceCoverage, sourceAvailability,
            directionalConvergence: convergence, tension, ambiguity,
            dominantDirection, contextualAlignment,
            evidenceCount: domainEvidence.length,
            independentSourceCount: independentUnits.length,
            representedSystemCount: allIndependentSystems.size,
            methodology: DomainAggregationEngine.METHODOLOGY,
            projectionMethodologies
        };
    }
}
