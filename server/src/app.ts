import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyRawBody from 'fastify-raw-body';
import { config } from './config/env';
import { apiRoutes } from './routes/api';
import { tarotRoutes } from './routes/tarot';
import { astrologyRoutes } from './routes/astrology';
import { synastryRoutesV2 } from './modules/synastry/synastry.routes';
import { coherenceRoutes } from './routes/coherence';
import { rankingRoutes } from './routes/ranking';
import rosterRoutes from './modules/roster/roster.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { webhookRoutes } from './routes/webhooks';
import { interpretRoutes } from './routes/interpret';
import { checkoutRoutes } from './routes/checkout';
import { relationshipRoutes } from './routes/relationship';
import memoryRoutes from './modules/memory/memory.routes';
import { reviewRoutes } from './routes/review';
import fastifyRateLimit from '@fastify/rate-limit';
export const buildApp = async (): Promise<FastifyInstance> => {
    const app = fastify({
        logger: {
            serializers: {
                req(request) {
                    // SEC-F2B.3: Redact sensitive query parameters from req.url to prevent PII/secret leaks
                    let safeUrl = request.url;
                    if (safeUrl.includes('?')) {
                        safeUrl = safeUrl.replace(/([?&])(token|secret|email|password|key|ids)=([^&]+)/gi, '$1$2=[REDACTED]');
                    }
                    return {
                        method: request.method,
                        url: safeUrl,
                        hostname: request.hostname,
                        remoteAddress: request.ip,
                        remotePort: request.socket?.remotePort
                    };
                }
            }
        },
        ignoreTrailingSlash: true,
        trustProxy: 1 // SEC-F2B.1: Trust only the first hop load balancer to prevent X-Forwarded-For spoofing
    });

    // --- AI REVIEW MODE KILL SWITCH (BACKEND AUTHORITY) ---
    app.addHook('onRequest', async (request, reply) => {
        const path = request.url;
        // Si la ruta pertenece a los módulos de Review/Demo, verifica el estado en memoria
        if (path.startsWith('/api/review') || path.startsWith('/api/demo')) {
            const isDemoEnabled = (global as any).isAiReviewModeActive === true;
            if (!isDemoEnabled) {
                // Kill switch is ACTIVE (Review mode is OFF). Deny strictly.
                return reply.status(403).send({ 
                    error: "Forbidden", 
                    message: "NAOS Review Mode is currently locked by the Architect (Kill Switch Active). Real-time endpoints denied." 
                });
            }
        }
    });

    // Public endpoint for the client to check if the route is open
    app.get('/api/system/demo-mode', async (request, reply) => {
        return { enabled: (global as any).isAiReviewModeActive === true };
    });

    // Required for Stripe Webhook signature verification
    await app.register(fastifyRawBody, {
        field: 'rawBody',
        global: false,
        encoding: 'utf8',
        runFirst: true
    });

    await app.register(fastifyRateLimit, {
        global: false,
        max: 5,
        timeWindow: '1 minute',
        hook: 'preHandler', // SEC-F2B: Ensures validateUser runs first so req.user_id exists
        keyGenerator: (req) => {
            return (req as any).user_id || req.ip; // Limit by user if authenticated, otherwise IP
        },
        errorResponseBuilder: function (request, context) {
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: {
                    es: 'Has realizado varias solicitudes en poco tiempo. Inténtalo nuevamente en unos momentos.',
                    en: "You've made several requests in a short period. Please try again in a moment."
                }
            };
        }
    });

    // ── SEC-F2B.2: CORS — strict allowlist, no wildcard fallback ──────────────
    // Webhooks (Paddle, Stripe) are server-to-server with no Origin header.
    // They are authenticated via signature, not CORS — leave them unaffected.
    const CORS_ALLOWLIST = new Set([
        // Production frontends — only origins confirmed to consume the backend API
        'https://naos-sigil.vercel.app',
        'https://naosos.app',
        'https://www.naosos.app'
    ]);

    // SEC-F2B.2: Local development only, excluded from production
    if (process.env.NODE_ENV !== 'production') {
        ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'].forEach(o => CORS_ALLOWLIST.add(o));
    }

    await app.register(cors, {
        origin: (origin, cb) => {
            // Allow server-to-server requests that carry no Origin (webhooks, curl, health checks)
            if (!origin) return cb(null, true);

            if (CORS_ALLOWLIST.has(origin)) {
                return cb(null, true);
            }

            // Controlled 403 for unauthorized origins — must not produce a 500
            const err = new Error('CORS: origin not allowed') as any;
            err.statusCode = 403;
            return cb(err, false);
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Profile-Id', 'x-profile-id', 'Accept', 'Origin'],
        // SEC-F2B.2: credentials: false — frontend uses Authorization header (JWT), NOT cross-origin cookies.
        // Access-Control-Allow-Credentials: true is not required and reduces CSRF attack surface.
        credentials: false
    });

    // ── SEC-F2B.2: Security headers on every API response ────────────────────
    app.addHook('onSend', async (request, reply) => {
        // Prevent MIME-type sniffing attacks
        reply.header('X-Content-Type-Options', 'nosniff');
        // Prevent clickjacking on any HTML served directly by the API
        reply.header('X-Frame-Options', 'DENY');
        // Don't leak Referer to third parties from API responses
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
        // HSTS for production HTTPS — 1 year, no subdomains until all are HTTPS-verified
        if (request.protocol === 'https') {
            reply.header('Strict-Transport-Security', 'max-age=31536000');
        }
        // Remove server version disclosure — Fastify sets this by default
        reply.removeHeader('x-powered-by');
    });

    app.get('/health', async (request, reply) => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await app.register(apiRoutes);
    await app.register(tarotRoutes, { prefix: '/api/tarot' });
    await app.register(astrologyRoutes, { prefix: '/api/astrology' });
    await app.register(coherenceRoutes, { prefix: '/api/coherence' });
    await app.register(rankingRoutes, { prefix: '/api/ranking' });
    await app.register(synastryRoutesV2, { prefix: '/api/synastry' });
    await app.register(rosterRoutes);
    await app.register(adminRoutes, { prefix: '/api/admin' });
    await app.register(webhookRoutes);
    await app.register(interpretRoutes, { prefix: '/api/energy-code' });
    await app.register(checkoutRoutes, { prefix: '/api/checkout' });
    await app.register(relationshipRoutes, { prefix: '/api/relationship' });
    await app.register(memoryRoutes, { prefix: '/api/memory' });
    await app.register(reviewRoutes, { prefix: '/api/review' });

    return app;
};
