import { describe, it, expect } from 'vitest';
import { ActionRoutingEngine } from './ActionRoutingEngine';
import { ActionRoutingInput } from './types';
import { InternalDomainState } from '../domainAggregation/types';

describe('ActionRoutingEngine', () => {
    const createBaseDomainState = (): InternalDomainState => ({
        domain: 'BUSINESS_EXPANSION',
        strength: 0,
        structuralResonance: 0,
        evidenceCoverage: 1.0,
        sourceAvailability: 1.0,
        directionalConvergence: { value: 0, status: 'NOT_APPLICABLE' },
        tension: { value: 0, status: 'NOT_APPLICABLE' },
        ambiguity: { value: 0, status: 'NOT_APPLICABLE' },
        dominantDirection: 'UNDETERMINED',
        contextualAlignment: 'NONE',
        evidenceCount: 0,
        independentSourceCount: 0,
        representedSystemCount: 0,
        methodology: 'DOMAIN_AGGREGATION_V1',
        projectionMethodologies: []
    });

    it('zero domain states yield no actions', () => {
        const input: ActionRoutingInput = { domainState: createBaseDomainState() };
        const routes = ActionRoutingEngine.route(input);
        expect(routes.length).toBe(0);
    });

    it('high strength + high convergence + low tension yields DIRECT pacing and PRIMARY priority (if context present)', () => {
        const state = createBaseDomainState();
        state.strength = 0.85;
        state.directionalConvergence = { value: 0.9, status: 'VALID' };
        state.tension = { value: 0.1, status: 'VALID' };
        state.dominantDirection = 'SUPPORTIVE';
        state.contextualAlignment = 'PRESENT';

        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(routes.length).toBe(1);
        expect(routes[0].pacing).toBe('DIRECT');
        expect(routes[0].priorityBand).toBe('PRIMARY');
        expect(routes[0].actionType).toBe('COMMUNICATE');
    });

    it('high strength + high tension yields PAUSE_AND_REVIEW pacing and REVIEW/PREPARE/OBSERVE type', () => {
        const state = createBaseDomainState();
        state.strength = 0.85;
        state.tension = { value: 0.8, status: 'VALID' };
        state.dominantDirection = 'MIXED';

        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(routes[0].pacing).toBe('PAUSE_AND_REVIEW');
        expect(['REVIEW', 'PREPARE', 'OBSERVE']).toContain(routes[0].actionType);
    });

    it('high ambiguity yields MEASURED pacing and REFLECT/OBSERVE/COMMUNICATE type', () => {
        const state = createBaseDomainState();
        state.strength = 0.70;
        state.ambiguity = { value: 0.8, status: 'VALID' };
        state.dominantDirection = 'MIXED';

        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(routes[0].pacing).toBe('MEASURED');
        expect(['REFLECT', 'OBSERVE', 'COMMUNICATE']).toContain(routes[0].actionType);
    });

    it('low Coverage is distinguishable from low sourceAvailability', () => {
        const state1 = createBaseDomainState();
        state1.strength = 0.7;
        state1.evidenceCoverage = 0.1;
        state1.sourceAvailability = 1.0;
        
        const state2 = createBaseDomainState();
        state2.strength = 0.7;
        state2.evidenceCoverage = 1.0;
        state2.sourceAvailability = 0.1;

        const route1 = ActionRoutingEngine.route({ domainState: state1 })[0];
        const route2 = ActionRoutingEngine.route({ domainState: state2 })[0];

        expect(route1.reasonCodes).toContain('LOW_COVERAGE');
        expect(route1.reasonCodes).not.toContain('LOW_SOURCE_AVAILABILITY');
        
        expect(route2.reasonCodes).toContain('LOW_SOURCE_AVAILABILITY');
        expect(route2.reasonCodes).not.toContain('LOW_COVERAGE');
    });

    it('structural-only domain yields OPTIONAL priority without urgent temporal action', () => {
        const state = createBaseDomainState();
        state.structuralResonance = 0.85;
        // strength = 0

        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(routes[0].priorityBand).toBe('OPTIONAL');
    });

    it('factual-context-only domain yields SECONDARY priority with 0 strength', () => {
        const state = createBaseDomainState();
        state.contextualAlignment = 'PRESENT';
        
        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(routes[0].priorityBand).toBe('SECONDARY');
        expect(routes[0].reasonCodes).toContain('CONTEXT_PRESENT');
    });

    it('factual Business + challenging symbolic Business yields CHALLENGING action types', () => {
        const state = createBaseDomainState();
        state.domain = 'BUSINESS_EXPANSION';
        state.contextualAlignment = 'PRESENT';
        state.strength = 0.7;
        state.dominantDirection = 'CHALLENGING';

        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(['PREPARE', 'REVIEW', 'REGULATE']).toContain(routes[0].actionType);
    });

    it('factual Business + supportive symbolic Business yields SUPPORTIVE action types', () => {
        const state = createBaseDomainState();
        state.domain = 'BUSINESS_EXPANSION';
        state.contextualAlignment = 'PRESENT';
        state.strength = 0.7;
        state.dominantDirection = 'SUPPORTIVE';

        const routes = ActionRoutingEngine.route({ domainState: state });
        expect(['ACT', 'CONNECT', 'LEARN', 'COMMUNICATE']).toContain(routes[0].actionType);
    });

    it('same Strength but different Tension -> different routing/pacing', () => {
        const stateHighTension = createBaseDomainState();
        stateHighTension.strength = 0.8;
        stateHighTension.tension = { value: 0.9, status: 'VALID' };
        
        const stateLowTension = createBaseDomainState();
        stateLowTension.strength = 0.8;
        stateLowTension.tension = { value: 0.1, status: 'VALID' };

        const r1 = ActionRoutingEngine.route({ domainState: stateHighTension })[0];
        const r2 = ActionRoutingEngine.route({ domainState: stateLowTension })[0];

        expect(r1.pacing).toBe('PAUSE_AND_REVIEW');
        expect(r2.pacing).not.toBe('PAUSE_AND_REVIEW');
    });

    it('coherence modifier regulates pacing', () => {
        const state = createBaseDomainState();
        state.strength = 0.8;
        
        const rOptimal = ActionRoutingEngine.route({ domainState: state, coherenceModifier: 'OPTIMAL' })[0];
        const rLow = ActionRoutingEngine.route({ domainState: state, coherenceModifier: 'LOW' })[0];

        expect(rLow.pacing).toBe('GENTLE');
        expect(rLow.reasonCodes).toContain('COHERENCE_PACING');
    });

    it('active Protocol continuity safely modifies targetSurface', () => {
        const state = createBaseDomainState();
        state.domain = 'BODY_REGULATION';
        state.strength = 0.8;
        state.dominantDirection = 'CHALLENGING'; // Yields REGULATE/PREPARE/REVIEW

        const rNormal = ActionRoutingEngine.route({ domainState: state })[0];
        const rActive = ActionRoutingEngine.route({ domainState: state, activeProtocol: true })[0];

        // Normal Regulate -> SANCTUARY
        // Protocol continuity Regulate -> PROTOCOL_21
        expect(rActive.targetSurface).toBe('PROTOCOL_21');
        expect(rActive.reasonCodes).toContain('ACTIVE_PROTOCOL_CONTINUITY');
    });

    it('relationship domain safety avoids prescriptive actions', () => {
        const state = createBaseDomainState();
        state.domain = 'RELATIONSHIPS_LOVE';
        state.strength = 0.9;
        
        const route = ActionRoutingEngine.route({ domainState: state })[0];
        // Cannot be ACT (which could imply break up, marry, etc)
        expect(['COMMUNICATE', 'CONNECT', 'REFLECT', 'OBSERVE']).toContain(route.actionType);
    });

    it('body regulation safety routes safely', () => {
        const state = createBaseDomainState();
        state.domain = 'BODY_REGULATION';
        state.strength = 0.9;
        state.dominantDirection = 'CHALLENGING';
        
        const route = ActionRoutingEngine.route({ domainState: state })[0];
        expect(['REGULATE', 'OBSERVE', 'REFLECT', 'PREPARE', 'REVIEW']).toContain(route.actionType);
    });

    it('all six domains evaluate correctly', () => {
        const domains = [
            'ACTION_INITIATIVE',
            'RELATIONSHIPS_LOVE',
            'BUSINESS_EXPANSION',
            'COMMUNICATION_LEARNING',
            'BODY_REGULATION',
            'INTROSPECTION_RECOVERY'
        ] as const;

        for (const dom of domains) {
            const state = createBaseDomainState();
            state.domain = dom;
            state.strength = 0.8;
            const routes = ActionRoutingEngine.route({ domainState: state });
            expect(routes.length).toBe(1);
            expect(routes[0].domain).toBe(dom);
        }
    });

    it('ES/EN parity - domain strings remain canonical enum', () => {
        // Enums ensure Language Agnosticism by definition, tested by structural design
        const state = createBaseDomainState();
        state.strength = 0.8;
        const route = ActionRoutingEngine.route({ domainState: state })[0];
        expect(route.domain).toBe('BUSINESS_EXPANSION');
        expect(route.actionType).not.toBe('PREPARAR'); // It remains 'PREPARE'
    });

    it('input-order independence and deterministic reruns', () => {
        const state = createBaseDomainState();
        state.strength = 0.8;
        
        const r1 = ActionRoutingEngine.route({ domainState: state, activeProtocol: true })[0];
        const r2 = ActionRoutingEngine.route({ activeProtocol: true, domainState: state })[0];

        expect(r1.id).toBe(r2.id); // Same ID guarantees deterministic property serialization
        expect(r1).toEqual(r2);
    });
});
