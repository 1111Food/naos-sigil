import { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import { sendProactiveMessage } from '../modules/sigil/telegramService';

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

    // Create specific account with password and duration
    app.post<{ Body: { email: string, password?: string, days?: number } }>('/api/admin/create-account', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { email, password, days } = req.body;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(500).send({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." });
            }

            const finalPassword = password || Math.random().toString(36).slice(-10) + 'A1!';

            const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: finalPassword,
                email_confirm: true
            });

            if (authError) {
                return reply.status(400).send({ error: authError.message });
            }

            if (days && days > 0) {
                 const expirationDate = new Date();
                 expirationDate.setDate(expirationDate.getDate() + days);
                 
                 // Wait a bit for the trigger to create the profile record
                 await new Promise(r => setTimeout(r, 1500));
                 
                 const { error: profileError } = await supabaseAdmin.from('profiles').update({ 
                     plan_type: 'premium',
                     subscription_status: 'active',
                     current_period_end: expirationDate.toISOString()
                 }).eq('id', userAuth.user.id);
                 
                 if (profileError) {
                     console.error("Error setting premium expiration:", profileError);
                 }
                 
                 await supabaseAdmin.from('ai_economics_ledger').update({ 
                     current_cycle_budget: 1000000 
                 }).eq('user_id', userAuth.user.id);
            }

            return { success: true, email: userAuth.user.email, password: finalPassword };
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // Create user via invitation
    app.post<{ Body: { email: string, name: string } }>('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { email, name } = req.body;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." });
            }

            // Send invite via Supabase Auth
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: { full_name: name, plan_type: 'free' },
                redirectTo: 'https://naos-os.com/auth/callback'
            });

            if (error) throw error;
            
            // Note: Supabase will create the auth.users record. The trigger will create the profiles record.
            return { success: true, user: data.user };
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

    app.post('/api/admin/telegram-test', { preHandler: [requireAdmin] }, async (req, reply) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader!.replace('Bearer ', '');
            const { data: { user } } = await supabaseAdmin.auth.getUser(token);
            
            if (user?.email !== 'luisalfredoherreramendez@gmail.com') {
                return reply.status(403).send({ error: "Only the founder can send test messages." });
            }

            const { data: profile } = await supabaseAdmin.from('profiles').select('telegram_chat_id').eq('id', user.id).single();
            if (!profile?.telegram_chat_id) {
                return reply.status(400).send({ error: "No tienes Telegram vinculado." });
            }

            const success = await sendProactiveMessage(
                profile.telegram_chat_id, 
                "Prueba Operacional NAOS. Enlace de Telegram activo. (Este mensaje fue disparado desde el Panel de Administración)"
            );

            if (success) {
                return { success: true };
            } else {
                return reply.status(500).send({ error: "Error enviando el mensaje a Telegram." });
            }
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

    app.post('/api/admin/telegram-test', { preHandler: [requireAdmin] }, async (req, reply) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader!.replace('Bearer ', '');
            const { data: { user } } = await supabaseAdmin.auth.getUser(token);
            
            if (user?.email !== 'luisalfredoherreramendez@gmail.com') {
                return reply.status(403).send({ error: "Only the founder can send test messages." });
            }

            const { data: profile } = await supabaseAdmin.from('profiles').select('telegram_chat_id').eq('id', user.id).single();
            if (!profile?.telegram_chat_id) {
                return reply.status(400).send({ error: "No tienes Telegram vinculado." });
            }

            const success = await sendProactiveMessage(
                profile.telegram_chat_id, 
                "Prueba Operacional NAOS. Enlace de Telegram activo. (Este mensaje fue disparado desde el Panel de Administración)"
            );

            if (success) {
                return { success: true };
            } else {
                return reply.status(500).send({ error: "Error enviando el mensaje a Telegram." });
            }
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

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

            // Protect Founder from demotion
            if (email === 'luisalfredoherreramendez@gmail.com' && role !== 'admin') {
                return reply.status(403).send({ error: "Cannot demote the Founder." });
            }

            const { error } = await supabaseAdmin.from('profiles').update({ plan_type: role }).eq('email', email);
            if (error) throw error;
            return { success: true };
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

    app.delete<{ Params: { id: string } }>('/users/:id', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { id } = req.params;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Necesito tu Llave Maestra (Service Role Key) en el .env del servidor para borrar identidades de Supabase." });
            }

            // Protect Founder
            const { data: userToDelete } = await supabaseAdmin.auth.admin.getUserById(id);
            if (userToDelete?.user?.email === 'luisalfredoherreramendez@gmail.com') {
                return reply.status(403).send({ error: "Cannot delete the Founder." });
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (error) throw error;

            // Cascade takes care of profiles, synastry_history, etc.
            return { success: true };
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // --- AI REVIEW MODE KILL SWITCH (IN-MEMORY) ---
    // Defaults to false on server restart. Only an architect can turn it on.
    app.post<{ Body: { enabled: boolean } }>('/demo-mode', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { enabled } = req.body;
        (global as any).isAiReviewModeActive = enabled;
        return { success: true, enabled: (global as any).isAiReviewModeActive };
    });
}
