import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../../lib/supabase';

export class RosterController {

    // Add a new profile to the user's roster
    public static async addProfile(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        try {
            const profileData = request.body as any;

            if (!profileData.name || !profileData.birthDate) {
                return reply.status(400).send({ error: "Datos Incompletos", message: "Nombre y Fecha Solar son requeridos." });
            }

            const { data, error } = await supabase.from('user_roster').insert({
                user_id: userId,
                name: profileData.name,
                birth_date: profileData.birthDate,
                birth_time: profileData.birthTime || null,
                birth_city: profileData.birthCity || null,
                birth_state: profileData.birthState || null,
                birth_country: profileData.birthCountry || null,
                role_label: profileData.roleLabel || 'Vínculo'
            }).select().single();

            if (error) {
                console.error("❌ Roster Add Error:", error);
                throw error;
            }

            return reply.send({ success: true, message: "Perfil agregado al Roster.", data });
        } catch (error: any) {
            console.error("❌ Roster Error:", error);
            return reply.status(500).send({ error: "Fallo al guardar perfil.", message: error.message });
        }
    }

    // Get all profiles for the current user
    public static async getProfiles(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        try {
            const { data, error } = await supabase.from('user_roster')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return reply.send({ success: true, data: data || [] });
        } catch (error: any) {
            console.error("❌ Roster Fetch Error:", error);
            return reply.status(500).send({ error: "Fallo al obtener el Roster." });
        }
    }

    // Delete a profile from the user's roster
    public static async deleteProfile(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { id } = request.params as { id: string };

        try {
            const { error } = await supabase.from('user_roster')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) throw error;

            return reply.send({ success: true, message: "Perfil eliminado del Roster." });
        } catch (error: any) {
            console.error("❌ Roster Delete Error:", error);
            return reply.status(500).send({ error: "Fallo al eliminar perfil." });
        }
    }

    // Update a profile in the user's roster
    public static async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        const userId = (request as any).user_id;
        const { id } = request.params as { id: string };
        const updates = request.body as any;

        try {
            const { data, error } = await supabase.from('user_roster')
                .update({
                    name: updates.name,
                    birth_date: updates.birthDate,
                    birth_time: updates.birthTime,
                    birth_city: updates.birthCity,
                    birth_state: updates.birthState,
                    birth_country: updates.birthCountry,
                    role_label: updates.roleLabel
                })
                .eq('id', id)
                .eq('user_id', userId)
                .select().single();

            if (error) throw error;

            return reply.send({ success: true, message: "Perfil actualizado.", data });
        } catch (error: any) {
            console.error("❌ Roster Update Error:", error);
            return reply.status(500).send({ error: "Fallo al actualizar perfil." });
        }
    }
}
