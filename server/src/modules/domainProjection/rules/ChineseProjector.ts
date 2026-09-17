import { CanonicalDomain, DomainEvidence, SourceKind, DomainRelevanceClass } from '../types';
import { NaosSignal } from '../../signalEngine/models/NaosSignal';
import * as crypto from 'crypto';

export class ChineseProjector {
    static readonly METHODOLOGY = 'DOMAIN_PROJECTION_V1';

    static project(signal: NaosSignal): DomainEvidence[] {
        if (signal.signalType !== 'CHINESE') return [];

        const evidence: DomainEvidence[] = [];
        const payload = signal.payload as any;
        const animal = (payload.animal || '').toLowerCase();
        
        const isStructural = signal.temporalScope === 'STRUCTURAL';
        const mappedDomains = this.evaluateRules(animal, isStructural);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(signal, mapping.domain, mapping.relevance));
        }

        return evidence;
    }

    private static evaluateRules(animal: string, isStructural: boolean): { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] = [];
        const topRelevance: DomainRelevanceClass = isStructural ? 'CONTEXTUAL' : 'PRIMARY';
        
        switch (animal) {
            case 'rat':
            case 'dragon':
            case 'monkey':
                // Action / Business cluster
                results.push({ domain: 'ACTION_INITIATIVE', relevance: topRelevance });
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance });
                break;
            case 'ox':
            case 'snake':
            case 'rooster':
                // Structure / Introspection / Detail
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance });
                results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: 'SECONDARY' });
                break;
            case 'tiger':
            case 'horse':
            case 'dog':
                // Action / Communication / Social
                results.push({ domain: 'ACTION_INITIATIVE', relevance: topRelevance });
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: topRelevance });
                break;
            case 'rabbit':
            case 'goat':
            case 'pig':
                // Relationships / Regulation
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: topRelevance });
                results.push({ domain: 'BODY_REGULATION', relevance: 'SECONDARY' });
                break;
        }

        return results;
    }

    private static createEvidence(signal: NaosSignal, domain: CanonicalDomain, relevance: DomainRelevanceClass): DomainEvidence {
        const sourceKind: SourceKind = signal.temporalScope === 'STRUCTURAL' ? 'STRUCTURAL_BACKGROUND' : 'SYMBOLIC_SIGNAL';
        
        const hashInput = `${domain}|${relevance}|${signal.id}|${this.METHODOLOGY}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
        
        return {
            id: `EVIDENCE.CHINESE.${idHash}`,
            domain,
            relevanceClass: relevance,
            sourceKind,
            sourceSystem: 'CHINESE',
            sourceId: signal.id,
            direction: signal.direction,
            temporalScope: signal.temporalScope,
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'CHINESE_V1_ANIMAL_MAPPING'
            }
        };
    }
}
