import React from 'react';
import { useTranslation } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoherence } from '../hooks/useCoherence';
import { useSound } from '../hooks/useSound';
import { useEnergy } from '../hooks/useEnergy';
import { useProfile } from '../hooks/useProfile';

interface SigilBubbleProps {
    activeView?: string;
    onNavigate?: (view: any, payload?: any) => void;
}

export const SigilBubble: React.FC<SigilBubbleProps> = ({ activeView, onNavigate }) => {
    const { t } = useTranslation();
    const { score, trend } = useCoherence();
    const { profile } = useProfile();
    const { energy } = useEnergy();
    const { playSound } = useSound();
    const [message, setMessage] = React.useState<string | null>(null);
    const hasTriggeredRef = React.useRef(false);
    const welcomeTriggeredRef = React.useRef(false);

    // Keep track of latest values without resetting the idle countdown timer
    const scoreRef = React.useRef(score);
    const trendRef = React.useRef(trend);
    
    React.useEffect(() => { scoreRef.current = score; }, [score]);
    React.useEffect(() => { trendRef.current = trend; }, [trend]);

    // Initial Welcome Logic (Personalized + Guidance)
    React.useEffect(() => {
        if (activeView !== 'TEMPLE' || welcomeTriggeredRef.current) return;

        const timer = setTimeout(() => {
            if (welcomeTriggeredRef.current) return;
            
            const name = profile?.nickname || profile?.name || t('viajero');
            const welcome = t('sigil_welcome_1', { name });
            
            setMessage(welcome);
            playSound('success');
            welcomeTriggeredRef.current = true;
            hasTriggeredRef.current = true; // Mark as triggered so idle doesn't fire immediately
        }, 3000); // Trigger 3s after landing

        return () => clearTimeout(timer);
    }, [activeView, profile, energy, t, playSound]);

    React.useEffect(() => {
        if (activeView !== 'TEMPLE' || hasTriggeredRef.current) {
            if (activeView !== 'TEMPLE') {
                setMessage(null);
                welcomeTriggeredRef.current = false;
                hasTriggeredRef.current = false;
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
        }, 15000 * 2.5); // 37.5 seconds idle trigger (given initial welcome)

        return () => clearTimeout(timer);
    }, [activeView, playSound, t]);

    if (!message) return null;

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="fixed z-[99] top-[140px] left-1/2 -translate-x-1/2 w-[90vw] max-w-md bg-black/80 backdrop-blur-3xl border border-cyan-500/20 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col items-center gap-4 text-center transition-all"
                >
                    <p className="text-[11px] md:text-sm text-white leading-relaxed font-light tracking-wide whitespace-pre-wrap">
                        {message}
                    </p>
                    <div className="flex gap-2 w-full justify-center">
                        <button 
                            onClick={() => setMessage(null)}
                            className="px-6 py-2 rounded-full border border-white/5 text-[9px] uppercase tracking-[0.2em] text-white/40 hover:bg-white/5 transition-all"
                        >
                            {t('ignore')}
                        </button>
                        <button 
                            onClick={() => {
                                setMessage(null);
                                if (onNavigate) {
                                    onNavigate('CHAT'); // Changed to Chat for better engagement with the message
                                }
                            }}
                            className="px-6 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-[9px] font-bold uppercase tracking-[0.2em] text-white hover:bg-cyan-500/30 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        >
                            {t('calibrate') || 'CALIBRAR'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
