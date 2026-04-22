import { supabase } from '../../lib/supabase';

export interface UsageStats {
    tarot_draw_count: number;
    synastry_dual_count: number;
    synastry_group_count: number;
    sigil_messages_count: number;
    naos_code_count: number;
    last_active_date: string; // YYYY-MM-DD
}

export const LIMITS = {
    tarot: 1,
    synastry_dual: 1,
    synastry_group: 0,
    sigil: 50,
    naos_code: 1
};

export class UsageGuardService {
    
    static async getStats(userId: string): Promise<UsageStats> {
        try {
            const { data } = await supabase.from('profiles').select('profile_data').eq('id', userId).maybeSingle();
            const profileData = data?.profile_data || {};
            
            let stats = profileData.usage_stats as UsageStats;
            
            const today = new Date().toISOString().split('T')[0];
            
            if (!stats || stats.last_active_date !== today) {
                stats = {
                    tarot_draw_count: 0,
                    synastry_dual_count: 0,
                    synastry_group_count: 0,
                    sigil_messages_count: 0,
                    naos_code_count: 0,
                    last_active_date: today
                };
                
                // Save immediately back to profile so child processes read correctly
                await this.saveStats(userId, stats, profileData);
            }
            
            return stats;
        } catch (e) {
            console.error("❌ UsageGuard: Failed to get/init stats:", e);
            // Fallback default (safe for crashes but bypasses lockdown if broken)
            return {
                tarot_draw_count: 0,
                synastry_dual_count: 0,
                synastry_group_count: 0,
                sigil_messages_count: 0,
                naos_code_count: 0,
                last_active_date: new Date().toISOString().split('T')[0]
            };
        }
    }

    static async checkLimit(userId: string, action: keyof typeof LIMITS): Promise<{ ok: boolean, message?: string }> {
        const { data } = await supabase.from('profiles').select('plan_type').eq('id', userId).maybeSingle();
        const planType = data?.plan_type || 'free';

        const stats = await this.getStats(userId);
        
        let count = 0;
        let limit = LIMITS[action];
        let actionLabel = "esta acción";

        if (action === 'sigil') {
            limit = planType === 'premium' || planType === 'premium_plus' || planType === 'admin' ? 20 : 3;
            count = stats.sigil_messages_count;
            actionLabel = "mensajes de Sigil";
        }
        else if (action === 'tarot') { 
            count = stats.tarot_draw_count + stats.synastry_dual_count; 
            actionLabel = "Tarot / Oráculo"; 
        }
        else if (action === 'synastry_dual') { 
            count = stats.tarot_draw_count + stats.synastry_dual_count; 
            actionLabel = "Sinastría Dual / Oráculo"; 
        }
        else if (action === 'synastry_group') { 
            count = stats.synastry_group_count; 
            actionLabel = "Matriz de Grupos"; 
        }
        else if (action === 'naos_code') { count = stats.naos_code_count; actionLabel = "Código de Identidad"; }

        // Premium and Admin users bypass limits for oracle and synastry
        if (planType === 'admin' || planType === 'premium' || planType === 'premium_plus') {
            if (action !== 'sigil' && action !== 'naos_code') {
                return { ok: true };
            }
            if (planType === 'admin') return { ok: true };
        }

        if (count >= limit) {
            let limitMessage = `Has agotado tu energía para ${actionLabel} por hoy (${limit}/${limit}). Medita en el Santuario y regresa al amanecer.`;
            if (action === 'naos_code') limitMessage = "El Código de Identidad solo se puede consultar 1 vez al día para evitar sobrecarga del Oráculo.";
            return { ok: false, message: limitMessage };
        }
        return { ok: true };
    }

    static async incrementUsage(userId: string, action: keyof typeof LIMITS) {
        try {
            const stats = await this.getStats(userId);
            if (action === 'tarot') stats.tarot_draw_count++;
            else if (action === 'synastry_dual') stats.synastry_dual_count++;
            else if (action === 'synastry_group') stats.synastry_group_count++;
            else if (action === 'sigil') stats.sigil_messages_count++;
            else if (action === 'naos_code') stats.naos_code_count++;

            const { data } = await supabase.from('profiles').select('profile_data').eq('id', userId).maybeSingle();
            const profileData = data?.profile_data || {};
            
            await this.saveStats(userId, stats, profileData);
        } catch (e) {
            console.error(`❌ UsageGuard: Failed to increment usage for ${action}:`, e);
        }
    }

    private static async saveStats(userId: string, stats: UsageStats, currentProfileData: any) {
         currentProfileData.usage_stats = stats;
         await supabase.from('profiles').update({ profile_data: currentProfileData }).eq('id', userId);
    }
}
