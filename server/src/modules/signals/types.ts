export type SignalCategory = 
    | 'IDENTITY'
    | 'ASTRONOMICAL'
    | 'ASTROLOGICAL'
    | 'BEHAVIORAL'
    | 'TEMPORAL'
    | 'RELATIONAL';

/**
 * SignalProvenance rastrea el origen exacto del dato.
 */
export interface SignalProvenance {
    /**
     * Fuente libre extensible (Ej: 'NASA_JPL_HORIZONS', 'NAOS_PROTOCOL_ENGINE', 'USER_INPUT')
     */
    source: string;              
    
    /**
     * Versión del motor o endpoint que generó el dato (Ej: '1.0', 'API_v2026')
     */
    source_version?: string;     
    
    /**
     * Cuándo se generó físicamente este registro en el sistema (ISO 8601).
     * Nota: Esto difiere del timestamp de la señal (que indica cuándo aplica u ocurre el evento).
     */
    generated_at: string;        
    
    /**
     * Método o algoritmo utilizado (Ej: 'ephemeris_calculation', 'deterministic_transit')
     */
    method?: string;             
}

/**
 * Representación universal de una señal en el sistema NAOS.
 * <T> preserva el tipo exacto del payload (ej. AstrologyProfile, EphemerisVector).
 */
export interface NaosSignal<T = unknown> {
    id: string;                      // Identificador único (UUID)
    user_id: string | null;          // null si es una señal ambiental global (ej. tránsitos, fases lunares)
    
    category: SignalCategory;
    
    value: T;                        // El payload real, conservando su tipado genérico
    
    /**
     * Representa cuándo la señal es efectiva o cuándo fue observada (observed_at / effective_at).
     * Se distingue claramente de provenance.generated_at.
     */
    timestamp: string;               
    
    /**
     * Representa la confianza del sistema en la *generación* o inferencia de la señal.
     * NUNCA representa validez científica.
     * Opcional: Se omite (undefined) cuando el dato es fáctico y no requiere inferencia.
     */
    confidence?: number;             
    
    provenance: SignalProvenance;
    
    metadata?: Record<string, unknown>; // Datos adicionales no estructurados si es necesario
}
