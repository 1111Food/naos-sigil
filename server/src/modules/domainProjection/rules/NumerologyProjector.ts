import { CanonicalDomain, DomainEvidence, SourceKind, DomainRelevanceClass } from '../types';
import { NaosSignal } from '../../signalEngine/models/NaosSignal';
import * as crypto from 'crypto';

export class NumerologyProjector {
    static readonly METHODOLOGY = 'DOMAIN_PROJECTION_V1';

    static project(signal: NaosSignal): DomainEvidence[] {
        if (signal.signalType !== 'NUMEROLOGY') return [];

        const evidence: DomainEvidence[] = [];
        const payload = signal.payload as any;
        const value = payload.value as number;
        
        // Differentiate universal vs personal for relevance rank
        const isPersonal = payload.cycleNature === 'PERSONAL';

        const mappedDomains = this.evaluateRules(value, isPersonal);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(signal, mapping.domain, mapping.relevance));
        }

        return evidence;
    }

    private static evaluateRules(value: number, isPersonal: boolean): { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] = [];
        const topRelevance: DomainRelevanceClass = isPersonal ? 'PRIMARY' : 'SECONDARY';
        const subRelevance: DomainRelevanceClass = isPersonal ? 'SECONDARY' : 'CONTEXTUAL';

        switch (value) {
            case 1:
                results.push({ domain: 'ACTION_INITIATIVE', relevance: topRelevance });
                break;
            case 2:
            case 11:
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: topRelevance });
                break;
            case 3:
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: topRelevance });
                break;
            case 4:
            case 22:
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance });
                results.push({ domain: 'BODY_REGULATION', relevance: subRelevance }); // Structure/routine
                break;
            case 5:
                results.push({ domain: 'ACTION_INITIATIVE', relevance: subRelevance });
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: subRelevance });
                break;
            case 6:
            case 33:
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: topRelevance });
                break;
            case 7:
                results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: topRelevance });
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: subRelevance }); // Deep study
                break;
            case 8:
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance });
                break;
            case 9:
                results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: subRelevance }); // Endings, integration
                break;
        }

        return results;
    }

    private static createEvidence(signal: NaosSignal, domain: CanonicalDomain, relevance: DomainRelevanceClass): DomainEvidence {
        const sourceKind: SourceKind = signal.temporalScope === 'STRUCTURAL' ? 'STRUCTURAL_BACKGROUND' : 'SYMBOLIC_SIGNAL';
        
        const hashInput = `${domain}|${relevance}|${signal.id}|${this.METHODOLOGY}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
        
        return {
            id: `EVIDENCE.NUMEROLOGY.${idHash}`,
            domain,
            relevanceClass: relevance,
            sourceKind,
            sourceSystem: 'NUMEROLOGY',
            sourceId: signal.id,
            direction: signal.direction,
            temporalScope: signal.temporalScope,
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'NUM_V1_BASIC_VALUES'
            }
        };
    }
}
