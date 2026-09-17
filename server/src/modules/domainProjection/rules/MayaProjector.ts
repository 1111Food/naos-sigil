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
        const sameNawal = !!payload.sameNawal;
        const sameTone = !!payload.sameTone;
        
        const isStructural = signal.temporalScope === 'STRUCTURAL';

        const mappedDomains = this.evaluateRules(nawal, isStructural, sameNawal, sameTone);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(signal, mapping.domain, mapping.relevance, mapping.isPersonalized || isStructural));
        }

        return evidence;
    }

    private static evaluateRules(nawal: string, isStructural: boolean, sameNawal: boolean, sameTone: boolean): { domain: CanonicalDomain; relevance: DomainRelevanceClass; isPersonalized: boolean }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass; isPersonalized: boolean }[] = [];
        
        const topRelevance: DomainRelevanceClass = isStructural ? 'CONTEXTUAL' : 'PRIMARY';
        const subRelevance: DomainRelevanceClass = isStructural ? 'CONTEXTUAL' : 'SECONDARY';

        // Generic rules
        switch (nawal) {
            case 'batz': 
                results.push({ domain: 'ACTION_INITIATIVE', relevance: topRelevance, isPersonalized: false });
                break;
            case 'e': 
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: topRelevance, isPersonalized: false });
                results.push({ domain: 'ACTION_INITIATIVE', relevance: subRelevance, isPersonalized: false });
                break;
            case 'iq': 
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: topRelevance, isPersonalized: false });
                break;
            case 'tzikin': 
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: topRelevance, isPersonalized: false });
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: subRelevance, isPersonalized: false });
                break;
            case 'imox': 
                results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: topRelevance, isPersonalized: false });
                break;
            case 'kan': 
                results.push({ domain: 'BODY_REGULATION', relevance: topRelevance, isPersonalized: false });
                break;
        }

        // Relational features add distinct personalized evidence
        if (sameNawal) {
            // When your birth nawal returns, it's a powerful personal reset
            results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: 'PRIMARY', isPersonalized: true });
        }
        
        if (sameTone) {
            // Tone resonance brings physical/energetic harmony
            results.push({ domain: 'BODY_REGULATION', relevance: 'SECONDARY', isPersonalized: true });
        }

        // Deduplicate: same domain + same specificity should collapse
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
        
        // Include isPersonalized in ID to prevent collision between generic and relation evidence
        const hashInput = `${domain}|${relevance}|${signal.id}|${isPersonalized}|${this.METHODOLOGY}`;
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
            evidenceSpecificity: isPersonalized ? 'PERSONALIZED' : 'GENERIC',
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'MAYA_V1_NAWAL_MAPPING'
            }
        };
    }
}
