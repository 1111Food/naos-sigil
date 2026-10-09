import { describe, it, expect } from 'vitest';
import { parseIdentityPayload, isLanguageMismatched } from '../lib/identityPayload';

describe('Phase 4C: Frontend Dual-Schema Identity Parser', () => {

    const validV3 = {
        arquetipo: { nombre: 'Vector' },
        nucleo_estructural: 'v3_data',
        campo_perceptivo: 'v3_data',
        arquitectura_mental: 'v3_data',
        motor_accion: 'v3_data',
        expresion_proyeccion: 'v3_data',
        direccion_evolutiva: 'v3_data',
        conflicto_central: 'v3_data',
        diagnostico_global: 'v3_data',
        potencial_elevado: 'v3_data',
        sombra_riesgo: 'v3_data',
        conclusion_directa: 'v3_data'
    };

    const validV4 = {
        schema_version: 'v4.0',
        canon_version: '1.0',
        archetype_id: 'fuego-4',
        language: 'es',
        input_fingerprint: 'abc',
        is_fallback: false,
        identidad_central: 'v4_data',
        motor_instintivo: 'v4_data',
        mecanismo_operativo: 'v4_data',
        talento_manifestado: 'v4_data',
        riesgo_y_sombra: 'v4_data',
        imperativo_evolutivo: 'v4_data',
        aplicacion_vital: 'v4_data'
    };

    it('A. archetype_id outside the exact 16 IDs -> UNKNOWN', () => {
        expect(parseIdentityPayload({ ...validV4, archetype_id: 'invalid-1' }).type).toBe('UNKNOWN');
    });

    it('B. missing canon_version -> UNKNOWN', () => {
        const payload = { ...validV4 };
        delete (payload as any).canon_version;
        expect(parseIdentityPayload(payload).type).toBe('UNKNOWN');
    });

    it('C. empty canon_version -> UNKNOWN', () => {
        expect(parseIdentityPayload({ ...validV4, canon_version: '' }).type).toBe('UNKNOWN');
    });

    it('D. language other than es/en -> UNKNOWN', () => {
        expect(parseIdentityPayload({ ...validV4, language: 'fr' }).type).toBe('UNKNOWN');
    });

    it('E. missing input_fingerprint -> UNKNOWN', () => {
        const payload = { ...validV4 };
        delete (payload as any).input_fingerprint;
        expect(parseIdentityPayload(payload).type).toBe('UNKNOWN');
    });

    it('F. empty input_fingerprint -> UNKNOWN', () => {
        expect(parseIdentityPayload({ ...validV4, input_fingerprint: '  ' }).type).toBe('UNKNOWN');
    });

    it('G. is_fallback not boolean -> UNKNOWN', () => {
        expect(parseIdentityPayload({ ...validV4, is_fallback: 'true' }).type).toBe('UNKNOWN');
    });

    it('H. valid is_fallback=true -> V4', () => {
        expect(parseIdentityPayload({ ...validV4, is_fallback: true }).type).toBe('V4');
    });

    it('I. all 16 valid archetype IDs are accepted', () => {
        const ids = [
            'fuego-1', 'fuego-2', 'fuego-3', 'fuego-4',
            'tierra-1', 'tierra-2', 'tierra-3', 'tierra-4',
            'aire-1', 'aire-2', 'aire-3', 'aire-4',
            'agua-1', 'agua-2', 'agua-3', 'agua-4'
        ];
        for (const id of ids) {
            expect(parseIdentityPayload({ ...validV4, archetype_id: id }).type).toBe('V4');
        }
    });

    it('J. schema_version v5.0 -> UNKNOWN', () => {
        expect(parseIdentityPayload({ ...validV4, schema_version: 'v5.0' }).type).toBe('UNKNOWN');
    });

    it('K. raw arrays/null/primitives -> UNKNOWN', () => {
        expect(parseIdentityPayload([]).type).toBe('UNKNOWN');
        expect(parseIdentityPayload(null).type).toBe('UNKNOWN');
        expect(parseIdentityPayload("string").type).toBe('UNKNOWN');
        expect(parseIdentityPayload(123).type).toBe('UNKNOWN');
    });

    it('L. no unsafe name inference affects V4 identity', () => {
        // Even if we inject a V3 style 'nombre', V4 strictly relies on archetype_id.
        const parsed = parseIdentityPayload({ ...validV4, archetype_id: 'tierra-4', nombre: 'Vector' });
        expect(parsed.type).toBe('V4');
        if (parsed.type === 'V4') {
            expect(parsed.payload.archetype_id).toBe('tierra-4');
        }
    });

    // M-P handled via code inspection for UI changes, but these remaining unit checks match older tests:
    it('handles UNAVAILABLE properly', () => {
        expect(parseIdentityPayload({ status: 'UNAVAILABLE' }).type).toBe('UNAVAILABLE');
    });

    it('V3 caching regression logic', () => {
        expect(parseIdentityPayload(validV3).type).toBe('V3');
    });

    it('detects language mismatch securely', () => {
        const parsedES = parseIdentityPayload({ ...validV4, language: 'es' });
        expect(isLanguageMismatched(parsedES, 'en')).toBe(true);
    });

});
