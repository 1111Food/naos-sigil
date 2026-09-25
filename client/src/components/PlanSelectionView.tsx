import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Zap } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { trackEvent } from '../lib/analytics';

interface PlanSelectionViewProps {
    onBack?: () => void;
    onSelectPlan?: (plan: 'monthly' | 'yearly') => void;
}

export const PlanSelectionView: React.FC<PlanSelectionViewProps> = ({ onBack }) => {
    const { profile, refreshProfile } = useProfile();
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    useEffect(() => { trackEvent('pricing_viewed'); }, []);

    const provider = import.meta.env.VITE_PAYMENT_PROVIDER || 'stripe';

    // Paddle Initialization
    useEffect(() => {
        if (provider === 'paddle') {
            const script = document.createElement('script');
            script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
            script.onload = () => {
                if ((window as any).Paddle) {
                    (window as any).Paddle.Environment.set(import.meta.env.VITE_PADDLE_ENVIRONMENT || 'sandbox');
                    (window as any).Paddle.Initialize({                        token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token',
                        eventCallback: function(data: any) {
                            if (data.name === 'checkout.completed') {
                                handleCheckoutSuccess();
                            }
                        }
                    });
                }
            };
            document.body.appendChild(script);
        }
    }, [provider]);

    const handleCheckoutSuccess = async () => {
        trackEvent('checkout_completed');
        setIsActivating(true);
        // Poll for 10 seconds to allow webhook to process
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            await refreshProfile();
            // check if upgraded
            if (attempts > 5) {
                clearInterval(interval);
                setIsActivating(false);
                window.location.href = '/sanctuary?upgrade=success';
            }
        }, 2000);
    };

    const handleCheckout = async (priceId: string, endpoint: string = 'create-session', planMode?: string) => {
        trackEvent('checkout_started', { plan: planMode });
        if (profile?.plan_type === 'admin') {
            alert('Admin account - Payments Disabled');
            return;
        }

        if (!priceId) {
            alert('Error: Plan not configured.');
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const headers = await getAsyncAuthHeaders('POST');
            const response = await fetch(`/api/checkout/${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ priceId })
            });

            const data = await response.json();
            if (response.ok) {
                if (provider === 'paddle' && data.transactionId && planMode !== '3days') {
                    if ((window as any).Paddle) {
                        (window as any).Paddle.Checkout.open({
                            transactionId: data.transactionId
                        });
                        setIsCheckoutLoading(false);
                    } else {
                        alert('Paddle not loaded');
                        setIsCheckoutLoading(false);
                    }
                } else if (data.url) {
                    window.location.href = data.url;
                } else {
                    alert('Failed to start checkout (Missing URL or Transaction ID)');
                    setIsCheckoutLoading(false);
                }
            } else {
                alert(data.error || 'Failed to start checkout');
                setIsCheckoutLoading(false);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to start checkout.');
            setIsCheckoutLoading(false);
        }
    };

    if (isActivating) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-naos-gold mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Activando tu Modo Arquitecto...</h3>
                <p className="text-white/60">Sintonizando tu cuenta con los nuevos accesos.</p>
            </div>
        );
    }

    const monthlyPrice = provider === 'paddle' ? import.meta.env.VITE_PADDLE_PRICE_MONTHLY : import.meta.env.VITE_STRIPE_PRICE_MONTHLY;
    const yearlyPrice = provider === 'paddle' ? import.meta.env.VITE_PADDLE_PRICE_YEARLY : import.meta.env.VITE_STRIPE_PRICE_YEARLY;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif text-white text-center">Modo Arquitecto</h2>
            <div className="grid grid-cols-1 gap-4">
                {/* Monthly */}
                <div                    onClick={() => handleCheckout(monthlyPrice || '')}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-naos-gold/50 cursor-pointer transition-all"
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-white">Mensual</h3>
                        <span className="text-xl text-naos-gold">$11.11</span>
                    </div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-naos-gold" /> Mapa Temporal de 12 Meses</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-naos-gold" /> Energa Actual</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-naos-gold" /> Interpretaciones Profundas</li>
                    </ul>
                </div>
                {/* Yearly */}
                <div                    onClick={() => handleCheckout(yearlyPrice || '')}
                    className="p-6 rounded-2xl bg-naos-gold/10 border border-naos-gold/50 hover:bg-naos-gold/20 cursor-pointer transition-all relative overflow-hidden"
                >
                    <div className="absolute top-2 right-2 bg-naos-gold text-black text-xs font-bold px-2 py-1 rounded">20% OFF</div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-white">Anual</h3>
                        <span className="text-xl text-naos-gold">$111.11</span>
                    </div>
                    <ul className="space-y-2 text-sm text-white/70">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-naos-gold" /> Todo lo del plan mensual</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-naos-gold" /> Acceso a NAOS AI Avanzado</li>
                    </ul>
                </div>

                {/* 3 Days - Stripe Only */}
                {provider === 'stripe' && (
                    <div                        onClick={() => handleCheckout(import.meta.env.VITE_STRIPE_PRICE_3DAYS || '', 'create-session-3days', '3days')}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 cursor-pointer transition-all"
                    >
                        <div className="flex justify-between items-center">
                            <h3 className="text-md font-bold text-white">Plan Chispa (3 das)</h3>
                            <span className="text-md text-white/70">\.00</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};





