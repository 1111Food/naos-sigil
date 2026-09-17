import { CanonicalDomain, DomainEvidence, SourceKind, DomainRelevanceClass } from '../types';
import { NaosSignal } from '../../signalEngine/models/NaosSignal';
import * as crypto from 'crypto';

export class AstrologyProjector {
    static readonly METHODOLOGY = 'DOMAIN_PROJECTION_V1';

    static project(signal: NaosSignal): DomainEvidence[] {
        if (signal.signalType !== 'ASTROLOGY') return [];

        const evidence: DomainEvidence[] = [];
        const payload = signal.payload as any;
        const transit = payload.transitPlanet || payload.planet || '';
        const target = payload.natalTarget || '';

        // Example proprietary rule mapping (Backend Only)
        // We evaluate transit and target to generate deterministic evidence
        const mappedDomains = this.evaluateRules(transit, target);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(signal, mapping.domain, mapping.relevance));
        }

        return evidence;
    }

    private static evaluateRules(transit: string, target: string): { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] = [];
        const bodies = [transit.toLowerCase(), target.toLowerCase()].filter(Boolean);

        // Core Recipe - V1 (Server-side deterministic mapping)
        if (bodies.includes('mars')) {
            results.push({ domain: 'ACTION_INITIATIVE', relevance: 'PRIMARY' });
        }
        if (bodies.includes('venus')) {
            results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: 'PRIMARY' });
        }
        if (bodies.includes('mercury')) {
            results.push({ domain: 'COMMUNICATION_LEARNING', relevance: 'PRIMARY' });
            results.push({ domain: 'BUSINESS_EXPANSION', relevance: 'SECONDARY' });
        }
        if (bodies.includes('jupiter')) {
            results.push({ domain: 'BUSINESS_EXPANSION', relevance: 'PRIMARY' });
        }
        if (bodies.includes('saturn')) {
            results.push({ domain: 'BUSINESS_EXPANSION', relevance: 'SECONDARY' });
        }
        if (bodies.includes('moon')) {
            results.push({ domain: 'INTROSPECTION_RECOVERY', relevance: 'PRIMARY' });
            results.push({ domain: 'BODY_REGULATION', relevance: 'SECONDARY' });
        }
        
        // Deduplicate by domain keeping highest relevance
        const unique = new Map<CanonicalDomain, DomainRelevanceClass>();
        const rank = { 'PRIMARY': 3, 'SECONDARY': 2, 'CONTEXTUAL': 1 };
        
        for (const res of results) {
            const existing = unique.get(res.domain);
            if (!existing || rank[res.relevance] > rank[existing]) {
                unique.set(res.domain, res.relevance);
            }
        }

        return Array.from(unique.entries()).map(([domain, relevance]) => ({ domain, relevance }));
    }

    private static createEvidence(signal: NaosSignal, domain: CanonicalDomain, relevance: DomainRelevanceClass): DomainEvidence {
        const sourceKind: SourceKind = signal.temporalScope === 'STRUCTURAL' ? 'STRUCTURAL_BACKGROUND' : 'SYMBOLIC_SIGNAL';
        
        // Deterministic ID
        const hashInput = `${domain}|${relevance}|${signal.id}|${this.METHODOLOGY}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
        
        return {
            id: `EVIDENCE.ASTROLOGY.${idHash}`,
            domain,
            relevanceClass: relevance,
            sourceKind,
            sourceSystem: 'ASTROLOGY',
            sourceId: signal.id,
            direction: signal.direction,
            temporalScope: signal.temporalScope,
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'ASTRO_V1_BASIC_BODIES' // Internal only
            }
        };
    }
}
