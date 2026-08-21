import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfile } from './useProfile';
import { endpoints } from '../lib/api';
import { naosQueryFn, naosQueryMutate } from '../lib/queryClient';

export interface SubscriptionStatus {
    plan: 'FREE' | 'PREMIUM' | 'EXTENDED';
    validUntil?: string;
    features: string[];
}

// Query key factory — garantiza que todas las partes del código usen la misma key
export const subscriptionKeys = {
    all: ['subscription'] as const,
    status: (profileId: string) => [...subscriptionKeys.all, profileId] as const,
};

export function useSubscription(shouldFetch: boolean = true) {
    const { profile } = useProfile();
    const qc = useQueryClient();

    const { data: status, isLoading: loading } = useQuery<SubscriptionStatus>({
        queryKey: subscriptionKeys.status(profile?.id ?? ''),
        queryFn: () => naosQueryFn<SubscriptionStatus>(endpoints.subscription),
        // Solo ejecutar cuando hay sesión y se solicita explícitamente
        enabled: shouldFetch && !!profile?.id,
        // El plan de suscripción cambia poco — 10 min antes de re-validar
        staleTime: 1000 * 60 * 10,
    });

    const { mutateAsync: upgrade } = useMutation({
        mutationFn: () => naosQueryMutate<SubscriptionStatus>(endpoints.upgrade, 'POST'),
        onSuccess: (updated) => {
            // Actualiza el caché inmediatamente sin re-fetch de red
            qc.setQueryData(subscriptionKeys.status(profile?.id ?? ''), updated);
        },
    });

    const { mutateAsync: togglePlan } = useMutation({
        mutationFn: () => {
            const nextPlan = status?.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM';
            return naosQueryMutate<SubscriptionStatus>(
                endpoints.upgrade,
                'POST',
                { plan: nextPlan }
            );
        },
        onSuccess: (updated) => {
            qc.setQueryData(subscriptionKeys.status(profile?.id ?? ''), updated);
        },
    });

    return { status: status ?? null, loading, upgrade, togglePlan };
}
