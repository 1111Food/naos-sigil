import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, Shield, Heart, Users, Compass, BookOpen, Eye, X, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { useTranslation } from '../i18n';
import { useProfile } from '../hooks/useProfile';

interface OracleExplainerProps {
    type: 'TAROT' | 'SOULS' | 'DUAL' | 'GROUP' | 'IDENTITY_NEXUS' | 'IDENTITY_COMPLETE' | 'IDENTITY_WISDOM' | 'IDENTITY_ARCHETYPE';
    onClose: () => void;
}

const getLocalizedContent = (t: any) => ({
    TAROT: {
        title: t('oracle_tarot_title'),
        subtitle: t('oracle_tarot_subtitle'),
        color: "text-amber-400",
        gradient: "from-amber-500/20 to-orange-500/10",
        border: "border-amber-500/30",
        icon: Sparkles,
        steps: [
            { number: "01", title: t('oracle_tarot_step1_title'), description: t('oracle_tarot_step1_desc'), icon: Target, iconColor: "text-blue-400" },
            { number: "02", title: t('oracle_tarot_step2_title'), description: t('oracle_tarot_step2_desc'), icon: Zap, iconColor: "text-amber-400" },
            { number: "03", title: t('oracle_tarot_step3_title'), description: t('oracle_tarot_step3_desc'), icon: Shield, iconColor: "text-emerald-400" }
        ]
    },
    SOULS: {
        title: t('oracle_souls_title'),
        subtitle: t('oracle_souls_subtitle'),
        color: "text-rose-400",
        gradient: "from-rose-500/20 to-pink-500/10",
        border: "border-rose-500/30",
        icon: Heart,
        steps: [
            { number: "01", title: t('oracle_souls_step1_title'), description: t('oracle_souls_step1_desc'), icon: Users, iconColor: "text-rose-400" },
            { number: "02", title: t('oracle_souls_step2_title'), description: t('oracle_souls_step2_desc'), icon: Compass, iconColor: "text-cyan-400" },
            { number: "03", title: t('oracle_souls_step3_title'), description: t('oracle_souls_step3_desc'), icon: BookOpen, iconColor: "text-purple-400" }
        ]
    },
    DUAL: {
        title: t('oracle_dual_title'),
        subtitle: t('oracle_dual_subtitle'),
        color: "text-cyan-400",
        gradient: "from-cyan-500/20 to-blue-500/10",
        border: "border-cyan-500/30",
        icon: Eye,
        steps: [
            { number: "01", title: t('oracle_dual_step1_title'), description: t('oracle_dual_step1_desc'), icon: Zap, iconColor: "text-amber-400" },
            { number: "02", title: t('oracle_dual_step2_title'), description: t('oracle_dual_step2_desc'), icon: Shield, iconColor: "text-emerald-400" },
            { number: "03", title: t('oracle_dual_step3_title'), description: t('oracle_dual_step3_desc'), icon: Target, iconColor: "text-blue-400" }
        ]
    },
    GROUP: {
        title: t('oracle_group_title'),
        subtitle: t('oracle_group_subtitle'),
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-indigo-500/10",
        border: "border-purple-500/30",
        icon: Users,
        steps: [
            { number: "01", title: t('oracle_group_step1_title'), description: t('oracle_group_step1_desc'), icon: BookOpen, iconColor: "text-purple-400" },
            { number: "02", title: t('oracle_group_step2_title'), description: t('oracle_group_step2_desc'), icon: Target, iconColor: "text-blue-400" },
            { number: "03", title: t('oracle_group_step3_title'), description: t('oracle_group_step3_desc'), icon: Zap, iconColor: "text-amber-400" }
        ]
    },
    IDENTITY_NEXUS: {
        title: t('oracle_nexus_title'),
        subtitle: t('oracle_nexus_subtitle'),
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/10",
        border: "border-blue-500/30",
        icon: Compass,
        steps: [
            { number: "01", title: t('oracle_nexus_step1_title'), description: t('oracle_nexus_step1_desc'), icon: Target, iconColor: "text-blue-400" },
            { number: "02", title: t('oracle_nexus_step2_title'), description: t('oracle_nexus_step2_desc'), icon: BookOpen, iconColor: "text-purple-400" },
            { number: "03", title: t('oracle_nexus_step3_title'), description: t('oracle_nexus_step3_desc'), icon: Shield, iconColor: "text-emerald-400" }
        ]
    },
    IDENTITY_COMPLETE: {
        title: t('oracle_complete_title'),
        subtitle: t('oracle_complete_subtitle'),
        color: "text-indigo-400",
        gradient: "from-indigo-500/20 to-purple-500/10",
        border: "border-indigo-500/30",
        icon: BookOpen,
        steps: [
            { number: "01", title: t('oracle_complete_step1_title'), description: t('oracle_complete_step1_desc'), icon: Target, iconColor: "text-blue-400" },
            { number: "02", title: t('oracle_complete_step2_title'), description: t('oracle_complete_step2_desc'), icon: Zap, iconColor: "text-amber-400" },
            { number: "03", title: t('oracle_complete_step3_title'), description: t('oracle_complete_step3_desc'), icon: Eye, iconColor: "text-purple-400" },
            { number: "04", title: t('oracle_complete_step4_title'), description: t('oracle_complete_step4_desc'), icon: Shield, iconColor: "text-emerald-400" }
        ]
    },
    IDENTITY_WISDOM: {
        title: t('oracle_wisdom_title'),
        subtitle: t('oracle_wisdom_subtitle'),
        color: "text-emerald-400",
        gradient: "from-emerald-500/20 to-teal-500/10",
        border: "border-emerald-500/30",
        icon: BookOpen,
        steps: [
            { number: "01", title: t('oracle_wisdom_step1_title'), description: t('oracle_wisdom_step1_desc'), icon: BookOpen, iconColor: "text-emerald-400" },
            { number: "02", title: t('oracle_wisdom_step2_title'), description: t('oracle_wisdom_step2_desc'), icon: Target, iconColor: "text-blue-400" },
            { number: "03", title: t('oracle_wisdom_step3_title'), description: t('oracle_wisdom_step3_desc'), icon: Zap, iconColor: "text-amber-400" }
        ]
    },
    IDENTITY_ARCHETYPE: {
        title: t('oracle_archetype_title'),
        subtitle: t('oracle_archetype_subtitle'),
        color: "text-amber-400",
        gradient: "from-amber-500/20 to-yellow-500/10",
        border: "border-amber-500/30",
        icon: Shield,
        steps: [
            { number: "01", title: t('oracle_archetype_step1_title'), description: t('oracle_archetype_step1_desc'), icon: Shield, iconColor: "text-emerald-400" },
            { number: "02", title: t('oracle_archetype_step2_title'), description: t('oracle_archetype_step2_desc'), icon: Target, iconColor: "text-blue-400" },
            { number: "03", title: t('oracle_archetype_step3_title'), description: t('oracle_archetype_step3_desc'), icon: Zap, iconColor: "text-amber-400" }
        ]
    }
});

