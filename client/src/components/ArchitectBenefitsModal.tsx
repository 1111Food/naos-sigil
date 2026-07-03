import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Sparkles, Brain, Bot, Stars, ShieldAlert, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

interface ArchitectBenefitsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ArchitectBenefitsModal: React.FC<ArchitectBenefitsModalProps> = ({ isOpen, onClose }) => {
    const { t, language } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const benefits = [
        {
            id: 'ai_unlimited',
            title: language === 'en' ? 'Unlimited Artificial Intelligence' : 'Inteligencia Artificial Sin Límites',
            description: language === 'en'
                ? 'Your personal Sigil has no bounds. Consult, inquire, and expand your consciousness without limits.'
                : 'Tu Sigil personal no tiene límites. Consulta, indaga y expande tu consciencia sin bloqueos.',
            icon: Bot,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/30'
        },
        {
            id: 'deep_interpretations',
            title: language === 'en' ? 'Deep Hidden Wisdom' : 'Profundidad Oculta',
            description: language === 'en'
                ? 'Deep interpretations unlocked across Astrology, Numerology, Human Design, Nawal, and Eastern Wisdom.'
                : 'Interpretaciones profundas desbloqueadas en Astrología, Numerología, Diseño Humano, Nawal y Sabiduría Oriental.',
            icon: Stars,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30'
        },
        {
            id: 'lab_protocol',
            title: language === 'en' ? 'Protocols & Mental Lab' : 'Protocolos & Laboratorio',
            description: language === 'en'
                ? 'Total access to Protocol 2190 and the Mental Laboratory for your neural rewiring.'
                : 'Acceso total al Protocolo 2190 y al Laboratorio Mental para tu recableado neuronal.',
            icon: Brain,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30'
        },
        {
            id: 'telegram_coach',
            title: language === 'en' ? 'Sigil on Telegram' : 'Sigil en Telegram',
            description: language === 'en'
                ? 'Your Spiritual Coach available 24/7 directly on Telegram. Receive proactive alerts and guidance.'
                : 'Tu Coach Espiritual disponible 24/7 directo en Telegram. Recibe alertas y guías proactivas.',
            icon: Send,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30'
        },
        {
            id: 'future_tools',
            title: language === 'en' ? 'Continuous Evolution' : 'Evolución Continua',
            description: language === 'en'
                ? 'Early access to future tools, features, and sacred knowledge added to the NAOS Temple.'
                : 'Acceso anticipado a futuras herramientas, funciones y conocimiento sagrado del Templo de NAOS.',
            icon: Sparkles,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30'
        }
    ];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % benefits.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev === 0 ? benefits.length - 1 : prev - 1));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg glass-panel rounded-3xl p-6 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6 pt-4">
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/20 text-amber-400 mb-4 shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                            >
                                <Sparkles className="w-8 h-8" />
                            </motion.div>
                            <h2 className="text-2xl md:text-3xl font-serif italic text-white mb-2">
                                {language === 'en' ? 'Architect Privileges' : 'Privilegios de Arquitecto'}
                            </h2>
                            <p className="text-xs uppercase tracking-widest text-amber-400/80 font-semibold">
                                {language === 'en' ? 'Premium Arsenal' : 'Arsenal Premium'}
                            </p>
                        </div>

                        {/* Carousel Container */}
                        <div className="relative w-full h-[280px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                                >
                                    <div className={cn(
                                        "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border shadow-2xl transition-all",
                                        benefits[activeIndex].bg,
                                        benefits[activeIndex].border
                                    )}>
                                        {React.createElement(benefits[activeIndex].icon, {
                                            className: cn("w-10 h-10", benefits[activeIndex].color)
                                        })}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">
                                        {benefits[activeIndex].title}
                                    </h3>
                                    <p className="text-sm font-light text-white/70 leading-relaxed max-w-[280px]">
                                        {benefits[activeIndex].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Carousel Controls */}
                            <button 
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all hover:-translate-x-1"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all hover:translate-x-1"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mt-4">
                            {benefits.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        activeIndex === idx ? "w-6 bg-amber-400" : "bg-white/20 hover:bg-white/40"
                                    )}
                                />
                            ))}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
