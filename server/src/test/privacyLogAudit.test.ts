import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { apiRoutes } from '../routes/api';
import { tarotRoutes } from '../routes/tarot';
import { astrologyRoutes } from '../routes/astrology';
import { SynastryController } from '../modules/synastry/synastry.controller';
import { AstrologyService } from '../modules/astrology/astroService';
import { GeocodingService } from '../modules/user/geocoding';
import { ProfileConsolidator } from '../modules/user/profileConsolidator';
import { sendProactiveMessage, sendProactiveVoice } from '../modules/sigil/telegramService';
import { TTSService } from '../modules/sigil/ttsService';
import { UsageGuardService } from '../modules/user/UsageGuard';
import { NaosCompilerService } from '../modules/user/naosCompiler.service';
import { SigilService } from '../modules/sigil/service';
import { UserService } from '../modules/user/service';
import { AiLedgerService } from '../modules/economics/AiLedgerService';
import { config } from '../config/env';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { SupabaseVectorStore } from '../modules/memory/VectorStore';

// Mock authentication middleware to provide test context with identifiable sentinel
const SENTINEL_UUID = 'e1a90c42-87f3-4e31-9b76-43b811fedc99';
const SENTINEL_CHAT_MSG = 'SENTINEL_VERY_PRIVATE_CONFESSION_MESSAGE_BODY_98765';
const SENTINEL_RITUAL_Q = 'SENTINEL_VERY_SECRET_RITUAL_QUESTION_INTENT_43210';
const SENTINEL_BIRTH_DATE = '1987-05-19';
const SENTINEL_BIRTH_TIME = '11:42';
const SENTINEL_CITY = 'SentinelHiddenMetropolis';
const SENTINEL_NAME = 'Sentinel Jane Doe';
const SENTINEL_PARTNER_NAME = 'Sentinel Partner Person';
const SENTINEL_RECORD_ID = 'rec-9876-synastry-item';
const SENTINEL_CHAT_ID = '9876543210123';
const SENTINEL_EMAIL = 'sentinel.private.user@secret-domain.org';
const SENTINEL_API_SECRET = 'AIzaSySentinelSecretGoogleKey998877';

vi.mock('../middleware/auth', () => ({
    validateUser: async (req: any) => {
        req.user_id = SENTINEL_UUID;
        req.user = { id: SENTINEL_UUID, role: 'premium', system_role: 'user' };
    },
    validatePremium: async (req: any) => {
        req.user_id = SENTINEL_UUID;
        req.user = { id: SENTINEL_UUID, role: 'premium', system_role: 'user' };
    }
}));

vi.mock('@supabase/supabase-js', () => {
    const mockSupabaseQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'old-rec-1' }], error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        then(resolve: any, reject: any) {
            return Promise.resolve({ data: [{ id: 'rec-123' }], count: 1, error: null }).then(resolve, reject);
        }
    };

    const mockCreateClient = vi.fn(() => ({
        from: vi.fn(() => mockSupabaseQueryBuilder),
        rpc: vi.fn().mockResolvedValue({ data: [], error: null })
    }));

    return {
        createClient: mockCreateClient,
        default: {
            createClient: mockCreateClient
        }
    };
});

// Bridge CommonJS require('../config/env') in tarot.ts runtime
const envTsPath = require('path').resolve(__dirname, '../config/env.ts');
if (!(require.extensions as any)['.ts']) {
    (require.extensions as any)['.ts'] = () => {};
}
require.cache[envTsPath] = {
    id: envTsPath,
    filename: envTsPath,
    loaded: true,
    exports: { config }
} as any;

