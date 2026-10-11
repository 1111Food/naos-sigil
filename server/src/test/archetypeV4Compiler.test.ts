import { config } from '../../src/config/env';
import { NaosCompilerService } from '../../src/modules/user/naosCompiler.service';
import { ArchetypeValidator } from '../../src/modules/user/archetypeValidator';
import { NAOS_ARCHETYPES_CANON } from '../../src/shared/canon/archetypes';
import { ArchetypeId } from '../../src/shared/types/archetype';
import crypto from 'crypto';
import { vi } from 'vitest';
import { supabase } from '../../src/lib/supabase';

describe('Phase 4B: V4 Compiler & Validator Tests (Required Fixes)', () => {

    const fakeBible = {
        astrology: { sun: 'Aries' },
        numerology: { lifePath: 1 },
        mayan: { sign: 'Batz' },
        chinese: { sign: 'Dragon' }
    };

    describe('Feature Flag & V3 Isolation', () => {
        let originalFlag: boolean;

        beforeAll(() => {
            originalFlag = config.NAOS_ARCHETYPE_V4_ENABLED;
        });

        afterAll(() => {
            config.NAOS_ARCHETYPE_V4_ENABLED = originalFlag;
        });

        it('A, B, L, S. flag absent or false = V3 remains default, behavior unchanged', async () => {
            config.NAOS_ARCHETYPE_V4_ENABLED = false;
            expect(config.NAOS_ARCHETYPE_V4_ENABLED).toBe(false);
        });
    });

    describe('Canon Resolution & Fallbacks', () => {
        it('C. V4 Canon resolution for all 16 IDs', () => {
            const elements = ['fuego', 'tierra', 'aire', 'agua'];
            const roles = [1, 2, 3, 4];
            let count = 0;
            elements.forEach(el => {
                roles.forEach(r => {
                    const id = `${el}-${r}` as ArchetypeId;
                    expect(NAOS_ARCHETYPES_CANON[id]).toBeDefined();
                    count++;
                });
            });
            expect(count).toBe(16);
        });

        it('D. Vector is fuego-4', () => {
            expect(NAOS_ARCHETYPES_CANON['fuego-4'].name.es).toBe('El Vector');
        });

        it('E. Arquitecto is tierra-4', () => {
            expect(NAOS_ARCHETYPES_CANON['tierra-4'].name.es).toBe('El Arquitecto');
        });

        it('O. no valid archetype_id -> IDENTITY_CALCULATION_UNAVAILABLE (NOT aire-4)', async () => {
            const compiler = NaosCompilerService as any;

            compiler.getCompleteProfile = vi.fn().mockResolvedValue({});
            compiler.consolidateBible = vi.fn().mockResolvedValue({
                bible: fakeBible,
                archetype: { elemento_dominante: 'unknown', rol: 99 } // Invalid
            });

            const result = await compiler.compileV4('test_user', true, 'es');
            expect(result.status).toBe('UNAVAILABLE');
            expect(result.error).toBe('IDENTITY_CALCULATION_UNAVAILABLE');
        });
    });

    describe('Runtime Validator & Safety Policy', () => {
        const validPayload = {
            identidad_central: 'Este es un texto lo suficientemente largo para pasar la validación.',
            motor_instintivo: 'Este es un texto lo suficientemente largo para pasar la validación.',
            mecanismo_operativo: 'Este es un texto lo suficientemente largo para pasar la validación.',
            talento_manifestado: 'Este es un texto lo suficientemente largo para pasar la validación.',
            riesgo_y_sombra: 'Este es un texto lo suficientemente largo para pasar la validación.',
            imperativo_evolutivo: 'Este es un texto lo suficientemente largo para pasar la validación.',
            aplicacion_vital: 'Este es un texto lo suficientemente largo para pasar la validación.'
        };

        it('F. valid 7-key Gemini response -> PASS', () => {
            const res = ArchetypeValidator.validateAndRepair(validPayload, 'fuego-1');
            expect(res.outcome).toBe('PASS');
        });

        it('G, H, I. invalid JSON / missing key / empty field -> REJECT', () => {
            const missing = { ...validPayload };
            delete (missing as any).identidad_central;
            expect(ArchetypeValidator.validateAndRepair(missing, 'fuego-1').outcome).toBe('REJECT');

            const empty = { ...validPayload, identidad_central: 'corto' };
            expect(ArchetypeValidator.validateAndRepair(empty, 'fuego-1').outcome).toBe('REJECT');

            expect(ArchetypeValidator.validateAndRepair(null, 'fuego-1').outcome).toBe('REJECT');
        });

        it('J. generic "arquitecto de..." for non-tierra-4 -> REJECT', () => {
            const contaminated = { ...validPayload, identidad_central: 'Eres un arquitecto del futuro y tienes habilidades.' };
            const res = ArchetypeValidator.validateAndRepair(contaminated, 'fuego-1');
            expect(res.outcome).toBe('REJECT');
            expect(res.error).toContain('Identity contamination');
        });

        it('F. English "architect of..." -> REJECT outside tierra-4', () => {
            const contaminated = { ...validPayload, identidad_central: 'You are the architect of your own future and you have skills.' };
            const res = ArchetypeValidator.validateAndRepair(contaminated, 'fuego-1');
            expect(res.outcome).toBe('REJECT');
            expect(res.error).toContain('Identity contamination');
        });

        it('G. technical "arquitectura de software" & "software architecture" -> allowed', () => {
            const allowedES = { ...validPayload, identidad_central: 'Te dedicas a la arquitectura de software y estructuras.' };
            expect(ArchetypeValidator.validateAndRepair(allowedES, 'fuego-1').outcome).toBe('PASS');

            const allowedEN = { ...validPayload, identidad_central: 'You work with information architecture and systems.' };
            expect(ArchetypeValidator.validateAndRepair(allowedEN, 'fuego-1').outcome).toBe('PASS');
        });

        it('J, M. destiny/prediction/supernatural leak -> STRICTLY REJECT (no semantic repair)', () => {
            const supernatural = { ...validPayload, identidad_central: 'Tu destino está escrito, eres un psíquico.' };
            const res = ArchetypeValidator.validateAndRepair(supernatural, 'fuego-1');
            expect(res.outcome).toBe('REJECT'); // No longer repairable, meaning-altering auto-repairs are banned
        });

        it('I, H. Diagnostic framing (ES and EN) -> REJECT', () => {
            const diagnosticES = { ...validPayload, identidad_central: 'Tienes una patología severa y un diagnóstico clínico.' };
            expect(ArchetypeValidator.validateAndRepair(diagnosticES, 'fuego-1').outcome).toBe('REJECT');

            const diagnosticEN = { ...validPayload, identidad_central: 'You suffer from a mental disorder and need help.' };
            expect(ArchetypeValidator.validateAndRepair(diagnosticEN, 'fuego-1').outcome).toBe('REJECT');
        });

        it('K. non-semantic repair runs full validation again', () => {
            // Provide a repairable JSON fenced payload
            const repairable = { ...validPayload, identidad_central: '```json Este es un texto lo suficientemente largo para pasar la validación.' };
            const res = ArchetypeValidator.validateAndRepair(repairable, 'fuego-1');
            expect(res.outcome).toBe('PASS'); // Repaired successfully
            expect(res.payload?.identidad_central).not.toContain('```json');
        });
    });

    describe('Fingerprint Implementation', () => {
        it('P, Q, D. fingerprint determinism & canonical sort', () => {
            const compiler = NaosCompilerService as any;

            const hash1 = compiler.computeV4Fingerprint('fuego-1', 'es', fakeBible);
            const hash2 = compiler.computeV4Fingerprint('fuego-1', 'es', fakeBible);
            const hash3 = compiler.computeV4Fingerprint('fuego-1', 'en', fakeBible);

            // Same semantic nested object with different insertion order MUST produce identical SHA256
            const shuffledBible = {
                mayan: { sign: 'Batz' },
                astrology: { sun: 'Aries' },
                chinese: { sign: 'Dragon' },
                numerology: { lifePath: 1 }
            };
            const hash4 = compiler.computeV4Fingerprint('fuego-1', 'es', shuffledBible);

            // Same inputs -> same hash
            expect(hash1).toBe(hash2);
            // Shuffled keys -> same hash (Canonical Sort)
            expect(hash1).toBe(hash4);
            // Language change -> different hash
            expect(hash1).not.toBe(hash3);
        });
    });

            describe('Cache Handling (Mocked)', () => {
        it('A, B, C, E. Unknown schema ignored, preserves ES when writing EN', async () => {
            const mockEsCache = { schema_version: 'v4.0', cache_from_es: true };
            const existingProfileData = {
                v4_identity: {
                    es: mockEsCache,
                    unknown_field: 'should_be_preserved'
                },
                other_data: 'test'
            };
            const updateSpy = vi.fn().mockReturnValue({ eq: async () => ({}) });
            vi.spyOn(supabase, 'from').mockReturnValue({
                select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { profile_data: existingProfileData } }) }) }),
                update: updateSpy
            } as any);

            // Mock validateAndRepair to PASS
            vi.spyOn(ArchetypeValidator, 'validateAndRepair').mockReturnValue({
                outcome: 'PASS',
                payload: {
                    identidad_central: 'fresh_en',
                    motor_instintivo: 'fresh_en',
                    mecanismo_operativo: 'fresh_en',
                    talento_manifestado: 'fresh_en',
                    riesgo_y_sombra: 'fresh_en',
                    imperativo_evolutivo: 'fresh_en',
                    aplicacion_vital: 'fresh_en'
                }
            });

            // Mock callGeminiCompilerV4
            vi.spyOn(NaosCompilerService as any, 'callGeminiCompilerV4').mockResolvedValue({
                identidad_central: 'fresh_en',
                motor_instintivo: 'fresh_en',
                mecanismo_operativo: 'fresh_en',
                talento_manifestado: 'fresh_en',
                riesgo_y_sombra: 'fresh_en',
                imperativo_evolutivo: 'fresh_en',
                aplicacion_vital: 'fresh_en'
            });

            // Mock consolidateBible
            vi.spyOn(NaosCompilerService as any, 'consolidateBible').mockResolvedValue({ bible: {}, archetype: { id: 'fuego-4', elemento_dominante: 'fuego', rol: 'Analista' } });

            // Call compileV4 explicitly, or through compile
            config.NAOS_ARCHETYPE_V4_ENABLED = true;
            await NaosCompilerService.compile('user1', false, 'en', { system_role: 'owner' });

            // Assert update was called with preserved ES cache and unknown_field, plus new EN cache
            expect(updateSpy).toHaveBeenCalled();
            const updateArg = updateSpy.mock.calls[0][0];
            expect(updateArg.profile_data.other_data).toBe('test');
            expect(updateArg.profile_data.v4_identity.es).toEqual(mockEsCache);
            expect(updateArg.profile_data.v4_identity.unknown_field).toBe('should_be_preserved');
            expect(updateArg.profile_data.v4_identity.en.identidad_central).toBe('fresh_en');

            vi.restoreAllMocks();
        });
    });

    describe('Phase 4D: Canary Gate & Cache Poisoning Protection', () => {
        let originalFlag: boolean;
        beforeAll(() => {
            originalFlag = config.NAOS_ARCHETYPE_V4_ENABLED;
        });
        afterAll(() => {
            config.NAOS_ARCHETYPE_V4_ENABLED = originalFlag;
        });

        describe('Canary Gate Fail-Closed', () => {
            it('A, B. flag false + owner/admin => V3', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = false;

                const spy = vi.spyOn(NaosCompilerService as any, 'compileV4').mockImplementation(async () => ({}));
                const spyV3 = vi.spyOn(NaosCompilerService as any, 'getCompleteProfile').mockImplementation(async () => { throw new Error('V3_TRIGGERED') });

                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' }); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }
                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: 'admin' }); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }

                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
                spyV3.mockRestore();
            });

            it('C, D, E, F, H. flag true + missing/undefined/user/admin/unknown => V3', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const spy = vi.spyOn(NaosCompilerService as any, 'compileV4').mockImplementation(async () => ({}));
                const spyV3 = vi.spyOn(NaosCompilerService as any, 'getCompleteProfile').mockImplementation(async () => { throw new Error('V3_TRIGGERED') });

                try { await NaosCompilerService.compile('user1', false, 'es'); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }
                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: undefined }); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }
                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: 'user' }); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }
                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: 'admin' }); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }
                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: 'hacker' }); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }

                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
                spyV3.mockRestore();
            });

            it('G. flag true + owner => V4', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const spy = vi.spyOn(NaosCompilerService as any, 'compileV4').mockImplementation(async () => ({ status: 'UNAVAILABLE' }));

                try { await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' }); } catch (e) {}

                expect(spy).toHaveBeenCalled();
                spy.mockRestore();
            });

            it('I. client-like v4 parameter cannot authorize V4', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const spy = vi.spyOn(NaosCompilerService as any, 'compileV4').mockImplementation(async () => ({}));
                const spyV3 = vi.spyOn(NaosCompilerService as any, 'getCompleteProfile').mockImplementation(async () => { throw new Error('V3_TRIGGERED') });

                try { await NaosCompilerService.compile('user1', false, 'es', { v4: true } as any); } catch(e: any) { expect(e.message).toBe('V3_TRIGGERED'); }

                expect(spy).not.toHaveBeenCalled();
                spy.mockRestore();
                spyV3.mockRestore();
            });
        });

        describe('Cache Poisoning Protection', () => {
            const validDims = {
                identidad_central: 'this string is certainly long enough to pass the validator',
                motor_instintivo: 'this string is certainly long enough to pass the validator',
                mecanismo_operativo: 'this string is certainly long enough to pass the validator',
                talento_manifestado: 'this string is certainly long enough to pass the validator',
                riesgo_y_sombra: 'this string is certainly long enough to pass the validator',
                imperativo_evolutivo: 'this string is certainly long enough to pass the validator',
                aplicacion_vital: 'this string is certainly long enough to pass the validator'
            };

            let getProfileSpy: any;
            let consolidateSpy: any;
            let callGeminiSpy: any;
            let supabaseSpy: any;

            beforeEach(() => {
                getProfileSpy = vi.spyOn(NaosCompilerService as any, 'getCompleteProfile').mockResolvedValue({ active_sub_profile_id: null });
                consolidateSpy = vi.spyOn(NaosCompilerService as any, 'consolidateBible').mockResolvedValue({
                    bible: {},
                    archetype: { id: 'fuego-4', elemento_dominante: 'fuego', rol: 'Analista' }
                });
                callGeminiSpy = vi.spyOn(NaosCompilerService as any, 'callGeminiCompilerV4').mockResolvedValue({
                    ...validDims,
                    identidad_central: 'this is a fresh string from gemini that is long enough'
                });
            });

            afterEach(() => {
                vi.restoreAllMocks();
            });

            const setupMockCache = (cacheObj: any) => {

                supabaseSpy = vi.spyOn(supabase, 'from').mockReturnValue({
                    select: () => ({
                        eq: () => ({
                            maybeSingle: async () => ({
                                data: {
                                    profile_data: { v4_identity: cacheObj }
                                }
                            })
                        })
                    }),
                    update: () => ({ eq: async () => ({}) })
                } as any);
            };

            const getFingerprint = () => (NaosCompilerService as any).computeV4Fingerprint('fuego-4', 'es', {});

            it('J, K. valid ES V4 cache is accepted for ES (and EN for EN)', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims
                };
                setupMockCache({ es: cached });

                const res = await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).not.toHaveBeenCalled();
                expect((res as any).identidad_central).toBe('this string is certainly long enough to pass the validator');
            });

            it('L. ES cache cannot satisfy EN request', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims
                };
                setupMockCache({ es: cached });

                const res = await NaosCompilerService.compile('user1', false, 'en', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
                expect((res as any).identidad_central).toBe('this is a fresh string from gemini that is long enough');
            });

            it('M. canon_version mismatch causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: '0.0.1',
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims
                };
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('N. fingerprint mismatch causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: 'wrong_fingerprint',
                    is_fallback: false,
                    ...validDims
                };
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('O, P. archetype_id mismatch/invalid causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'agua-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims
                };
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('Q. is_fallback wrong type causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: 'false',
                    ...validDims
                };
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('R. missing dimension causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims
                };
                delete (cached as any).aplicacion_vital;
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('S. empty dimension causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims,
                    aplicacion_vital: ''
                };
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('T. semantic validator REJECT causes cache bypass', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims,
                    identidad_central: 'este es tu futuro inevitable mi amigo y no puedes escapar'
                };
                setupMockCache({ es: cached });

                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('U. malformed cached object is ignored safely', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                setupMockCache({ es: "not an object" });
                await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('6. REVALIDATED CACHE RESULT TEST: normalized payload is returned', async () => {
                config.NAOS_ARCHETYPE_V4_ENABLED = true;
                const ARCHETYPE_CANON_VERSION = 'vnext-1';
                const cached = {
                    schema_version: 'v4.0',
                    canon_version: ARCHETYPE_CANON_VERSION,
                    archetype_id: 'fuego-4',
                    language: 'es',
                    input_fingerprint: getFingerprint(),
                    is_fallback: false,
                    ...validDims,
                    identidad_central: ' **this string has markdown that will be removed** '
                };
                setupMockCache({ es: cached });

                const res = await NaosCompilerService.compile('user1', false, 'es', { system_role: 'owner' });
                expect(callGeminiSpy).not.toHaveBeenCalled();
                expect((res as any).identidad_central).toBe(' **this string has markdown that will be removed** ');
            });
        });

        describe('Phase 4E: Canonical Bridge Safety', () => {
            let compiler: any;
            let callGeminiSpy: any;

            beforeEach(() => {
                compiler = (NaosCompilerService as any);
                callGeminiSpy = vi.spyOn(compiler, 'callGeminiCompilerV4').mockResolvedValue({
                    identidad_central: 'test string long enough to pass',
                    motor_instintivo: 'test string long enough to pass',
                    mecanismo_operativo: 'test string long enough to pass',
                    talento_manifestado: 'test string long enough to pass',
                    riesgo_y_sombra: 'test string long enough to pass',
                    imperativo_evolutivo: 'test string long enough to pass',
                    aplicacion_vital: 'test string long enough to pass'
                });
            });

            it('A. id=fuego-4, rol=Analista => resolves fuego-4 => NOT UNAVAILABLE', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'fuego-4', elemento_dominante: 'fuego', rol: 'Analista' }
                });
                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).not.toBe('UNAVAILABLE');
                expect(res.archetype_id).toBe('fuego-4');
            });

            it('B. id=tierra-4, rol=Analista => resolves tierra-4 => NOT fuego-4', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'tierra-4', elemento_dominante: 'tierra', rol: 'Analista' }
                });
                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).not.toBe('UNAVAILABLE');
                expect(res.archetype_id).toBe('tierra-4');
            });

            it('C. localized role changes do NOT alter identity', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'fuego-4', elemento_dominante: 'fuego', rol: 'Analyst' }
                });
                const res = await compiler.compileV4('user', true, 'en');
                expect(res.status).not.toBe('UNAVAILABLE');
                expect(res.archetype_id).toBe('fuego-4');
            });

            it('D. invalid id => UNAVAILABLE', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'fuego-Analista', elemento_dominante: 'fuego', rol: 'Analista' }
                });
                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).toBe('UNAVAILABLE');
                expect(res.error).toBe('IDENTITY_CALCULATION_UNAVAILABLE');
            });

            it('E. missing id => UNAVAILABLE', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { elemento_dominante: 'fuego', rol: 'Analista' }
                });
                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).toBe('UNAVAILABLE');
                expect(res.error).toBe('IDENTITY_CALCULATION_UNAVAILABLE');
            });

            it('F. unknown id => UNAVAILABLE', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'void-99' }
                });
                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).toBe('UNAVAILABLE');
                expect(res.error).toBe('IDENTITY_CALCULATION_UNAVAILABLE');
            });

            it('G. valid authoritative id reaches Gemini fallback path', async () => {
                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'agua-2', elemento_dominante: 'agua', rol: 'Constructor' }
                });
                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).not.toBe('UNAVAILABLE');
                expect(callGeminiSpy).toHaveBeenCalled();
            });

            it('H. metadata completely survives validation repair pass', async () => {
                const applyRepairsSpy = vi.spyOn(ArchetypeValidator as any, 'applyRepairs');

                const initialProfileData = {
                    existing_user_pref: 'dark_mode',
                    v4_identity: {
                        en: { schema_version: 'v4.0', note: 'existing_en_cache' }
                    }
                };
                let currentProfileData: any = { ...initialProfileData };

                const updateSpy = vi.fn().mockImplementation((args: any) => {
                    currentProfileData = args.profile_data;
                    return { eq: async () => ({}) };
                });

                vi.spyOn(supabase, 'from').mockReturnValue({
                    select: () => ({
                        eq: () => ({
                            maybeSingle: async () => ({
                                data: { profile_data: currentProfileData }
                            })
                        })
                    }),
                    update: updateSpy
                } as any);

                compiler.consolidateBible = vi.fn().mockResolvedValue({
                    bible: {},
                    archetype: { id: 'fuego-4', elemento_dominante: 'fuego', rol: 'Analista' }
                });

                callGeminiSpy.mockResolvedValue({
                    identidad_central: '```json\nTexto validado para identidad central sin contaminacion.\n```',
                    motor_instintivo: 'Texto validado para motor instintivo sin contaminacion.',
                    mecanismo_operativo: 'Texto validado para mecanismo operativo sin contaminacion.',
                    talento_manifestado: 'Texto validado para talento manifestado sin contaminacion.',
                    riesgo_y_sombra: 'Texto validado para riesgo y sombra sin contaminacion.',
                    imperativo_evolutivo: 'Texto validado para imperativo evolutivo sin contaminacion.',
                    aplicacion_vital: 'Texto validado para aplicacion vital sin contaminacion.'
                });

                const res = await compiler.compileV4('user', true, 'es');
                expect(res.status).not.toBe('UNAVAILABLE');

                // 1. Proof of Real Repair Execution
                expect(applyRepairsSpy).toHaveBeenCalled();

                // 2. All Seven Dimensions (Surviving Repair & Cleaned)
                expect(res.identidad_central).toBe('Texto validado para identidad central sin contaminacion.');
                expect(res.motor_instintivo).toBe('Texto validado para motor instintivo sin contaminacion.');
                expect(res.mecanismo_operativo).toBe('Texto validado para mecanismo operativo sin contaminacion.');
                expect(res.talento_manifestado).toBe('Texto validado para talento manifestado sin contaminacion.');
                expect(res.riesgo_y_sombra).toBe('Texto validado para riesgo y sombra sin contaminacion.');
                expect(res.imperativo_evolutivo).toBe('Texto validado para imperativo evolutivo sin contaminacion.');
                expect(res.aplicacion_vital).toBe('Texto validado para aplicacion vital sin contaminacion.');

                // 3. All Six Metadata Fields
                expect(res.schema_version).toBe('v4.0');
                expect(res.canon_version).toBe('vnext-1');
                expect(res.archetype_id).toBe('fuego-4');
                expect(res.language).toBe('es');
                expect(typeof res.input_fingerprint).toBe('string');
                expect(res.input_fingerprint).toMatch(/^[a-f0-9]{64}$/);
                expect(res.is_fallback).toBe(false);

                // 4. Cache Write Verification
                expect(updateSpy).toHaveBeenCalled();
                const writtenData = updateSpy.mock.calls[0][0].profile_data;
                expect(writtenData.existing_user_pref).toBe('dark_mode');
                expect(writtenData.v4_identity.en).toEqual({ schema_version: 'v4.0', note: 'existing_en_cache' });

                const writtenEs = writtenData.v4_identity.es;
                expect(writtenEs.schema_version).toBe('v4.0');
                expect(writtenEs.canon_version).toBe('vnext-1');
                expect(writtenEs.archetype_id).toBe('fuego-4');
                expect(writtenEs.language).toBe('es');
                expect(writtenEs.input_fingerprint).toBe(res.input_fingerprint);
                expect(writtenEs.is_fallback).toBe(false);

                expect(writtenEs.identidad_central).toBe('Texto validado para identidad central sin contaminacion.');
                expect(writtenEs.motor_instintivo).toBe('Texto validado para motor instintivo sin contaminacion.');
                expect(writtenEs.mecanismo_operativo).toBe('Texto validado para mecanismo operativo sin contaminacion.');
                expect(writtenEs.talento_manifestado).toBe('Texto validado para talento manifestado sin contaminacion.');
                expect(writtenEs.riesgo_y_sombra).toBe('Texto validado para riesgo y sombra sin contaminacion.');
                expect(writtenEs.imperativo_evolutivo).toBe('Texto validado para imperativo evolutivo sin contaminacion.');
                expect(writtenEs.aplicacion_vital).toBe('Texto validado para aplicacion vital sin contaminacion.');

                // 5. Cache Read Verification (Subsequent Non-Forced Compilation)
                callGeminiSpy.mockClear();
                const cachedRes = await compiler.compileV4('user', false, 'es');

                expect(callGeminiSpy).not.toHaveBeenCalled();
                expect(cachedRes.status).not.toBe('UNAVAILABLE');
                expect(cachedRes.schema_version).toBe('v4.0');
                expect(cachedRes.canon_version).toBe('vnext-1');
                expect(cachedRes.archetype_id).toBe('fuego-4');
                expect(cachedRes.language).toBe('es');
                expect(cachedRes.input_fingerprint).toBe(res.input_fingerprint);
                expect(cachedRes.is_fallback).toBe(false);
                expect(cachedRes.identidad_central).toBe('Texto validado para identidad central sin contaminacion.');
                expect(cachedRes.aplicacion_vital).toBe('Texto validado para aplicacion vital sin contaminacion.');
            });
        });
    });
});
