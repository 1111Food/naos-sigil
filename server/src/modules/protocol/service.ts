import { supabase } from '../../lib/supabase';
import { CoherenceService } from '../coherence/service';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env';
import { memoryService } from '../memory/MemoryService';

export class ProtocolService {
    /**
     * Sella el día actual del protocolo y evalúa la progresión o evolución.
     */
    static async sealDay(userId: string, protocolId: string, dayNumber: number, notes?: string, token?: string, localDate?: string) {
        console.log(`🚀 ProtocolService: Sealing day ${dayNumber} for protocol ${protocolId} on ${localDate}`);

        const client = token
            ? createClient(config.SUPABASE_URL!, config.SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } })
            : supabase;

        // 1. Obtener estado actual
        const { data: protocol, error: fetchError } = await client
            .from('user_protocols')
            .select('*')
            .eq('id', protocolId)
            .single();

        if (fetchError || !protocol) {
            throw new Error("Protocol not found or error fetching state.");
        }

        if (protocol.status !== 'active') {
            throw new Error("Protocol is not active. Cannot seal day.");
        }

        // Check for same day in JS as a fallback safeguard (optimistic lock)
        const { data: lastLog } = await client
            .from('protocol_daily_logs')
            .select('completed_at, local_date')
            .eq('protocol_id', protocolId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // If localDate matches the last check-in's localDate, reject it.
        // If localDate column isn't migrated yet, we fallback to comparing YYYY-MM-DD from completed_at UTC.
        if (lastLog) {
            const lastLogLocalDate = lastLog.local_date || lastLog.completed_at.split('T')[0];
            if (lastLogLocalDate === localDate) {
                console.warn(`⚠️ ProtocolService: Duplicate same-day check-in prevented for ${userId}`);
                throw new Error("ALREADY_CHECKED_IN_TODAY");
            }
        }

        const is21DayMilestone = dayNumber === 21 && protocol.target_days === 21;
        const isFinalCompletion = dayNumber >= protocol.target_days;
        const now = new Date().toISOString();

        let updatedProtocol;
        try {
            // Try to use the ATOMIC RPC introduced in Point 5 migration
            const { data: rpcData, error: rpcError } = await client.rpc('seal_protocol_day', {
                p_protocol_id: protocolId,
                p_day_number: dayNumber,
                p_local_date: localDate,
                p_notes: notes || null,
                p_completed_at: now,
                p_is_21_milestone: is21DayMilestone,
                p_is_final_completion: isFinalCompletion
            });

            if (rpcError) {
                // If the RPC doesn't exist yet (Deployment Gate Pending), we fallback to the old multi-step approach
                const isMissingFunction = rpcError.code === '42883' || 
                                          rpcError.code === 'PGRST202' || 
                                          (rpcError.message && rpcError.message.toLowerCase().includes('could not find the function'));
                
                if (isMissingFunction) {
                    console.log(`⚠️ ProtocolService: RPC 'seal_protocol_day' not found. Falling back to non-atomic execution.`);
                    updatedProtocol = await this.sealDayLegacyFallback(client, userId, protocolId, dayNumber, notes, protocol, is21DayMilestone, isFinalCompletion);
                } else {
                    throw rpcError;
                }
            } else {
                updatedProtocol = rpcData;
            }
        } catch (e: any) {
            // If the error is a unique constraint violation on protocol_daily_logs_protocol_id_local_date_key
            if (e.code === '23505' && e.message.includes('local_date')) {
                throw new Error("ALREADY_CHECKED_IN_TODAY");
            }
            throw e;
        }

        // 1.5. Guardar en memoria si hay reflexión significativa
        if (notes && notes.trim().length > 10) {
            try {
                await memoryService.remember({
                    user_id: userId,
                    content: `[Protocol Day ${dayNumber} Reflection]: ${notes.trim()}`,
                    memory_type: 'evidence',
                    module_source: 'protocol'
                });
            } catch (memErr) {
                console.warn("⚠️ Protocol Memory tracking failed silently:", memErr);
            }
        }

        // 3. Impacto en Coherencia
        // Incrementar disciplina por cumplimiento
        try {
            await CoherenceService.updateScore(userId, 'discipline', 3);
            await CoherenceService.updateStreak(userId, 'increment');
        } catch (coherenceErr: any) {
            // FIRE AND FORGET - SILENT FAIL
            // Como dicta el Point 5 CHECKIN_ATOMICITY_CONTRACT: 
            // Si coherence falla, el protocolo avanza lógicamente para el usuario preservando el check-in.
            console.error("⚠️ [NON-FATAL] Coherence Update Failed during check-in:", coherenceErr);
        }

        return updatedProtocol;
    }

    /**
     * Fallback for when the DB migration is not yet applied
     */
    static async sealDayLegacyFallback(client: any, userId: string, protocolId: string, dayNumber: number, notes: string | undefined, protocol: any, is21DayMilestone: boolean, isFinalCompletion: boolean) {
        // 1. Registrar el log diario sin local_date (schema antiguo)
        const { error: logError } = await client
            .from('protocol_daily_logs')
            .upsert({
                protocol_id: protocolId,
                day_number: dayNumber,
                is_completed: true,
                completed_at: new Date().toISOString(),
                notes
            }, { onConflict: 'protocol_id,day_number' });

        if (logError) throw logError;

        let updates: any = {};

        if (is21DayMilestone) {
            updates = { status: 'awaiting_evolution', updated_at: new Date().toISOString() };
        } else if (isFinalCompletion) {
            updates = { status: 'completed', end_date: new Date().toISOString(), updated_at: new Date().toISOString() };
            await client.from('protocols').update({ status: 'completed' }).eq('user_id', userId).eq('status', 'active');
        } else {
            updates = { current_day: dayNumber + 1, updated_at: new Date().toISOString() };
        }

        const { data: updated, error: updateError } = await client
            .from('user_protocols')
            .update(updates)
            .eq('id', protocolId)
            .select()
            .single();

        if (updateError) throw updateError;
        return updated;
    }

    /**
     * Mueve el protocolo de la etapa de 21 días a la de 90 días.
     */
    static async evolveProtocol(userId: string, protocolId: string, newIntention: string, token?: string) {
        console.log(`✨ ProtocolService: Evolving protocol ${protocolId} to 90 days.`);

        const client = token
            ? createClient(config.SUPABASE_URL!, config.SUPABASE_ANON_KEY!, { global: { headers: { Authorization: `Bearer ${token}` } } })
            : supabase;

        // Idempotency check: if already 90_DAYS, return early
        const { data: currentProtocol } = await client
            .from('user_protocols')
            .select('protocol_stage, status')
            .eq('id', protocolId)
            .single();

        if (currentProtocol?.protocol_stage === '90_DAYS') {
            console.log("ℹ️ ProtocolService: Protocol already evolved to 90 days. Returning existing state.");
            return { alreadyEvolved: true };
        }

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

        // Intention History: Archive old intention and create new one
        if (newIntention) {
            // Find current active identity
            const { data: oldIntent } = await client
                .from('protocols')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (oldIntent) {
                // Archive old
                const { data: archivedIntent, error: archiveError } = await client
                    .from('protocols')
                    .update({ status: 'evolved' })
                    .eq('id', oldIntent.id)
                    .select('id, status')
                    .single();

                if (archiveError) {
                    throw new Error(`Failed to archive previous intention: ${archiveError.message}`);
                }

                if (!archivedIntent || archivedIntent.status !== 'evolved') {
                    throw new Error('Previous intention was not archived correctly');
                }

                // Insert new Cycle II intention
                await client
                    .from('protocols')
                    .insert({
                        user_id: userId,
                        title: oldIntent.title, // Keep same title/theme
                        purpose: newIntention,
                        status: 'active'
                    });
            }
        }

        // Premio extra por evolucionar
        await CoherenceService.updateScore(userId, 'discipline', 10);

        return updated;
    }
}
