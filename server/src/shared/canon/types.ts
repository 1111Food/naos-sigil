export type ArchetypeId =
    | 'fuego-1' | 'fuego-2' | 'fuego-3' | 'fuego-4'
    | 'tierra-1' | 'tierra-2' | 'tierra-3' | 'tierra-4'
    | 'aire-1' | 'aire-2' | 'aire-3' | 'aire-4'
    | 'agua-1' | 'agua-2' | 'agua-3' | 'agua-4';

export type ArchetypeRole = 'Iniciador' | 'Constructor' | 'Conector' | 'Analista';
export type ArchetypeFrequency = 'Ígnea' | 'Telúrica' | 'Etérea' | 'Abisal';

export interface LocalizedString {
    es: string;
    en: string;
}

export interface CanonicalArchetypeDimensions {
    identidad_central: LocalizedString;
    motor_instintivo: LocalizedString;
    mecanismo_operativo: LocalizedString;
    talento_manifestado: LocalizedString;
    riesgo_y_sombra: LocalizedString;
    imperativo_evolutivo: LocalizedString;
    aplicacion_vital: LocalizedString;
}

export interface CanonicalArchetype {
    archetype_id: ArchetypeId;
    name: LocalizedString;
    role: ArchetypeRole;
    frequency: ArchetypeFrequency;
    discriminant: LocalizedString;
    lexical_signature: LocalizedString[];
    contamination_alerts: LocalizedString[];
    dimensions: CanonicalArchetypeDimensions;
}

export type ArchetypeCanonMap = Record<ArchetypeId, CanonicalArchetype>;

/**
 * IDENTITY_CALCULATION_UNAVAILABLE
 *
 * Contract: If archetype calculation fails to produce a valid mathematical canonical ID,
 * the engine MUST NOT fallback to assigning a fake/default ArchetypeId. It must return this error state.
 */
export type ArchetypeCalculationResult =
    | { status: 'SUCCESS'; id: ArchetypeId }
    | { status: 'UNAVAILABLE'; error: string };

export const ARCHETYPE_CANON_VERSION = "vnext-1";
