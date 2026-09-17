import { ActionRoutingInput, ActionRoute, ActionType, ActionReasonCode, TargetSurface } from './types';
import { 
    ACTION_ROUTING_V1_METHODOLOGY, 
    DOMAIN_ACTION_MATRIX, 
    ACTION_SURFACE_MAPPING, 
    resolvePacing, 
    resolvePriority,
    ROUTING_THRESHOLDS
} from './internal/recipe';
import * as crypto from 'crypto';

export class ActionRoutingEngine {
    static route(input: ActionRoutingInput): ActionRoute[] {
        const { domainState, coherenceModifier, activeProtocol } = input;
        const routes: ActionRoute[] = [];

        // 1. Evaluate metrics
        const tensionVal = domainState.tension.status === 'VALID' ? domainState.tension.value : 0;
        const ambiguityVal = domainState.ambiguity.status === 'VALID' ? domainState.ambiguity.value : 0;
        const convergenceVal = domainState.directionalConvergence.status === 'VALID' ? domainState.directionalConvergence.value : 0;

        // 2. Resolve Pacing and Priority
        const pacing = resolvePacing(
            tensionVal,
            ambiguityVal,
            convergenceVal,
            domainState.evidenceCoverage,
            coherenceModifier
        );

        const priority = resolvePriority(
            domainState.strength,
            domainState.contextualAlignment,
            domainState.structuralResonance
        );

        if (priority === 'DEFER') {
            return []; // No actions if DEFER
        }

        // 3. Select Appropriate Actions from Matrix
        const candidateActions = DOMAIN_ACTION_MATRIX[domainState.domain] || [];
        
        let selectedAction: ActionType | null = null;

        // Domain-agnostic tension/ambiguity overrides on action TYPE selection (not just pacing)
        if (tensionVal >= ROUTING_THRESHOLDS.HIGH_TENSION) {
            // High tension leans towards REVIEW, OBSERVE, PREPARE
            selectedAction = candidateActions.find(a => ['REVIEW', 'OBSERVE', 'PREPARE'].includes(a)) || candidateActions[0];
        } else if (ambiguityVal >= ROUTING_THRESHOLDS.HIGH_AMBIGUITY) {
            // High ambiguity leans towards REFLECT, OBSERVE, COMMUNICATE
            selectedAction = candidateActions.find(a => ['REFLECT', 'OBSERVE', 'COMMUNICATE'].includes(a)) || candidateActions[0];
        } else if (domainState.dominantDirection === 'SUPPORTIVE') {
            // Supportive leans towards ACT, CONNECT, LEARN
            selectedAction = candidateActions.find(a => ['ACT', 'CONNECT', 'LEARN', 'COMMUNICATE'].includes(a)) || candidateActions[0];
        } else if (domainState.dominantDirection === 'CHALLENGING') {
            // Challenging leans towards PREPARE, REVIEW, REGULATE
            selectedAction = candidateActions.find(a => ['PREPARE', 'REVIEW', 'REGULATE'].includes(a)) || candidateActions[0];
        } else {
            selectedAction = candidateActions[0]; // fallback to safest/first
        }

        if (!selectedAction) return [];

        // 4. Resolve Target Surface
        let targetSurface = ACTION_SURFACE_MAPPING[selectedAction] || 'NONE';

        // Override target surface for continuity if protocol is active
        if (activeProtocol && ['REGULATE', 'REFLECT'].includes(selectedAction)) {
            targetSurface = 'PROTOCOL_21';
        }

        // 5. Gather Reason Codes
        const reasonCodes: ActionReasonCode[] = [];
        if (domainState.strength >= ROUTING_THRESHOLDS.HIGH_STRENGTH_ACTIVATION) reasonCodes.push('TEMPORAL_ACTIVATION');
        if (domainState.contextualAlignment === 'PRESENT') reasonCodes.push('CONTEXT_PRESENT');
        if (tensionVal >= ROUTING_THRESHOLDS.HIGH_TENSION) reasonCodes.push('HIGH_TENSION');
        if (ambiguityVal >= ROUTING_THRESHOLDS.HIGH_AMBIGUITY) reasonCodes.push('HIGH_AMBIGUITY');
        if (convergenceVal >= ROUTING_THRESHOLDS.HIGH_CONVERGENCE) reasonCodes.push('HIGH_DIRECTIONAL_CONVERGENCE');
        if (domainState.evidenceCoverage < ROUTING_THRESHOLDS.ADEQUATE_COVERAGE && domainState.evidenceCoverage > 0) reasonCodes.push('LOW_COVERAGE');
        if (domainState.sourceAvailability < 0.5) reasonCodes.push('LOW_SOURCE_AVAILABILITY');
        if (domainState.structuralResonance >= ROUTING_THRESHOLDS.STRUCTURAL_RESONANCE_THRESHOLD) reasonCodes.push('STRUCTURAL_RESONANCE');
        if (coherenceModifier) reasonCodes.push('COHERENCE_PACING');
        if (activeProtocol) reasonCodes.push('ACTIVE_PROTOCOL_CONTINUITY');
        if (domainState.dominantDirection === 'CHALLENGING') reasonCodes.push('DOMINANT_CHALLENGE');
        if (domainState.dominantDirection === 'SUPPORTIVE') reasonCodes.push('DOMINANT_SUPPORT');

        // 6. Build Route
        // Deterministic ID generation based on core route properties
        const hashPayload = `${domainState.domain}:${selectedAction}:${priority}:${pacing}:${targetSurface}`;
        const id = `route_${crypto.createHash('sha256').update(hashPayload).digest('hex').substring(0, 12)}`;

        const route: ActionRoute = {
            id,
            domain: domainState.domain,
            actionType: selectedAction,
            priorityBand: priority,
            pacing,
            targetSurface,
            reasonCodes,
            contextualAlignment: domainState.contextualAlignment,
            methodology: ACTION_ROUTING_V1_METHODOLOGY
        };

        routes.push(route);
        return routes;
    }
}
