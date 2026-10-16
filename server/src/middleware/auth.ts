import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { config } from '../config/env';

const ALLOWED_SYSTEM_ROLES = new Set(['user', 'admin', 'owner']);
const ALLOWED_PLAN_TYPES = new Set(['free', 'premium', 'premium_plus', 'admin']);

export const validateUser = async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = Math.random().toString(36).substring(7);
    const authHeader = request.headers.authorization;
    const url = request.url;

    console.log(`📡 [AUTH_IN] Request ${requestId} | Method: ${request.method} | URL: ${url}`);

    try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.warn(`⚠️ [AUTH_FAIL] Request ${requestId} | No Bearer Token`);
            return reply.status(401).send({ error: 'Falta token de sesión mística' });
        }

        const token = authHeader.split(' ')[1];
        
        // Timeout Protection for Supabase (Critical Fix for Hangs)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('SUPABASE_AUTH_TIMEOUT')), 10000)
        );

        console.log(`⏳ [AUTH_WAIT] Request ${requestId} | Validating with Supabase...`);
        
        const { data: { user }, error } = await Promise.race([
            supabase.auth.getUser(token),
            timeoutPromise
        ]) as any;

        if (error || !user) {
            console.warn(`❌ [AUTH_FAIL] Request ${requestId} | Invalid User or Token: AUTH_VALIDATION_FAILED`);
            return reply.status(401).send({ error: 'Sesión expirada o inválida' });
        }

        console.log(`✅ [AUTH_OK] Request ${requestId} | User validated`);

        // Inject user_id and token into the request for downstream use
        (request as any).user_id = user.id;
        (request as any).token = token;

        // --- RBAC INJECTION (Database-Authoritative) ---
        let { data: profile } = await supabase
            .from('profiles')
            .select('plan_type, system_role')
            .eq('id', user.id)
            .single();

        let profilePlan = profile?.plan_type;
        let profileSystemRole = profile?.system_role;

        // If profile wasn't found or system_role is missing, fetch directly via REST API with user's own token
        if (!profilePlan || !profileSystemRole) {
            try {
                const supabaseUrl = config.SUPABASE_URL || 'https://avaikhukgugvcocwedsz.supabase.co';
                const supabaseAnonKey = config.SUPABASE_ANON_KEY || '';
                const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=plan_type,system_role&id=eq.${user.id}`, {
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        if (!profilePlan) profilePlan = data[0].plan_type;
                        if (!profileSystemRole) profileSystemRole = data[0].system_role;
                    }
                }
            } catch (fetchErr) {
                // SEC-5B: Log stable diagnostic event code without raw error object or URL details
                console.warn(`⚠️ [AUTH_FETCH] Request ${requestId} | Profile fetch fallback failed: PROFILE_FETCH_FAILED`);
            }
        }

        // Strict allowlist validation — any malformed or unknown value fails closed
        const candidatePlan = typeof profilePlan === 'string' ? profilePlan.trim().toLowerCase() : '';
        const validPlan = ALLOWED_PLAN_TYPES.has(candidatePlan) ? candidatePlan : 'free';

        const candidateSystemRole = typeof profileSystemRole === 'string' ? profileSystemRole.trim().toLowerCase() : '';
        const validSystemRole = ALLOWED_SYSTEM_ROLES.has(candidateSystemRole) ? candidateSystemRole : 'user';

        // Database-authoritative privilege resolution:
        // System administrative privileges require database-backed 'owner' or 'admin'.
        // Administrative accounts (owner/admin) or plan_type='admin' inherit usage exemptions.
        const isInternalAdmin = validSystemRole === 'owner' || validSystemRole === 'admin' || validPlan === 'admin';
        const userRole = isInternalAdmin
            ? 'admin'
            : (validPlan === 'premium' || validPlan === 'premium_plus')
                ? 'premium'
                : 'free';

        (request as any).user = {
            id: user.id,
            role: userRole,
            system_role: validSystemRole
        };

    } catch (error: any) {
        const isTimeout = error?.message === 'SUPABASE_AUTH_TIMEOUT';
        console.error(`🔥 [AUTH_CRASH] Request ${requestId} | Error: ${isTimeout ? 'SUPABASE_AUTH_TIMEOUT' : 'AUTH_INTERNAL_ERROR'}`);
        const status = isTimeout ? 504 : 401;
        return reply.status(status).send({ error: isTimeout ? 'Auth Error: SUPABASE_AUTH_TIMEOUT' : 'Auth Error: AUTH_INTERNAL_ERROR' });
    }
};

export const validatePremium = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    // STRICT RBAC CHECK
    if (!user || (user.role !== "premium" && user.role !== "admin")) {
        console.warn(`🚨 [RBAC_DENIED] Restricted feature accessed by role: ${user?.role || 'null'}`);
        return reply.status(403).send({ error: "Access denied or AI restricted feature" });
    }
};

export const validateAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    // STRICT ADMIN CHECK
    if (!user || (user.system_role !== 'owner' && user.system_role !== 'admin')) {
        return reply.status(403).send({ error: "Access denied: Admin restricted feature" });
    }
};
