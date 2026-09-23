import * as crypto from 'crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../../lib/supabase';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export class AdminController {
    /**
     * List users in the profiles table with filters support.
     */

    static async createAccount(request: FastifyRequest, reply: FastifyReply) {
        const { email, password, days } = request.body as { email: string, password?: string, days?: number };

        // 1. Minimal Validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return reply.status(400).send({ error: "Email válido es requerido" });
        }
        if (password !== undefined && typeof password !== 'string') {
            return reply.status(400).send({ error: "Password debe ser string si se provee" });
        }
        if (days !== undefined && (typeof days !== 'number' || days < 0 || !Number.isInteger(days) || days > 3650)) {
            return reply.status(400).send({ error: "Days debe ser un número entero válido (0-3650)" });
        }

        try {
            // Secure Temporary Password Generation
            const finalPassword = password || crypto.randomBytes(12).toString('base64').replace(/\W/g, '') + 'A1!';

            const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: finalPassword,
                email_confirm: true
            });

            if (authError) return reply.status(400).send({ error: authError.message });

            const newUserId = userAuth.user.id;

            // Bounded Verification Strategy for Profile Trigger
            let profileExists = false;
            let attempts = 0;
            const maxAttempts = 15;
            const waitMs = 200;

            while (attempts < maxAttempts) {
                const { data } = await supabaseAdmin.from('profiles').select('id').eq('id', newUserId).maybeSingle();
                if (data) {
                    profileExists = true;
                    break;
                }
                attempts++;
                await new Promise(r => setTimeout(r, waitMs));
            }

            // Rollback if profile trigger failed
            if (!profileExists) {
                const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(newUserId);
                if (rollbackError) console.error(`[ADMIN] Rollback failed for orphaned auth user ${newUserId}: ${rollbackError.message}`);
                return reply.status(500).send({ error: "La cuenta de Auth fue creada pero el trigger del perfil falló. Se ejecutó Rollback." });
            }

            // Profile update
            let profileUpdatePayload: any = { system_role: 'user' };
            if (days && days > 0) {
                 const expirationDate = new Date();
                 expirationDate.setDate(expirationDate.getDate() + days);
                 profileUpdatePayload.plan_type = 'premium';
                 profileUpdatePayload.subscription_status = 'active';
                 profileUpdatePayload.current_period_end = expirationDate.toISOString();
            } else {
                 profileUpdatePayload.plan_type = 'free';
            }

            const { error: profileError } = await supabaseAdmin.from('profiles').update(profileUpdatePayload).eq('id', newUserId);

            if (profileError) {
                // Rollback on profile update failure
                const { error: rollbackError } = await supabaseAdmin.auth.admin.deleteUser(newUserId);
                if (rollbackError) console.error(`[ADMIN] Rollback failed for user ${newUserId} after profile update failure: ${rollbackError.message}`);
                return reply.status(500).send({ error: "Usuario creado pero falló al configurar plan. Se ejecutó Rollback.", details: profileError.message });
            }

            return { status: 'ok', message: "Cuenta creada exitosamente", email, password: finalPassword };
        } catch (e: any) {
            return reply.status(500).send({ error: "Fallo en el servidor al crear cuenta", details: e.message });
        }
    }

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

        if (!['free', 'premium', 'premium_plus'].includes(role)) {
            return reply.status(400).send({ error: "Rol no válido" });
        }

        try {
            const { data, error } = await supabaseAdmin.from('profiles')
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

    static async setBudget(request: FastifyRequest, reply: FastifyReply) {
        const { user_id, budget } = request.body as { user_id: string, budget: number | null };

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!user_id || !uuidRegex.test(user_id)) {
            return reply.status(400).send({ error: "user_id no válido. Debe ser un UUID válido." });
        }

        if (budget !== null) {
            if (typeof budget !== 'number' || isNaN(budget) || !isFinite(budget)) {
                return reply.status(400).send({ error: "Budget must be a valid number or null." });
            }
            if (budget < 0) {
                return reply.status(400).send({ error: "Budget cannot be negative." });
            }
            if (budget > 1000) {
                return reply.status(400).send({ error: "Budget exceeds maximum allowed override (1000)." });
            }
        }

        try {
            // Profile Target Existence Check
            const { data: targetProfile, error: targetError } = await supabaseAdmin.from('profiles').select('id').eq('id', user_id).maybeSingle();
            if (targetError) throw targetError;
            if (!targetProfile) {
                return reply.status(404).send({ error: "Usuario no encontrado en la base de datos." });
            }

            if (budget === null) {
                const { error } = await supabaseAdmin.from('user_ai_budgets').delete().eq('user_id', user_id);
                if (error) throw error;
                return { success: true, message: "Budget override removed." };
            }

            const { error } = await supabaseAdmin.from('user_ai_budgets').upsert({
                user_id: user_id,
                budget_usd: budget,
                updated_at: new Date().toISOString()
            });
            if (error) throw error;
            return { success: true, message: "Budget override applied." };
        } catch (e: any) {
            return reply.status(500).send({ error: "Error updating budget", details: e.message });
        }
    }

    static async deleteUser(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

        // 🛡️ SECURITY: Prevent owner deletion
        if (id === '2c48f84f-2c2e-4b0d-b799-166709fd1d1f') {
            return reply.status(403).send({ error: "No se puede eliminar al Owner/Founder." });
        }

        try {




            let { error } = await supabaseAdmin.auth.admin.deleteUser(id);

            if (error) {
                const isNotFound = error.status === 404 || error.message?.toLowerCase().includes('not found');

                if (isNotFound) {
                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .delete()
                        .eq('id', id);

                    if (profileError) {
                        return reply.status(500).send({
                            error: "Fallo al eliminar perfil huérfano",
                            details: profileError.message
                        });
                    }
                    return { status: 'ok', message: `Perfil huérfano desintegrado.` };
                }
                return reply.status(500).send({ error: "Fallo al eliminar el usuario en Auth", details: error.message });
            }

            return { status: 'ok', message: `Usuario desintegrado completamente.` };
        } catch (e: any) {
            return reply.status(500).send({ error: "Error en la eliminación", details: e.message });
        }
    }
}
