import { FastifyInstance } from 'fastify';
import { validateUser } from '../../middleware/auth';
import { RosterController } from './roster.controller';

export default async function rosterRoutes(fastify: FastifyInstance) {
    // Add auth hook strictly for all roster routes
    fastify.addHook('preValidation', validateUser);

    fastify.post('/api/roster', RosterController.addProfile);
    fastify.get('/api/roster', RosterController.getProfiles);
    fastify.put('/api/roster/:id', RosterController.updateProfile);
    fastify.delete('/api/roster/:id', RosterController.deleteProfile);
}
