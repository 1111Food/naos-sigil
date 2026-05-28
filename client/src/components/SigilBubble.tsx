import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../hooks/useSound';
import { useProfile } from '../hooks/useProfile';
import { MessageCircle, Beaker, X } from 'lucide-react';

interface SigilBubbleProps {
    activeView?: string;
    onNavigate?: (view: any, payload?: any) => void;
}

export const SigilBubble: React.FC<SigilBubbleProps> = ({ activeView, onNavigate }) => {
    const { t } = useTranslation();
    const { profile } = useProfile();
    const { playSound } = useSound();
    const [isVisible, setIsVisible] = useState(false);
    
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetIdleTimer = () => {
        if (activeView !== 'TEMPLE') return;
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        // Hide if they start moving again
        if (isVisible) setIsVisible(false);

        // 60 seconds (1 minute) of true inactivity
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            playSound('success');
        }, 60000);
    };

    useEffect(() => {
        if (activeView !== 'TEMPLE') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsVisible(false);
            return;
        }

        resetIdleTimer();

        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
        window.addEventListener('touchstart', resetIdleTimer);
        window.addEventListener('click', resetIdleTimer);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('touchstart', resetIdleTimer);
            window.removeEventListener('click', resetIdleTimer);
        };
    }, [activeView, isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed z-[100] bottom-8 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col gap-4 text-center"
                >
                    <button 
                        onClick={() => setIsVisible(false)}
                        className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                    
                    <p className="text-sm text-white/80 leading-relaxed font-light mt-2">
                        {profile?.nickname || profile?.name ? `Parece que hay quietud en el sistema, ${profile.nickname || profile.name}.` : "Parece que hay quietud en el sistema."}
                        <br/><br/>
                        ¿Te gustaría conversar conmigo o explorar el Laboratorio Elemental?
                    </p>
                    
                    <div className="flex flex-col gap-2 w-full mt-2">
                        <button 
                            onClick={() => {
                                setIsVisible(false);
                                if (onNavigate) onNavigate('CHAT');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
                        >
                            <MessageCircle size={14} />
                            Conversar con NAOS
                        </button>
                        <button 
                            onClick={() => {
                                setIsVisible(false);
                                if (onNavigate) onNavigate('LABS');
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest text-emerald-100 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all"
                        >
                            <Beaker size={14} />
                            Laboratorio Elemental
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
