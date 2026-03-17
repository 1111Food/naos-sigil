import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from './useProfile';
import { API_BASE_URL } from '../lib/api';

export interface Protocol21 {
    id: string;
    user_id: string;
    start_date: string;
    current_day: number;
    target_days: number;
    protocol_stage: '21_DAYS' | '90_DAYS';
    status: 'active' | 'completed' | 'paused' | 'cancelled' | 'awaiting_evolution';
    created_at: string;
    title?: string;
    purpose?: string;
}

export interface ProtocolLog {
    id: string;
    protocol_id: string;
    day_number: number;
    is_completed: boolean;
    completed_at: string;
    notes?: string;
}

export const useProtocol21 = () => {
    const { profile } = useProfile();
    const [activeProtocol, setActiveProtocol] = useState<Protocol21 | null>(null);
    const [dailyLogs, setDailyLogs] = useState<ProtocolLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedCount, setCompletedCount] = useState(0);

    // Fetch Active or Awaiting Evolution Protocol
    const fetchProtocol = async () => {
        if (!profile?.id) return;
        setLoading(true);
        setError(null);

        try {
            const { data: protocol, error: protocolError } = await supabase
                .from('user_protocols')
                .select('*')
                .eq('user_id', profile.id)
                .in('status', ['active', 'awaiting_evolution'])
                .maybeSingle();

            if (protocolError) throw protocolError;

            if (protocol) {
                // Fetch intent from protocols table to get title and purpose
                const { data: intent } = await supabase
                    .from('protocols')
                    .select('title, purpose')
                    .eq('user_id', profile.id)
                    .eq('status', protocol.status === 'awaiting_evolution' ? 'active' : 'active') // Both usually 'active' in protocols table
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                setActiveProtocol({
                    ...protocol,
                    title: intent?.title || 'Protocolo 21',
                    purpose: intent?.purpose || 'Evolución'
                });

                // Fetch Logs for this protocol
                const { data: logs, error: logsError } = await supabase
                    .from('protocol_daily_logs')
                    .select('*')
                    .eq('protocol_id', protocol.id)
                    .order('day_number', { ascending: true });

                if (logsError) throw logsError;
                setDailyLogs(logs || []);
            } else {
                setActiveProtocol(null);
                setDailyLogs([]);
            }

            // Fetch completed protocols count
            const { count } = await supabase
                .from('user_protocols')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('status', 'completed');

            setCompletedCount(count || 0);

        } catch (err: any) {
            console.error("Error fetching protocol:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProtocol();
    }, [profile?.id]);

    // Start New Protocol
    const startProtocol = async () => {
        if (!profile?.id) return;
        setLoading(true);

        try {
            if (activeProtocol) {
                throw new Error("Ya tienes un ciclo en curso.");
            }

            const { data, error } = await supabase
                .from('user_protocols')
                .insert({
                    user_id: profile.id,
                    start_date: new Date().toISOString(),
                    current_day: 1,
                    target_days: 21,
                    protocol_stage: '21_DAYS',
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            setActiveProtocol(data);
            setDailyLogs([]);
            return data;

        } catch (err: any) {
            console.error("Error creating protocol:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Complete Daily Check (Now using the new server endpoint)
    const completeDay = async (dayNumber: number, notes?: string) => {
        if (!activeProtocol || !profile?.id) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/protocols/seal-day`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    protocolId: activeProtocol.id,
                    dayNumber,
                    notes
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al sellar el día");
            }

            // Optimistic update for instant UI feedback
            setDailyLogs(prev => [...prev, {
                id: 'temp-' + Date.now(),
                protocol_id: activeProtocol.id,
                day_number: dayNumber,
                is_completed: true,
                completed_at: new Date().toISOString(),
                notes: notes
            }]);

            // Advance day if under 21
            if (activeProtocol.current_day < 21) {
                setActiveProtocol(prev => prev ? { ...prev, current_day: prev.current_day + 1 } : null);
            } else if (activeProtocol.current_day === 21 && activeProtocol.target_days === 21) {
                setActiveProtocol(prev => prev ? { ...prev, status: 'awaiting_evolution' } : null);
            }

            const updatedProtocol = await response.json();

            // Refrescar estado completo por detrás
            fetchProtocol();
            return updatedProtocol;

        } catch (err: any) {
            console.error("Error completing day:", err);
            throw err;
        }
    };

    // Evolve Protocol (Bridge Action)
    const evolveProtocol = async () => {
        if (!activeProtocol || !profile?.id) return;

        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/protocols/evolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ protocolId: activeProtocol.id })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al evolucionar protocolo");
            }

            const updatedProtocol = await response.json();
            await fetchProtocol();
            return updatedProtocol;
        } catch (err: any) {
            console.error("Error evolving protocol:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Archive Protocol (Bridge Action - Sellar en la Bóveda)
    const archiveProtocol = async () => {
        if (!activeProtocol || !profile?.id) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('user_protocols')
                .update({
                    status: 'completed',
                    end_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeProtocol.id);

            if (error) throw error;

            // Also mark intent as completed
            await supabase
                .from('protocols')
                .update({ status: 'completed' })
                .eq('user_id', profile.id)
                .eq('status', 'active');

            setActiveProtocol(null);
            setDailyLogs([]);
            await fetchProtocol();
        } catch (err: any) {
            console.error("Error archiving protocol:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Pause Protocol
    const pauseProtocol = async () => {
        if (!activeProtocol) return;
        try {
            const { error } = await supabase
                .from('user_protocols')
                .update({ status: 'paused' })
                .eq('id', activeProtocol.id);

            if (error) throw error;
            setActiveProtocol(prev => prev ? { ...prev, status: 'paused' } : null);
        } catch (err) {
            console.error(err);
        }
    };

    // Cancel Protocol
    const cancelProtocol = async () => {
        if (!activeProtocol || !profile?.id) return;
        try {
            const { error } = await supabase
                .from('user_protocols')
                .update({ status: 'cancelled' })
                .eq('id', activeProtocol.id);

            if (error) throw error;
            await supabase.from('protocols').update({ status: 'cancelled' }).eq('user_id', profile.id).eq('status', 'active');
            setActiveProtocol(null);
            setDailyLogs([]);
        } catch (err) {
            console.error(err);
        }
    };

    // Reset Protocol
    const resetProtocol = async () => {
        if (!activeProtocol) return;
        setLoading(true);
        try {
            const { error: updateError } = await supabase
                .from('user_protocols')
                .update({
                    current_day: 1,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    target_days: 21,
                    protocol_stage: '21_DAYS'
                })
                .eq('id', activeProtocol.id);

            if (updateError) throw updateError;

            const { error: deleteError } = await supabase
                .from('protocol_daily_logs')
                .delete()
                .eq('protocol_id', activeProtocol.id);

            if (deleteError) throw deleteError;

            setActiveProtocol(prev => prev ? { ...prev, current_day: 1, status: 'active', target_days: 21 } : null);
            setDailyLogs([]);
            await fetchProtocol();

        } catch (err: any) {
            console.error("Error resetting protocol:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        activeProtocol,
        dailyLogs,
        loading,
        error,
        completedCount,
        startProtocol,
        completeDay,
        evolveProtocol,
        archiveProtocol,
        pauseProtocol,
        cancelProtocol,
        resetProtocol,
        refresh: fetchProtocol
    };
};
