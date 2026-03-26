import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguagePromptBanner: React.FC = () => {
    const { language, setLanguage } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('naos_language_prompt_dismissed');
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('naos_language_prompt_dismissed', 'true');
    };

    const handleSelect = (lang: 'es' | 'en') => {
        setLanguage(lang);
        handleDismiss();
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-[95%] glass-panel rounded-3xl p-4 shadow-2xl border border-cyan-500/20 text-center space-y-3"
            >
                <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_30px_rgba(6,182,212,0.05)] pointer-events-none" />
                
                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <span className="animate-pulse">🌐</span> 
                    {language === 'es' ? 'Idioma Detectado' : 'Language Detected'}
                </p>
                
                <p className="text-[12px] text-cyan-100/90 font-light">
                    {language === 'es' 
                        ? '¿Deseas continuar en Español o cambiar a Inglés?' 
                        : 'Do you want to continue in English or switch to Spanish?'}
                </p>
                
                <div className="flex gap-2 justify-center items-center">
                    <button
                        onClick={() => handleSelect('es')}
                        className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            language === 'es' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-white/60 hover:text-white'
                        }`}
                    >
                        Español
                    </button>
                    <button
                        onClick={() => handleSelect('en')}
                        className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                            language === 'en' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-white/60 hover:text-white'
                        }`}
                    >
                        English
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="ml-1 p-1 hover:bg-white/5 rounded-full text-white/30 hover:text-white/80 transition-all"
                        title={language === 'es' ? 'Cerrar' : 'Close'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
