import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, X, ChevronRight, ChevronLeft, Target, Globe, Fingerprint, Anchor } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatedSilhouette } from './AnimatedSilhouette';
import { useTranslation } from '../i18n';

interface ElementalOnboardingProps {
    isOpen: boolean;
    onClose: () => void;
}

const STEPS_CONFIG = [
    { id: 1, icon: Target, color: "cyan" },
    { id: 2, icon: Brain, color: "blue" },
    { id: 3, icon: Activity, color: "emerald" },
    { id: 4, icon: Globe, color: "amber" },
    { id: 5, icon: Fingerprint, color: "rose" },
    { id: 6, icon: Anchor, color: "purple" }
];

export const ElementalOnboarding: React.FC<ElementalOnboardingProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS_CONFIG.length - 1) {
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

    const stepConfig = STEPS_CONFIG[currentStep];
    const SvgIcon = stepConfig.icon;

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
                                    stepConfig.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10' :
                                        stepConfig.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 shadow-rose-500/10' :
                                            stepConfig.color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 shadow-purple-500/10' :
                                                stepConfig.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 shadow-blue-500/10' :
                                                    stepConfig.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 shadow-amber-500/10' :
                                                        'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10'
                                )}
                            >
                                <SvgIcon className={cn("w-12 h-12", 
                                    stepConfig.color === 'cyan' ? 'text-cyan-400' :
                                    stepConfig.color === 'rose' ? 'text-rose-400' :
                                    stepConfig.color === 'purple' ? 'text-purple-400' :
                                    stepConfig.color === 'blue' ? 'text-blue-400' :
                                    stepConfig.color === 'amber' ? 'text-amber-400' :
                                    'text-emerald-400'
                                )} />
                            </motion.div>

                            {/* Step Indicators */}
                            <div className="mt-12 flex gap-2">
                                {STEPS_CONFIG.map((_, idx) => (
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
                                        {t('lab_onboarding_ritual')}
                                    </span>
                                    <h2 className="text-3xl font-serif italic text-white mt-1 leading-tight">
                                        {t(`lab_onboarding_step${stepConfig.id}_title` as any)}
                                    </h2>
                                    <p className={cn(
                                        "text-[10px] uppercase tracking-widest font-bold mt-2",
                                        stepConfig.color === 'cyan' ? 'text-cyan-400' :
                                            stepConfig.color === 'rose' ? 'text-rose-400' :
                                                stepConfig.color === 'purple' ? 'text-purple-400' :
                                                    stepConfig.color === 'blue' ? 'text-blue-400' :
                                                        stepConfig.color === 'amber' ? 'text-amber-400' :
                                                            'text-emerald-400'
                                    )}>
                                        {t(`lab_onboarding_step${stepConfig.id}_sub` as any)}
                                    </p>
                                </div>

                                <p className="text-sm text-white/60 leading-relaxed font-light italic">
                                    "{t(`lab_onboarding_step${stepConfig.id}_content` as any)}"
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
                                    {t('lab_onboarding_back')}
                                </button>

                                <button
                                    onClick={handleNext}
                                    className={cn(
                                        "px-8 py-3 rounded-2xl flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-black transition-all group",
                                        stepConfig.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30' :
                                            stepConfig.color === 'rose' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' :
                                                stepConfig.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30' :
                                                    stepConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' :
                                                        stepConfig.color === 'amber' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30' :
                                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                    )}
                                >
                                    {currentStep === STEPS_CONFIG.length - 1 ? t('lab_onboarding_start') : t('lab_onboarding_continue')}
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
