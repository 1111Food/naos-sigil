import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Archive, Zap, Shield } from 'lucide-react';

interface EvolutionBridgeProps {
    isOpen: boolean;
    onEvolve: () => void;
    onArchive: () => void;
}

export const EvolutionBridge: React.FC<EvolutionBridgeProps> = ({ isOpen, onEvolve, onArchive }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#050505]/95 backdrop-blur-3xl px-6"
            >
                {/* Mystic Aura Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-transparent blur-[150px] rounded-full animate-pulse-slow" />
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>

                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-4xl p-1 md:p-1.5 rounded-[4rem] bg-gradient-to-br from-amber-500/20 via-white/5 to-cyan-500/20 shadow-2xl"
                >
                    <div className="relative bg-[#080808]/90 backdrop-blur-3xl rounded-[3.8rem] p-10 md:p-20 overflow-hidden flex flex-col items-center text-center">

                        {/* Status Icon */}
                        <motion.div
                            initial={{ rotate: -20, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-10 p-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                        >
                            <Zap size={48} className="animate-pulse" />
                        </motion.div>

                        <div className="space-y-6 max-w-2xl">
                             <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl md:text-5xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-cyan-200 tracking-tight"
                            >
                                UMBRAL COMPLETADO
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg md:text-xl text-white/90 font-sans font-light leading-relaxed max-w-lg mx-auto"
                            >
                                Has sostenido coherencia durante 21 ciclos.
                                Ahora puedes convertir esto en tu nueva identidad.
                                <br />
                                <span className="text-amber-400 font-serif italic text-base mt-4 block">"21 días no es motivación. Es evidencia."</span>
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="pt-4"
                            >
                                <span className="text-[10px] uppercase tracking-[0.8em] text-amber-500/80 font-black">
                                    ¿Qué dictamina el Arquitecto?
                                </span>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-16 flex flex-col md:flex-row gap-6 w-full max-w-xl">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onEvolve}
                                className="flex-1 group relative py-6 px-10 rounded-3xl overflow-hidden transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles size={16} className="text-black" />
                                        <span className="text-black font-black text-xs uppercase tracking-[0.2em]">Ascensión</span>
                                    </div>
                                    <span className="text-black font-serif italic text-xl">Evolucionar al Protocolo 90</span>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onArchive}
                                className="flex-1 group relative py-6 px-10 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] transition-all"
                            >
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center gap-2 mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <Archive size={14} className="text-white/60" />
                                        <span className="text-white/40 text-[10px] uppercase tracking-[0.2em]">Archivos</span>
                                    </div>
                                    <span className="text-white/60 group-hover:text-white transition-colors font-sans font-light text-lg">Sellar en la Bóveda</span>
                                </div>
                            </motion.button>
                        </div>

                        {/* Subtle Footer */}
                        <div className="mt-12 flex items-center gap-3 text-white/20">
                            <Shield size={12} />
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold italic">NAOS Behavioral Architecture</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
