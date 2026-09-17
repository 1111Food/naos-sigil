import { describe, it, expect } from 'vitest';
import { DomainProjectionEngine } from './DomainProjectionEngine';
import { NaosSignal } from '../signalEngine/models/NaosSignal';
import { PersonalContextItem, PersonalContextSnapshot } from '../personalContext/types';

describe('DomainProjectionEngine (Phase 7.1)', () => {
    
    // Helper to create basic signal
    const makeAstroSignal = (id: string, transit: string, target: string, direction: any = 'SUPPORTIVE', scope: any = 'TRANSIT'): NaosSignal => ({
        id,
        signalType: 'ASTROLOGY',
        subject: 'ACCOUNT_OWNER',
        timestamp: '2026-09-17',
        temporalScope: scope,
        direction,
        intensity: 0.9,
        specificity: null,
        provenance: { engine: 'Test', methodologyId: 'V1', calculatedAt: '2026', inputs: {} },
        payload: { transitPlanet: transit, natalTarget: target }
    });

    const makeNumSignal = (id: string, value: number, isPersonal: boolean): NaosSignal => ({
        id,
        signalType: 'NUMEROLOGY',
        subject: 'ACCOUNT_OWNER',
        timestamp: '2026-09-17',
        temporalScope: 'DAILY',
        direction: 'NEUTRAL',
        intensity: null,
        specificity: null,
        provenance: { engine: 'Test', methodologyId: 'V1', calculatedAt: '2026', inputs: {} },
        payload: { cycleNature: isPersonal ? 'PERSONAL' : 'UNIVERSAL', value }
    });

    it('1. Six domain enum only', () => {
        const signal = makeAstroSignal('sig1', 'Mars', 'Sun');
        const evidence = DomainProjectionEngine.project([signal]);
        expect(evidence.some(e => e.domain === 'ACTION_INITIATIVE')).toBe(true);
        
        const invalidDomain = evidence.some(e => !['ACTION_INITIATIVE', 'RELATIONSHIPS_LOVE', 'BUSINESS_EXPANSION', 'COMMUNICATION_LEARNING', 'BODY_REGULATION', 'INTROSPECTION_RECOVERY'].includes(e.domain));
        expect(invalidDomain).toBe(false);
    });

    it('2. One signal -> zero domains', () => {
        // Pluto is unmapped in V1 basic rules
        const signal = makeAstroSignal('sig1', 'Pluto', 'Pluto');
        const evidence = DomainProjectionEngine.project([signal]);
        expect(evidence.length).toBe(0);
    });

    it('3. One signal -> one domain', () => {
        const signal = makeAstroSignal('sig1', 'Mars', 'Pluto');
        const evidence = DomainProjectionEngine.project([signal]);
        expect(evidence.length).toBe(1);
        expect(evidence[0].domain).toBe('ACTION_INITIATIVE');
    });

    it('4. One signal -> multiple domains', () => {
        const signal = makeAstroSignal('sig1', 'Mercury', 'Moon'); // Mercury = Comm/Bus, Moon = Intro/Body
        const evidence = DomainProjectionEngine.project([signal]);
        expect(evidence.length).toBeGreaterThan(1);
        expect(evidence.map(e => e.domain)).toContain('COMMUNICATION_LEARNING');
        expect(evidence.map(e => e.domain)).toContain('INTROSPECTION_RECOVERY');
    });

    it('5. Relevance classes without numeric scores', () => {
        const signal = makeNumSignal('sig1', 1, true);
        const evidence = DomainProjectionEngine.project([signal]);
        expect(evidence[0].relevanceClass).toBe('PRIMARY');
        expect((evidence[0] as any).score).toBeUndefined();
        expect((evidence[0] as any).weight).toBeUndefined();
    });

    it('6. Supportive vs challenging preserves same domain relevance', () => {
        const s1 = makeAstroSignal('s1', 'Venus', 'Sun', 'SUPPORTIVE');
        const s2 = makeAstroSignal('s2', 'Venus', 'Sun', 'CHALLENGING');
        
        const ev1 = DomainProjectionEngine.project([s1]);
        const ev2 = DomainProjectionEngine.project([s2]);
        
        expect(ev1[0].domain).toBe(ev2[0].domain);
        expect(ev1[0].relevanceClass).toBe(ev2[0].relevanceClass);
        expect(ev1[0].direction).toBe('SUPPORTIVE');
        expect(ev2[0].direction).toBe('CHALLENGING');
    });

    it('7. Source temporal scope preserved & Structural evidence separation', () => {
        const s1 = makeAstroSignal('s1', 'Mars', 'Sun', 'NEUTRAL', 'STRUCTURAL');
        const ev1 = DomainProjectionEngine.project([s1]);
        
        expect(ev1[0].temporalScope).toBe('STRUCTURAL');
        expect(ev1[0].sourceKind).toBe('STRUCTURAL_BACKGROUND');
        
        const s2 = makeAstroSignal('s2', 'Mars', 'Sun', 'NEUTRAL', 'TRANSIT');
        const ev2 = DomainProjectionEngine.project([s2]);
        expect(ev2[0].temporalScope).toBe('TRANSIT');
        expect(ev2[0].sourceKind).toBe('SYMBOLIC_SIGNAL');
    });

    it('8. Source-order independence and deterministic IDs', () => {
        const s1 = makeAstroSignal('s1', 'Mars', 'Sun');
        const s2 = makeAstroSignal('s2', 'Venus', 'Moon');
        
        const out1 = DomainProjectionEngine.project([s1, s2]);
        const out2 = DomainProjectionEngine.project([s2, s1]);
        
        expect(out1).toEqual(out2); // Both are sorted deterministically
    });

    it('9. Maya relation-feature projection', () => {
        const signal: NaosSignal = {
            id: 'm1', signalType: 'MAYA', subject: 'ACCOUNT_OWNER', timestamp: '2026',
            temporalScope: 'DAILY', direction: 'NEUTRAL', intensity: null, specificity: null, provenance: {} as any,
            payload: { nawal: 'e', tone: 5 }
        };
        const ev = DomainProjectionEngine.project([signal]);
        expect(ev.map(e => e.domain)).toContain('BUSINESS_EXPANSION');
        expect(ev.every(e => e.sourceSystem === 'MAYA')).toBe(true);
    });

    it('10. Chinese relation-feature projection', () => {
        const signal: NaosSignal = {
            id: 'c1', signalType: 'CHINESE', subject: 'ACCOUNT_OWNER', timestamp: '2026',
            temporalScope: 'ANNUAL', direction: 'NEUTRAL', intensity: null, specificity: null, provenance: {} as any,
            payload: { animal: 'rat', element: 'wood' }
        };
        const ev = DomainProjectionEngine.project([signal]);
        expect(ev.map(e => e.domain)).toContain('BUSINESS_EXPANSION');
        expect(ev.map(e => e.domain)).toContain('ACTION_INITIATIVE');
    });

    it('11. Contextual rules (Profile, Protocol, Coherence = zero evidence)', () => {
        const makeContext = (key: string, val: string, eligible: boolean = true): PersonalContextItem => ({
            id: `ctx_${key}`,
            subject: { accountId: 'acc', subjectClass: 'ACCOUNT_OWNER' },
            contextKey: key,
            value: val,
            authorityClass: 'USER_STATED',
            freshness: 'CURRENT',
            occurredAt: '2026', observedAt: '2026', validFrom: '2026', validUntil: null,
            expired: false,
            provenance: {} as any,
            reasoningEligible: eligible
        });

        const snapshot: PersonalContextSnapshot = {
            subject: { accountId: 'acc', subjectClass: 'ACCOUNT_OWNER' },
            generatedAt: '2026-09-17',
            activeContext: [],
            presentationMetadata: [makeContext('profile.name', 'John', false)],
            reasoningContext: [
                makeContext('profile.birthDate', '1990-01-01'),
                makeContext('protocol.status', 'ACTIVE'),
                makeContext('coherence.level', 'LOW'),
                makeContext('user_stated.free_text', 'I am sad today') // Untagged free text
            ],
            historicalContext: [],
            unresolvedConflicts: [],
            unavailableSources: []
        };

        const ev = DomainProjectionEngine.project([], snapshot);
        expect(ev.length).toBe(0); // None of these project to domains
    });

    it('12. Explicit Context rule (user_stated.business)', () => {
        const snapshot: PersonalContextSnapshot = {
            subject: { accountId: 'acc', subjectClass: 'ACCOUNT_OWNER' },
            generatedAt: '2026-09-17',
            activeContext: [],
            presentationMetadata: [],
            reasoningContext: [
                {
                    id: 'ctx_bus', 
                    subject: { accountId: 'acc', subjectClass: 'ACCOUNT_OWNER' },
                    contextKey: 'user_stated.goal.business', value: 'Negotiate',
                    authorityClass: 'USER_STATED', freshness: 'CURRENT', 
                    occurredAt: '2026', observedAt: '2026', validFrom: '2026', validUntil: null,
                    expired: false, provenance: {} as any, reasoningEligible: true
                }
            ],
            historicalContext: [], unresolvedConflicts: [], unavailableSources: []
        };
        const ev = DomainProjectionEngine.project([], snapshot);
        expect(ev.length).toBe(1);
        expect(ev[0].domain).toBe('BUSINESS_EXPANSION');
        expect(ev[0].sourceKind).toBe('FACTUAL_CONTEXT');
    });

    it('13. Locale parity (es/en)', () => {
        // Enums and keys are english constants. Locale should not affect projection
        const signalEs = makeAstroSignal('sigEs', 'Venus', 'Sun');
        const signalEn = makeAstroSignal('sigEn', 'Venus', 'Sun'); 
        
        // Simulating that the input models are identical regardless of locale
        const evEs = DomainProjectionEngine.project([signalEs]);
        const evEn = DomainProjectionEngine.project([signalEn]);
        
        expect(evEs[0].domain).toBe(evEn[0].domain);
    });

    it('14. Explicit regression: Same input -> Same ID', () => {
        const s1 = makeAstroSignal('sig-invariant-1', 'Venus', 'Sun');
        const ev1 = DomainProjectionEngine.project([s1]);
        const ev2 = DomainProjectionEngine.project([s1]);

        expect(ev1[0].id).toBe(ev2[0].id);
        expect(ev1[0].id).toMatch(/^EVIDENCE\.ASTROLOGY\.[a-f0-9]{12}$/);
    });
});
