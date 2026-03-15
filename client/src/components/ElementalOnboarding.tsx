import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, X, ChevronRight, ChevronLeft, Target, Globe, Fingerprint, Anchor } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatedSilhouette } from './AnimatedSilhouette';

interface ElementalOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        title: "El Refugio del Arquitecto",
        subtitle: "Sistema de Calibración Neural",
        content: "Este espacio no es misticismo pasivo. Es un laboratorio de bioingeniería interactiva diseñado para hackear tu sistema nervioso. Aquí entrelazamos la acústica de precisión con arquitecturas antiguas de meditación para forzar un \"reset\" mental en minutos.",
        icon: <Target className="w-12 h-12 text-cyan-400" />,
        color: "cyan"
    },
    {
        title: "Arquitectura del Sistema",
        subtitle: "Corteza Prefrontal y Nervio Vago",
        content: "El estrés crónico apaga tu corteza prefrontal (centro de decisiones lógicas) y secuestra la amígdala. Los ritmos que experimentarás aquí estimulan directamente tu nervio vago, induciendo una respuesta parasimpática que desactiva el flujo de cortisol y restaura tu ancho de banda cognitivo.",
        icon: <Brain className="w-12 h-12 text-blue-400" />,
        color: "blue"
    },
    {
        title: "Propósito Fisiológico",
        subtitle: "Química Sanguínea y Frecuencias",
        content: "Cada 'Frecuencia Elemental' actúa como un péndulo neuroquímico. El elemento Tierra (Bajas Frecuencias) enraíza y disipa la adrenalina. El elemento Aire (Altas Frecuencias) inyecta claridad y dopamina. No cambias de música al azar; calibras conscientemente tu estado basal.",
        icon: <Activity className="w-12 h-12 text-emerald-400" />,
        color: "emerald"
    },
    {
        title: "Linajes de Consciencia",
        subtitle: "Tecnología de 3000 Años",
        content: "Nuestros protocolos estructuran el control temporal del Kriya Yoga, el enfoque agudo del Budismo Zen, la quietud de los Templos Shaolin y la fortaleza del Estoicismo. Son tradiciones forjadas originariamente para guerreros, ahora comprimidas en algoritmos y secuencias de audio.",
        icon: <Globe className="w-12 h-12 text-amber-400" />,
        color: "amber"
    },
    {
        title: "Alto Rendimiento",
        subtitle: "El Estándar de la Élite",
        content: "Esto es ciencia táctica comprobada. Operadores de élite (Navy SEALs) utilizan estas mismas retenciones de aire antes de entrar en conflicto para reducir pulsaciones. Ejecutivos de Fortune 500 y atletas olímpicos sincronizan estas respiraciones para desencadenar el hiper-enfoque (Flow State).",
        icon: <Fingerprint className="w-12 h-12 text-rose-400" />,
        color: "rose"
    },
    {
        title: "Geometría del Aliento",
        subtitle: "Sinfonía Diafragmática",
        content: "Asume el puesto de Observador. Columna absolutamente recta y barbilla nivelada (tu antena neuronal). Utiliza el diafragma: al inspirar, infla primero tu bóveda estomacal y luego expande el tórax superior. Siente la bioenergía ascendiendo y afinando tus centros vitales.",
        icon: <Anchor className="w-12 h-12 text-purple-400" />,
        color: "purple"
    }
];

export const ElementalOnboarding: React.FC<ElementalOnboardingProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('has_seen_lab_onboarding', 'true');
        onClose();
    };

    const step = STEPS[currentStep];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-zinc-900/50 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-3xl flex flex-col md:flex-row min-h-[500px]"
                    >
                        {/* Right: Close/Skip Button */}
                        <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-white/40" />
                            </button>
                        </div>

                        {/* Left: Visual/Icon Area */}
                        <div className="w-full md:w-1/3 p-12 flex flex-col items-center justify-center bg-white/[0.02] border-r border-white/5 relative overflow-hidden">
                            {/* Animated Silhouette Background */}
                            <div className="absolute inset-0 z-0 opacity-50 flex items-center justify-center p-4">
                                <AnimatedSilhouette
                                    showBreathing={currentStep >= 3}
                                    showEnergyCenters={currentStep >= 1}
                                />
                            </div>

                            <motion.div
                                key={currentStep}
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className={cn(
                                    "p-6 rounded-full border-2 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative z-10 backdrop-blur-md",
                                    step.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10' :
                                        step.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/10' :
                                            step.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 shadow-purple-500/10' :
                                                step.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/10' :
                                                    step.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/10' :
                                                        'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10'
                                )}
                            >
                                {step.icon}
                            </motion.div>

                            {/* Step Indicators */}
                            <div className="mt-12 flex gap-2">
                                {STEPS.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                            idx === currentStep ? "bg-white w-6" : "bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right: Content Area */}
                        <div className="flex-1 p-12 flex flex-col justify-between">
                            <motion.div
                                key={currentStep + 'content'}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-black">
                                        Ritual de Iniciación
                                    </span>
                                    <h2 className="text-3xl font-serif italic text-white mt-1 leading-tight">
                                        {step.title}
                                    </h2>
                                    <p className={cn(
                                        "text-[10px] uppercase tracking-widest font-bold mt-2",
                                        step.color === 'cyan' ? 'text-cyan-400' :
                                            step.color === 'rose' ? 'text-rose-400' :
                                                step.color === 'purple' ? 'text-purple-400' :
                                                    step.color === 'blue' ? 'text-blue-400' :
                                                        step.color === 'amber' ? 'text-amber-400' :
                                                            'text-emerald-400'
                                    )}>
                                        {step.subtitle}
                                    </p>
                                </div>

                                <p className="text-sm text-white/60 leading-relaxed font-light italic">
                                    "{step.content}"
                                </p>
                            </motion.div>

                            {/* Actions */}
                            <div className="mt-12 flex items-center justify-between">
                                <button
                                    onClick={handleBack}
                                    className={cn(
                                        "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black transition-all",
                                        currentStep === 0 ? "opacity-0 pointer-events-none" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    <ChevronLeft size={14} />
                                    Atrás
                                </button>

                                <button
                                    onClick={handleNext}
                                    className={cn(
                                        "px-8 py-3 rounded-2xl flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black transition-all group",
                                        step.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30' :
                                            step.color === 'rose' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' :
                                                step.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30' :
                                                    step.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' :
                                                        step.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' :
                                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                    )}
                                >
                                    {currentStep === STEPS.length - 1 ? "Comenzar Ritual" : "Continuar"}
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
