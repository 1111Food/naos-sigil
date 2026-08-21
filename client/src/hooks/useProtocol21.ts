import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    const qc = useQueryClient();

    const { data, isLoading: loading, error, refetch: fetchProtocol } = useQuery({
        queryKey: ['protocol21', profile?.id],
        queryFn: async () => {
            if (!profile?.id) throw new Error('No profile');

            let activeProtocol = null;
            let dailyLogs: ProtocolLog[] = [];
            let completedCount = 0;

            const { data: protocol, error: protocolError } = await supabase
                .from('user_protocols')
                .select('*')
                .eq('user_id', profile.id)
                .in('status', ['active', 'awaiting_evolution'])
                .maybeSingle();

            if (protocolError) throw protocolError;

            if (protocol) {
                const { data: intent } = await supabase
                    .from('protocols')
                    .select('title, purpose')
                    .eq('user_id', profile.id)
                    .eq('status', protocol.status === 'awaiting_evolution' ? 'active' : 'active')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                activeProtocol = {
                    ...protocol,
                    title: intent?.title || 'Protocolo 21',
                    purpose: intent?.purpose || 'Evolución'
                };

                const { data: logs, error: logsError } = await supabase
                    .from('protocol_daily_logs')
                    .select('*')
                    .eq('protocol_id', protocol.id)
                    .order('day_number', { ascending: true });

                if (logsError) throw logsError;
                dailyLogs = logs || [];
            }

            const { count } = await supabase
                .from('user_protocols')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('status', 'completed');

            completedCount = count || 0;

            return { activeProtocol, dailyLogs, completedCount };
        },
        enabled: !!profile?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const activeProtocol = data?.activeProtocol || null;
    const dailyLogs = data?.dailyLogs || [];
    const completedCount = data?.completedCount || 0;
    const errorMessage = error ? error.message : null;

    const startMutation = useMutation({
        mutationFn: async () => {
            if (activeProtocol) throw new Error("Ya tienes un ciclo en curso.");
            const { data, error } = await supabase
                .from('user_protocols')
                .insert({
                    user_id: profile!.id,
                    start_date: new Date().toISOString(),
                    current_day: 1,
                    target_days: 21,
                    protocol_stage: '21_DAYS',
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const startProtocol = async () => {
        return startMutation.mutateAsync();
    };

    const completeMutation = useMutation({
        mutationFn: async ({ dayNumber, notes }: { dayNumber: number, notes?: string }) => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const response = await fetch(`${API_BASE_URL}/api/protocols/seal-day`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ protocolId: activeProtocol!.id, dayNumber, notes })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al sellar el día");
            }
            return response.json();
        },
        onMutate: async ({ dayNumber, notes }) => {
            await qc.cancelQueries({ queryKey: ['protocol21', profile?.id] });
            const previousData = qc.getQueryData<any>(['protocol21', profile?.id]);
            
            if (previousData) {
                qc.setQueryData(['protocol21', profile?.id], {
                    ...previousData,
                    dailyLogs: [...previousData.dailyLogs, {
                        id: 'temp-' + Date.now(),
                        protocol_id: activeProtocol!.id,
                        day_number: dayNumber,
                        is_completed: true,
                        completed_at: new Date().toISOString(),
                        notes: notes
                    }],
                    activeProtocol: {
                        ...previousData.activeProtocol,
                        current_day: previousData.activeProtocol.current_day < 21 ? previousData.activeProtocol.current_day + 1 : previousData.activeProtocol.current_day,
                        status: (previousData.activeProtocol.current_day === 21 && previousData.activeProtocol.target_days === 21) ? 'awaiting_evolution' : previousData.activeProtocol.status
                    }
                });
            }
            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                qc.setQueryData(['protocol21', profile?.id], context.previousData);
            }
        },
        onSettled: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const completeDay = async (dayNumber: number, notes?: string) => {
        if (!activeProtocol || !profile?.id) return;
        return completeMutation.mutateAsync({ dayNumber, notes });
    };

    const evolveMutation = useMutation({
        mutationFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const response = await fetch(`${API_BASE_URL}/api/protocols/evolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ protocolId: activeProtocol!.id })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Error al evolucionar protocolo");
            }
            return response.json();
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const evolveProtocol = async () => {
        if (!activeProtocol || !profile?.id) return;
        return evolveMutation.mutateAsync();
    };

    const archiveMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('user_protocols')
                .update({ status: 'completed', end_date: new Date().toISOString(), updated_at: new Date().toISOString() })
                .eq('id', activeProtocol!.id);

            if (error) throw error;

            await supabase
                .from('protocols')
                .update({ status: 'completed' })
                .eq('user_id', profile!.id)
                .eq('status', 'active');
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const archiveProtocol = async () => {
        if (!activeProtocol || !profile?.id) return;
        return archiveMutation.mutateAsync();
    };

    const pauseMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('user_protocols').update({ status: 'paused' }).eq('id', activeProtocol!.id);
            if (error) throw error;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const pauseProtocol = async () => {
        if (!activeProtocol) return;
        return pauseMutation.mutateAsync();
    };

    const cancelMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('user_protocols').update({ status: 'cancelled' }).eq('id', activeProtocol!.id);
            if (error) throw error;
            await supabase.from('protocols').update({ status: 'cancelled' }).eq('user_id', profile!.id).eq('status', 'active');
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const cancelProtocol = async () => {
        if (!activeProtocol || !profile?.id) return;
        return cancelMutation.mutateAsync();
    };

    const resetMutation = useMutation({
        mutationFn: async () => {
            const { error: updateError } = await supabase
                .from('user_protocols')
                .update({ current_day: 1, status: 'active', start_date: new Date().toISOString(), target_days: 21, protocol_stage: '21_DAYS' })
                .eq('id', activeProtocol!.id);
            if (updateError) throw updateError;

            const { error: deleteError } = await supabase
                .from('protocol_daily_logs')
                .delete()
                .eq('protocol_id', activeProtocol!.id);
            if (deleteError) throw deleteError;
        },
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: ['protocol21', profile?.id] });
        }
    });

    const resetProtocol = async () => {
        if (!activeProtocol) return;
        return resetMutation.mutateAsync();
    };

    return {
        activeProtocol,
        dailyLogs,
        loading,
        error: errorMessage,
        completedCount,
        startProtocol,
        completeDay,
        evolveProtocol,
        archiveProtocol,
        pauseProtocol,
        cancelProtocol,
        resetProtocol,
        refresh: async () => { await fetchProtocol(); }
    };
};
