import { config } from '../../config/env';
import { supabase } from '../../lib/supabase';

export interface CoherenceState {
    user_id: string;
    discipline_score: number;
    energy_score: number;
    clarity_score: number;
    global_coherence: number;
    current_streak: number;
    last_interaction_at: string;
}

export class CoherenceService {
    private static getDefaultState(userId: string): CoherenceState {
        return {
            user_id: userId,
            discipline_score: 50,
            energy_score: 50,
            clarity_score: 50,
            global_coherence: 50,
            current_streak: 0,
            last_interaction_at: new Date().toISOString()
        };
    }
    private static readonly HARD_FLOOR = 0;
    private static readonly MAX_SCORE = 100;

    /**
     * Obtiene el estado actual de coherencia del usuario.
     */
    static async getCoherence(userId: string): Promise<CoherenceState> {
        const { data, error } = await supabase
            .from('coherence_index')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error("❌ Error fetching coherence:", error);
            throw error;
        }

        if (!data) {
            // Inicializar si no existe
            try {
                const { data: newData, error: initError } = await supabase
                    .from('coherence_index')
                    .insert([{ user_id: userId }])
                    .select()
                    .single();

                if (initError) {
                    console.warn("⚠️ Coherence Init failed (RLS?):", initError.message);
                    return this.getDefaultState(userId);
                }
                return newData;
            } catch (err) {
                console.warn("⚠️ Coherence Init crashed:", err);
                return this.getDefaultState(userId);
            }
        }

        return data;
    }

    /**
     * Actualiza un puntaje específico y refresh del last_interaction_at.
     */
    static async updateScore(userId: string, pillar: 'discipline' | 'energy' | 'clarity', delta: number) {
        const field = `${pillar}_score`;

        // Obtenemos el valor actual para clampear
        const current = await this.getCoherence(userId);
        const newValue = Math.max(0, Math.min(100, (current as any)[field] + delta));

        const { error } = await supabase
            .from('coherence_index')
            .update({
                [field]: newValue,
                last_interaction_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error(`❌ Error updating ${pillar} score:`, error);
            throw error;
        }
    }

    /**
     * Aplica el decaimiento por inactividad (>48 horas).
     * Se reduce la disciplina un 2% diario de inactividad extra.
     */
    static async applyInactivityDecay(userId: string) {
        const state = await this.getCoherence(userId);
        const lastInteraction = new Date(state.last_interaction_at);
        const now = new Date();
        const diffMs = now.getTime() - lastInteraction.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours > 48) {
            const daysOver = Math.floor((diffHours - 48) / 24) + 1;
            const decayFactor = Math.pow(0.98, daysOver); // 2% diario
            const newDiscipline = Math.max(0, state.discipline_score * decayFactor);

            console.log(`📉 Inactividad detectada (${diffHours.toFixed(1)}h). Decaimiento: ${state.discipline_score} -> ${newDiscipline.toFixed(1)}`);

            await supabase
                .from('coherence_index')
                .update({ discipline_score: newDiscipline })
                .eq('user_id', userId);
        }
    }

    /**
     * Incrementa, congela o resetea la racha.
     * @param mode 'increment' | 'freeze' | 'reset'
     */
    static async updateStreak(userId: string, mode: 'increment' | 'freeze' | 'reset' = 'increment') {
        const state = await this.getCoherence(userId);

        let newStreak = state.current_streak;

        if (mode === 'increment') {
            newStreak = state.current_streak + 1;
        } else if (mode === 'reset') {
            newStreak = 0;
        }
        // If 'freeze', newStreak remains the same

        if (newStreak !== state.current_streak) {
            await supabase
                .from('coherence_index')
                .update({ current_streak: newStreak })
                .eq('user_id', userId);
        }
    }
}
