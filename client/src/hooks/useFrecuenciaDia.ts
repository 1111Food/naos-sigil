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
    localDate?: string; // V2 canonical date
}

// Clave de localStorage para tracking de lectura (sin cambios de comportamiento)
const getReadKey = () => `frecuencia_read_date`;

export function useFrecuenciaDia() {
    const { session, userProfile } = useAuth(); // If userProfile has language we could pass it, otherwise backend defaults to 'es'

    const storedDate = typeof window !== 'undefined' ? localStorage.getItem(getReadKey()) : null;

    const { data, isLoading: loading } = useQuery<FrecuenciaDiaData | null>({
        queryKey: ['frecuencia-dia', session?.user?.id], // Removed local today from cache key
        queryFn: async () => {
            const lang = userProfile?.language || 'es';
            const res = await fetch(`${API_BASE_URL}/api/oracle/daily?lang=${lang}`, {
                headers: { 'Authorization': `Bearer ${session!.access_token}` }
            });
            const json = await res.json();
            if (json.status === 'ok' && json.data) return json.data;
            return null;
        },
        enabled: !!session,
        staleTime: 1000 * 60 * 30, // 30 min
        gcTime: 1000 * 60 * 60,    // 1 hora
    });

    // Use server's canonical date for tracking read status, fallback to local date temporarily if loading
    const activeDate = data?.localDate || new Date().toISOString().split('T')[0];

    const markAsRead = () => {
        if (data?.localDate) {
            localStorage.setItem(getReadKey(), data.localDate);
        }
    };

    const isRead = storedDate === activeDate;

    return { data: data ?? null, isRead, markAsRead, loading };
}
