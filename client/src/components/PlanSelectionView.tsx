import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';

// Typing for Lemon Squeezy SDK
declare global {
    interface Window {
        createLemonSqueezy?: () => void;
        LemonSqueezy?: {
            Url: {
                Open: (url: string) => void;
            };
            Setup: (config: { eventHandler: (event: any) => void }) => void;
        };
    }
}

interface PlanSelectionViewProps {
    onBack?: () => void;
    onSelectPlan?: (plan: 'monthly' | 'yearly') => void;
}

export const PlanSelectionView: React.FC<PlanSelectionViewProps> = ({ onBack }) => {
    const { profile, refreshProfile } = useProfile();
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    // Initialize Lemon Squeezy Overlay
    useEffect(() => {
        if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
            
            // Setup global event handler for real-time sync
            window.LemonSqueezy?.Setup({
                eventHandler: (event) => {
                    if (event.event === 'Checkout.Success') {
                        console.log('💰 [PAYMENT] Checkout success detected. Refreshing profile...');
                        refreshProfile();
                    }
                }
            });
        }
    }, [refreshProfile]);

    const handleLemonSqueezyCheckout = (variantId: string) => {
        if (!profile?.id) {
            console.error("❌ Checkout Error: No authenticated user found.");
            return;
        }

        setIsCheckoutLoading(true);
        
        // Construct checkout URL with user_id in custom_data
        // store.lemonsqueezy.com/checkout/buy/variant_id?checkout[custom][user_id]=xxx
        const storeUrl = import.meta.env.VITE_LEMON_SQUEEZY_STORE_URL || 'naos.lemonsqueezy.com';
        const checkoutUrl = `https://${storeUrl}/checkout/buy/${variantId}?checkout[custom][user_id]=${profile.id}&checkout[email]=${profile.email || ''}&embed=1`;

        if (window.LemonSqueezy) {
            window.LemonSqueezy.Url.Open(checkoutUrl);
            setTimeout(() => setIsCheckoutLoading(false), 2000); // Safety reset
        } else {
            // Fallback for direct link if SDK failed
            window.open(checkoutUrl, '_blank');
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
                    onClick={() => handleLemonSqueezyCheckout(import.meta.env.VITE_LEMON_SQUEEZY_VAR_MONTHLY || 'default_monthly_id')}
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
                    onClick={() => handleLemonSqueezyCheckout(import.meta.env.VITE_LEMON_SQUEEZY_VAR_YEARLY || 'default_yearly_id')}
                    className={`p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden ${isCheckoutLoading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Mejor Valor
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Anual</span>
                        <span className="text-[10px] text-cyan-300/60">Ahorra más del 30%</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-black text-cyan-400">$88 <span className="text-[10px] font-normal text-white/40">/ año</span></span>
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
