export type ArchetypeId =
    | 'fuego-1' | 'fuego-2' | 'fuego-3' | 'fuego-4'
    | 'tierra-1' | 'tierra-2' | 'tierra-3' | 'tierra-4'
    | 'aire-1' | 'aire-2' | 'aire-3' | 'aire-4'
    | 'agua-1' | 'agua-2' | 'agua-3' | 'agua-4';

export interface V4ArchetypePayload {
    schema_version: 'v4.0';
    canon_version: string;
    archetype_id: ArchetypeId;
    language: 'es' | 'en';
    input_fingerprint: string;
    is_fallback: boolean;
    identidad_central: string;
    motor_instintivo: string;
    mecanismo_operativo: string;
    talento_manifestado: string;
    riesgo_y_sombra: string;
    imperativo_evolutivo: string;
    aplicacion_vital: string;
}

export interface NaosIdentitySynthesis {
    arquetipo?: {
        nombre: string;
        frecuencia: string;
        rol: string;
        descripcion: string;
        interpretacion_profunda?: string;
        elemento: string;
        powerLines?: any[];
        desglose?: any;
    };
    nucleo_estructural: string;
    campo_perceptivo: string;
    arquitectura_mental: string;
    motor_accion: string;
    expresion_proyeccion: string;
    direccion_evolutiva: string;
    conflicto_central: string;
    diagnostico_global: string;
    potencial_elevado: string;
    sombra_riesgo: string;
    conclusion_directa: string;
}

export interface UnavailableIdentityPayload {
    status: 'UNAVAILABLE';
    error: string;
}

export type ParsedIdentityPayload =
    | { type: 'V4'; payload: V4ArchetypePayload }
    | { type: 'V3'; payload: NaosIdentitySynthesis }
    | { type: 'UNAVAILABLE'; error: string }
    | { type: 'UNKNOWN'; error: string };
