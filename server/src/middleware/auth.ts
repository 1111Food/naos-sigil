import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';

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
            console.warn(`❌ [AUTH_FAIL] Request ${requestId} | Invalid User or Token. Error:`, error);
            return reply.status(401).send({ error: 'Sesión expirada o inválida' });
        }

        console.log(`✅ [AUTH_OK] Request ${requestId} | User: ${user.id}`);

        // Inject user_id into the request for downstream use
        (request as any).user_id = user.id;
        (request as any).token = token;
    } catch (error: any) {
        console.error(`🔥 [AUTH_CRASH] Request ${requestId} | Error:`, error.message);
        const status = error.message === 'SUPABASE_AUTH_TIMEOUT' ? 504 : 401;
        return reply.status(status).send({ error: `Auth Error: ${error.message}` });
    }
};
