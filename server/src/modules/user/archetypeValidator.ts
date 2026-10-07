import { V4ArchetypePayload, ArchetypeId } from '../../shared/types/archetype';
import { NAOS_ARCHETYPES_CANON } from '../../shared/canon/archetypes';

export type ValidatorOutcome = 'PASS' | 'REPAIRABLE' | 'REJECT';

export interface ValidationResult {
    outcome: ValidatorOutcome;
    payload?: Partial<V4ArchetypePayload>;
    error?: string;
}

export class ArchetypeValidator {
    private static readonly REQUIRED_KEYS = [
        'identidad_central', 'motor_instintivo', 'mecanismo_operativo',
        'talento_manifestado', 'riesgo_y_sombra', 'imperativo_evolutivo', 'aplicacion_vital'
    ];

    private static readonly PROHIBITED_DESTINY_TERMS = [
        /\b(?:destino|predicción|predecir|adivinación|futuro inevitable|decretado)\b/gi,
        /\b(?:psíquico|psíquica|magia|sobrenatural|poder místico|videncia|vidente)\b/gi
    ];

    private static readonly DIAGNOSTIC_TERMS = [
        /\b(?:patología|trastorno|enfermedad psiquiátrica|diagnóstico clínico)\b/gi,
        /\b(?:pathology|mental disorder|psychiatric disorder|clinical diagnosis)\b/gi,
        /\byou have (?:a|an)?\s?(?:disorder|pathology|disease)\b/gi,
        /\byou suffer from\b/gi
    ];

    // Repair dictionary: ONLY for completely non-semantic transformations (e.g. whitespace, JSON markers)
    // All semantic replacements like destino->camino have been removed and must REJECT.
    private static readonly REPAIR_DICTIONARY: Array<{ pattern: RegExp; replacement: string }> = [
        { pattern: /^\s*\x60\x60\x60json\s*/gi, replacement: '' },
        { pattern: /\s*\x60\x60\x60\s*$/gi, replacement: '' }
    ];

    /**
     * Entry point for validation. It will attempt to repair once if REPAIRABLE,
     * and re-validate automatically. If it still fails, returns REJECT.
     */
    static validateAndRepair(payload: any, expectedArchetypeId: ArchetypeId): ValidationResult {
        const initialPass = this.validateRaw(payload, expectedArchetypeId);

        if (initialPass.outcome === 'PASS') {
            return initialPass;
        }

        if (initialPass.outcome === 'REPAIRABLE' && initialPass.payload) {
            // Apply repairs
            const repairedPayload = this.applyRepairs(initialPass.payload);

            // Re-validate post repair
            const secondPass = this.validateRaw(repairedPayload, expectedArchetypeId);

            if (secondPass.outcome === 'PASS') {
                return { outcome: 'PASS', payload: repairedPayload };
            } else {
                return { outcome: 'REJECT', error: 'Repaired payload failed validation: ' + secondPass.error };
            }
        }

        return initialPass;
    }

    private static validateRaw(payload: any, expectedArchetypeId: ArchetypeId): ValidationResult {
        let isRepairable = false;

        // Note: we can't repair if it's not an object. But if it's a string, maybe it's just wrapped in ```json
        // Wait, payload should already be parsed. If it's a string instead of JSON, we can't repair here because
        // the REQUIRED_KEYS check below will fail. Let's assume the caller parses it.

        // 1. JSON parse & structure validation
        if (!payload || typeof payload !== 'object') {
            return { outcome: 'REJECT', error: 'Payload is not a valid JSON object' };
        }

        // 2. Exactly expected 7 keys
        const keys = Object.keys(payload);
        const hasAllKeys = this.REQUIRED_KEYS.every(k => keys.includes(k));
        const hasOnlyRequiredKeys = keys.length === this.REQUIRED_KEYS.length;
        if (!hasAllKeys || !hasOnlyRequiredKeys) {
            return { outcome: 'REJECT', error: 'Payload does not have exactly the 7 expected dimensions' };
        }

        // 3. String & length check
        for (const key of this.REQUIRED_KEYS) {
            const val = payload[key];
            if (typeof val !== 'string') {
                return { outcome: 'REJECT', error: `Field ${key} is not a string` };
            }
            if (val.trim().length < 15) {
                return { outcome: 'REJECT', error: `Field ${key} is too short` };
            }
            if (val.length > 2500) {
                return { outcome: 'REJECT', error: `Field ${key} is too long` };
            }
            // If field contains markdown json fences, mark as repairable
            if (/\x60\x60\x60json/.test(val)) {
                isRepairable = true;
            }
        }

        const fullText = this.REQUIRED_KEYS.map(k => payload[k]).join(' ');

        // 4. Prompt leakage (Strict specific internal markers, not generic words)
        if (/Lexical Signature|Jerarquía de Autoridad|Canon del Arquetipo|SYSTEM PROMPT|system instruction|COMPUTED_CANONICAL|PERSONAL_SIGNAL|MODEL_INTERPRETATION/i.test(fullText)) {
            return { outcome: 'REJECT', error: 'Prompt leakage detected' };
        }

        // 5. Prohibited identity contamination (Arquitecto -> tierra-4)
        if (expectedArchetypeId !== 'tierra-4') {
            // Block "arquitecto de..." or "eres un arquitecto", or "architect of..."
            const archPatternES = /\b(?:el|un|eres\s+un|una|eres\s+una)\s+arquitect[oa]\b/i;
            const archPatternEN = /\b(?:the|an|you\s+are\s+an?)\s+architect\b/i;
            const archOfEN = /\barchitect\s+of\b/i;

            // Exclude legitimate tech contexts
            const legitTechES = /arquitectura\s+de\s+(?:software|información|datos)/i;
            const legitTechEN = /(?:software|information|data)\s+architecture/i;

            const hasBadES = archPatternES.test(fullText) && !legitTechES.test(fullText);
            const hasBadEN = (archPatternEN.test(fullText) || archOfEN.test(fullText)) && !legitTechEN.test(fullText);

            if (hasBadES || hasBadEN) {
                 return { outcome: 'REJECT', error: 'Identity contamination (Architect used for non tierra-4)' };
            }
        }

        // 6. Supernatural & deterministic destiny (Now strictly REJECT)
        for (const pattern of this.PROHIBITED_DESTINY_TERMS) {
            if (pattern.test(fullText)) {
                return { outcome: 'REJECT', error: 'Contains deterministic destiny or magical terms' };
            }
        }

        // 7. Diagnostic framing
        for (const pattern of this.DIAGNOSTIC_TERMS) {
            if (pattern.test(fullText)) {
                return { outcome: 'REJECT', error: 'Contains diagnostic/medical framing' };
            }
        }

        if (isRepairable) {
            return { outcome: 'REPAIRABLE', payload, error: 'Contains non-semantic repairable formatting' };
        }

        return { outcome: 'PASS', payload };
    }

    private static applyRepairs(payload: any): any {
        const repaired = { ...payload };

        for (const key of this.REQUIRED_KEYS) {
            let val = repaired[key] as string;
            for (const rule of this.REPAIR_DICTIONARY) {
                val = val.replace(rule.pattern, rule.replacement);
            }
            repaired[key] = val;
        }

        return repaired;
    }
}
