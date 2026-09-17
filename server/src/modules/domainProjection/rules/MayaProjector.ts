import { CanonicalDomain, DomainEvidence, SourceKind, DomainRelevanceClass } from '../types';
import { NaosSignal } from '../../signalEngine/models/NaosSignal';
import * as crypto from 'crypto';

export class MayaProjector {
    static readonly METHODOLOGY = 'DOMAIN_PROJECTION_V1';

    static project(signal: NaosSignal): DomainEvidence[] {
        if (signal.signalType !== 'MAYA') return [];

        const evidence: DomainEvidence[] = [];
        const payload = signal.payload as any;
        const nawal = (payload.nawal || '').toLowerCase();
        
        // Preserve relation features (e.g., if there's a specific tone relationship or offset)
        // For V1, we'll map the primary nawal, but structural signals are CONTEXTUAL
        const isStructural = signal.temporalScope === 'STRUCTURAL';

        const mappedDomains = this.evaluateRules(nawal, isStructural);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(signal, mapping.domain, mapping.relevance));
        }

        return evidence;
    }

    private static evaluateRules(nawal: string, isStructural: boolean): { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] = [];
        
        // Base relevance: temporal signals are stronger active evidence than structural background
        const topRelevance: DomainRelevanceClass = isStructural ? 'CONTEXTUAL' : 'PRIMARY';
        const subRelevance: DomainRelevanceClass = isStructural ? 'CONTEXTUAL' : 'SECONDARY';

        // Example proprietary rule matrix mapping for Maya Nawales
        switch (nawal) {
            case 'batz': // Monkey/Weaver (Creation, Beginnings)
                results.push({ domain: 'ACTION_INITIATIVE', relevance: topRelevance });
                break;
            case 'e': // Path/Tooth (Journey, Business)
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance });
                results.push({ domain: 'ACTION_INITIATIVE', relevance: subRelevance });
                break;
            case 'atzqab': // Or whatever the canonical keys are, let's map some general ones
            case 'iq': // Wind (Communication)
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: topRelevance });
                break;
            case 'tzikin': // Bird (Vision, Relationships, Wealth)
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: topRelevance });
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: subRelevance });
                break;
            case 'imox': // Crocodile/Water (Emotions, Introspection)
                results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: topRelevance });
                break;
            case 'kan': // Snake (Body, Energy)
                results.push({ domain: 'BODY_REGULATION', relevance: topRelevance });
                break;
            // Add safe fallback for unmapped
        }

        return results;
    }

    private static createEvidence(signal: NaosSignal, domain: CanonicalDomain, relevance: DomainRelevanceClass): DomainEvidence {
        const sourceKind: SourceKind = signal.temporalScope === 'STRUCTURAL' ? 'STRUCTURAL_BACKGROUND' : 'SYMBOLIC_SIGNAL';
        
        const hashInput = `${domain}|${relevance}|${signal.id}|${this.METHODOLOGY}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
        
        return {
            id: `EVIDENCE.MAYA.${idHash}`,
            domain,
            relevanceClass: relevance,
            sourceKind,
            sourceSystem: 'MAYA',
            sourceId: signal.id,
            direction: signal.direction,
            temporalScope: signal.temporalScope,
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'MAYA_V1_NAWAL_MAPPING'
            }
        };
    }
}
