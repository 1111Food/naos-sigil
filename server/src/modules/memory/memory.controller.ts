import { FastifyRequest, FastifyReply } from 'fastify';
import { memoryService } from './MemoryService';
import { MemorySearchFilter } from './types';

/**
 * MemoryController — Privacy-first REST handlers for user memory management.
 * 
 * All handlers require authenticated user via validateUser middleware.
 * Memory failure never crashes the request — graceful degradation throughout.
 */
export class MemoryController {

    /**
     * GET /api/memory
     * List user's memories with optional filters and pagination.
     */
    public static async listMemories(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        try {
            const query = request.query as {
                limit?: string;
                offset?: string;
                memory_type?: string;
                module_source?: string;
                entity_id?: string;
            };

            const limit = Math.min(parseInt(query.limit || '20', 10), 100);
            const offset = parseInt(query.offset || '0', 10);

            const filter: MemorySearchFilter = {};
            if (query.memory_type) filter.memory_type = query.memory_type as any;
            if (query.module_source) filter.module_source = query.module_source;
            if (query.entity_id) filter.entity_id = query.entity_id;

            const memories = await memoryService.listMemories(userId, limit, offset, filter);

            return reply.send({
                success: true,
                data: memories,
                pagination: { limit, offset, count: memories.length }
            });
        } catch (error: any) {
            console.error('❌ Memory List Error:', error);
            return reply.status(500).send({ error: 'Failed to list memories', message: error.message });
        }
    }

    /**
     * GET /api/memory/settings
     * Get user's memory privacy settings.
     */
    public static async getSettings(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        try {
            const settings = await memoryService.getSettings(userId);
            return reply.send({ success: true, data: settings });
        } catch (error: any) {
            console.error('❌ Memory Settings Error:', error);
            return reply.status(500).send({ error: 'Failed to get settings', message: error.message });
        }
    }

    /**
     * PUT /api/memory/settings
     * Update user's memory privacy settings.
     */
    public static async updateSettings(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        try {
            const body = request.body as {
                memory_enabled?: boolean;
                auto_save_chat?: boolean;
                retention_days?: number | null;
            };

            await memoryService.updateSettings(userId, body);
            const updated = await memoryService.getSettings(userId);

            return reply.send({ success: true, data: updated });
        } catch (error: any) {
            console.error('❌ Memory Settings Update Error:', error);
            return reply.status(500).send({ error: 'Failed to update settings', message: error.message });
        }
    }

    /**
     * GET /api/memory/:id
     * Get a specific memory by ID.
     */
    public static async getMemory(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { id } = request.params as { id: string };
        try {
            const memory = await memoryService.getMemoryById(id);

            if (!memory || memory.user_id !== userId) {
                return reply.status(404).send({ error: 'Memory not found' });
            }

            return reply.send({ success: true, data: memory });
        } catch (error: any) {
            console.error('❌ Memory Get Error:', error);
            return reply.status(500).send({ error: 'Failed to get memory', message: error.message });
        }
    }

    /**
     * GET /api/memory/:id/provenance
     * Get the temporal evolution chain of a memory.
     */
    public static async getProvenance(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { id } = request.params as { id: string };
        try {
            // Verify ownership first
            const memory = await memoryService.getMemoryById(id);
            if (!memory || memory.user_id !== userId) {
                return reply.status(404).send({ error: 'Memory not found' });
            }

            const chain = await memoryService.getProvenance(id);
            return reply.send({ success: true, data: chain });
        } catch (error: any) {
            console.error('❌ Memory Provenance Error:', error);
            return reply.status(500).send({ error: 'Failed to get provenance', message: error.message });
        }
    }

    /**
     * PUT /api/memory/:id
     * Correct/update the content of a memory.
     */
    public static async correctMemory(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { id } = request.params as { id: string };
        try {
            // Verify ownership
            const existing = await memoryService.getMemoryById(id);
            if (!existing || existing.user_id !== userId) {
                return reply.status(404).send({ error: 'Memory not found' });
            }

            const { content } = request.body as { content: string };
            if (!content || content.trim().length === 0) {
                return reply.status(400).send({ error: 'Content is required' });
            }

            const corrected = await memoryService.correct(id, content.trim());
            return reply.send({ success: true, data: corrected });
        } catch (error: any) {
            console.error('❌ Memory Correct Error:', error);
            return reply.status(500).send({ error: 'Failed to correct memory', message: error.message });
        }
    }

    /**
     * DELETE /api/memory/:id
     * Soft-delete a memory.
     */
    public static async deleteMemory(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { id } = request.params as { id: string };
        try {
            // Verify ownership
            const existing = await memoryService.getMemoryById(id);
            if (!existing || existing.user_id !== userId) {
                return reply.status(404).send({ error: 'Memory not found' });
            }

            await memoryService.forget(id);
            return reply.send({ success: true, message: 'Memory released' });
        } catch (error: any) {
            console.error('❌ Memory Delete Error:', error);
            return reply.status(500).send({ error: 'Failed to delete memory', message: error.message });
        }
    }

    /**
     * POST /api/memory/search
     * Semantic search across user's memories (for client-side use).
     */
    public static async searchMemories(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        try {
            const { query, limit, memory_type, module_source, entity_id } = request.body as {
                query: string;
                limit?: number;
                memory_type?: string;
                module_source?: string;
                entity_id?: string;
            };

            if (!query || query.trim().length === 0) {
                return reply.status(400).send({ error: 'Query is required' });
            }

            const filter: MemorySearchFilter = {};
            if (memory_type) filter.memory_type = memory_type as any;
            if (module_source) filter.module_source = module_source;
            if (entity_id) filter.entity_id = entity_id;

            const results = await memoryService.recall(userId, query.trim(), limit || 10, filter);

            return reply.send({
                success: true,
                data: results,
                count: results.length
            });
        } catch (error: any) {
            console.error('❌ Memory Search Error:', error);
            return reply.status(500).send({ error: 'Failed to search memories', message: error.message });
        }
    }
}
