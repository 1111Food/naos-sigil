import { describe, it, expect } from 'vitest';
import { DomainAggregationEngine } from './DomainAggregationEngine';
import { DomainAggregationInput } from './types';
import { DomainEvidence, DomainRelevanceClass, SourceKind, DomainProvenance } from '../domainProjection/types';

describe('DomainAggregationEngine', () => {
    const defaultAvailability = {
        ASTROLOGY: 'AVAILABLE',
        MAYA: 'AVAILABLE',
        CHINESE: 'AVAILABLE',
        NUMEROLOGY: 'AVAILABLE'
    } as const;

    const createEvidence = (
        sourceSystem: string,
        sourceId: string,
        direction: string,
        temporalScope: string = 'TRANSIT',
        evidenceSpecificity: 'GENERIC' | 'PERSONALIZED' = 'PERSONALIZED',
        relevanceClass: DomainRelevanceClass = 'PRIMARY'
    ): DomainEvidence => ({
        id: `ev-${sourceSystem}-${sourceId}`,
        domain: 'BUSINESS_EXPANSION',
        relevanceClass,
        sourceKind: 'SYMBOLIC_SIGNAL',
        sourceSystem,
        sourceId,
        direction,
        temporalScope,
        evidenceSpecificity,
        sourceAuthority: 'COMPUTED_CANONICAL',
        sourceFreshness: 'REALTIME',
        methodology: 'TEST',
        provenance: { projectionRuleId: 'test-rule', sourceData: null } as unknown as DomainProvenance
    });

    it('A. zero evidence -> 0 strength, 0 coverage, UNDETERMINED direction', () => {
        const input: DomainAggregationInput = { evidence: [], systemAvailability: defaultAvailability };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        expect(res.strength).toBe(0);
        expect(res.evidenceCoverage).toBe(0);
        expect(res.directionalConvergence.status).toBe('NOT_APPLICABLE');
        expect(res.tension.status).toBe('NOT_APPLICABLE');
        expect(res.ambiguity.status).toBe('NOT_APPLICABLE');
        expect(res.dominantDirection).toBe('UNDETERMINED');
    });

    it('B. one SUPPORTIVE unit', () => {
        const input: DomainAggregationInput = { 
            evidence: [createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE')], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        expect(res.strength).toBeGreaterThan(0);
        expect(res.evidenceCoverage).toBe(0.25); // 1 out of 4 eligible systems
        expect(res.directionalConvergence.status).toBe('INSUFFICIENT_EVIDENCE');
        expect(res.tension.status).toBe('INSUFFICIENT_EVIDENCE');
        expect(res.ambiguity.status).toBe('VALID');
        expect(res.ambiguity.value).toBe(0);
        expect(res.dominantDirection).toBe('SUPPORTIVE');
    });

    it('E. one MIXED unit creates ambiguity, no fake tension', () => {
        const input: DomainAggregationInput = { 
            evidence: [createEvidence('ASTROLOGY', 't1', 'MIXED')], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        expect(res.strength).toBeGreaterThan(0);
        expect(res.tension.status).toBe('INSUFFICIENT_EVIDENCE');
        expect(res.ambiguity.status).toBe('VALID');
        expect(res.ambiguity.value).toBeGreaterThan(0);
        expect(res.dominantDirection).toBe('MIXED');
    });

    it('T. 8 Astro + 1 Num + 1 Maya + 1 Chinese -> bounds flooding', () => {
        const evidence: DomainEvidence[] = [
            createEvidence('NUMEROLOGY', 'n1', 'SUPPORTIVE'),
            createEvidence('MAYA', 'm1', 'SUPPORTIVE'),
            createEvidence('CHINESE', 'c1', 'SUPPORTIVE'),
        ];
        for(let i=0; i<8; i++) {
            evidence.push(createEvidence('ASTROLOGY', `a${i}`, 'SUPPORTIVE'));
        }

        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', { evidence, systemAvailability: defaultAvailability });
        
        // System counts should be respected
        expect(res.representedSystemCount).toBe(4);
        expect(res.independentSourceCount).toBe(11);
        expect(res.evidenceCoverage).toBe(1.0); // 4 out of 4
        expect(res.directionalConvergence.status).toBe('VALID');
        expect(res.tension.status).toBe('VALID');
        expect(res.tension.value).toBe(0);
        expect(res.strength).toBeGreaterThan(0);
        expect(res.strength).toBeLessThanOrEqual(1.0);
    });

    it('M. structural only -> inflates structuralResonance but not strength', () => {
        const input: DomainAggregationInput = { 
            evidence: [createEvidence('CHINESE', 'natal1', 'SUPPORTIVE', 'STRUCTURAL')], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        expect(res.strength).toBe(0);
        expect(res.structuralResonance).toBeGreaterThan(0);
    });

    it('O. generic + personalized same underlying source -> subsumes, no double counting', () => {
        const input: DomainAggregationInput = { 
            evidence: [
                createEvidence('MAYA', 'day1', 'SUPPORTIVE', 'DAILY', 'GENERIC'),
                createEvidence('MAYA', 'day1', 'SUPPORTIVE', 'DAILY', 'PERSONALIZED'),
            ], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        expect(res.independentSourceCount).toBe(1); // Grouped!
        expect(res.evidenceCoverage).toBe(0.25);
    });

    it('P. factual business goal + SUPPORTIVE symbolic -> contextual alignment PRESENT', () => {
        const factual: DomainEvidence = {
            id: 'fact-1', domain: 'BUSINESS_EXPANSION', relevanceClass: 'PRIMARY', sourceKind: 'FACTUAL_CONTEXT',
            sourceSystem: 'USER', sourceId: 'goal-1', direction: 'SUPPORTIVE', temporalScope: 'STRUCTURAL',
            evidenceSpecificity: 'PERSONALIZED', sourceAuthority: 'USER_STATED', sourceFreshness: 'REALTIME', methodology: 'T', provenance: { projectionRuleId: 'rule', sourceData: null } as unknown as DomainProvenance
        };
        const input: DomainAggregationInput = { 
            evidence: [factual, createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE')], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        
        // Factual shouldn't artificially boost signal strength beyond the symbolic ones
        const symbolicOnlyRes = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', { evidence: [createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE')], systemAvailability: defaultAvailability });
        
        expect(res.strength).toBeCloseTo(symbolicOnlyRes.strength);
        expect(res.contextualAlignment).toBe('PRESENT');
    });

    it('R/S. Eligibility vs Availability models', () => {
        const input: DomainAggregationInput = { 
            evidence: [createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE')], 
            systemAvailability: {
                ASTROLOGY: 'AVAILABLE',
                MAYA: 'UNAVAILABLE', // Infrastructure down
                CHINESE: 'AVAILABLE', // Emitted 0
                NUMEROLOGY: 'AVAILABLE' // Emitted 0
            }
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        
        expect(res.sourceAvailability).toBe(0.75); // 3 of 4 eligible systems are available
        expect(res.evidenceCoverage).toBeCloseTo(1 / 3); // 1 represented out of 3 available eligible
    });

    it('I. SUPPORTIVE + CHALLENGING creates valid inter-source Tension', () => {
        const input: DomainAggregationInput = { 
            evidence: [
                createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE'),
                createEvidence('NUMEROLOGY', 'n1', 'CHALLENGING')
            ], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        
        expect(res.tension.status).toBe('VALID');
        expect(res.tension.value).toBeGreaterThan(0);
        expect(res.directionalConvergence.status).toBe('VALID');
        expect(res.directionalConvergence.value).toBeLessThan(1.0);
    });

    it('D. NEUTRAL contributes to activation without direction', () => {
        const input: DomainAggregationInput = { 
            evidence: [
                createEvidence('ASTROLOGY', 't1', 'NEUTRAL'),
                createEvidence('NUMEROLOGY', 'n1', 'NEUTRAL')
            ], 
            systemAvailability: defaultAvailability 
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        
        expect(res.strength).toBeGreaterThan(0);
        expect(res.dominantDirection).toBe('NEUTRAL');
        expect(res.tension.status).toBe('INSUFFICIENT_EVIDENCE'); // 0 pos/neg mass
        expect(res.directionalConvergence.status).toBe('INSUFFICIENT_EVIDENCE');
    });

    it('same sourceId string from two different sourceSystems remains two independent units', () => {
        const input: DomainAggregationInput = {
            evidence: [
                createEvidence('ASTROLOGY', 'shared-cycle-1', 'SUPPORTIVE'),
                createEvidence('NUMEROLOGY', 'shared-cycle-1', 'SUPPORTIVE')
            ],
            systemAvailability: defaultAvailability
        };
        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', input);
        expect(res.independentSourceCount).toBe(2);
        expect(res.representedSystemCount).toBe(2);
        expect(res.evidenceCoverage).toBe(0.5); // 2 of 4
    });

    it('adding CHALLENGING evidence cannot reduce Strength (OPPOSING_EVIDENCE_CANCELS_STRENGTH = NO)', () => {
        const singleSupportive: DomainAggregationInput = {
            evidence: [createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE')],
            systemAvailability: defaultAvailability
        };
        const res1 = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', singleSupportive);

        const supportivePlusChallenging: DomainAggregationInput = {
            evidence: [
                createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE'),
                createEvidence('NUMEROLOGY', 'n1', 'CHALLENGING')
            ],
            systemAvailability: defaultAvailability
        };
        const res2 = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', supportivePlusChallenging);

        expect(res2.strength).toBeGreaterThanOrEqual(res1.strength);
    });

    it('all normalized numeric metrics remain strictly bounded [0.0, 1.0] under high volume', () => {
        const massiveEvidence: DomainEvidence[] = [];
        const systems = ['ASTROLOGY', 'MAYA', 'CHINESE', 'NUMEROLOGY'];
        const directions = ['SUPPORTIVE', 'CHALLENGING', 'MIXED', 'NEUTRAL'];
        for (let i = 0; i < 100; i++) {
            massiveEvidence.push(createEvidence(
                systems[i % systems.length],
                `src-${i}`,
                directions[i % directions.length],
                'TRANSIT',
                'PERSONALIZED',
                'PRIMARY'
            ));
        }

        const res = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', {
            evidence: massiveEvidence,
            systemAvailability: defaultAvailability
        });

        expect(res.strength).toBeGreaterThanOrEqual(0);
        expect(res.strength).toBeLessThanOrEqual(1.0);
        expect(res.structuralResonance).toBeGreaterThanOrEqual(0);
        expect(res.structuralResonance).toBeLessThanOrEqual(1.0);
        expect(res.evidenceCoverage).toBeGreaterThanOrEqual(0);
        expect(res.evidenceCoverage).toBeLessThanOrEqual(1.0);
        expect(res.sourceAvailability).toBeGreaterThanOrEqual(0);
        expect(res.sourceAvailability).toBeLessThanOrEqual(1.0);
        if (res.directionalConvergence.status === 'VALID') {
            expect(res.directionalConvergence.value).toBeGreaterThanOrEqual(0);
            expect(res.directionalConvergence.value).toBeLessThanOrEqual(1.0);
        }
        if (res.tension.status === 'VALID') {
            expect(res.tension.value).toBeGreaterThanOrEqual(0);
            expect(res.tension.value).toBeLessThanOrEqual(1.0);
        }
        if (res.ambiguity.status === 'VALID') {
            expect(res.ambiguity.value).toBeGreaterThanOrEqual(0);
            expect(res.ambiguity.value).toBeLessThanOrEqual(1.0);
        }
    });

    it('aggregates identically regardless of evidence array ordering (deterministic purity)', () => {
        const evA = createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE');
        const evB = createEvidence('NUMEROLOGY', 'n1', 'CHALLENGING');
        const evC = createEvidence('MAYA', 'm1', 'MIXED');

        const resOrder1 = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', {
            evidence: [evA, evB, evC],
            systemAvailability: defaultAvailability
        });
        const resOrder2 = DomainAggregationEngine.aggregate('BUSINESS_EXPANSION', {
            evidence: [evC, evA, evB],
            systemAvailability: defaultAvailability
        });

        expect(resOrder1).toEqual(resOrder2);
    });

    it('executes consistently across all 6 canonical domains', () => {
        const domains = [
            'ACTION_INITIATIVE',
            'RELATIONSHIPS_LOVE',
            'BUSINESS_EXPANSION',
            'COMMUNICATION_LEARNING',
            'BODY_REGULATION',
            'INTROSPECTION_RECOVERY'
        ] as const;

        for (const dom of domains) {
            const ev = { ...createEvidence('ASTROLOGY', 't1', 'SUPPORTIVE'), domain: dom };
            const res = DomainAggregationEngine.aggregate(dom, {
                evidence: [ev],
                systemAvailability: defaultAvailability
            });
            expect(res.domain).toBe(dom);
            expect(res.strength).toBeGreaterThan(0);
            expect(res.methodology).toBe('DOMAIN_AGGREGATION_V1');
        }
    });
});
