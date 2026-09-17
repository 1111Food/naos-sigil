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
        const sameAnimal = !!payload.sameAnimal;
        const sameElement = !!payload.sameElement;
        
        const isStructural = signal.temporalScope === 'STRUCTURAL';

        const mappedDomains = this.evaluateRules(animal, isStructural, sameAnimal, sameElement);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(signal, mapping.domain, mapping.relevance, mapping.isPersonalized || isStructural));
        }

        return evidence;
    }

    private static evaluateRules(animal: string, isStructural: boolean, sameAnimal: boolean, sameElement: boolean): { domain: CanonicalDomain; relevance: DomainRelevanceClass; isPersonalized: boolean }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass; isPersonalized: boolean }[] = [];
        
        const topRelevance: DomainRelevanceClass = isStructural ? 'CONTEXTUAL' : 'PRIMARY';

        // Generic rules
        switch (animal) {
            case 'dragon':
            case 'tiger':
            case 'horse':
                results.push({ domain: 'ACTION_INITIATIVE', relevance: topRelevance, isPersonalized: false });
                break;
            case 'rabbit':
            case 'sheep':
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: topRelevance, isPersonalized: false });
                break;
            case 'rat':
            case 'monkey':
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance, isPersonalized: false });
                break;
        }

        // Relational features
        if (sameAnimal) {
            // Ben Ming Nian (Zodiac year of birth)
            results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: 'PRIMARY', isPersonalized: true });
        }
        
        if (sameElement) {
            // Element resonance
            results.push({ domain: 'BODY_REGULATION', relevance: 'SECONDARY', isPersonalized: true });
        }

        const unique = new Map<string, { relevance: DomainRelevanceClass, isPersonalized: boolean }>();
        const rank = { 'PRIMARY': 3, 'SECONDARY': 2, 'CONTEXTUAL': 1 };
        
        for (const res of results) {
            const key = `${res.domain}::${res.isPersonalized}`;
            const existing = unique.get(key);
            if (!existing || rank[res.relevance] > rank[existing.relevance]) {
                unique.set(key, res);
            }
        }

        return Array.from(unique.entries()).map(([key, val]) => {
            const domain = key.split('::')[0] as CanonicalDomain;
            return { domain, relevance: val.relevance, isPersonalized: val.isPersonalized };
        });
    }

    private static createEvidence(signal: NaosSignal, domain: CanonicalDomain, relevance: DomainRelevanceClass, isPersonalized: boolean): DomainEvidence {
        const sourceKind: SourceKind = signal.temporalScope === 'STRUCTURAL' ? 'STRUCTURAL_BACKGROUND' : 'SYMBOLIC_SIGNAL';
        
        const hashInput = `${domain}|${relevance}|${signal.id}|${isPersonalized}|${this.METHODOLOGY}`;
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
            evidenceSpecificity: isPersonalized ? 'PERSONALIZED' : 'GENERIC',
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'CHINESE_V1_ANIMAL_MAPPING'
            }
        };
    }
}
