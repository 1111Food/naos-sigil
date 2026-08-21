import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../lib/api';

export interface FrecuenciaDiaData {
    texto_principal: string;
    score_energia_general: number;
    riesgo: string;
    oportunidad: string;
    prioridades_dinamicas: { nombre: string; score: number; icono: string }[];
    variables_astrales_utilizadas: string[];
    conversational_hook: string;
}

// Clave de localStorage para tracking de lectura (sin cambios de comportamiento)
const getReadKey = () => `frecuencia_read_date`;

export function useFrecuenciaDia() {
    const { session } = useAuth();

    const today = new Date().toISOString().split('T')[0];
    const storedDate = typeof window !== 'undefined' ? localStorage.getItem(getReadKey()) : null;

    const { data, isLoading: loading } = useQuery<FrecuenciaDiaData | null>({
        queryKey: ['frecuencia-dia', session?.user?.id, today],
        queryFn: async () => {
            const res = await fetch(`${API_BASE_URL}/api/oracle/daily?offset=0`, {
                headers: { 'Authorization': `Bearer ${session!.access_token}` }
            });
            const json = await res.json();
            if (json.status === 'ok' && json.data) return json.data;
            return null;
        },
        enabled: !!session,
        // La frecuencia del día cambia una vez al día — cache agresivo
        staleTime: 1000 * 60 * 30, // 30 min frescos (no cambia a cada rato)
        gcTime: 1000 * 60 * 60,    // 1 hora en memoria
    });

    const markAsRead = () => {
        localStorage.setItem(getReadKey(), today);
    };

    const isRead = storedDate === today;

    return { data: data ?? null, isRead, markAsRead, loading };
}
