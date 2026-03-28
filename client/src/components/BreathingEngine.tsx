import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { useBreathingSound, type BreathPhase } from '../hooks/useBreathingSound';

interface BreathingEngineProps {
    technique: 'WATER_CALM' | 'EARTH_GROUND' | 'FIRE_ACTIVATE' | 'AIR_FLOW' | 'BHASTRIKA' | 'BOX' | 'COHERENCE' | 'UJJAYI' | 'NADI' | 'BUMBLEBEE' | 'HYPEROX' | 'INTERMITTENT';
    instruction?: string;
    onComplete: () => void;
}

const TECHNIQUES = {
    'WATER_CALM': {
        name: 'breath_water_name',
        cycle: [
            { label: 'breath_inhale', duration: 4, scale: 1.5, opacity: 1 },
            { label: 'breath_hold', duration: 7, scale: 1.5, opacity: 0.8 },
            { label: 'breath_exhale', duration: 8, scale: 1, opacity: 0.5 }
        ],
        color: 'from-cyan-500 to-blue-500',
        cyclesToComplete: 6
    },
    'EARTH_GROUND': {
        name: 'breath_earth_name',
        cycle: [
            { label: 'breath_inhale', duration: 4, scale: 1.5, opacity: 1 },
            { label: 'breath_hold', duration: 4, scale: 1.5, opacity: 0.8 },
            { label: 'breath_exhale', duration: 4, scale: 1, opacity: 0.5 },
            { label: 'breath_hold_empty', duration: 4, scale: 1, opacity: 0.3 }
        ],
        color: 'from-emerald-500 to-green-600',
        cyclesToComplete: 8
    },
    'FIRE_ACTIVATE': {
        name: 'breath_fire_name',
        cycle: [
            { label: 'breath_pump', duration: 0.5, scale: 1.2, opacity: 1 },
            { label: 'breath_release', duration: 0.5, scale: 1, opacity: 0.6 }
        ],
        color: 'from-amber-500 to-orange-600',
        cyclesToComplete: 120
    },
    'AIR_FLOW': {
        name: 'breath_air_name',
        cycle: [
            { label: 'breath_inhale_left', duration: 4, scale: 1.5, opacity: 1 },
            { label: 'breath_hold', duration: 4, scale: 1.5, opacity: 0.8 },
            { label: 'breath_exhale_right', duration: 4, scale: 1, opacity: 0.5 },
            { label: 'breath_inhale_right', duration: 4, scale: 1.5, opacity: 1 },
            { label: 'breath_hold', duration: 4, scale: 1.5, opacity: 0.8 },
            { label: 'breath_exhale_left', duration: 4, scale: 1, opacity: 0.5 }
        ],
        color: 'from-violet-400 to-fuchsia-300',
        cyclesToComplete: 5
    },
    'BHASTRIKA': {
        name: 'breath_bhastrika_name',
        cycle: [
            { label: 'breath_strong_inhale', duration: 1, scale: 1.4, opacity: 1 },
            { label: 'breath_strong_exhale', duration: 1, scale: 0.9, opacity: 0.6 }
        ],
        color: 'from-orange-600 to-red-600',
        cyclesToComplete: 60
    },
    'BOX': {
        name: 'breath_box_name',
        cycle: [
            { label: 'breath_inhale', duration: 4, scale: 1.5, opacity: 1 },
            { label: 'breath_hold', duration: 4, scale: 1.5, opacity: 0.8 },
            { label: 'breath_exhale', duration: 4, scale: 1, opacity: 0.5 },
            { label: 'breath_empty', duration: 4, scale: 1, opacity: 0.3 }
        ],
        color: 'from-emerald-600 to-teal-700',
        cyclesToComplete: 7
    },
    'COHERENCE': {
        name: 'breath_coherence_name',
        cycle: [
            { label: 'breath_inhale', duration: 5, scale: 1.4, opacity: 1 },
            { label: 'breath_exhale', duration: 5, scale: 1, opacity: 0.6 }
        ],
        color: 'from-blue-400 to-cyan-400',
        cyclesToComplete: 12
    },
    'UJJAYI': {
        name: 'breath_ujjayi_name',
        cycle: [
            { label: 'breath_ocean_in', duration: 6, scale: 1.5, opacity: 1 },
            { label: 'breath_ocean_out', duration: 6, scale: 1, opacity: 0.4 }
        ],
        color: 'from-blue-600 to-indigo-800',
        cyclesToComplete: 10
    },
    'BUMBLEBEE': {
        name: 'breath_bumblebee_name',
        cycle: [
            { label: 'breath_inhale_deep', duration: 4, scale: 1.3, opacity: 1 },
            { label: 'breath_humming', duration: 8, scale: 1.1, opacity: 0.3 }
        ],
        color: 'from-yellow-400 to-amber-600',
        cyclesToComplete: 10
    },
    'HYPEROX': {
        name: 'breath_hyperox_name',
        cycle: [
            { label: 'breath_charge', duration: 1.5, scale: 1.6, opacity: 1 },
            { label: 'breath_release_out', duration: 1, scale: 1, opacity: 0.4 }
        ],
        color: 'from-cyan-300 to-white',
        cyclesToComplete: 48
    },
    'NADI': {
        name: 'breath_nadi_name',
        cycle: [
            { label: 'breath_left', duration: 5, scale: 1.3, opacity: 1 },
            { label: 'breath_right', duration: 5, scale: 1.3, opacity: 1 }
        ],
        color: 'from-purple-400 to-violet-600',
        cyclesToComplete: 12
    },
    'INTERMITTENT': {
        name: 'breath_intermittent_name',
        cycle: [
            { label: 'breath_inhale_deep', duration: 4, scale: 1.5, opacity: 1 },
            { label: 'breath_hold_full', duration: 10, scale: 1.5, opacity: 0.8 },
            { label: 'breath_exhale_all', duration: 4, scale: 1, opacity: 0.4 },
            { label: 'breath_hold_empty', duration: 10, scale: 1, opacity: 0.2 }
        ],
        color: 'from-slate-400 to-indigo-300',
        cyclesToComplete: 4
    }
};

