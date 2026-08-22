import { supabase } from '../../lib/supabase';
import { UserService } from '../user/service';
import { memoryService } from '../memory/MemoryService';
import { EnergyService } from '../energy/service';
import { ProfileConsolidator } from '../user/profileConsolidator';
import { ArchetypeEngine } from '../user/archetypeEngine';

export interface NaosContext {
    identity: {
        archetype: string;
        energy_signature: any;
        plan_type: string;
    };
    protocol: {
        active: boolean;
        protocol_id?: string;
        stage?: string;
        current_day?: number;
        target_days?: number;
        status?: string;
        intention?: string;
    } | null;
    memory: {
        recent_reflections: string[];
    };
    timeMap: {
        current_energy: any;
    } | null;
    relationships: {
        active_synastries_count: number;
    } | null;
    state: {
        local_time: string;
        coherence_tier: string;
    };
}

export class ContextBuilder {
    static async build(userId: string, localTime?: string): Promise<NaosContext> {
        const today = new Date();
        const safeLocalTime = localTime || today.toISOString();

        // 1. Fetch Parallel Data
        const [
            userProfile,
            protocolRes,
            memories,
            coherenceRank
        ] = await Promise.all([
            UserService.getProfile(userId).catch(() => null),
            supabase.from('user_protocols')
                .select('id, protocol_stage, current_day, target_days, status, intention, intentions ( intention_text )')
                .eq('user_id', userId)
                .in('status', ['active', 'awaiting_evolution'])
                .limit(1)
                .maybeSingle(),
            memoryService.listMemories(userId, 5).catch(() => []),
            supabase.from('user_performance_stats').select('tier_label').eq('user_id', userId).maybeSingle()
        ]);

        // 2. Format Identity
        let identityData: any = { archetype: 'Unknown', energy_signature: null, plan_type: 'free' };
        let energySnapshot: any;
        if (userProfile) {
            const consolidated = ProfileConsolidator.consolidate(userProfile);
            const archetype = ArchetypeEngine.calculate({
                ...userProfile,
                astrology: consolidated.western,
                numerology: consolidated.numerology
            });
            identityData = {
                archetype: archetype?.nombre || 'Unknown',
                energy_signature: consolidated,
                plan_type: userProfile.plan_type || 'free'
            };
            energySnapshot = EnergyService.getDailySnapshot(userProfile);
        }

        // 3. Format Protocol
        let protocolData = null;
        if (protocolRes.data) {
            const p = protocolRes.data;
            const intentionText = p.intentions && p.intentions.length > 0 ? p.intentions[0].intention_text : p.intention;
            protocolData = {
                active: true,
                protocol_id: p.id,
                stage: p.protocol_stage,
                current_day: p.current_day,
                target_days: p.target_days,
                status: p.status,
                intention: intentionText || 'Sin intención registrada'
            };
        }

        // 4. Format Memory
        const recentReflections = memories
            .filter(m => m.memory_type !== ('system' as any))
            .map(m => m.content);

        return {
            identity: identityData,
            protocol: protocolData,
            memory: {
                recent_reflections: recentReflections
            },
            timeMap: {
                current_energy: energySnapshot
            },
            relationships: {
                active_synastries_count: 0 // To be expanded in P1
            },
            state: {
                local_time: safeLocalTime,
                coherence_tier: coherenceRank.data?.tier_label || 'Fragmentado'
            }
        };
    }
}
