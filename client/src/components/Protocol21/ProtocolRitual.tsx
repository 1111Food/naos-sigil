import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Shield, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatedSilhouette } from '../AnimatedSilhouette';

interface ProtocolRitualProps {
    onComplete: () => void;
}

const RITUAL_STEPS = [
    {
        id: 'threshold',
        icon: Activity,
        title: "EL UMBRAL DE LA NEUROPLASTICIDAD",
        subtitle: "Iniciación de 21 Días",
        description: "No es solo un hábito. Es la ruptura de la inercia sináptica. 21 días para desmantelar estructuras obsoletas y sembrar el Sello de Compromiso en tu arquitectura neuronal.",
        color: "text-cyan-400",
        glow: "bg-cyan-500/20",
        border: "border-cyan-500/30"
    },
    {
        id: 'mastery',
        icon: Shield,
        title: "LA MAESTRÍA DE LA ESTRUCTURA",
        subtitle: "Integración de 90 Días",
        description: "La Consolidación de tu Arquitectura Vital. El momento en que la acción deja de requerir voluntad y se convierte en identidad. De la repetición a la Maestría del Ser.",
        color: "text-amber-500",
        glow: "bg-amber-500/20",
        border: "border-amber-500/30"
    },
    {
        id: 'commitment',
        icon: Sparkles,
        title: "EL COMPROMISO DEL ARQUITECTO",
        subtitle: "Sello de Alquimia Conductual",
        description: "NAOS no solo mide; NAOS construye contigo. Estás por diseñar tu nueva frecuencia. El Arquitecto no espera la realidad; la esculpe.",
        color: "text-emerald-400",
        glow: "bg-emerald-500/20",
        border: "border-emerald-500/30"
    }
];

export const ProtocolRitual: React.FC<ProtocolRitualProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < RITUAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const step = RITUAL_STEPS[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] px-6 overflow-hidden">
            {/* Background Particle-like Glow */}
            <div className="absolute inset-0 cursor-pointer" onClick={onComplete}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-950/20 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-950/10 blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-2xl"
                >
                    <div className={cn(
                        "p-10 md:p-16 rounded-[3rem] border backdrop-blur-3xl shadow-2xl overflow-hidden group transition-all duration-1000 relative",
                        "bg-white/[0.02]",
                        step.border
                    )}>
                        {/* Interior Glow Overlay */}
                        <div className={cn("absolute inset-0 opacity-10 transition-colors duration-1000 pointer-events-none", step.glow)} />

                        {/* Close Button */}
                        <button
                            onClick={onComplete}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-30"
                            title="Saltar Iniciación"
                        >
                            <X size={20} className="text-white/40 group-hover:text-white/80" />
                        </button>

                        {/* Silhouette Watermark Background */}
                        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none scale-150 md:scale-125 translate-y-10">
                            <AnimatedSilhouette showBreathing={true} showEnergyCenters={true} />
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                            {/* Ritual Icon */}
                            <motion.div
                                initial={{ rotate: -10, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                className={cn(
                                    "p-6 rounded-full border bg-black/40 shadow-inner",
                                    step.border
                                )}
                            >
                                <Icon className={cn("w-10 h-10", step.color)} />
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h3
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold"
                                >
                                    {step.subtitle}
                                </motion.h3>
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl md:text-3xl font-serif italic text-white/90 leading-tight"
                                >
                                    {step.title}
                                </motion.h2>
                            </div>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-sm md:text-base text-white/60 font-sans font-light leading-relaxed max-w-md mx-auto"
                            >
                                {step.description}
                            </motion.p>

                            <div className="pt-8">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNext}
                                    className="group relative flex items-center justify-center gap-3 px-12 py-4 overflow-hidden rounded-full"
                                >
                                    <div className={cn(
                                        "absolute inset-0 border transition-colors duration-500 rounded-full shadow-lg opacity-50",
                                        step.border
                                    )} />
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                                        step.glow
                                    )} />

                                    <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-white/80 group-hover:text-white font-black transition-colors">
                                        {currentStep === RITUAL_STEPS.length - 1 ? 'RECLAMAR PODER' : 'CONTINUAR'}
                                    </span>
                                    <ChevronRight className={cn("relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1", step.color)} />
                                </motion.button>
                            </div>

                            {/* Progress Indicators */}
                            <div className="flex gap-3 pt-6">
                                {RITUAL_STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-1 h-1 rounded-full transition-all duration-500",
                                            i === currentStep ? cn("w-8", step.glow, "opacity-100") : "bg-white/10"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