export const BreathingEngine: React.FC<BreathingEngineProps> = ({ technique, instruction, onComplete }) => {
    const { t } = useTranslation();
    const config = TECHNIQUES[technique] || TECHNIQUES.WATER_CALM;
    const [stepIndex, setStepIndex] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const { setPhase, stop, resume } = useBreathingSound();

    // v9.9 Enhanced Audio Synchronization
    useEffect(() => {
        if (!isActive || isFinished) {
            stop();
            return;
        }

        const currentStep = config.cycle[stepIndex];
        const label = currentStep.label;

        // Determine phase for the hook
        let phase: BreathPhase = 'none';
        if (label.includes('inhale') || label.includes('pump') || label.includes('charge')) phase = 'inhale';
        else if (label.includes('exhale') || label.includes('release') || label.includes('humming')) phase = 'exhale';
        else if (label.includes('hold') || label.includes('empty') || label.includes('wait')) phase = 'hold';

        setPhase(phase, currentStep.duration);

        const timer = setTimeout(() => {
            const nextStep = (stepIndex + 1) % config.cycle.length;

            if (nextStep === 0) {
                const newCount = cycleCount + 1;
                setCycleCount(newCount);
                if (newCount >= config.cyclesToComplete) {
                    setIsFinished(true);
                    onComplete();
                    setIsActive(false);
                    return;
                }
            }
            setStepIndex(nextStep);
        }, currentStep.duration * 1000);

        return () => clearTimeout(timer);
    }, [stepIndex, isActive, technique, cycleCount, isFinished]);

    const currentStep = config.cycle[stepIndex];

    const handleStart = () => {
        resume();
        setIsActive(true);
        setStepIndex(0);
        setCycleCount(0);
        setIsFinished(false);
    };

    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-10 text-center"
            >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                    <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-2xl font-serif text-white mb-2">{t('breath_integrated')}</h3>
                <p className="text-white/60 text-sm">{t('breath_frequency_raised')}</p>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[400px] relative">

            {/* PLASMA ORB CONTAINER */}
            <div className="relative w-80 h-80 flex items-center justify-center">

                {/* 1. Core Plasma (The Hot Center) - STRICT WHITE (Stitch) */}
                <motion.div
                    className="absolute w-20 h-20 rounded-full bg-white blur-[15px] z-10"
                    animate={{
                        scale: isActive ? currentStep.scale * 0.8 : 0.8,
                        opacity: isActive ? 1 : 0.5,
                    }}
                    transition={{
                        duration: currentStep.duration,
                        ease: "easeInOut"
                    }}
                />

                {/* 2. Inner Glow (The Energy) */}
                <motion.div
                    className={cn(
                        "absolute w-40 h-40 rounded-full blur-[25px] mix-blend-screen bg-gradient-to-tr",
                        config.color
                    )}
                    animate={{
                        scale: isActive ? currentStep.scale : 1,
                        opacity: isActive ? 0.8 : 0.3,
                        rotate: isActive ? 360 : 0,
                    }}
                    transition={{
                        scale: { duration: currentStep.duration, ease: "easeInOut" },
                        opacity: { duration: currentStep.duration, ease: "easeInOut" },
                        rotate: { duration: 25, repeat: Infinity, ease: "linear" }
                    }}
                />

                {/* 3. Outer Aura (The Flow) - Fluid Expansion */}
                <motion.div
                    className={cn(
                        "absolute w-64 h-64 rounded-full blur-[50px] mix-blend-screen opacity-20",
                        config.color
                    )}
                    animate={{
                        scale: isActive ? currentStep.scale * 1.3 : 1,
                        opacity: isActive ? 0.4 : 0.1,
                        rotate: isActive ? -180 : 0
                    }}
                    transition={{
                        scale: { duration: currentStep.duration * 1.1, ease: "easeInOut" }, // Slightly slower rhythm
                        rotate: { duration: 30, repeat: Infinity, ease: "linear" }
                    }}
                />

                {/* 4. Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                    <AnimatePresence mode="wait">
                        {isActive ? (
                            <motion.div
                                key={currentStep.label}
                                initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
                                transition={{ duration: 0.5 }}
                                className="text-center"
                            >
                                <p className="text-white/30 text-[8px] mb-2 uppercase tracking-[0.3em] font-black">
                                    {t(config.name as any)}
                                </p>
                                <h2 className="text-3xl font-light text-white tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                    {t(currentStep.label as any)}
                                </h2>
                                {instruction && (
                                    <p className="text-white/60 text-[10px] mt-2 uppercase tracking-[0.1em] max-w-[180px]">
                                        {t(instruction as any)}
                                    </p>
                                )}
                                <p className="text-white/70 text-xs mt-2 uppercase tracking-[0.2em] font-mono">
                                    {cycleCount + 1} / {config.cyclesToComplete}
                                </p>
                            </motion.div>
                        ) : (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-white/80 uppercase tracking-[0.3em] text-sm animate-pulse font-medium"
                                >
                                    {t('breath_start')}
                                </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            {!isActive && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="mt-12 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-serif italic backdrop-blur-md"
                >
                    {t('breath_start')} {t(config.name as any)}
                </motion.button>
            )}

            {isActive && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setIsActive(false)}
                    className="mt-12 text-white/30 hover:text-white/60 text-xs uppercase tracking-widest transition-colors z-20"
                >
                    {t('breath_stop')}
                </motion.button>
            )}
        </div>
    );
};
