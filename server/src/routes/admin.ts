import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

export async function adminRoutes(app: FastifyInstance) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY || '';
    const supabaseAdmin = createClient(config.SUPABASE_URL || '', serviceKey);

    const requireAdmin = async (req: any, reply: any) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return reply.status(401).send({ error: "No token session" });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        
        if (error || !user) return reply.status(401).send({ error: "Invalid token session" });

        const userEmail = (user.email || '').toLowerCase();
        if (userEmail !== 'luisalfredoherreramendez@gmail.com' && !userEmail.includes('luisalfredoherreramendez') && !userEmail.includes('luis.herrera')) {
             const { data: profile } = await supabaseAdmin.from('profiles').select('plan_type').eq('id', user.id).single();
             if (profile?.plan_type !== 'admin') {
                 return reply.status(403).send({ error: "Forbidden: Destinado solo a Arquitectos." });
             }
        }
    };

    app.get('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {
        try {
            const { data: profiles, error } = await supabaseAdmin.from('profiles').select('id, email, full_name, plan_type, created_at, updated_at');
            if (error) throw error;

            const total = profiles.length;
            const premium = profiles.filter((p: any) => p.plan_type === 'premium' || p.plan_type === 'premium_plus').length;

            return { users: profiles, stats: { total, premium } };
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    app.post<{ Body: { email: string, role: string } }>('/api/admin/set-role', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { email, role } = req.body;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." });
            }

            const { error } = await supabaseAdmin.from('profiles').update({ plan_type: role }).eq('email', email);
            if (error) throw error;
            return { success: true };
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

    app.delete<{ Params: { id: string } }>('/api/admin/users/:id', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { id } = req.params;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Necesito tu Llave Maestra (Service Role Key) en el .env del servidor para borrar identidades de Supabase." });
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (error) throw error;

            // Cascade takes care of profiles, synastry_history, etc.
            return { success: true };
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });
}
