import { FastifyInstance } from 'fastify';
import { validateUser } from '../../middleware/auth';
import { MemoryController } from './memory.controller';

/**
 * Memory routes — Privacy-first endpoints for user memory management.
 * 
 * Registered with prefix '/api/memory' in app.ts.
 * All routes require authentication via validateUser middleware.
 */
export default async function memoryRoutes(fastify: FastifyInstance) {
    // Auth hook for all memory routes
    fastify.addHook('preValidation', validateUser);

    // Privacy & Settings
    fastify.get('/settings', MemoryController.getSettings);
    fastify.put('/settings', MemoryController.updateSettings);

    // Semantic Search
    fastify.post('/search', MemoryController.searchMemories);

    // CRUD
    fastify.get('/', MemoryController.listMemories);
    fastify.get('/:id', MemoryController.getMemory);
    fastify.get('/:id/provenance', MemoryController.getProvenance);
    fastify.put('/:id', MemoryController.correctMemory);
    fastify.delete('/:id', MemoryController.deleteMemory);
}
