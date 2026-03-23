import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../../lib/supabase';

export class AdminController {
    /**
     * List users in the profiles table with filters support.
     */
    static async listUsers(request: FastifyRequest, reply: FastifyReply) {
        const { email } = request.query as { email?: string };

        try {
            let query = supabase
                .from('profiles')
                .select('id, email, plan_type, created_at')
                .order('created_at', { ascending: false });

            if (email) {
                query = query.ilike('email', `%${email}%`);
            }

            const { data, error } = await query;

            if (error) {
                return reply.status(500).send({ error: "No se pudieron listar los usuarios", details: error.message });
            }

            // Optional: aggregated stats
            const total = data.length;
            const premiumCount = data.filter(u => u.plan_type === 'premium' || u.plan_type === 'premium_plus').length;

            return {
                users: data,
                stats: {
                    total,
                    premium: premiumCount
                }
            };
        } catch (e: any) {
            return reply.status(500).send({ error: "Error en el listado de administración", details: e.message });
        }
    }

    /**
     * Update plan_type for a profile by email matching.
     */
    static async updateRole(request: FastifyRequest, reply: FastifyReply) {
        const { email, role } = request.body as { email: string, role: string };

        if (!email || !role) {
            return reply.status(400).send({ error: "Email y Rol son requeridos" });
        }

        if (!['free', 'premium', 'admin'].includes(role)) {
            return reply.status(400).send({ error: "Rol no válido" });
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ plan_type: role })
                .eq('email', email)
                .select();

            if (error) {
                return reply.status(500).send({ error: "Fallo al actualizar el rol", details: error.message });
            }

            if (!data || data.length === 0) {
                return reply.status(404).send({ error: "No se encontró un usuario con ese email en los perfiles." });
            }

            return { 
                status: 'ok', 
                message: `Rol actualizado a [${role}] para [${email}] exitosamente.`, 
                data: data[0] 
            };
        } catch (e: any) {
            return reply.status(500).send({ error: "Error en la actualización", details: e.message });
        }
    }

    /**
     * Hard-deletes a user from Supabase Auth completely (requires Service Role Key)
     */
    static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ 
                    error: "Configuración Incompleta", 
                    details: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor (.env) para borrar usuarios desde auth.users." 
                });
            }

            const { createClient } = require('@supabase/supabase-js');
            const supabaseAdmin = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY);

            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

            if (error) {
                return reply.status(500).send({ error: "Fallo al eliminar el usuario en Auth", details: error.message });
            }

            return { status: 'ok', message: `Usuario desintegrado completamente.` };
        } catch (e: any) {
            return reply.status(500).send({ error: "Error en la eliminación", details: e.message });
        }
    }
}
