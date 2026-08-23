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
        logger: true,
        ignoreTrailingSlash: true
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
        errorResponseBuilder: function (request, context) {
            const err: any = new Error('Frecuencia saturada. El Sigil necesita estabilizarse. Por favor, espera un minuto antes de enviar otra consulta.');
            err.statusCode = 429;
            return err;
        }
    });

    await app.register(cors, {
        origin: (origin, cb) => {
            // Allow requests with no origin (like mobile apps, curl, postman)
            if (!origin) return cb(null, true);

            const allowedStatic = [
                'https://naos-sigil.vercel.app',
                'https://naosos.app',
                'https://www.naosos.app',
                'https://naos-os.com',
                'https://www.naos-os.com',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:3000',
                'http://localhost:3001'
            ];

            if (
                allowedStatic.includes(origin) ||
                origin.endsWith('.naosos.app') ||
                origin.endsWith('.naos-os.com') ||
                origin.endsWith('.vercel.app')
            ) {
                return cb(null, true);
            }

            cb(null, true); // Fallback allow to guarantee no user gets blocked by CORS on new domains
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Profile-Id', 'x-profile-id', 'Accept', 'Origin'],
        credentials: true
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
