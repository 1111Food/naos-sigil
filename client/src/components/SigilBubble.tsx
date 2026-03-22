import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoherence } from '../hooks/useCoherence';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

export const SigilBubble: React.FC = () => {
    const { score, trend } = useCoherence();
    const { playSound } = useSound();
    const [message, setMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (score && score < 60) {
                setMessage("Tu sistema muestra fricción. ¿Deseas estabilizarte?");
                playSound('success');
            } else if (trend === 'down') {
                setMessage("Frecuencia bajando. Es hora de regular tu estado.");
                playSound('success');
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [score, trend, playSound]);

    if (!message) return null;

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="fixed z-[99] top-[180px] left-1/2 -translate-x-1/2 w-full max-w-xs bg-black/80 backdrop-blur-3xl border border-cyan-500/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col items-center gap-3 text-center"
                >
                    <p className="text-[10px] text-white/80 leading-relaxed font-light tracking-wide">
                        {message}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setMessage(null)}
                            className="px-4 py-1.5 rounded-full border border-white/5 text-[8px] uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
                        >
                            Ignorar
                        </button>
                        <button 
                            onClick={() => {
                                setMessage(null);
                                // Set window location or open active contextual actions if desired
                            }}
                            className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-[8px] font-bold uppercase tracking-widest text-white hover:bg-cyan-500/30 transition-all"
                        >
                            Estabilizar
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
