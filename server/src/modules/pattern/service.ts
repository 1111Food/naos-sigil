import { NaosSignal } from '../signals/types';
import { SignalEngine } from '../signals/service';

export type PatternStatus = 'candidate' | 'emerging' | 'recurring' | 'dismissed' | 'resolved';

export interface PatternCandidate {
    pattern_id: string;
    user_id: string;
    type: string;
    description: string;
    observations: string[]; // Referencias a memory IDs o notas
    first_seen: string;
    last_seen: string;
    occurrences: number;
    status: PatternStatus;
}

export class PatternEngine {
    
    // Tiempos y umbrales configurables
    private static MIN_OCCURRENCES = 3;
    private static MIN_TEMPORAL_SPAN_DAYS = 7;

    /**
     * Evalúa las memorias longitudinales y protocolos para emitir señales de patrones.
     * En V1, esto es una abstracción que detectaría recurrencias de palabras clave o etiquetas en Memory.
     */
    static async evaluate(userId: string, memories: any[]): Promise<NaosSignal<PatternCandidate[]> | null> {
        // En un motor real, haríamos NLP clustering o vector similarity sobre los recuerdos de `memoryService`.
        // Para establecer la fundación, generamos un flujo determinista basado en el volumen de datos.
        
        if (memories.length < this.MIN_OCCURRENCES) {
            return null; // Pattern Readiness: Not reached
        }

        const firstSeen = new Date(memories[memories.length - 1].created_at);
        const lastSeen = new Date(memories[0].created_at);
        
        const daysDiff = (lastSeen.getTime() - firstSeen.getTime()) / (1000 * 3600 * 24);

        if (daysDiff < this.MIN_TEMPORAL_SPAN_DAYS) {
            return null; // Pattern Readiness: Temporal span not reached
        }

        // Dummy pattern candidate based on rule met
        const candidate: PatternCandidate = {
            pattern_id: `pat_${Date.now()}`,
            user_id: userId,
            type: 'BEHAVIORAL_RECURRENCE',
            description: 'A recurring theme observed in recent protocol reflections.',
            observations: memories.map(m => m.id || 'obs_id'),
            first_seen: firstSeen.toISOString(),
            last_seen: lastSeen.toISOString(),
            occurrences: memories.length,
            status: 'emerging'
        };

        return SignalEngine.normalize(
            'BEHAVIORAL',
            [candidate],
            {
                source: 'NAOS_PATTERN_ENGINE',
                source_version: '1.0',
                method: 'longitudinal_observation'
            },
            {
                userId: userId,
                confidence: 0.75 // Inferencia: 75% seguro de que esto es un patrón válido
            }
        );
    }
}