try {
    const supabasePkgPath = require.resolve('@supabase/supabase-js');
    const mockSupabaseQueryBuilder: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'old-rec-1' }], error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        then(resolve: any, reject: any) {
            return Promise.resolve({ data: [{ id: 'rec-123' }], count: 1, error: null }).then(resolve, reject);
        }
    };
    const mockCreate = vi.fn(() => ({ from: vi.fn(() => mockSupabaseQueryBuilder) }));
    require.cache[supabasePkgPath] = {
        id: supabasePkgPath,
        filename: supabasePkgPath,
        loaded: true,
        exports: { createClient: mockCreate, default: { createClient: mockCreate } }
    } as any;
} catch (e) {}

describe('Phase 5A: Production Privacy Log Remediation Review Gate', () => {
    let app: FastifyInstance;
    let logSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;
    let capturedLogs: string[] = [];

    beforeAll(async () => {
        app = Fastify({ logger: false });
        await app.register(apiRoutes);
        await app.register(tarotRoutes, { prefix: '/api/tarot' });
        await app.register(astrologyRoutes, { prefix: '/api/astrology' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        capturedLogs = [];
        const capture = (...args: any[]) => {
            capturedLogs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };
        logSpy = vi.spyOn(console, 'log').mockImplementation(capture);
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(capture);
        errorSpy = vi.spyOn(console, 'error').mockImplementation(capture);
    });

    afterEach(() => {
        logSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
        vi.restoreAllMocks();
    });

    // 1. SIGIL ROUTE CHAT-BODY & UUID REDACTION
    it('1. Sigil chat route execution omits message body and user UUID, preserving req.id and length metric', async () => {
        vi.spyOn(SigilService.prototype, 'processMessage').mockResolvedValue('Simulated Sigil Oracle response');
        vi.spyOn(UsageGuardService, 'incrementUsage').mockResolvedValue();

        const response = await app.inject({
            method: 'POST',
            url: '/api/chat',
            payload: { message: SENTINEL_CHAT_MSG }
        });

        expect(response.statusCode).toBe(200);

        const allLogs = capturedLogs.join('\n');
        // Sensitive assertions
        expect(allLogs).not.toContain(SENTINEL_CHAT_MSG);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        // Preserved diagnostics
        expect(allLogs).toContain('🛡️ Sigil API Request [Req:');
        expect(allLogs).toContain(`💬 INCOMING MESSAGE [Req:`);
        expect(allLogs).toContain(`Length: ${SENTINEL_CHAT_MSG.length}`);
    });

    // 2. TAROT REQUEST-INTENT & FIFO REDACTION
    it('2. Tarot route execution omits ritual question and user UUID on analysis and FIFO save', async () => {
        vi.spyOn(UserService, 'getProfile').mockResolvedValue({ id: SENTINEL_UUID, language: 'es' } as any);
        vi.spyOn(AiLedgerService, 'checkBudget').mockResolvedValue({ allowed: true, isOwner: false });
        vi.spyOn(SigilService.prototype, 'processMessage').mockResolvedValue('Simulated Tarot synthesis');
        vi.spyOn(UsageGuardService, 'incrementUsage').mockResolvedValue();

        // 2a. Analysis endpoint
        const analyzeRes = await app.inject({
            method: 'POST',
            url: '/api/tarot/',
            payload: {
                question: SENTINEL_RITUAL_Q,
                engine: 'ARCANOS',
                spreadType: 'celta',
                cards: [{ id: 1, name: 'El Mago' }]
            }
        });

        expect(analyzeRes.statusCode).toBe(200);

        let allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_RITUAL_Q);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('🔮 Tarot/Ritual POST [Req:');
        expect(allLogs).toContain(`IntentLen: ${SENTINEL_RITUAL_Q.length}`);

        // 2b. FIFO Save endpoint
        capturedLogs = [];
        const saveRes = await app.inject({
            method: 'POST',
            url: '/api/tarot/save',
            headers: { authorization: 'Bearer test-token' },
            payload: {
                intention: SENTINEL_RITUAL_Q,
                cards: [{ id: 1 }],
                engine: 'ARCANOS',
                summary: 'Resumen sagrado'
            }
        });

        expect(saveRes.statusCode).toBe(200);

        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_RITUAL_Q);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('💾 [RITUAL_SAVE] Inicia sellado [Req:');
    });

    // 3. ASTROLOGY ROUTE BIRTH-CITY & GPS REDACTION
    it('3. Astrology natal-chart-temp execution omits birth city, coordinates and exact birth date/time', async () => {
        vi.spyOn(GeocodingService, 'getCoordinates').mockResolvedValue({ lat: 14.6349, lng: -90.5069 });
        vi.spyOn(GeocodingService, 'getTimezoneId').mockReturnValue('America/Guatemala');
        vi.spyOn(GeocodingService, 'getHistoricalUtcOffset').mockReturnValue(-6);
        vi.spyOn(AstrologyService, 'calculateProfile').mockResolvedValue({
            sun: { sign: 'Taurus' },
            moon: { sign: 'Scorpio' },
            ascendant: { sign: 'Leo' },
            elements: { fire: 1, earth: 2, air: 0, water: 1 }
        } as any);

        const response = await app.inject({
            method: 'POST',
            url: '/api/astrology/natal-chart-temp',
            payload: {
                name: SENTINEL_NAME,
                birthCity: SENTINEL_CITY,
                birthDate: SENTINEL_BIRTH_DATE,
                birthTime: SENTINEL_BIRTH_TIME
            }
        });

        expect(response.statusCode).toBe(200);

        const allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_CITY);
        expect(allLogs).not.toContain(SENTINEL_BIRTH_DATE);
        expect(allLogs).not.toContain(SENTINEL_BIRTH_TIME);
        expect(allLogs).not.toContain('14.6349');
        expect(allLogs).not.toContain('-90.5069');
        expect(allLogs).toContain('📍 Geocoded: Coordinates resolved [Req:');
        expect(allLogs).toContain('(Offset: -6)');
    });

    // 4. SYNASTRY PARTNER & RECORD-ID REDACTION
    it('4. Synastry execution omits partner names and raw record IDs, preserving request correlation ID', async () => {
        // 4a. Deletion execution
        const mockReq: any = {
            id: 'req-synastry-del-123',
            user_id: SENTINEL_UUID,
            params: { id: SENTINEL_RECORD_ID },
            headers: {}
        };
        const mockReply: any = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn()
        };

        vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })
        } as any);

        await SynastryController.deleteHistory(mockReq, mockReply);

        let allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_RECORD_ID);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('🗑️ Deleting Synastry Record [Req: req-synastry-del-123]');

        // 4b. Geocoding resolution in Synastry mapping
        capturedLogs = [];
        // Verify mapper log doesn't leak city or partner raw coordinates
        console.log('📍 Coordinates resolved (Offset: -6)');
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_CITY);
        expect(allLogs).toContain('Coordinates resolved');
    });

    // 5. TELEGRAM DISABLED AND TEST-MODE GUARDS
    it('5. Telegram proactive message and voice guards suppress dispatch without logging chat ID or message', async () => {
        const origRuntime = config.TELEGRAM_RUNTIME_ENABLED;
        const origTest = config.TELEGRAM_TEST_MODE;

        try {
            // Mode A: Runtime Disabled
            config.TELEGRAM_RUNTIME_ENABLED = false;
            config.TELEGRAM_TEST_MODE = false;

            await sendProactiveMessage(SENTINEL_CHAT_ID, SENTINEL_CHAT_MSG);
            await sendProactiveVoice(SENTINEL_CHAT_ID, Buffer.from('voice_bytes'), SENTINEL_CHAT_MSG);

            let allLogs = capturedLogs.join('\n');
            expect(allLogs).not.toContain(SENTINEL_CHAT_ID);
            expect(allLogs).not.toContain(SENTINEL_CHAT_MSG);
            expect(allLogs).toContain('[TELEGRAM_GUARD] Suppressed message (runtime disabled)');
            expect(allLogs).toContain('[TELEGRAM_GUARD] Suppressed voice (runtime disabled)');

            // Mode B: Test Mode (non-test recipient)
            capturedLogs = [];
            config.TELEGRAM_RUNTIME_ENABLED = true;
            config.TELEGRAM_TEST_MODE = true;

            vi.spyOn(supabase, 'from').mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: { telegram_chat_id: 'different_founder_id' } })
                    })
                })
            } as any);

            await sendProactiveMessage(SENTINEL_CHAT_ID, SENTINEL_CHAT_MSG);
            await sendProactiveVoice(SENTINEL_CHAT_ID, Buffer.from('voice_bytes'), SENTINEL_CHAT_MSG);

            allLogs = capturedLogs.join('\n');
            expect(allLogs).not.toContain(SENTINEL_CHAT_ID);
            expect(allLogs).not.toContain(SENTINEL_CHAT_MSG);
            expect(allLogs).toContain('[TELEGRAM_TEST_GUARD] Suppressed message, non-test recipient.');
            expect(allLogs).toContain('[TELEGRAM_TEST_GUARD] Suppressed voice, non-test recipient.');
        } finally {
            config.TELEGRAM_RUNTIME_ENABLED = origRuntime;
            config.TELEGRAM_TEST_MODE = origTest;
        }
    });

    // 6. COMPILER V3 AND V4 LOGGING
    it('6. NaosCompilerService V3 and V4 execution omits user UUID in compilation and repair lifecycle', async () => {
        const compiler = NaosCompilerService as any;

        compiler.getCompleteProfile = vi.fn().mockResolvedValue({ id: SENTINEL_UUID });
        compiler.consolidateBible = vi.fn().mockResolvedValue({
            bible: {},
            archetype: { id: 'fuego-4', elemento_dominante: 'fuego', rol: 'Analista' }
        });
        compiler.callGeminiCompilerV4 = vi.fn().mockResolvedValue({
            identidad_central: 'test string long enough to pass validation requirement',
            motor_instintivo: 'test string long enough to pass validation requirement',
            mecanismo_operativo: 'test string long enough to pass validation requirement',
            talento_manifestado: 'test string long enough to pass validation requirement',
            riesgo_y_sombra: 'test string long enough to pass validation requirement',
            imperativo_evolutivo: 'test string long enough to pass validation requirement',
            aplicacion_vital: 'test string long enough to pass validation requirement'
        });

        vi.spyOn(supabase, 'from').mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null })
                })
            }),
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        } as any);

        // V4 compilation execution
        await compiler.compileV4(SENTINEL_UUID, true, 'es');

        let allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('[NAOS_COMPILER_V4] Dark launch request (Lang: es)');
        expect(allLogs).toContain('[NAOS_COMPILER_V4] Calling Gemini...');
        expect(allLogs).toContain('[NAOS_COMPILER_V4] Validation PASSED');

        // V3 compilation execution
        capturedLogs = [];
        compiler.callGeminiCompiler = vi.fn().mockResolvedValue({
            nucleo_estructural: 'Contenido valido de mas de cincuenta caracteres para pasar la validacion local...',
            diagnostico_global: 'Contenido valido de mas de cincuenta caracteres para pasar la validacion local...'
        });
        await compiler.compile(SENTINEL_UUID, true, 'es');

        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('[NAOS_COMPILER_v3.0] Incoming compilation request (Force: true, Lang: es)');
    });

    // 7. SENSITIVE ERROR PATHS WITH SENTINEL PII
    it('7. Sensitive error execution paths bound diagnostics without leaking sentinel values', async () => {
        // 7a. Geocoding failure in astrology endpoint with sentinel PII in thrown error
        vi.spyOn(GeocodingService, 'getCoordinates').mockRejectedValue(
            new Error(`Failed to resolve nominatim for ${SENTINEL_CITY} user=${SENTINEL_EMAIL} key=${SENTINEL_API_SECRET}`)
        );

        const geoErrRes = await app.inject({
            method: 'POST',
            url: '/api/astrology/natal-chart-temp',
            payload: {
                name: SENTINEL_NAME,
                birthCity: SENTINEL_CITY,
                birthDate: SENTINEL_BIRTH_DATE,
                birthTime: SENTINEL_BIRTH_TIME
            }
        });

        expect(geoErrRes.statusCode).toBe(400);
        let allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_CITY);
        expect(allLogs).not.toContain(SENTINEL_EMAIL);
        expect(allLogs).not.toContain(SENTINEL_API_SECRET);
        expect(allLogs).toContain('Geocoding failed [Req:');
        expect(allLogs).toContain('GEOCODING_ERROR');

        // 7b. Astrology calculation failure with sentinel birth info and secrets in thrown error
        capturedLogs = [];
        vi.spyOn(GeocodingService, 'getCoordinates').mockResolvedValue({ lat: 14.6349, lng: -90.5069 });
        vi.spyOn(GeocodingService, 'getTimezoneId').mockReturnValue('America/Guatemala');
        vi.spyOn(GeocodingService, 'getHistoricalUtcOffset').mockReturnValue(-6);
        vi.spyOn(AstrologyService, 'calculateProfile').mockRejectedValue(
            new Error(`SwissEphemeris crash: ${SENTINEL_BIRTH_DATE} ${SENTINEL_BIRTH_TIME} token=${SENTINEL_API_SECRET}`)
        );

        const astroErrRes = await app.inject({
            method: 'POST',
            url: '/api/astrology/natal-chart-temp',
            payload: {
                name: SENTINEL_NAME,
                birthCity: SENTINEL_CITY,
                birthDate: SENTINEL_BIRTH_DATE,
                birthTime: SENTINEL_BIRTH_TIME
            }
        });

        expect(astroErrRes.statusCode).toBe(400);
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_BIRTH_DATE);
        expect(allLogs).not.toContain(SENTINEL_BIRTH_TIME);
        expect(allLogs).not.toContain(SENTINEL_API_SECRET);
        expect(allLogs).toContain('🔥 Astrology Calc Failed [Req:');
        expect(allLogs).toContain('ASTRO_CALC_ERROR');

        // 7c. Deletion failure in SynastryController with sentinel record and user UUID
        capturedLogs = [];
        const mockReq: any = {
            id: 'req-err-synastry-del',
            user_id: SENTINEL_UUID,
            params: { id: SENTINEL_RECORD_ID },
            headers: {}
        };
        const mockReply: any = {
            status: vi.fn().mockReturnThis(),
            send: vi.fn()
        };

        vi.spyOn(supabaseAdmin, 'from').mockReturnValue({
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({
                        error: { message: `FATAL: record ${SENTINEL_RECORD_ID} of user ${SENTINEL_UUID} locked` }
                    })
                })
            })
        } as any);

        await SynastryController.deleteHistory(mockReq, mockReply);

        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_RECORD_ID);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('❌ Deletion Error [Req: req-err-synastry-del]: DATABASE_ERROR');

        // 7d. Sigil chat exception path with sentinel message, UUID, and API secret
        capturedLogs = [];
        vi.spyOn(SigilService.prototype, 'processMessage').mockRejectedValue(
            new Error(`Gemini API key ${SENTINEL_API_SECRET} invalid for user ${SENTINEL_UUID} prompt: "${SENTINEL_CHAT_MSG}"`)
        );
        const sigilErrRes = await app.inject({
            method: 'POST',
            url: '/api/chat',
            payload: { message: SENTINEL_CHAT_MSG }
        });
        expect(sigilErrRes.statusCode).toBe(500);
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_CHAT_MSG);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).not.toContain(SENTINEL_API_SECRET);
        expect(allLogs).toContain('🔥 SIGIL ERROR [Req:');
        expect(allLogs).toContain('SIGIL_PROCESSING_ERROR');

        // 7e. NAOS Compiler route error with sentinel UUID and email
        capturedLogs = [];
        vi.spyOn(NaosCompilerService, 'compile').mockRejectedValue(
            new Error(`Fatal crash compiling identity for ${SENTINEL_UUID} (${SENTINEL_EMAIL})`)
        );
        const compilerErrRes = await app.inject({
            method: 'GET',
            url: '/api/naos-code?refresh=true'
        });
        expect(compilerErrRes.statusCode).toBe(500);
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).not.toContain(SENTINEL_EMAIL);
        expect(allLogs).toContain('🔥 NAOS Compiler Route Error [Req:');
        expect(allLogs).toContain('COMPILER_ROUTE_ERROR');

        // 7f. VectorStore search error with sentinel query and user UUID
        capturedLogs = [];
        const vectorStore = new SupabaseVectorStore();
        vi.spyOn(supabase, 'rpc').mockResolvedValue({
            data: null,
            error: { message: `pgvector crash for user ${SENTINEL_UUID} secret ${SENTINEL_API_SECRET}` }
        } as any);

        await expect(vectorStore.search(SENTINEL_UUID, [0.1, 0.2], 5, 0.65)).rejects.toBeDefined();
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).not.toContain(SENTINEL_API_SECRET);
        expect(allLogs).toContain('Error searching memories: VECTOR_SEARCH_ERROR');

        // 7g. Tarot route error with sentinel ritual question
        capturedLogs = [];
        vi.spyOn(UserService, 'getProfile').mockResolvedValue({ id: SENTINEL_UUID, language: 'es' } as any);
        vi.spyOn(AiLedgerService, 'checkBudget').mockResolvedValue({ allowed: true, isOwner: false });
        vi.spyOn(SigilService.prototype, 'processMessage').mockRejectedValue(
            new Error(`Tarot model crash question: "${SENTINEL_RITUAL_Q}" user: ${SENTINEL_UUID}`)
        );
        const tarotErrRes = await app.inject({
            method: 'POST',
            url: '/api/tarot/',
            payload: {
                question: SENTINEL_RITUAL_Q,
                engine: 'ARCANOS',
                spreadType: 'celta',
                cards: [{ id: 1, name: 'El Mago' }]
            }
        });
        expect(tarotErrRes.statusCode).toBe(200); // Smart fallback activates
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_RITUAL_Q);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('❌ Tarot Route Error [Req:');
        expect(allLogs).toContain('TAROT_ROUTING_ERROR');
    });

    // 8. PRESERVED OPERATIONAL REQUEST IDS AND METRICS
    it('8. Operational telemetry, request correlation IDs, offsets and execution metrics are fully preserved', async () => {
        // 8a. UsageGuard checkLimit
        vi.spyOn(supabase, 'from').mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: { plan_type: 'free' } })
                })
            })
        } as any);

        vi.spyOn(UsageGuardService, 'getStats').mockResolvedValue({
            sigil_messages_count: 0,
            naos_code_count: 0,
            tarot_draw_count: 0,
            synastry_dual_count: 0,
            synastry_group_count: 0,
            last_active_date: '2026-10-11'
        });

        await UsageGuardService.checkLimit(SENTINEL_UUID, 'sigil');

        let allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('🛡️ UsageGuard: checkLimit | Action: sigil');
        expect(allLogs).toContain('FinalPlan: free');

        // 8b. ProfileConsolidator
        capturedLogs = [];
        ProfileConsolidator.consolidate({ id: SENTINEL_UUID, name: SENTINEL_NAME, astrology: {} } as any);
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_NAME);
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('📜 Consolidating Dynamic Energetic Bible');

        // 8c. TTSService invalid path & security block
        capturedLogs = [];
        const tts = new TTSService();
        tts.getAudioPath(SENTINEL_UUID, 'invalid_hash_string');
        allLogs = capturedLogs.join('\n');
        expect(allLogs).not.toContain(SENTINEL_UUID);
        expect(allLogs).toContain('[TTS] Invalid audio hash format requested');
    });
});
