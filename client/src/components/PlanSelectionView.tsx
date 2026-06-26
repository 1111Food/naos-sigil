import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

interface PlanSelectionViewProps {
    onBack?: () => void;
    onSelectPlan?: (plan: 'monthly' | 'yearly') => void;
}

export const PlanSelectionView: React.FC<PlanSelectionViewProps> = ({ onBack }) => {
    const { profile } = useProfile();
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const handleStripeCheckout = async (priceId: string) => {
        if (!profile?.id) {
            console.error("❌ Checkout Error: No authenticated user found.");
            return;
        }

        setIsCheckoutLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            
            const response = await fetch(`${apiUrl}/api/checkout/create-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-profile-id': profile.id
                },
                body: JSON.stringify({ priceId })
            });

            const data = await response.json();

            if (data.url) {
                // Redirect user to Stripe Checkout
                window.location.href = data.url;
            } else {
                console.error("❌ Stripe session creation failed:", data.error);
                setIsCheckoutLoading(false);
            }
        } catch (err) {
            console.error("🔥 Error connecting to checkout service:", err);
            setIsCheckoutLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center text-center gap-4 w-full animate-in fade-in duration-300">
            <h2 className="text-base font-serif italic tracking-wide text-white/90">
                Selecciona tu nivel de acceso
            </h2>
            <p className="text-xs text-white/50 px-4 leading-relaxed">
                Desbloquea tu arquitectura completa para operar desde tu diseño original.
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
                {/* Monthly */}
                <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    onClick={() => handleStripeCheckout(import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '')}
                    className={`p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer transition-all ${isCheckoutLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Mensual</span>
                        <span className="text-[10px] text-white/40">Acceso continuo</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-cyan-400">$11.11 <span className="text-[10px] font-normal text-white/40">/ mes</span></span>
                    </div>
                </motion.div>

                {/* Yearly */}
                <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(6,182,212,0.05)' }}
                    onClick={() => handleStripeCheckout(import.meta.env.VITE_STRIPE_PRICE_YEARLY || '')}
                    className={`p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden ${isCheckoutLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Mejor Valor
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Anual</span>
                        <span className="text-[10px] text-cyan-300/60">Ahorras 2 meses</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-cyan-400">$111.00 <span className="text-[10px] font-normal text-white/40">/ año</span></span>
                    </div>
                </motion.div>
                
                {isCheckoutLoading && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-cyan-400 font-bold animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        INICIALIZANDO PORTAL SEGURO...
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full px-2 mt-2">
                {[
                    "Acceso total a tu código energético",
                    "IA Sigil con memoria",
                    "Protocolos de transformación",
                    "Laboratorio de evolución"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-white/70">
                        <Check className="w-3 h-3 text-cyan-400" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="mt-2 text-[10px] text-white/40 hover:text-white/60 transition-colors uppercase tracking-wider font-semibold"
                >
                    Volver
                </button>
            )}
        </div>
    );
};
