import { FastifyInstance } from 'fastify';
import { validateUser } from '../middleware/auth';
import { NAOSIntelligenceKernel } from '../modules/relationship/kernel/NAOSIntelligenceKernel';
import { ContextMatrix } from '../modules/relationship/models/ContextMatrix';

export async function relationshipRoutes(app: FastifyInstance) {
    
    app.post<{ Body: { targetId?: string, mode?: string, language?: 'es' | 'en' } }>('/scan', { preHandler: [validateUser] }, async (req, reply) => {
        const userId = (req as any).user_id;
        const { targetId, mode = 'analysis', language = 'es' } = req.body;
        
        try {
            // In a real scenario, we'd fetch actual users. 
            // For V4.1 Narrative Layer testing, we mock them if missing.
            const userA = { id: userId, name: "User A", birthDate: "1990-01-01", profile_data: {} };
            const userB = { id: targetId || "mock-target", name: "User B", birthDate: "1995-05-05", profile_data: {} };
            
            const context: any = {
                type: 'romantic',
                duration: 0,
                intensity: 1,
                language: language
            };
            
            const entity: any = { id: `rel_${userId}_${targetId || 'mock'}` };

            const kernel = new NAOSIntelligenceKernel();
            const result = await kernel.process(entity, userA, userB, context, mode as any);
            
            return { status: 'ok', data: result };
        } catch (error: any) {
            console.error("🔥 Relationship Scan Error:", error);
            return reply.status(500).send({ error: error.message });
        }
    });
}
