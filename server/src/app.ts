import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
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

export const buildApp = async (): Promise<FastifyInstance> => {
    const app = fastify({
        logger: true,
        ignoreTrailingSlash: true
    });


    await app.register(cors, {
        origin: [
            'https://naos-sigil.vercel.app',
            'http://localhost:5173',
            'http://localhost:5174'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Profile-Id', 'x-profile-id'],
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

    return app;
};
