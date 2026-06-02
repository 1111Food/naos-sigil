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
                    className="fixed z-[100] bottom-24 left-1/2 -translate-x-1/2 w-max max-w-[95vw] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full px-4 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-3"
                >
                    <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[9px] text-white/60 font-light uppercase tracking-[0.2em] hidden sm:inline-block">¿Quietud?</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setIsVisible(false);
                                if (onNavigate) onNavigate('CHAT');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
                        >
                            <MessageCircle size={12} />
                            Hablar
                        </button>
                        <button 
                            onClick={() => {
                                setIsVisible(false);
                                if (onNavigate) onNavigate('LABS');
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all"
                        >
                            <Beaker size={12} />
                            Laboratorio
                        </button>
                    </div>

                    <button 
                        onClick={() => setIsVisible(false)}
                        className="p-1 ml-1 text-white/30 hover:text-white transition-colors"
                    >
                        <X size={12} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
