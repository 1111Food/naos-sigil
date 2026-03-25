import { useState, useEffect } from 'react';
import { useProfile } from './useProfile';
import { endpoints, getAsyncAuthHeaders } from '../lib/api';

export interface SubscriptionStatus {
    plan: 'FREE' | 'PREMIUM' | 'EXTENDED';
    validUntil?: string;
    features: string[];
}

export function useSubscription(shouldFetch: boolean = true) {
    const { profile } = useProfile();
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(shouldFetch);

    useEffect(() => {
        const fetchStatus = async () => {
            // Wait for profile.id to be available before fetching to prevent 401
            if (!shouldFetch || !profile?.id) {
                if (!shouldFetch) setLoading(false);
                return;
            }

            try {
                const headers = await getAsyncAuthHeaders();
                const res = await fetch(endpoints.subscription, { headers });
                
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                } else if (res.status === 401) {
                    console.warn("🔐 useSubscription: Token still invalid or expired.");
                }
            } catch (err) {
                console.error("Failed to fetch subscription", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [shouldFetch, profile?.id]);

    const upgrade = async () => {
        try {
            const headers = await getAsyncAuthHeaders();
            const res = await fetch(endpoints.upgrade, {
                method: 'POST',
                headers
            });
            if (res.ok) {
                const updated = await res.json();
                setStatus(updated);
            }
        } catch (err) {
            console.error("Upgrade failed", err);
        }
    };

    const togglePlan = async () => {
        try {
            const nextPlan = status?.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM';
            const headers = await getAsyncAuthHeaders();
            const res = await fetch(endpoints.upgrade, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: nextPlan })
            });
            if (res.ok) {
                const updated = await res.json();
                setStatus(updated);
            }
        } catch (err) {
            console.error("Toggle Plan failed", err);
        }
    };

    return { status, loading, upgrade, togglePlan };
}
