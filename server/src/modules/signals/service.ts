import crypto from 'crypto';
import { NaosSignal, SignalCategory, SignalProvenance } from './types';

/**
 * Normaliza y despacha señales estructuradas en el sistema NAOS.
 * Actualmente opera en memoria como abstracción base sin persistencia forzada.
 */
export class SignalEngine {
    
    /**
     * Construye un objeto NaosSignal validado.
     */
    static normalize<T = unknown>(
        category: SignalCategory,
        value: T,
        provenance: Omit<SignalProvenance, 'generated_at'> & { generated_at?: string },
        options: {
            timestamp?: string; // effective_at / observed_at (por defecto: ahora)
            userId?: string | null;
            confidence?: number;
            metadata?: Record<string, unknown>;
        } = {}
    ): NaosSignal<T> {
        
        return {
            id: crypto.randomUUID(),
            user_id: options.userId ?? null,
            category,
            value,
            timestamp: options.timestamp || new Date().toISOString(),
            confidence: options.confidence, // Opcional, solo para inferencias
            provenance: {
                ...provenance,
                generated_at: provenance.generated_at || new Date().toISOString()
            },
            metadata: options.metadata
        };
    }
}
