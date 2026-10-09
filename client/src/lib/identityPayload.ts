import { ParsedIdentityPayload, V4ArchetypePayload, NaosIdentitySynthesis } from '../types/archetypePayload';

function isRecord(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
}

const VALID_ARCHETYPE_IDS = new Set<string>([
    'fuego-1', 'fuego-2', 'fuego-3', 'fuego-4',
    'tierra-1', 'tierra-2', 'tierra-3', 'tierra-4',
    'aire-1', 'aire-2', 'aire-3', 'aire-4',
    'agua-1', 'agua-2', 'agua-3', 'agua-4'
]);

export function parseIdentityPayload(raw: unknown): ParsedIdentityPayload {
    if (!isRecord(raw)) {
        return { type: 'UNKNOWN', error: 'Payload is empty or not an object' };
    }

    // 1. UNAVAILABLE SCHEMA
    if (raw.status === 'UNAVAILABLE') {
        const errStr = typeof raw.error === 'string' ? raw.error : 'IDENTITY_CALCULATION_UNAVAILABLE';
        return { type: 'UNAVAILABLE', error: errStr };
    }

    // 2. V4 SCHEMA
    if (raw.schema_version === 'v4.0') {
        if (typeof raw.canon_version !== 'string' || raw.canon_version.trim().length === 0) {
            return { type: 'UNKNOWN', error: 'Malformed V4: invalid canon_version' };
        }

        if (typeof raw.archetype_id !== 'string' || !VALID_ARCHETYPE_IDS.has(raw.archetype_id)) {
            return { type: 'UNKNOWN', error: `Malformed V4: invalid archetype_id` };
        }

        if (raw.language !== 'es' && raw.language !== 'en') {
            return { type: 'UNKNOWN', error: 'Malformed V4: invalid language' };
        }

        if (typeof raw.input_fingerprint !== 'string' || raw.input_fingerprint.trim().length === 0) {
            return { type: 'UNKNOWN', error: 'Malformed V4: invalid input_fingerprint' };
        }

        if (typeof raw.is_fallback !== 'boolean') {
            return { type: 'UNKNOWN', error: 'Malformed V4: is_fallback must be boolean' };
        }

        const requiredV4Keys = [
            'identidad_central', 'motor_instintivo', 'mecanismo_operativo',
            'talento_manifestado', 'riesgo_y_sombra', 'imperativo_evolutivo', 'aplicacion_vital'
        ];

        const hasAllKeys = requiredV4Keys.every(k => typeof raw[k] === 'string' && (raw[k] as string).trim().length > 0);

        if (hasAllKeys) {
            return { type: 'V4', payload: raw as unknown as V4ArchetypePayload };
        } else {
            return { type: 'UNKNOWN', error: 'Malformed V4 payload (missing required dimension or metadata)' };
        }
    }

    // 3. UNKNOWN FUTURE SCHEMA (e.g. v5.0) -> Fail safely, DO NOT fallback to V3
    if ('schema_version' in raw && raw.schema_version !== 'v4.0') {
        return { type: 'UNKNOWN', error: `Unrecognized schema version: ${raw.schema_version}` };
    }

    // 4. V3 LEGACY SCHEMA
    if (typeof raw.nucleo_estructural === 'string') {
        return { type: 'V3', payload: raw as unknown as NaosIdentitySynthesis };
    }

    // Default Fallback
    return { type: 'UNKNOWN', error: 'Unrecognized identity schema shape' };
}

export function isLanguageMismatched(schema: ParsedIdentityPayload, currentLanguage: string): boolean {
    if (schema.type === 'V4') {
        return schema.payload.language !== currentLanguage;
    }
    return false; // V3 did not strictly tag payload.language at root level, assumes match by query
}
