import { supabase } from '../../lib/supabase';
import { CoherenceService } from '../coherence/service';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env';
import { memoryService } from '../memory/MemoryService';

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
