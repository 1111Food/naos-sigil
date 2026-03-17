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

export const buildApp = async (): Promise<FastifyInstance> => {
    const app = fastify({
        logger: true,
        ignoreTrailingSlash: true
    });

    /*
    await app.register(cors, {
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://192.168.1.72:5174',
            'https://naos-platform.vercel.app',
            'https://naos-sigil.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Profile-Id', 'x-profile-id'],
        credentials: true,
        preflightContinue: false
    });
    */

    app.addHook('onRequest', async (request, reply) => {
        reply.header('Access-Control-Allow-Origin', 'https://naos-sigil.vercel.app');
        reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Profile-Id, x-profile-id');
        reply.header('Access-Control-Allow-Credentials', 'true');

        if (request.method === 'OPTIONS') {
            return reply.status(204).send();
        }
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

    return app;
};
