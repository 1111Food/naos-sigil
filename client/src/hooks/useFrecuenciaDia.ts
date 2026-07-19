import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface FrecuenciaDiaData {
    texto_principal: string;
    score_energia_general: number;
    riesgo: string;
    oportunidad: string;
    prioridades_dinamicas: { nombre: string; score: number; icono: string }[];
    variables_astrales_utilizadas: string[];
    conversational_hook: string;
}

export function useFrecuenciaDia() {
    const { session } = useAuth();
    const [data, setData] = useState<FrecuenciaDiaData | null>(null);
    const [isRead, setIsRead] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        fetchFrecuencia();
    }, [session]);

    const fetchFrecuencia = async () => {
        setLoading(true);
        try {
            const token = session?.access_token;
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/oracle/daily?offset=0`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.status === 'ok' && json.data) {
                setData(json.data);
                // We don't have a specific API to check is_read easily here unless we add it,
                // But we can check local storage or assume it's unread if it's the first time today.
                // Let's use localStorage to track if they've seen today's Frecuencia.
                const today = new Date().toISOString().split('T')[0];
                const storedDate = localStorage.getItem('frecuencia_read_date');
                if (storedDate !== today) {
                    setIsRead(false);
                }
            }
        } catch (e) {
            console.error("Error fetching Frecuencia del Día", e);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = () => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('frecuencia_read_date', today);
        setIsRead(true);
    };

    return { data, isRead, markAsRead, loading };
}
