import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lock, Dna, Eye, ShieldAlert, Sparkles, Droplets, Flame, Wind, Mountain } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

interface CarouselItem {
    id: string;
    title: string;
    subtitle: string;
    accent: string;
    icon: React.ElementType;
    featureId: string;
    locked?: boolean;
    bgGradient: string;
}

interface Carousel3DProps {
    isDormant: boolean;
    isPremium: boolean;
    onSelectFeature: (featureId: string) => void;
    triggerUpgrade: (type: string) => void;
    playSound: (type: 'click' | 'swipe') => void;
}

export const Carousel3D: React.FC<Carousel3DProps> = ({
    isDormant,
    isPremium,
    onSelectFeature,
    triggerUpgrade,
    playSound
}) => {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);

    const items: CarouselItem[] = [
        {
            id: 'identity',
            title: t('identity') || 'Código de Identidad',
            subtitle: 'ADN Astral & Numerológico',
            accent: 'cyan',
            icon: Dna,
            featureId: 'IDENTITY_NEXUS',
            bgGradient: 'from-cyan-500/10 to-transparent',
        },
        {
            id: 'oracle',
            title: t('oracle') || 'Oráculo de Almas',
            subtitle: 'Sincronía & Tarot',
            accent: 'magenta',
            icon: Eye,
            featureId: 'ORACLE_SOULS',
            bgGradient: 'from-fuchsia-500/10 to-transparent',
        },
        {
            id: 'protocols',
            title: t('protocols') || 'Protocolos 21/90',
            subtitle: 'Motor de Coherencia',
            accent: 'emerald',
            icon: ShieldAlert,
            featureId: 'PROTOCOL21',
            locked: !isPremium,
            bgGradient: 'from-emerald-500/10 to-transparent',
        },
        {
            id: 'laboratory',
            title: t('laboratory') || 'Laboratorio Elemental',
            subtitle: 'Regulación Bio-Frecuencial',
            accent: 'orange',
            icon: Sparkles,
            featureId: 'ELEMENTAL_LAB',
            locked: !isPremium,
            bgGradient: 'from-orange-500/10 to-transparent',
        }
    ];

    const nextSlide = () => {
        playSound('swipe');
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        playSound('swipe');
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleSelect = (item: CarouselItem) => {
        playSound('click');
        if (item.locked) {
            if (item.id === 'protocols') triggerUpgrade('protocol');
            else triggerUpgrade('evolution');
        } else {
            onSelectFeature(item.featureId);
        }
    };

    // Calculate dynamic styles based on index distance from activeIndex
    const getCardProps = (index: number, item: CarouselItem) => {
        const diff = index - activeIndex;
        // Normalize diff to handle wrap-around (assuming 4 items)
        let normalizedDiff = diff;
        if (diff > 1) normalizedDiff = -1; // If it's the item way ahead, put it behind
        if (diff < -1) normalizedDiff = 1; // If it's the item way behind, put it ahead
        // If there are exactly 4 items, the opposite item (diff=2 or -2) will be hidden or placed at the back
        if (Math.abs(diff) === 2) normalizedDiff = 2;

        const isCenter = normalizedDiff === 0;
        const isLeft = normalizedDiff === -1;
        const isRight = normalizedDiff === 1;
        const isBack = Math.abs(normalizedDiff) >= 2;

        let scale = 1;
        let x = 0;
        let z = 0;
        let rotateY = 0;
        let opacity = 1;
        let zIndex = 10;

        if (isCenter) {
            scale = 1;
            x = 0;
            z = 0;
            rotateY = 0;
            opacity = 1;
            zIndex = 30;
        } else if (isLeft) {
            scale = 0.8;
            x = -120; // Move left
            z = -100; // Move back
            rotateY = 25; // Turn inward
            opacity = 0.6;
            zIndex = 20;
        } else if (isRight) {
            scale = 0.8;
            x = 120; // Move right
            z = -100; // Move back
            rotateY = -25; // Turn inward
            opacity = 0.6;
            zIndex = 20;
        } else {
            // Hidden in the back
            scale = 0.6;
            x = 0;
            z = -200;
            opacity = 0;
            zIndex = 10;
        }

        // Apply dormancy constraint (all gray and locked except Identity)
        const applyDormant = isDormant && item.id !== 'identity';

        return { scale, x, z, rotateY, opacity, zIndex, applyDormant };
    };

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center perspective-[1000px] overflow-visible mt-8">
            
            {/* Navigation Arrows (Desktop) */}
            <button 
                onClick={prevSlide}
                className="hidden md:flex absolute left-0 z-40 p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-cyan-400 transition-all backdrop-blur-md"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>

            <button 
                onClick={nextSlide}
                className="hidden md:flex absolute right-0 z-40 p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-cyan-400 transition-all backdrop-blur-md"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Mobile Drag/Swipe Area */}
            <div className="absolute inset-0 z-50 md:hidden" 
                {...{
                    onTouchStart: (e: any) => {
                        const touch = e.touches[0];
                        (window as any).startX = touch.clientX;
                    },
                    onTouchEnd: (e: any) => {
                        const touch = e.changedTouches[0];
                        const diff = (window as any).startX - touch.clientX;
                        if (diff > 50) nextSlide();
                        if (diff < -50) prevSlide();
                    }
                }}
            />

            {/* Carousel Container */}
            <div className="relative w-[320px] md:w-[420px] h-[460px] transform-style-3d">
                <AnimatePresence initial={false}>
                    {items.map((item, index) => {
                        const { scale, x, z, rotateY, opacity, zIndex, applyDormant } = getCardProps(index, item);
                        const isCenter = index === activeIndex;

                        return (
                            <motion.div
                                key={item.id}
                                className={cn(
                                    "absolute inset-0 rounded-[2rem] border border-white/10 overflow-hidden glass-panel cursor-pointer flex flex-col",
                                    applyDormant && "grayscale opacity-30 pointer-events-none blur-[2px]",
                                    isCenter && "shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/30"
                                )}
                                animate={{
                                    scale,
                                    x,
                                    z,
                                    rotateY,
                                    opacity,
                                    zIndex
                                }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                style={{ transformStyle: 'preserve-3d' }}
                                onClick={() => isCenter ? handleSelect(item) : setActiveIndex(index)}
                            >
                                {/* Card Background */}
                                <div className={cn("absolute inset-0 bg-gradient-to-b opacity-40 backdrop-blur-md", item.bgGradient)} />
                                
                                {/* Geometric / Futuristic Pattern Overlay */}
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

                                {/* Glowing Accent */}
                                {isCenter && (
                                    <div className={cn(
                                        "absolute -inset-1 opacity-20 blur-2xl animate-pulse -z-10",
                                        `bg-${item.accent}-500`
                                    )} />
                                )}

                                {/* Content */}
                                <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center mt-4">
                                    <div className={cn(
                                        "w-20 h-20 rounded-full flex items-center justify-center mb-6 glass-card border border-white/20 transition-all duration-700",
                                        isCenter && `shadow-[0_0_30px_rgba(255,255,255,0.2)]`,
                                        isCenter && item.accent === 'cyan' && 'text-cyan-400',
                                        isCenter && item.accent === 'magenta' && 'text-fuchsia-400',
                                        isCenter && item.accent === 'emerald' && 'text-emerald-400',
                                        isCenter && item.accent === 'orange' && 'text-orange-400',
                                        !isCenter && 'text-white/40'
                                    )}>
                                        <item.icon className={cn("w-10 h-10", isCenter && "animate-pulse")} strokeWidth={1.5} />
                                    </div>
                                    
                                    <h3 className="text-2xl font-light tracking-widest uppercase text-white drop-shadow-md mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs font-mono tracking-widest text-white/50 uppercase">
                                        {item.subtitle}
                                    </p>
                                </div>

                                {/* Status Footer */}
                                <div className="relative z-10 p-4 border-t border-white/10 bg-black/40 flex items-center justify-center gap-2">
                                    {item.locked ? (
                                        <>
                                            <Lock className="w-4 h-4 text-white/40" />
                                            <span className="text-[10px] tracking-widest text-white/40 uppercase">Requiere Nivel</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] tracking-widest text-white/60 uppercase group-hover:text-white transition-colors">
                                            [ Iniciar Secuencia ]
                                        </span>
                                    )}
                                </div>

                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
            
            {/* Pagination Indicators */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-50">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            activeIndex === i ? "w-8 bg-cyan-400" : "w-2 bg-white/20 hover:bg-white/40"
                        )}
                    />
                ))}
            </div>

        </div>
    );
};
