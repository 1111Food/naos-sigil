import { CanonicalDomain, DomainEvidence, SourceKind, DomainRelevanceClass } from '../types';
import { PersonalContextItem } from '../../personalContext/types';
import * as crypto from 'crypto';

export class PersonalContextProjector {
    static readonly METHODOLOGY = 'DOMAIN_PROJECTION_V1';

    static project(item: PersonalContextItem): DomainEvidence[] {
        // Only process reasoning eligible items
        if (!item.reasoningEligible) return [];

        const evidence: DomainEvidence[] = [];
        const mappedDomains = this.evaluateRules(item);

        for (const mapping of mappedDomains) {
            evidence.push(this.createEvidence(item, mapping.domain, mapping.relevance));
        }

        return evidence;
    }

    private static evaluateRules(item: PersonalContextItem): { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] {
        const results: { domain: CanonicalDomain; relevance: DomainRelevanceClass }[] = [];

        // 1. Filter out known non-domain items
        if (item.contextKey.startsWith('profile.')) {
            // Profile metadata (birthDate, etc.) doesn't project directly to life domains
            return results;
        }

        if (item.contextKey.startsWith('coherence.')) {
            // Coherence modifies state but does not activate ACTION, BUSINESS, etc.
            return results;
        }

        if (item.contextKey.startsWith('protocol.')) {
            // V1 protocols are free-text only or numeric status. No domain mapping.
            return results;
        }

        // 2. Structured Domain Tags (Explicit Context)
        // E.g., user explicitly tagged "goal.business"
        if (item.contextKey.startsWith('user_stated.')) {
            // Check for explicit structured taxonomy
            if (item.contextKey === 'user_stated.goal.business') {
                results.push({ domain: 'BUSINESS_EXPANSION', relevance: 'PRIMARY' });
            } else if (item.contextKey === 'user_stated.goal.relationship') {
                results.push({ domain: 'RELATIONSHIPS_LOVE', relevance: 'PRIMARY' });
            } else if (item.contextKey === 'user_stated.goal.health' || item.contextKey === 'user_stated.goal.body') {
                results.push({ domain: 'BODY_REGULATION', relevance: 'PRIMARY' });
            } else if (item.contextKey === 'user_stated.goal.learning') {
                results.push({ domain: 'COMMUNICATION_LEARNING', relevance: 'PRIMARY' });
            }
        }

        return results;
    }

    private static createEvidence(item: PersonalContextItem, domain: CanonicalDomain, relevance: DomainRelevanceClass): DomainEvidence {
        const sourceKind: SourceKind = 'FACTUAL_CONTEXT';
        
        const hashInput = `${domain}|${relevance}|${item.id}|${this.METHODOLOGY}`;
        const idHash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 12);
        
        return {
            id: `EVIDENCE.CONTEXT.${idHash}`,
            domain,
            relevanceClass: relevance,
            sourceKind,
            sourceSystem: 'PERSONAL_CONTEXT',
            sourceId: item.id,
            direction: 'NEUTRAL', // Context facts are neutral vectors by default
            temporalScope: item.freshness === 'LONG_TERM' ? 'STRUCTURAL' : 'DAILY',
            sourceAuthority: item.authorityClass,
            sourceFreshness: item.freshness,
            methodology: this.METHODOLOGY,
            provenance: {
                projectionRuleId: 'CONTEXT_V1_STRUCTURED_TAGS'
            }
        };
    }
}
