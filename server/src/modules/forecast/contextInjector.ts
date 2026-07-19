import { supabase } from '../../lib/supabase';

export class ForecastContextInjector {
    /**
     * Extracts the user's real behavioral data on the platform (The "5th School").
     * E.g. meditation sessions, current protocol streak, etc.
     */
    static async getUserBehaviorContext(userId: string): Promise<string> {
        let context = "";

        try {
            // 1. Get user performance stats (level, streak)
            const { data: stats } = await supabase
                .from('user_performance_stats')
                .select('current_streak, tier_label')
                .eq('user_id', userId)
                .maybeSingle();

            if (stats) {
                context += `- Racha actual de conexión: ${stats.current_streak} días.\n`;
                context += `- Nivel de evolución (Tier): ${stats.tier_label || 'Iniciado'}.\n`;
            }

            // 2. Get recent meditation sessions
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count: medCount } = await supabase
                .from('meditation_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('completed_at', thirtyDaysAgo);

            if (medCount !== null) {
                context += `- Sesiones de laboratorio (meditación) en los últimos 30 días: ${medCount}.\n`;
            }

            // 3. Get recent protocol logs
            const { count: protoCount } = await supabase
                .from('protocol_daily_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('completed_at', thirtyDaysAgo);
                
            if (protoCount !== null) {
                context += `- Días de protocolo completados en los últimos 30 días: ${protoCount}.\n`;
            }

            return context.trim();
        } catch (error) {
            console.error("❌ ForecastContextInjector Error:", error);
            return "No se pudo extraer el historial de comportamiento (usuario nuevo o error).";
        }
    }
}
