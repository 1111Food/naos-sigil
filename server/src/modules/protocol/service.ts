import { supabase } from '../../lib/supabase';
import { CoherenceService } from '../coherence/service';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env';

export class ProtocolService {
    /**
     * Sella el día actual del protocolo y evalúa la progresión o evolución.
     */
    static async sealDay(userId: string, protocolId: string, dayNumber: number, notes?: string, token?: string) {
        console.log(`🛡️ ProtocolService: Sealing day ${dayNumber} for protocol ${protocolId}`);

        const client = token
            ? createClient(config.SUPABASE_URL!, config.SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } })
            : supabase;

        // 1. Registrar el log diario
        const { error: logError } = await client
            .from('protocol_daily_logs')
            .upsert({
                protocol_id: protocolId,
                day_number: dayNumber,
                is_completed: true,
                completed_at: new Date().toISOString(),
                notes
            }, { onConflict: 'protocol_id,day_number' });

        if (logError) {
            console.error("❌ Error logging day:", logError);
            throw logError;
        }

        // 2. Obtener estado actual para decidir el siguiente paso
        const { data: protocol, error: fetchError } = await client
            .from('user_protocols')
            .select('*')
            .eq('id', protocolId)
            .single();

        if (fetchError || !protocol) {
            throw new Error("Protocol not found or error fetching state.");
        }

        let updates: any = {};
        const is21DayMilestone = dayNumber === 21 && protocol.target_days === 21;
        const isFinalCompletion = dayNumber >= protocol.target_days;

        if (is21DayMilestone) {
            // UMBRAL DE EVOLUCIÓN: No archivar, esperar decisión.
            console.log("🚀 ProtocolService: Evolution threshold reached (Day 21).");
            updates = {
                status: 'awaiting_evolution',
                updated_at: new Date().toISOString()
            };
        } else if (isFinalCompletion) {
            // CIERRE TOTAL (ej: Día 90 alcanzado)
            console.log(`🏁 ProtocolService: Final target reached (${protocol.target_days}).`);
            updates = {
                status: 'completed',
                end_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Marcar también la intención original como completada
            await client
                .from('protocols')
                .update({ status: 'completed' })
                .eq('user_id', userId)
                .eq('status', 'active');
        } else {
            // PROGRESIÓN NORMAL
            updates = {
                current_day: dayNumber + 1,
                updated_at: new Date().toISOString()
            };
        }

        const { data: updated, error: updateError } = await client
            .from('user_protocols')
            .update(updates)
            .eq('id', protocolId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 3. Impacto en Coherencia
        // Incrementar disciplina por cumplimiento
        await CoherenceService.updateScore(userId, 'discipline', 3);
        await CoherenceService.updateStreak(userId, 'increment');

        return updated;
    }

    /**
     * Mueve el protocolo de la etapa de 21 días a la de 90 días.
     */
    static async evolveProtocol(userId: string, protocolId: string, token?: string) {
        console.log(`✨ ProtocolService: Evolving protocol ${protocolId} to 90 days.`);

        const client = token
            ? createClient(config.SUPABASE_URL!, config.SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } })
            : supabase;

        const { data: updated, error } = await client
            .from('user_protocols')
            .update({
                target_days: 90,
                protocol_stage: '90_DAYS',
                status: 'active',
                current_day: 22, // Continúa desde el 22
                updated_at: new Date().toISOString()
            })
            .eq('id', protocolId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error("❌ Error evolving protocol:", error);
            throw error;
        }

        // Premio extra por evolucionar
        await CoherenceService.updateScore(userId, 'discipline', 10);

        return updated;
    }
}
