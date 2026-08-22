import { useQuery } from '@tanstack/react-query';
import { endpoints, getAuthHeaders } from '../lib/api';

export interface NaosContextType {
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

export function useNaosContext() {
    const fetchContext = async (): Promise<NaosContextType> => {
        const localTime = new Date().toISOString();
        const res = await fetch(`${endpoints.profile.replace('/profile', '/context')}?localTime=${localTime}`, {
            headers: getAuthHeaders() as HeadersInit
        });
        if (!res.ok) {
            throw new Error('Failed to fetch NAOS Context');
        }
        return res.json();
    };

    return useQuery({
        queryKey: ['naosContext'],
        queryFn: fetchContext,
        staleTime: 1000 * 60 * 5 // 5 minutes cache
    });
}
