import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { validateUser, validatePremium, validateAdmin } from '../middleware/auth';
import { UsageGuardService } from '../modules/user/UsageGuard';
import { NaosCompilerService } from '../modules/user/naosCompiler.service';
import { config } from '../config/env';
import { supabase } from '../lib/supabase';

// Mock dependencies
vi.mock('../lib/supabase', () => {
    return {
        supabase: {
            auth: {
                getUser: vi.fn()
            },
            from: vi.fn()
        }
    };
});

describe('Phase 5B — Authorization Integrity & Role Isolation Suite', () => {
    let app: FastifyInstance;

    beforeEach(async () => {
        vi.clearAllMocks();
        app = Fastify({ logger: false });

        // Protected test routes
        app.get('/test/authenticated', { preHandler: [validateUser] }, async (req) => {
            return { user: (req as any).user };
        });

        app.get('/test/premium', { preHandler: [validateUser, validatePremium] }, async (req) => {
            return { ok: true, user: (req as any).user };
        });

        app.get('/test/admin', { preHandler: [validateUser, validateAdmin] }, async (req) => {
            return { ok: true, user: (req as any).user };
        });

        await app.ready();
    });

    afterEach(async () => {
        await app.close();
    });

    const setupAuthMock = (params: {
        user: { id: string; email?: string } | null;
        authError?: any;
        profile?: { plan_type?: any; system_role?: any; profile_data?: any } | null;
        profileError?: any;
    }) => {
        (supabase.auth.getUser as any).mockResolvedValue({
            data: { user: params.user },
            error: params.authError || null
        });

        const singleMock = vi.fn().mockResolvedValue({
            data: params.profile || null,
            error: params.profileError || null
        });

        const maybeSingleMock = vi.fn().mockResolvedValue({
            data: params.profile || null,
            error: params.profileError || null
        });

        const eqMock = vi.fn().mockReturnValue({ 
            single: singleMock,
            maybeSingle: maybeSingleMock
        });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

        (supabase.from as any).mockReturnValue({
            select: selectMock
        });
    };

    // --- REQUIREMENT 1: ELIMINATION OF UNSAFE EXCEPTIONS ---

    it('T1-A: Founder lookalike substring email (luis.herrera) is NOT elevated to admin', async () => {
        setupAuthMock({
            user: { id: 'usr-attacker-1', email: 'attacker.luis.herrera@gmail.com' },
            profile: { plan_type: 'free', system_role: 'user' }
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('free');
        expect(body.user.system_role).toBe('user');
    });

    it('T1-B: Founder lookalike substring email (herreramendez) is NOT elevated to admin', async () => {
        setupAuthMock({
            user: { id: 'usr-attacker-2', email: 'fake_herreramendez@domain.org' },
            profile: { plan_type: 'free', system_role: 'user' }
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('free');
        expect(body.user.system_role).toBe('user');
    });

    it('T2: Historical test emails (luis@luis.com, lahm@lahm.com) are NOT elevated to admin', async () => {
        for (const testEmail of ['luis@luis.com', 'lahm@lahm.com']) {
            setupAuthMock({
                user: { id: 'usr-test-email', email: testEmail },
                profile: { plan_type: 'free', system_role: 'user' }
            });

            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer valid-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('free');
            expect(body.user.system_role).toBe('user');
        }
    });

    it('T3: Historical hardcoded UUIDs are NOT elevated to admin without DB role', async () => {
        const historicalUuids = [
            '22325a10-7b9f-4606-8a54-574bb63ba6a8',
            '1c6e74b8-ad52-41c3-bc95-2577cd3c67e8'
        ];

        for (const uuid of historicalUuids) {
            setupAuthMock({
                user: { id: uuid, email: 'unprivileged@example.com' },
                profile: { plan_type: 'free', system_role: 'user' }
            });

            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer valid-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('free');
            expect(body.user.system_role).toBe('user');
        }
    });

    // --- REQUIREMENT 2: DATABASE-AUTHORITATIVE ROLE RESOLUTION ---

    it('T4: Normal authenticated user receives role=free and system_role=user', async () => {
        setupAuthMock({
            user: { id: 'usr-regular-1', email: 'regular.person@example.com' },
            profile: { plan_type: 'free', system_role: 'user' }
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('free');
        expect(body.user.system_role).toBe('user');
    });

    it('T5: Premium subscribers receive role=premium and system_role=user', async () => {
        for (const plan of ['premium', 'premium_plus']) {
            setupAuthMock({
                user: { id: 'usr-sub-1', email: 'subscriber@example.com' },
                profile: { plan_type: plan, system_role: 'user' }
            });

            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer valid-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('premium');
            expect(body.user.system_role).toBe('user');
        }
    });

    it('T6: Legitimate database OWNER receives role=admin and system_role=owner', async () => {
        setupAuthMock({
            user: { id: 'usr-founder-root', email: 'founder@example.com' },
            profile: { plan_type: 'admin', system_role: 'owner' }
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('admin');
        expect(body.user.system_role).toBe('owner');
    });

    it('T7: System admin with non-owner role receives role=admin and system_role=admin', async () => {
        setupAuthMock({
            user: { id: 'usr-admin-1', email: 'sysadmin@example.com' },
            profile: { plan_type: 'free', system_role: 'admin' }
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('admin');
        expect(body.user.system_role).toBe('admin');
    });

    // --- REQUIREMENT 3: FALLBACK QUERY & FAIL-CLOSED BEHAVIOR ---

    it('T8: Missing or invalid JWT fails with 401 Unauthorized', async () => {
        // Missing token
        const resMissing = await app.inject({
            method: 'GET',
            url: '/test/authenticated'
        });
        expect(resMissing.statusCode).toBe(401);

        // Invalid token
        setupAuthMock({ user: null, authError: { message: 'Invalid token' } });
        const resInvalid = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer bad-token' }
        });
        expect(resInvalid.statusCode).toBe(401);
    });

    it('T9: Primary SDK lookup fails but REST fallback succeeds with plan_type and system_role', async () => {
        // SDK fails
        setupAuthMock({
            user: { id: 'usr-fallback-1', email: 'founder@example.com' },
            profile: null,
            profileError: { message: 'RLS blocked anon client' }
        });

        // Mock global fetch for REST fallback
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ plan_type: 'admin', system_role: 'owner' }]
        } as any);

        try {
            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer fallback-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('admin');
            expect(body.user.system_role).toBe('owner');

            // Verify fetch URL selected both plan_type and system_role
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('select=plan_type,system_role&id=eq.usr-fallback-1'),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer fallback-token'
                    })
                })
            );
        } finally {
            global.fetch = originalFetch;
        }
    });

    it('T10: Both primary DB and fallback REST fail -> fails closed to free/user', async () => {
        setupAuthMock({
            user: { id: 'usr-fail-both', email: 'anyone@example.com' },
            profile: null,
            profileError: { message: 'DB down' }
        });

        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        try {
            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer some-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('free');
            expect(body.user.system_role).toBe('user');
        } finally {
            global.fetch = originalFetch;
        }
    });

    // --- REQUIREMENT 4: CLIENT SPOOFING & GATE ENFORCEMENT ---

    it('T11: Client-provided role values in body or headers cannot elevate user', async () => {
        setupAuthMock({
            user: { id: 'usr-spoof-1', email: 'spoofed@example.com' },
            profile: { plan_type: 'free', system_role: 'user' }
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: {
                authorization: 'Bearer valid-token',
                'x-user-role': 'admin',
                'x-system-role': 'owner'
            }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('free');
        expect(body.user.system_role).toBe('user');
    });

    it('T12: validateAdmin admits owner and admin, strictly rejects standard users with 403', async () => {
        // Owner -> 200
        setupAuthMock({
            user: { id: 'usr-owner', email: 'owner@example.com' },
            profile: { plan_type: 'admin', system_role: 'owner' }
        });
        const resOwner = await app.inject({
            method: 'GET',
            url: '/test/admin',
            headers: { authorization: 'Bearer valid-token' }
        });
        expect(resOwner.statusCode).toBe(200);

        // System Admin -> 200
        setupAuthMock({
            user: { id: 'usr-admin', email: 'admin@example.com' },
            profile: { plan_type: 'free', system_role: 'admin' }
        });
        const resAdmin = await app.inject({
            method: 'GET',
            url: '/test/admin',
            headers: { authorization: 'Bearer valid-token' }
        });
        expect(resAdmin.statusCode).toBe(200);

        // Regular user with substring email -> 403
        setupAuthMock({
            user: { id: 'usr-fake-admin', email: 'attacker_luis.herrera@gmail.com' },
            profile: { plan_type: 'free', system_role: 'user' }
        });
        const resAttacker = await app.inject({
            method: 'GET',
            url: '/test/admin',
            headers: { authorization: 'Bearer valid-token' }
        });
        expect(resAttacker.statusCode).toBe(403);
    });

    it('T13: validatePremium admits premium and admin, rejects free tier with 403', async () => {
        // Premium -> 200
        setupAuthMock({
            user: { id: 'usr-prem', email: 'prem@example.com' },
            profile: { plan_type: 'premium', system_role: 'user' }
        });
        const resPrem = await app.inject({
            method: 'GET',
            url: '/test/premium',
            headers: { authorization: 'Bearer valid-token' }
        });
        expect(resPrem.statusCode).toBe(200);

        // Admin -> 200
        setupAuthMock({
            user: { id: 'usr-adm', email: 'adm@example.com' },
            profile: { plan_type: 'admin', system_role: 'owner' }
        });
        const resAdm = await app.inject({
            method: 'GET',
            url: '/test/premium',
            headers: { authorization: 'Bearer valid-token' }
        });
        expect(resAdm.statusCode).toBe(200);

        // Free -> 403
        setupAuthMock({
            user: { id: 'usr-free', email: 'free@example.com' },
            profile: { plan_type: 'free', system_role: 'user' }
        });
        const resFree = await app.inject({
            method: 'GET',
            url: '/test/premium',
            headers: { authorization: 'Bearer valid-token' }
        });
        expect(resFree.statusCode).toBe(403);
    });

    // --- REQUIREMENT 5: USAGEGUARD & V4 ARCHETYPE ISOLATION ---

    it('T14: UsageGuard compatibility — honors planType=admin for unlimited exemptions', async () => {
        setupAuthMock({
            user: { id: 'usr-admin-exempt', email: 'owner@example.com' },
            profile: {
                plan_type: 'admin',
                system_role: 'owner',
                profile_data: { usage_stats: { tarot_draw_count: 50, synastry_dual_count: 50, synastry_group_count: 50, sigil_messages_count: 50, naos_code_count: 50, last_reset_date: new Date().toISOString().split('T')[0] } }
            }
        });

        // Admin plan bypasses all action limits
        const adminCheckTarot = await UsageGuardService.checkLimit('usr-admin-exempt', 'tarot', 'admin');
        expect(adminCheckTarot.ok).toBe(true);

        const adminCheckSynastry = await UsageGuardService.checkLimit('usr-admin-exempt', 'synastry_dual', 'admin');
        expect(adminCheckSynastry.ok).toBe(true);

        const adminCheckSigil = await UsageGuardService.checkLimit('usr-admin-exempt', 'sigil', 'admin');
        expect(adminCheckSigil.ok).toBe(true);
    });

    it('T15: Archetype V4 compilation isolation requires BOTH V4 flag and system_role=owner', async () => {
        const compileV4Spy = vi.spyOn(NaosCompilerService as any, 'compileV4').mockResolvedValue({ status: 'V4_SUCCESS' });
        const getProfileSpy = vi.spyOn(NaosCompilerService as any, 'getCompleteProfile').mockImplementation(async () => {
            throw new Error('V3_TRIGGERED');
        });

        // Case 1: Flag OFF, Owner -> V4 not called, falls back to V3
        config.NAOS_ARCHETYPE_V4_ENABLED = false;
        try {
            await NaosCompilerService.compile('user-1', false, 'es', { system_role: 'owner' });
        } catch (e: any) {
            expect(e.message).toBe('V3_TRIGGERED');
        }
        expect(compileV4Spy).not.toHaveBeenCalled();

        // Case 2: Flag ON, Non-owner (attacker or standard user) -> V4 not called, falls back to V3
        config.NAOS_ARCHETYPE_V4_ENABLED = true;
        try {
            await NaosCompilerService.compile('user-2', false, 'es', { system_role: 'user' });
        } catch (e: any) {
            expect(e.message).toBe('V3_TRIGGERED');
        }
        expect(compileV4Spy).not.toHaveBeenCalled();

        // Case 3: Flag ON, System Admin (non-owner) -> V4 not called, falls back to V3
        try {
            await NaosCompilerService.compile('user-3', false, 'es', { system_role: 'admin' });
        } catch (e: any) {
            expect(e.message).toBe('V3_TRIGGERED');
        }
        expect(compileV4Spy).not.toHaveBeenCalled();

        // Case 4: Flag ON, Legitimate Owner -> V4 CALLED
        const v4Res = await NaosCompilerService.compile('user-4', false, 'es', { system_role: 'owner' });
        expect(v4Res).toEqual({ status: 'V4_SUCCESS' });
        expect(compileV4Spy).toHaveBeenCalledWith('user-4', false, 'es');

        // Restore mocks and flag
        config.NAOS_ARCHETYPE_V4_ENABLED = false;
        compileV4Spy.mockRestore();
        getProfileSpy.mockRestore();
    });

    // --- REQUIREMENT 6: FINAL GATE — STRICT ALLOWLIST & LOG PRIVACY ---

    it('T16: Missing plan_type in profile defaults fail-closed to role=free', async () => {
        setupAuthMock({
            user: { id: 'usr-missing-plan', email: 'user@example.com' },
            profile: { system_role: 'user' } // plan_type undefined
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('free');
        expect(body.user.system_role).toBe('user');
    });

    it('T17: Missing system_role in profile defaults fail-closed to system_role=user', async () => {
        setupAuthMock({
            user: { id: 'usr-missing-role', email: 'user@example.com' },
            profile: { plan_type: 'free' } // system_role undefined
        });

        const res = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer valid-token' }
        });

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body.user.role).toBe('free');
        expect(body.user.system_role).toBe('user');
    });

    it('T18: Malformed or unapproved system_role strings/types fail closed to user', async () => {
        const malformedRoles = ['superadmin', 'root', 'hacker', 'MANAGER', 'admin_override', 12345, null, ''];

        for (const malformed of malformedRoles) {
            setupAuthMock({
                user: { id: 'usr-malformed-role', email: 'attacker@example.com' },
                profile: { plan_type: 'free', system_role: malformed as any }
            });

            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer valid-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.system_role).toBe('user');
            expect(body.user.role).toBe('free');
        }
    });

    it('T19: Malformed or unapproved plan_type strings/types fail closed to free', async () => {
        const malformedPlans = ['god_mode', 'vip_unlimited', 'enterprise', 'platinum', 999, null, ''];

        for (const malformed of malformedPlans) {
            setupAuthMock({
                user: { id: 'usr-malformed-plan', email: 'attacker@example.com' },
                profile: { plan_type: malformed as any, system_role: 'user' }
            });

            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer valid-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.role).toBe('free');
            expect(body.user.system_role).toBe('user');
        }
    });

    it('T20: Contradictory SDK and REST: REST supplies missing system_role, validates strictly against allowlist', async () => {
        // SDK has plan_type=free, but missing system_role
        setupAuthMock({
            user: { id: 'usr-contra-1', email: 'admin@example.com' },
            profile: { plan_type: 'free' } // system_role missing
        });

        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ plan_type: 'free', system_role: 'admin' }]
        } as any);

        try {
            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer contra-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.system_role).toBe('admin');
            expect(body.user.role).toBe('admin');
        } finally {
            global.fetch = originalFetch;
        }
    });

    it('T21: Contradictory SDK and REST: REST supplies malformed system_role, fails closed to user', async () => {
        setupAuthMock({
            user: { id: 'usr-contra-2', email: 'hacker@example.com' },
            profile: { plan_type: 'free' } // system_role missing
        });

        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [{ plan_type: 'free', system_role: 'super_root_admin' }]
        } as any);

        try {
            const res = await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer contra-token' }
            });

            expect(res.statusCode).toBe(200);
            const body = JSON.parse(res.body);
            expect(body.user.system_role).toBe('user');
            expect(body.user.role).toBe('free');
        } finally {
            global.fetch = originalFetch;
        }
    });

    it('T22: Log Privacy — Auth failures and fallback errors emit stable event codes without raw error objects', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // 1. Auth failure
        setupAuthMock({
            user: null,
            authError: new Error('Sensitive Supabase Exception: token=eyJhbGciOiJIUzI1Ni... user=secret@secret.com')
        });

        const resAuthFail = await app.inject({
            method: 'GET',
            url: '/test/authenticated',
            headers: { authorization: 'Bearer leaking-token' }
        });
        expect(resAuthFail.statusCode).toBe(401);

        // Check logs for auth fail
        const warnCalls = consoleWarnSpy.mock.calls.map(c => c.join(' '));
        const authFailLog = warnCalls.find(l => l.includes('[AUTH_FAIL]'));
        expect(authFailLog).toBeDefined();
        expect(authFailLog).toContain('AUTH_VALIDATION_FAILED');
        expect(authFailLog).not.toContain('eyJhbGciOiJIUzI1Ni');
        expect(authFailLog).not.toContain('secret@secret.com');

        // 2. REST Fallback failure
        setupAuthMock({
            user: { id: 'usr-leak-test', email: 'user@example.com' },
            profile: null,
            profileError: { message: 'RLS block' }
        });

        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockRejectedValue(new Error('Sensitive Network Error with DB URL postgresql://admin:secret@db.internal:5432'));

        try {
            await app.inject({
                method: 'GET',
                url: '/test/authenticated',
                headers: { authorization: 'Bearer fallback-token' }
            });

            const fallbackLog = consoleWarnSpy.mock.calls.map(c => c.join(' ')).find(l => l.includes('[AUTH_FETCH]'));
            expect(fallbackLog).toBeDefined();
            expect(fallbackLog).toContain('PROFILE_FETCH_FAILED');
            expect(fallbackLog).not.toContain('postgresql://');
            expect(fallbackLog).not.toContain('secret@db.internal');
        } finally {
            global.fetch = originalFetch;
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        }
    });
});
