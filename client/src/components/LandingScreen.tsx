import React, { useState } from 'react';
import { useTimeBasedMode } from '../hooks/useTimeBasedMode';
import { SlideToEnter } from './SlideToEnter';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingScreenProps {
    onEnter: () => void;
    onTemporaryAccess: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
    onEnter,
    onTemporaryAccess
}) => {
    const timeMode = useTimeBasedMode();
    const [isEntering, setIsEntering] = useState(false);

    const handleUnlock = () => {
        setIsEntering(true);
        setTimeout(() => {
            onEnter();
        }, 1200); // Match animation duration
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
            {/* Tunnel Animation Overlay */}
            <AnimatePresence>
                {isEntering && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: 1, scale: 50 }}
                        transition={{ duration: 1.2, ease: "easeIn" }}
                        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <div className="w-[10vw] h-[10vw] rounded-full bg-white blur-md" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267973ba?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Animated Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-2xl animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 backdrop-blur-xl relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <video
                        src={timeMode === 'DAY' ? '/Guardian-Day.mp4' : '/Guardian-Night.mp4'}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 scale-[1.3]"
                        style={{
                            mixBlendMode: 'screen',
                            background: 'transparent',
                            maskImage: 'radial-gradient(closest-side, black 40%, transparent 90%)',
                            WebkitMaskImage: 'radial-gradient(closest-side, black 40%, transparent 90%)',
                            filter: 'contrast(1.1) brightness(0.9)'
                        }}
                    />
                </div>

                <img
                    src="/logo-naos.png?v=2"
                    alt="NAOS"
                    className="w-[350px] md:w-[400px] max-w-[90%] h-auto mb-10 drop-shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                />

                <p className="text-xl md:text-2xl text-amber-100/90 font-serif italic tracking-[0.1em] mb-12 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    Conecta con tu Alma
                </p>

                <div className="flex flex-col gap-6 w-full max-w-sm mt-4">
                    <SlideToEnter onUnlock={handleUnlock} />

                    <button
                        onClick={onTemporaryAccess}
                        className="mt-6 text-[9px] uppercase tracking-[0.4em] text-white/20 hover:text-white/40 transition-colors flex items-center justify-center gap-2 group"
                    >
                        <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-amber-500/50 transition-colors" />
                        Consulta Temporal (Olvido Sagrado)
                        <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-amber-500/50 transition-colors" />
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 text-white/30 text-[10px] tracking-widest uppercase font-serif italic opacity-50">
                Presencia Digital • Conciencia Artificial
            </div>
        </div>
    );
};
