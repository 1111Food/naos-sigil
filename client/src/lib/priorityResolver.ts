export interface TemplePriorityOutput {
    priority: string;
    confidence: number;
    headline: string;
    reason: string;
    signals: string[];
    recommendedAction: { action: string; target: string; label: string };
    secondaryActions: Array<{ action: string; target: string; label: string }>;
}

export function resolveTemplePriority(context: any): TemplePriorityOutput {
    if (!context) {
        return {
            priority: 'AWAITING_CONTEXT',
            confidence: 0,
            headline: 'Sintonizando sistema...',
            reason: 'Esperando telemetría de inteligencia.',
            signals: [],
            recommendedAction: { action: 'OPEN', target: 'CHAT', label: 'Despertar Sigil' },
            secondaryActions: []
        };
    }

    const protocol = context.protocol;
    const pattern = context.pattern;
    const timeMap = context.timeMap;
    const identity = context.identity;
    const signals: string[] = [];

    if (protocol?.active && (protocol.status === 'awaiting_evolution' || protocol.current_day === protocol.target_days)) {
        signals.push('protocol_milestone');
        return {
            priority: 'PROTOCOL_EVOLUTION',
            confidence: 1.0,
            headline: 'Tu ciclo está completo.',
            reason: \Has llegado al día \. Es momento de asimilar y evolucionar tu estructura.\,
            signals,
            recommendedAction: { action: 'OPEN', target: 'PROTOCOL21', label: 'Iniciar Evolución' },
            secondaryActions: [
                { action: 'OPEN', target: 'CHAT', label: 'Reflexionar con Sigil' }
            ]
        };
    }

    if (pattern?.active_candidates?.length > 0) {
        signals.push('behavioral_recurrence');
        return {
            priority: 'PATTERN_EMERGING',
            confidence: 0.85,
            headline: 'Un patrón está emergiendo.',
            reason: 'He detectado una recurrencia en tus reflexiones recientes que requiere tu atención.',
            signals,
            recommendedAction: { action: 'OPEN', target: 'CHAT', label: 'Explorar Patrón' },
            secondaryActions: [
                { action: 'OPEN', target: 'PROTOCOL21', label: 'Revisar Protocolo' }
            ]
        };
    }

    if (timeMap?.astronomical_transits?.length > 0) {
        signals.push('temporal_transit');
        return {
            priority: 'TEMPORAL_TRANSIT',
            confidence: 0.90,
            headline: 'Clima Temporal Intenso.',
            reason: 'Hay posiciones planetarias actuales cruzando directamente tu código base.',
            signals,
            recommendedAction: { action: 'OPEN', target: 'TIME_MAP_NEXUS', label: 'Ver Time Map' },
            secondaryActions: [
                { action: 'OPEN', target: 'CHAT', label: 'Consultar a Sigil' }
            ]
        };
    }

    if (protocol?.active && protocol.current_day > 1 && protocol.current_day < protocol.target_days) {
        signals.push('protocol_active');
        return {
            priority: 'CONTINUE_PROTOCOL',
            confidence: 0.95,
            headline: \Protocolo \ · Día \\,
            reason: \Mantén la tracción en tu intención: \.\,
            signals,
            recommendedAction: { action: 'OPEN', target: 'PROTOCOL21', label: 'Continuar Protocolo' },
            secondaryActions: [
                { action: 'OPEN', target: 'CHAT', label: 'Calibrar con Sigil' }
            ]
        };
    }

    if (protocol?.active && protocol.current_day === 1) {
        signals.push('protocol_start');
        return {
            priority: 'PROTOCOL_START',
            confidence: 0.99,
            headline: 'Ciclo Inicial.',
            reason: 'Tu estructura acaba de ser definida. Hoy establecemos la fundación.',
            signals,
            recommendedAction: { action: 'OPEN', target: 'PROTOCOL21', label: 'Ejecutar Día 1' },
            secondaryActions: [
                { action: 'OPEN', target: 'IDENTITY_NEXUS', label: 'Ver Identidad' }
            ]
        };
    }

    if (identity?.archetype) {
        signals.push('identity_baseline');
        return {
            priority: 'IDENTITY_REVELATION',
            confidence: 0.70,
            headline: \Frecuencia Activa: \\,
            reason: 'Tu sistema está estabilizado. Usa este tiempo para fortalecer tu arquitectura base.',
            signals,
            recommendedAction: { action: 'OPEN', target: 'CHAT', label: 'Conversar' },
            secondaryActions: [
                { action: 'OPEN', target: 'TIME_MAP_NEXUS', label: 'Explorar Temporalidad' },
                { action: 'OPEN', target: 'PROTOCOL21', label: 'Iniciar Protocolo' }
            ]
        };
    }

    return {
        priority: 'GENERAL_CONTEXT',
        confidence: 0.5,
        headline: 'Sistema Estabilizado.',
        reason: 'Todo fluye en coherencia. ¿Qué deseas explorar hoy?',
        signals,
        recommendedAction: { action: 'OPEN', target: 'CHAT', label: 'Consultar Sigil' },
        secondaryActions: [
            { action: 'OPEN', target: 'IDENTITY_NEXUS', label: 'Identidad' }
        ]
    };
}