// @ts-ignore
export const OracleExplainer: React.FC<OracleExplainerProps> = ({ type, onClose }) => {
    const { t } = useTranslation();
    const { profile } = useProfile();
    const isAdmin = profile?.plan_type === 'admin';
    const isPremium = profile?.plan_type === 'premium' || isAdmin;
    const { playSound } = useSound();
    const [currentIndex, setCurrentIndex] = React.useState(0);

    useEffect(() => {
        playSound('transition');
    }, [playSound]);

    const CONTENT = getLocalizedContent(t) as any;
    const data = CONTENT[type];
    const Icon = data.icon;
    const isCarousel = type === 'IDENTITY_COMPLETE';
    const totalSteps = data.steps.length;

    // Deep interpretation blocks for non-premium
    const isStepLocked = (index: number) => {
        if (type === 'IDENTITY_COMPLETE' && !isPremium && index > 1) return true;
        return false;
    };

    const handleNext = () => {
        if (currentIndex < totalSteps - 1) {
            playSound('click');
            setCurrentIndex(currentIndex + 1);
        } else {
            playSound('click');
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className={cn(
                    "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-panel border p-8 md:p-12 rounded-[3.5rem] bg-black/40 shadow-2xl flex flex-col",
                    data.border
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Background ambient glow */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none", data.gradient)} />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-8 space-y-4">
                    <div className={cn("p-4 rounded-full bg-white/5 border border-white/10 mb-2", data.color)}>
                        <Icon size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl md:text-3xl font-serif italic text-white/90">
                            {data.title}
                        </h2>
                        {!isPremium && type.startsWith('IDENTITY') && <Lock size={16} className="text-amber-500" />}
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-black">
                        {data.subtitle}
                    </p>
                </div>

                {isCarousel ? (
                    <div className="flex-1 flex flex-col items-center justify-center relative w-full">
                        {/* Progress Dots */}
                        <div className="flex gap-2 mb-6">
                            {data.steps.map((_: any, i: number) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        i === currentIndex ? "bg-cyan-400 w-4" : "bg-white/10"
                                    )} 
                                />
                            ))}
                        </div>

                        {/* Slide Card */}
                        <div className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all flex flex-col items-center text-center space-y-6 w-full max-w-md min-h-[160px] justify-center overflow-hidden">
                            {isStepLocked(currentIndex) && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
                                    <div className="p-3 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500">
                                        <Lock size={24} />
                                    </div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-500/80">Premium Access Required</p>
                                    <p className="text-[11px] text-white/40 leading-relaxed italic">This layer of your architecture requires deep interpretation access.</p>
                                </div>
                            )}

                            <div className="absolute top-4 right-4 text-2xl font-black text-white/5 font-mono group-hover:text-white/10 transition-colors">
                                {data.steps[currentIndex].number}
                            </div>
                            
                            <div className={cn("p-4 rounded-full bg-white/5 border border-white/5", data.steps[currentIndex].iconColor)}>
                                {React.createElement(data.steps[currentIndex].icon, { size: 32 })}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-serif italic tracking-wider text-white/90">
                                    {data.steps[currentIndex].title}
                                </h3>
                                <p className="text-[14px] text-white/60 leading-relaxed font-light">
                                    {data.steps[currentIndex].description}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        <div className="flex items-center gap-4 mt-8">
                            <button
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className={cn(
                                    "p-3 rounded-full border border-white/10 transition-all",
                                    currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5 text-white"
                                )}
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[11px] uppercase tracking-widest font-black hover:bg-cyan-500/30 transition-all"
                            >
                                <span>{currentIndex === totalSteps - 1 ? t('oracle_start') : t('oracle_next')}</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 flex-1">
                        {data.steps.map((step: any, i: number) => {
                            const StepIcon = step.icon;
                            const locked = isStepLocked(i);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2, duration: 0.6 }}
                                    className={cn(
                                        "group relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col items-center text-center space-y-4 h-full justify-start overflow-hidden",
                                        locked && "opacity-50 grayscale"
                                    )}
                                >
                                    {locked && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-20 flex items-center justify-center">
                                            <Lock size={16} className="text-amber-500/50" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 text-2xl font-black text-white/5 font-mono group-hover:text-white/10 transition-colors">
                                        {step.number}
                                    </div>
                                    
                                    <div className={cn("p-3 rounded-2xl bg-white/5 border border-white/5", step.iconColor)}>
                                        <StepIcon size={24} />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold tracking-wider text-white/90 uppercase">
                                            {step.title}
                                        </h3>
                                        <p className="text-[13px] text-white/60 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] italic">
                        Desarrollado por la Inteligencia NAOS • Versión 2.0.4
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
