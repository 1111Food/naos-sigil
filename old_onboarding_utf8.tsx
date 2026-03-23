import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { AstralVortex } from './AstralVortex';

interface OnboardingInitiationProps {
    onComplete: () => void;
}

export const OnboardingInitiation: React.FC<OnboardingInitiationProps> = ({ onComplete }) => {
    const { updateProfile } = useProfile();
    const [message, setMessage] = useState('');
    const [fullMessage, setFullMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        // Poetic sequence for the 4 schools
        setFullMessage("Bienvenido al Templo de Naos.\n\nTu arquitectura est├í siendo trazada a trav├®s de las cuatro grandes escuelas:\n\nÔ£ª El Cosmos Astral y su dise├▒o celeste.\nÔ£ª La Vibraci├│n Num├®rica de tu esencia.\nÔ£ª El Nawal Maya de tu cuenta larga.\nÔ£ª El T├│tem Oriental de tu instinto animal.\n\nÔ£¿ El Sigil ha evolucionado: Ahora puede comunicarse contigo en voz alta.\n\nSincronizando frecuencias...");
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!fullMessage) return;

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < fullMessage.length) {
                setMessage(fullMessage.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 14);

        return () => clearInterval(interval);
    }, [fullMessage]);

    const handleComplete = async () => {
        setCompleting(true);
        try {
            // 1. Try backend sync with fresh dynamic token
            const headers = await getAsyncAuthHeaders();
            await fetch(`${API_BASE_URL}/api/onboarding/complete`, {
                method: 'POST',
                headers
            });

            // 2. Local state update (Crucial for loop breaking)
            await updateProfile({ onboarding_completed: true });

            onComplete();
        } catch (err) {
            console.error('Failed to complete onboarding', err);
            // Even if it fails, try to update local state to break the loop
            try {
                await updateProfile({ onboarding_completed: true });
            } catch (innerErr) {
                console.error('Critical failure: Cannot even update local state', innerErr);
            }
            onComplete();
        } finally {
            setCompleting(false);
        }
    };

    const containerStyle = {
        boxShadow: "0 0 40px rgba(6,182,212,0.1), inset 0 0 20px rgba(6,182,212,0.05)"
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        >
            <AstralVortex />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 w-full max-w-2xl p-6 md:p-14 rounded-[2.5rem] bg-black/60 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] max-h-[85vh] overflow-y-auto custom-scrollbar"
                style={containerStyle}
            >
                {/* Decorative gradients */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '6s' }} />

                <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="p-4 rounded-full bg-cyan-500/5 border border-cyan-500/20"
                    >
                        <Sparkles className="w-8 h-8 text-cyan-400" />
                    </motion.div>

                    <h2 className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-serif">
                        Sigil: La Sintonizaci├│n Inicial
                    </h2>

                    <div className="min-h-[140px] md:min-h-[200px] flex items-center justify-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse" />
                                <p className="text-xs uppercase tracking-[0.3em] text-white/30 animate-pulse">Analizando tu Arquitectura...</p>
                            </div>
                        ) : (
                            <p className="text-lg md:text-xl font-serif italic leading-relaxed text-white/90 whitespace-pre-wrap">
                                {message}
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="inline-block w-px h-6 bg-cyan-400 ml-1 translate-y-1"
                                />
                            </p>
                        )}
                    </div>

                    <AnimatePresence>
                        {(!loading && message.length === fullMessage.length) && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                onClick={handleComplete}
                                disabled={completing}
                                className="group relative px-10 py-5 overflow-hidden rounded-[2rem] disabled:opacity-50"
                            >
                                <div className="absolute inset-0 border border-cyan-500/50 rounded-[2rem] group-hover:border-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-pulse" style={{ animationDuration: '3s' }} />
                                <span className="relative z-10 text-xs md:text-sm uppercase tracking-[0.4em] text-white/90 group-hover:text-white transition-colors flex items-center justify-center gap-3">
                                    {completing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sincronizando...
                                        </>
                                    ) : (
                                        'Sintonizar Coordenadas'
                                    )}
                                </span>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};
