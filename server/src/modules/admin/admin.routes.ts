import { FastifyPluginAsync } from 'fastify';
import { AdminController } from './admin.controller';
import { validateUser, validateAdmin } from '../../middleware/auth';

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
    // Both middlewares chained together protect everything inside this router plugin
    fastify.get('/users', { preHandler: [validateUser, validateAdmin] }, AdminController.listUsers);
    fastify.post('/set-role', { preHandler: [validateUser, validateAdmin] }, AdminController.updateRole);
    fastify.delete('/users/:id', { preHandler: [validateUser, validateAdmin] }, AdminController.deleteUser);
};
