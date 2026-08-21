import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from '../hooks/useProfile';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';

interface CoherenceStatus {
    score: number;
    trend: 'up' | 'down';
    lastDelta: number;
    astralMood: 'HARMONIOUS' | 'CHALLENGING' | 'NEUTRAL';
    index?: {
        discipline: number;
        energy: number;
        clarity: number;
        streak: number;
    };
    volatility?: {
        E_usuario_current: number;
        system_recommendation: string;
        ui_adaptation: string;
    };
}

interface CoherenceContextType {
    score: number;
    trend: 'up' | 'down';
    astralMood: 'HARMONIOUS' | 'CHALLENGING' | 'NEUTRAL';
    lastDelta: number;
    index?: CoherenceStatus['index'];
    volatility?: CoherenceStatus['volatility'];
    loading: boolean;
    refresh: () => Promise<void>;
    logAction: (action: string) => Promise<any>;
}

const CoherenceContext = createContext<CoherenceContextType | undefined>(undefined);

export const CoherenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile } = useProfile();
    const qc = useQueryClient();

    const { data: status, isLoading: loading, refetch } = useQuery<CoherenceStatus>({
        queryKey: ['coherence-status', profile?.id],
        queryFn: async () => {
            const headers = await getAsyncAuthHeaders('GET');
            const response = await fetch(`${API_BASE_URL}/api/coherence/status`, {
                headers: headers as HeadersInit
            });
            if (!response.ok) throw new Error('Failed to fetch coherence status');
            return response.json();
        },
        enabled: !!profile?.id,
        staleTime: 1000 * 60 * 5, // 5 min
    });

    const actionMutation = useMutation({
        mutationFn: async (action: string) => {
            const headers = await getAsyncAuthHeaders('POST');
            const response = await fetch(`${API_BASE_URL}/api/coherence/action`, {
                method: 'POST',
                headers: headers as HeadersInit,
                body: JSON.stringify({ action })
            });
            if (!response.ok) throw new Error('Failed to log action');
            return response.json();
        },
        onSuccess: (result) => {
            qc.setQueryData<CoherenceStatus | undefined>(['coherence-status', profile?.id], (prev) => {
                if (!prev) return undefined;
                return {
                    ...prev,
                    score: result.newScore,
                    lastDelta: result.delta,
                    trend: result.delta >= 0 ? 'up' : 'down'
                };
            });
        }
    });

    const logAction = async (action: string) => {
        if (!profile?.id) return;
        return actionMutation.mutateAsync(action);
    };

    const value = {
        score: status?.score ?? 50, // Default to 50 (Balanced)
        trend: status?.trend ?? 'up',
        astralMood: status?.astralMood ?? 'NEUTRAL',
        lastDelta: status?.lastDelta ?? 0,
        index: status?.index,
        volatility: status?.volatility,
        loading,
        refresh: async () => { await refetch(); },
        logAction
    };

    return (
        <CoherenceContext.Provider value={value}>
            {children}
        </CoherenceContext.Provider>
    );
};

export const useCoherence = () => {
    const context = useContext(CoherenceContext);
    if (!context) {
        throw new Error('useCoherence must be used within a CoherenceProvider');
    }
    return context;
};
