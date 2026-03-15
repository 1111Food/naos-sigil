import { useState, useEffect } from 'react';
import { endpoints, getAuthHeaders } from '../lib/api';

export interface SubscriptionStatus {
    plan: 'FREE' | 'PREMIUM' | 'EXTENDED';
    validUntil?: string;
    features: string[];
}

export function useSubscription(shouldFetch: boolean = true) {
    const [status, setStatus] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(shouldFetch);

    useEffect(() => {
        if (!shouldFetch) {
            setLoading(false);
            return;
        }

        fetch(endpoints.subscription, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setStatus(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch subscription", err);
                setLoading(false);
            });
    }, []);

    const upgrade = async () => {
        try {
            const res = await fetch(endpoints.upgrade, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const updated = await res.json();
            setStatus(updated);
        } catch (err) {
            console.error("Upgrade failed", err);
        }
    };

    const togglePlan = async () => {
        try {
            const nextPlan = status?.plan === 'PREMIUM' ? 'FREE' : 'PREMIUM';
            const res = await fetch(endpoints.upgrade, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: nextPlan })
            });
            const updated = await res.json();
            setStatus(updated);
        } catch (err) {
            console.error("Toggle Plan failed", err);
        }
    };

    return { status, loading, upgrade, togglePlan };
}
