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
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
    const [selectedIntention, setSelectedIntention] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        birthTime: '12:00',
        birthCity: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Step 1 Fade Delay
    useEffect(() => {
        if (step === 1) {
            const timer = setTimeout(() => setStep(2), 3500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Step 3 Fade Delay
    useEffect(() => {
        if (step === 3) {
            const timer = setTimeout(() => setStep(4), 4000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleIntentionSelect = (intention: string) => {
        setSelectedIntention(intention);
        setStep(3);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep(5);

        // Mimic Activation compute Delay
        setTimeout(async () => {
            setIsSaving(true);
            try {
                // Save profile updates on top levels
                await updateProfile({
                    name: formData.name,
                    birthDate: formData.birthDate,
                    birthTime: formData.birthTime,
                    birthCity: formData.birthCity,
                    dominant_intent: selectedIntention.toLowerCase() as any,
                    onboarding_completed: true
                });

                // Backend call sync
                const headers = await getAsyncAuthHeaders();
                await fetch(`${API_BASE_URL}/api/onboarding/complete`, {
                    method: 'POST',
                    headers
                });

                setStep(6);
            } catch (err) {
                console.error("Initiation failure:", err);
                setStep(4); // fallback if crash
            } finally {
                setIsSaving(false);
            }
        }, 3000); // 3 seconds calculating
    };

    const containerStyle = {
        boxShadow: "0 0 40px rgba(6,182,212,0.1), inset 0 0 20px rgba(6,182,212,0.05)"
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black"
        >
            <AstralVortex />

            <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full animate-pulse" />

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1.5 }}
                        className="relative z-10 flex flex-col items-center text-center gap-3"
                    >
                        <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide">
                            Bienvenido, Arquitecto
                        </h1>
                        <p className="text-xs md:text-sm text-white/50 font-light tracking-wider">
                            Estás a punto de acceder a tu diseño original
                        </p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full max-w-md p-8 rounded-[2rem] bg-black/50 border border-white/10 backdrop-blur-xl flex flex-col items-center gap-6"
                        style={containerStyle}
                    >
                        <h2 className="text-sm uppercase tracking-[0.3em] text-white/60 text-center font-serif">
                            ¿Qué estás buscando?
                        </h2>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            {['Claridad', 'Dinero', 'Amor', 'Disciplina', 'Propósito'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleIntentionSelect(option)}
                                    className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-white/80 hover:text-white text-xs font-medium tracking-wide transition-all active:scale-[0.98]"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 1.2 }}
                        className="relative z-10 flex flex-col items-center text-center max-w-sm px-4"
                    >
                        <p className="text-base md:text-lg font-serif italic text-white/90 leading-relaxed">
                            "NAOS no te dará respuestas… te enseñará el camino"
                        </p>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 w-full max-w-sm p-6 rounded-[2rem] bg-black/60 border border-cyan-500/20 backdrop-blur-xl flex flex-col items-center gap-5 shadow-[0_0_40px_rgba(6,182,212,0.1)]"
                    >
                        <h2 className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold mb-1">
                            Coordenadas para crear tu avatar
                        </h2>
                        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3 w-full">
                            <input
                                type="text" placeholder="Tu Nombre / Pseudónimo" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:border-cyan-500/40 focus:outline-none transition-all"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="date" required
                                    value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-500/40 focus:outline-none transition-all"
                                />
                                <input
                                    type="time" required
                                    value={formData.birthTime} onChange={e => setFormData({ ...formData, birthTime: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-cyan-500/40 focus:outline-none transition-all"
                                />
                            </div>
                            <input
                                type="text" placeholder="Ciudad de Origen" required
                                value={formData.birthCity} onChange={e => setFormData({ ...formData, birthCity: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:border-cyan-500/40 focus:outline-none transition-all"
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2"
                            >
                                Activar Arquitectura
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="relative z-10 flex flex-col items-center gap-4"
                    >
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </motion.div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/40 font-light animate-pulse">
                            Calculando tu código...
                        </p>
                    </motion.div>
                )}

                {step === 6 && (
                    <motion.div
                        key="step6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 flex flex-col items-center text-center gap-4"
                    >
                        <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                            <Sparkles className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-lg font-serif italic text-white">Tu arquitectura está lista</h2>
                        <button
                            onClick={onComplete}
                            className="px-6 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-wide transition-all mt-2"
                        >
                            Ingresar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
