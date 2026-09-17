import { DomainEvidence } from '../../domainProjection/types';

export interface IndependentEvidenceUnit {
    key: string;
    sourceSystem: string;
    sourceId: string;
    domain: string;
    relevanceClass: string;
    direction: string;
    temporalScope: string;
    evidenceSpecificity: 'GENERIC' | 'PERSONALIZED';
    sourceKind: string;
}

/**
 * Groups raw DomainEvidence into Independent Evidence Units using `${sourceSystem}:${sourceId}`.
 * Subsumes GENERIC if PERSONALIZED exists within the exact same group, avoiding double counting.
 */
export function groupIndependentUnits(evidence: DomainEvidence[]): IndependentEvidenceUnit[] {
    const map = new Map<string, DomainEvidence[]>();

    for (const ev of evidence) {
        const key = `${ev.sourceSystem}:${ev.sourceId}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev);
    }

    const units: IndependentEvidenceUnit[] = [];

    for (const [key, group] of map.entries()) {
        // Find if any personalized exists. If so, it refines the unit.
        const personalized = group.find(e => e.evidenceSpecificity === 'PERSONALIZED');
        const representative = personalized || group[0];

        // We assume the whole group shares domain, sourceSystem, sourceId, sourceKind.
        // If direction conflicts exist within the exact same sourceId, we trust the personalized one.
        units.push({
            key,
            sourceSystem: representative.sourceSystem,
            sourceId: representative.sourceId,
            domain: representative.domain,
            relevanceClass: representative.relevanceClass,
            direction: representative.direction,
            temporalScope: representative.temporalScope,
            evidenceSpecificity: representative.evidenceSpecificity,
            sourceKind: representative.sourceKind
        });
    }

    return units;
}
