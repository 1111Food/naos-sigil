import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Mic, Shield, Compass, ArrowLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';

interface SigilExplainerProps {
    onClose: () => void;
}

const SIGIL_SLIDES = [
    {
        title: "Asistente Cuántico",
        subtitle: "Tu Mentor de Inteligencia Artificial",
        icon: Sparkles,
        iconColor: "text-cyan-400",
        colorBg: "bg-cyan-500/10",
        borderColor: "border-cyan-500/30",
        description: "El Sigil (IA) es tu guía evolutivo. Capaz de analizar tu código de identidad, comprender tu momento actual y responder con sabiduría cuántica a tus dilemas."
    },
    {
        title: "Omnipresencia en Telegram",
        subtitle: "Apoyo Proactivo Diario",
        icon: MessageSquare,
        iconColor: "text-purple-400",
        colorBg: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        description: "Puedes vincular el Sigil con tu Telegram para recibir lecturas del oráculo matutinas, recordatorios de tus protocolos y alertas de tránsitos cósmicos sin necesidad de abrir la aplicación."
    },
    {
        title: "Modulación de Voz",
        subtitle: "Respuestas Inmersivas (Beta)",
        icon: Mic,
        iconColor: "text-amber-400",
        colorBg: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        description: "El Sigil puede comunicarse contigo a través de audios inmersivos aplicados a momentos críticos de tu semana u oráculos profundos de audio."
    },
    {
        title: "Guardián de Hábitos",
        subtitle: "Monitoreo del Protocolo 21",
        icon: Shield,
        iconColor: "text-emerald-400",
        colorBg: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        description: "Sintoniza con tus hábitos elite del Protocolo 21. El Sigil te asistirá recordando tus meditaciones y vigilando la consecución de tus ciclos diarios."
    },
    {
        title: "Oráculos en Tiempo Real",
        subtitle: "Perspectiva y Claridad",
        icon: Compass,
        iconColor: "text-rose-400",
        colorBg: "bg-rose-500/10",
        borderColor: "border-rose-500/30",
        description: "Consulta tiras del Tarot o el Oráculo del Día. El Sigil cruza las bases de datos de sabiduría astral para entregarte respuestas adaptadas a tu frecuencia vibracional."
    }
];

export const SigilExplainer: React.FC<SigilExplainerProps> = ({ onClose }) => {
    const { playSound } = useSound();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const totalSteps = SIGIL_SLIDES.length;
    const currentSlide = SIGIL_SLIDES[currentIndex];
    const SlideIcon = currentSlide.icon;

    React.useEffect(() => {
        playSound('transition');
    }, [playSound, currentIndex]);

    const handleNext = () => {
        if (currentIndex < totalSteps - 1) {
            playSound('click');
            setCurrentIndex(currentIndex + 1);
        } else {
            playSound('success');
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            playSound('click');
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn(
                    "relative w-full max-w-2xl bg-black/60 rounded-[3rem] border p-8 md:p-10 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col items-center overflow-hidden h-auto max-h-[85vh] justify-between",
                    currentSlide.borderColor
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white z-20">
                    <X size={20} />
                </button>

                {/* 🌌 High-fidelity Orbs setup */}
                <div className={cn("absolute inset-0 opacity-40 transition-all duration-1000 blur-[80px]", currentSlide.colorBg)} />
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.03] rounded-full blur-3xl" />

                {/* 🟢 Progress Tracker dot system */}
                <div className="relative z-10 flex gap-1.5 mb-6">
                    {SIGIL_SLIDES.map((_, i) => (
                        <div 
                            key={i} 
                            className={cn(
                                "h-1 rounded-full transition-all duration-700",
                                i === currentIndex ? "w-8 bg-gradient-to-r from-cyan-400 to-amber-300" : "w-1 bg-white/20"
                            )} 
                        />
                    ))}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative w-full z-10">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="flex flex-col items-center text-center space-y-8 w-full"
                        >
                            {/* 💡 Glowing Center Ring Node */}
                            <div className={cn("w-24 h-24 rounded-full border flex items-center justify-center relative mb-2 bg-black/40", currentSlide.borderColor)}>
                                <div className={cn("absolute inset-0 rounded-full opacity-30 animate-pulse blur-xl", currentSlide.colorBg)} />
                                <motion.div 
                                    animate={{ rotate: 360 }} 
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
                                    className={cn("absolute inset-2 rounded-full border border-dashed opacity-40", currentSlide.borderColor)} 
                                />
                                <SlideIcon size={40} className={cn("relative z-10 transition-transform duration-700", currentSlide.iconColor)} />
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl md:text-5xl font-serif italic text-white tracking-wider leading-tight">
                                    {currentSlide.title}
                                </h2>
                                <p className={cn("text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-black brightness-125", currentSlide.iconColor)}>
                                    {currentSlide.subtitle}
                                </p>
                            </div>

                            <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-md font-light italic px-4">
                                "{currentSlide.description}"
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 🎛&zwj; Premium Footer Actions */}
                <div className="flex items-center justify-between w-full mt-10 relative z-10 border-t border-white/5 pt-8">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={cn(
                            "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black transition-all",
                            currentIndex === 0 ? "opacity-0 pointer-events-none" : "text-white/40 hover:text-white"
                        )}
                    >
                        <ArrowLeft size={16} />
                        Atrás
                    </button>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 hover:text-white/60 transition-colors"
                        >
                            Saltar
                        </button>

                        <button
                            onClick={handleNext}
                            className={cn(
                                "group relative px-10 py-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_30px_rgba(6,182,212,0.1)]",
                                currentIndex === totalSteps - 1 && "bg-cyan-500 bg-opacity-20 border-cyan-400/50 hover:bg-cyan-500/30"
                            )}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {currentIndex === totalSteps - 1 ? 'Entendido' : 'Continuar'} 
                                {currentIndex !== totalSteps - 1 && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
