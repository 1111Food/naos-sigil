import React from 'react';
import { useTranslation } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoherence } from '../hooks/useCoherence';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

interface SigilBubbleProps {
    activeView?: string;
    onNavigate?: (view: any, payload?: any) => void;
}

export const SigilBubble: React.FC<SigilBubbleProps> = ({ activeView, onNavigate }) => {
    const { t } = useTranslation();
    const { score, trend } = useCoherence();
    const { playSound } = useSound();
    const [message, setMessage] = React.useState<string | null>(null);
    const hasTriggeredRef = React.useRef(false);

    // Keep track of latest values without resetting the idle countdown timer
    const scoreRef = React.useRef(score);
    const trendRef = React.useRef(trend);
    
    React.useEffect(() => { scoreRef.current = score; }, [score]);
    React.useEffect(() => { trendRef.current = trend; }, [trend]);

    React.useEffect(() => {
        if (activeView !== 'TEMPLE' || hasTriggeredRef.current) {
            if (activeView !== 'TEMPLE') {
                setMessage(null); // Clear message if leaving Temple
            }
            return;
        }

        const timer = setTimeout(() => {
            if (hasTriggeredRef.current) return;

            const currScore = scoreRef.current;
            const currTrend = trendRef.current;

            if (currScore && currScore < 60) {
                setMessage(t('friction_detected'));
                playSound('success');
                hasTriggeredRef.current = true;
            } else if (currTrend === 'down') {
                setMessage(t('frequency_dropping'));
                playSound('success');
                hasTriggeredRef.current = true;
            }
        }, 15000); // 15 seconds idle trigger

        return () => clearTimeout(timer);
    }, [activeView, playSound]);

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
                            {t('ignore')}
                        </button>
                        <button 
                            onClick={() => {
                                setMessage(null);
                                if (onNavigate) {
                                    onNavigate('SANCTUARY', { type: 'BREATH', techId: 'water-1' });
                                }
                            }}
                            className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-[8px] font-bold uppercase tracking-widest text-white hover:bg-cyan-500/30 transition-all"
                        >
                            {t('stabilize')}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
