import { FastifyPluginAsync } from 'fastify';
import { SynastryController } from './synastry.controller';
import { analyzeSchema, historySchema, deleteHistorySchema, analyzeGroupSchema } from './synastry.schema';
import { validateUser, validatePremium } from '../../middleware/auth';

export const synastryRoutesV2: FastifyPluginAsync = async (fastify) => {
    fastify.get('/ping', async () => { return { status: 'Synastry Routes Active' }; });
    fastify.post('/analyze', { preHandler: [validateUser, validatePremium], schema: analyzeSchema }, SynastryController.analyze);
    fastify.post('/analyze/group', { preHandler: [validateUser, validatePremium], schema: analyzeGroupSchema }, SynastryController.analyzeGroup);
    fastify.get('/history', { preHandler: [validateUser, validatePremium] }, SynastryController.getHistory);
    fastify.delete('/record/:id', { preHandler: [validateUser, validatePremium], schema: deleteHistorySchema }, SynastryController.deleteHistory);
    // Fallback delete route for malformed client requests
    fastify.delete('/:id', { preHandler: [validateUser, validatePremium], schema: deleteHistorySchema }, SynastryController.deleteHistory);
};
