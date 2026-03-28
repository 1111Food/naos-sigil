import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Play, Sparkles, Brain, Zap as ActionIcon, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { useFrequency, ELEMENT_FREQUENCIES } from '../hooks/useFrequency';
import { RITUAL_LIBRARY } from '../constants/ritualContent';
import { WisdomButton } from '../components/WisdomOverlay';

import { ElementalOnboarding } from '../components/ElementalOnboarding';

import { useTranslation } from '../i18n';

interface ElementalLaboratoryViewProps {
    onBack: () => void;
    onNavigate?: (view: any, payload?: any) => void;
}

export const ElementalLaboratoryView: React.FC<ElementalLaboratoryViewProps> = ({ onBack, onNavigate }) => {
    const { playSound } = useSound();
    const { t } = useTranslation();
    const { activeElement: activeAudioElement, toggleFrequency, isAtmosphereEnabled, setIsAtmosphereEnabled } = useFrequency();

    const [selectedElement, setSelectedElement] = useState<keyof typeof RITUAL_LIBRARY | null>(null);
    const [selectedRitualInfo, setSelectedRitualInfo] = useState<{
        title: string;
        description: React.ReactNode;
        techniqueType: 'BREATH' | 'MEDITATION';
        elementId: string;
    } | null>(null);

    // Modal State


    const [showOnboarding, setShowOnboarding] = useState(false);

    React.useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('has_seen_lab_onboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);



    const availablePaths = selectedElement ? RITUAL_LIBRARY[selectedElement] : [];

    // Explicit Tailwind classes to prevent purging in production builds
    const elements: { id: keyof typeof RITUAL_LIBRARY; icon: any; label: string; desc: string; style: any }[] = [
        {
            id: 'FIRE', icon: AlchemicalFire, label: t('element_fire'), desc: t('element_fire_desc'),
            style: {
                activeBg: 'bg-red-900/20', activeBorder: 'border-red-500/60', shadow: 'shadow-[inset_0_0_30px_rgba(239,68,68,0.15)]', text: 'text-red-400', gradient: 'from-red-500/20 to-transparent',
                inactiveHover: 'hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]',
                iconBase: 'text-red-500/70'
            }
        },
        {
            id: 'EARTH', icon: AlchemicalEarth, label: t('element_earth'), desc: t('element_earth_desc'),
            style: {
                activeBg: 'bg-emerald-900/20', activeBorder: 'border-emerald-500/60', shadow: 'shadow-[inset_0_0_30px_rgba(16,185,129,0.15)]', text: 'text-emerald-400', gradient: 'from-emerald-500/20 to-transparent',
                inactiveHover: 'hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]',
                iconBase: 'text-emerald-500/70'
            }
        },
        {
            id: 'AIR', icon: AlchemicalAir, label: t('element_air'), desc: t('element_air_desc'),
            style: {
                activeBg: 'bg-fuchsia-900/20', activeBorder: 'border-fuchsia-500/60', shadow: 'shadow-[inset_0_0_30px_rgba(217,70,239,0.15)]', text: 'text-fuchsia-400', gradient: 'from-fuchsia-500/20 to-transparent',
                inactiveHover: 'hover:border-fuchsia-500/40 hover:text-fuchsia-400 hover:bg-fuchsia-500/5 hover:shadow-[0_0_20px_rgba(217,70,239,0.1)]',
                iconBase: 'text-fuchsia-500/70'
            }
        },
        {
            id: 'WATER', icon: AlchemicalWater, label: t('element_water'), desc: t('element_water_desc'),
            style: {
                activeBg: 'bg-cyan-900/20', activeBorder: 'border-cyan-500/60', shadow: 'shadow-[inset_0_0_30px_rgba(6,182,212,0.15)]', text: 'text-cyan-400', gradient: 'from-cyan-500/20 to-transparent',
                inactiveHover: 'hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]',
                iconBase: 'text-cyan-500/70'
            }
        }
    ];

    const handleStartTechnique = (type: 'BREATH' | 'MEDITATION', techId: string) => {
        if (onNavigate) {
            playSound('transition');
            onNavigate('SANCTUARY', { type, techId });
        }
    };



    const emergencyActions = [
        { label: t('lab_emergency_activate'), sub: t('element_fire'), element: 'FIRE', techId: 'fire-1', icon: AlchemicalFire, iconClass: 'text-red-500/80 group-hover:text-red-400' },
        { label: t('lab_emergency_concrete'), sub: t('element_earth'), element: 'EARTH', techId: 'earth-1', icon: AlchemicalEarth, iconClass: 'text-emerald-500/80 group-hover:text-emerald-400' },
        { label: t('lab_emergency_flow'), sub: t('element_air'), element: 'AIR', techId: 'air-1', icon: AlchemicalAir, iconClass: 'text-fuchsia-500/80 group-hover:text-fuchsia-400' },
        { label: t('lab_emergency_calm'), sub: t('element_water'), element: 'WATER', techId: 'water-1', icon: AlchemicalWater, iconClass: 'text-cyan-500/80 group-hover:text-cyan-400' },
    ];

    return (
        <div className="min-h-screen bg-[#070714] text-white pb-24 font-sans pt-12 relative overflow-hidden">
            {/* Fluid Organic / Lava Lamp Background */}
            <LavaLampBackground />

            {/* Esoteric Alchemical Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none mix-blend-screen overflow-hidden">
                <SacredAlchemyBackground />
            </div>

            {/* Ambient glows are now handled by LavaLampBackground */}
            <header className="sticky top-0 z-40 bg-transparent p-6 mb-4 flex items-center justify-between">
                <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
                    <Sparkles size={16} className="text-amber-400 animate-pulse" />
                    <h1 className="text-xl md:text-2xl font-serif italic tracking-wider whitespace-nowrap">{t('lab_header')}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <WisdomButton color="cyan" onClick={() => setShowOnboarding(true)} />
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 space-y-16 relative z-10">
                {/* 1. Kit de Respuesta Rápida (What do you need?) */}
                <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 backdrop-blur-md space-y-8 shadow-2xl">
                    <div className="flex items-center gap-4 px-2">
                        <ActionIcon size={18} className="text-amber-400" />
                        <h2 className="text-sm md:text-base uppercase tracking-[0.4em] text-white/50 font-black">{t('lab_emergency_header')}</h2>
                        
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                playSound('click'); 
                                setSelectedRitualInfo({ 
                                    title: t('lab_emergency_header'), 
                                    description: (
                                        <div className="space-y-4">
                                            <p>{t('lab_emergency_info')}</p>
                                            <ul className="list-disc pl-5 space-y-2 text-white/50">
                                                <li><strong className="text-red-400 font-bold">{t('element_fire').toUpperCase()}:</strong> {t('ritual_fire_architect_breath_description')}</li>
                                                <li><strong className="text-emerald-400 font-bold">{t('element_earth').toUpperCase()}:</strong> {t('ritual_earth_architect_breath_description')}</li>
                                                <li><strong className="text-fuchsia-400 font-bold">{t('element_air').toUpperCase()}:</strong> {t('ritual_air_architect_breath_description')}</li>
                                                <li><strong className="text-cyan-400 font-bold">{t('element_water').toUpperCase()}:</strong> {t('ritual_water_architect_breath_description')}</li>
                                            </ul>
                                        </div>
                                    ), 
                                    techniqueType: 'BREATH', 
                                    elementId: 'WATER' 
                                }); 
                            }}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                            title={t('lab_what_is_this' as any)}
                        >
                            <Info size={14} />
                        </button>

                        <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {emergencyActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => handleStartTechnique('BREATH', action.techId)}
                                className={cn(
                                    "group p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center gap-4 text-center relative overflow-hidden backdrop-blur-xl",
                                    "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20",
                                    action.element === 'WATER' && "hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]",
                                    action.element === 'FIRE' && "hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]",
                                    action.element === 'EARTH' && "hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                                    action.element === 'AIR' && "hover:border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                                )}
                            >
                                {/* Immersive Icon Container */}
                                <motion.div 
                                    className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center transition-colors duration-300"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <action.icon size={20} className={cn("transition-colors", action.iconClass)} />
                                </motion.div>
                                <div className="space-y-1">
                                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90 group-hover:text-white">{action.label}</div>
                                    <div className="text-[8px] text-white/30 uppercase tracking-widest">{action.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                </section>

                {/* 2. Element Selection Grid */}
                <section className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-8 backdrop-blur-md space-y-10 shadow-2xl">
                    <div className="flex items-center gap-4 px-2">
                        <Sparkles size={18} className="text-white/30" />
                        <h2 className="text-sm md:text-base uppercase tracking-[0.4em] text-white/50 font-black">{t('lab_paths_header')}</h2>
                        
                        <button 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                playSound('click'); 
                                setSelectedRitualInfo({ 
                                    title: t('lab_paths_header'), 
                                    description: (
                                        <div className="space-y-4">
                                            <p>{t('lab_library_info')}</p>
                                            <ul className="list-disc pl-5 space-y-2 text-white/50">
                                                <li>{t('lab_library_step1')}</li>
                                                <li>{t('lab_library_step2')}</li>
                                                <li>{t('lab_library_step3')}</li>
                                            </ul>
                                        </div>
                                    ), 
                                    techniqueType: 'MEDITATION', 
                                    elementId: 'EARTH' 
                                }); 
                            }}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                            title={t('lab_what_is_this' as any)}
                        >
                            <Info size={14} />
                        </button>

                        <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent ml-2" />
                    </div>

                    <div className="grid grid-cols-4 gap-3 md:gap-4">
                        {elements.map((el) => {
                            const isSelected = selectedElement === el.id;

                            return (
                                <button
                                    key={el.id}
                                    onClick={() => {
                                        playSound('click');
                                        setSelectedElement(el.id);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center justify-center py-6 md:py-8 rounded-[2rem] border transition-all duration-500 relative group overflow-hidden",
                                        isSelected
                                            ? `${el.style.activeBg} ${el.style.activeBorder} ${el.style.shadow} ${el.style.text}`
                                            : `bg-white/[0.02] border-white/5 text-white/30 ${el.style.inactiveHover}`
                                    )}
                                >
                                    {/* Active Glow Backdrop */}
                                    {isSelected && (
                                        <div className={cn("absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none", el.style.gradient)} />
                                    )}
                                    <motion.div 
                                        className="relative mb-3 md:mb-4"
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <el.icon className={cn(
                                            "w-8 h-8 md:w-10 md:h-10 transition-all duration-500 relative z-10",
                                            isSelected ? `scale-110 drop-shadow-[0_0_15px_currentColor] text-current` : `group-hover:scale-110 drop-shadow-none ${el.style.iconBase} ${el.style.text.replace('text-', 'group-hover:text-')}`
                                        )} />
                                    </motion.div>
                                    <span className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.2em] relative z-10 mb-1">{el.label}</span>

                                </button>
                            );
                        })}
                    </div>

                    {/* Dedicated Frequency Toggles */}
                    <div className="pt-8 flex flex-col items-center space-y-8">
                        <div className="text-sm md:text-base uppercase tracking-[0.4em] text-white/50 font-black flex items-center gap-4 w-full px-2">
                            <Sparkles size={18} className="text-white/30" />
                            <span>{t('lab_acoustic_header')}</span>
                            
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    playSound('click'); 
                                    setSelectedRitualInfo({ 
                                        title: t('lab_acoustic_header'), 
                                        description: (
                                            <div className="space-y-4">
                                                <p>{t('lab_acoustic_info')}</p>
                                                <ul className="list-disc pl-5 space-y-2 text-white/50">
                                                    <li><strong className="text-white font-bold">{t('lab_acoustic_pure')}:</strong> {t('lab_acoustic_oscillator')}</li>
                                                    <li><strong className="text-white font-bold">{t('lab_acoustic_immersive')}:</strong> {t('lab_acoustic_algorithm')}</li>
                                                </ul>
                                            </div>
                                        ), 
                                        techniqueType: 'MEDITATION', 
                                        elementId: 'AIR' 
                                    }); 
                                }}
                                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                                title={t('lab_what_is_this' as any)}
                            >
                                <Info size={14} />
                            </button>

                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent ml-2" />

                            {/* Dual Audio Toggle Switch */}
                            <div className="flex bg-black/40 border border-white/10 rounded-full p-1 self-end shadow-inner ml-2">
                                 <button
                                    onClick={() => { playSound('click'); setIsAtmosphereEnabled(false); }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300",
                                        !isAtmosphereEnabled 
                                            ? "bg-white/10 text-white shadow-md" 
                                            : "text-white/30 hover:text-white/50"
                                    )}
                                >
                                    {t('pure_wave')}
                                </button>
                                <button
                                    onClick={() => { playSound('click'); setIsAtmosphereEnabled(true); }}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 flex items-center gap-2",
                                        isAtmosphereEnabled 
                                            ? "bg-emerald-500/20 text-emerald-400 shadow-md border border-emerald-500/30" 
                                            : "text-white/30 hover:text-white/50"
                                    )}
                                >
                                    {t('immersive')}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 md:gap-4 w-full">
                            {elements.map((el) => {
                                const isAudioPlaying = activeAudioElement === el.id;
                                const hz = ELEMENT_FREQUENCIES[el.id as keyof typeof ELEMENT_FREQUENCIES].baseHz;

                                return (
                                    <button
                                        key={`freq-${el.id}`}
                                        onClick={() => toggleFrequency(el.id as any)}
                                        className={cn(
                                            "group relative flex flex-col items-center gap-3 transition-all duration-300",
                                            isAudioPlaying ? "opacity-100 scale-105" : "opacity-50 hover:opacity-100 hover:scale-105"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-12 h-12 md:w-16 md:h-16 rounded-full border flex items-center justify-center relative transition-all duration-500",
                                            isAudioPlaying
                                                ? `${el.style.activeBg} ${el.style.activeBorder} ${el.style.shadow}`
                                                : "border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/[0.08]"
                                        )}>
                                            {/* Equalizer when playing */}
                                            {isAudioPlaying ? (
                                                <div className="flex items-center gap-[2px]">
                                                    {[1.5, 3, 2, 4, 1.5].map((h, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className={cn("w-[2px] rounded-full")}
                                                            style={{ backgroundColor: ELEMENT_FREQUENCIES[el.id as keyof typeof ELEMENT_FREQUENCIES].color }}
                                                            animate={{ height: ['6px', `${h * 4}px`, '6px'] }}
                                                            transition={{ repeat: Infinity, duration: 0.6 + i * 0.15, ease: "easeInOut" }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <el.icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: ELEMENT_FREQUENCIES[el.id as keyof typeof ELEMENT_FREQUENCIES].color }} />
                                            )}

                                            {/* Glowing ring when active */}
                                            {isAudioPlaying && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-full border border-current opacity-50"
                                                    style={{ color: ELEMENT_FREQUENCIES[el.id as keyof typeof ELEMENT_FREQUENCIES].color }}
                                                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0] }}
                                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                                />
                                            )}
                                        </div>

                                        <div className="text-center flex flex-col items-center">
                                            <span
                                                className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.2em] transition-colors"
                                            >
                                                {el.label}
                                            </span>
                                            <span className="text-[7px] md:text-[8px] font-mono tracking-wider text-white/30 uppercase mt-1">
                                                {hz} Hz
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedElement && (
                            <motion.div
                                key={selectedElement}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-10"
                            >
                                {/* Curated Techniques by Path */}
                                <div className="space-y-12">
                                    {availablePaths.map((path) => {
                                        const activeEl = elements.find(e => e.id === selectedElement);
                                        return (
                                            <div key={path.id} className="space-y-5">
                                                <div className="flex items-center gap-4 px-2">
                                                    <div className="h-[1px] w-8 bg-white/20" />
                                                    <h3 className="text-[9px] uppercase tracking-[0.5em] text-white/40 font-black">{t(path.name as any)}</h3>
                                                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Primary Breath for Path */}
                                                    <div
                                                        role="button"
                                                        onClick={() => handleStartTechnique('BREATH', path.breath.id)}
                                                        className="flex flex-col justify-between p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent hover:from-white/[0.08] hover:border-white/20 transition-all duration-500 group relative overflow-hidden h-full min-h-[160px] cursor-pointer"
                                                    >
                                                        {/* Ambient Hover Glow */}
                                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-500" />

                                                        <div className="flex items-start justify-between relative z-10 w-full mb-4">
                                                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/40 group-hover:text-white group-hover:border-white/20 transition-all duration-300">
                                                                <Wind size={20} strokeWidth={1.5} />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); playSound('click'); setSelectedRitualInfo({ title: t(path.breath.label as any), description: t((path.breath.description || path.breath.copy) as any), techniqueType: 'BREATH', elementId: selectedElement }); }}
                                                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all duration-300 text-white/40 hover:text-white z-20"
                                                                    title={t('lab_view_details' as any)}
                                                                >
                                                                    <Info size={14} />
                                                                </button>

                                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-white/10 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                                    <Play size={12} fill="white" className="ml-0.5 text-white/80" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-left relative z-10">
                                                            <div className="text-sm font-black uppercase tracking-widest text-white/90 mb-1">{t(path.breath.label as any)}</div>
                                                            <div className="text-[10px] text-white/40 italic font-light tracking-wide leading-relaxed">{t(path.breath.copy as any)}</div>
                                                        </div>
                                                    </div>

                                                    {/* Primary Meditation/Anchor for Path */}
                                                    <div
                                                        role="button"
                                                        onClick={() => handleStartTechnique('MEDITATION', path.meditation.id)}
                                                        className="flex flex-col justify-between p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent hover:from-white/[0.06] hover:border-white/20 transition-all duration-500 group relative overflow-hidden h-full min-h-[160px] cursor-pointer"
                                                    >
                                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-amber-900/10 transition-colors duration-500" />

                                                        <div className="flex items-start justify-between relative z-10 w-full mb-4">
                                                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/30 group-hover:text-amber-400 group-hover:border-amber-400/30 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all duration-300">
                                                                <Brain size={20} strokeWidth={1.5} />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); playSound('click'); setSelectedRitualInfo({ title: t(path.meditation.title as any), description: t((path.meditation.description || path.meditation.copy) as any), techniqueType: 'MEDITATION', elementId: selectedElement }); }}
                                                                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all duration-300 text-white/40 hover:text-white z-20"
                                                                    title={t('lab_view_details' as any)}
                                                                >
                                                                    <Info size={14} />
                                                                </button>

                                                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-amber-500/20 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                                    <Play size={12} fill="currentColor" className="ml-0.5 text-amber-400" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-left relative z-10">
                                                            <div className="text-sm font-black uppercase tracking-widest text-white/80 group-hover:text-white mb-1 transition-colors">{t(path.meditation.title as any)}</div>
                                                            <div className="text-[9px] text-white/30 uppercase tracking-widest font-mono">{t('tuning' as any)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </main>

            {/* Ritual Info Modal */}
            <AnimatePresence>
                {selectedRitualInfo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedRitualInfo(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Elemental Glow based on active element */}
                            <div className={cn(
                                "absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-30 pointer-events-none",
                                selectedRitualInfo.elementId === 'FIRE' && 'bg-red-500',
                                selectedRitualInfo.elementId === 'WATER' && 'bg-cyan-500',
                                selectedRitualInfo.elementId === 'EARTH' && 'bg-emerald-500',
                                selectedRitualInfo.elementId === 'AIR' && 'bg-fuchsia-500'
                            )} />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {selectedRitualInfo.techniqueType === 'BREATH' ? <Wind size={14} className="text-white/40" /> : <Brain size={14} className="text-white/40" />}
                                        <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-white/40">
                                            {selectedRitualInfo.techniqueType === 'BREATH' ? t('lab_breath_mechanic') : t('lab_meditation_tuning')}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-wider">{selectedRitualInfo.title}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedRitualInfo(null)}
                                    className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <X size={16} className="text-white/60" />
                                </button>
                            </div>

                            <div className="relative z-10 prose prose-invert max-w-none text-white/70 text-sm leading-relaxed font-light">
                                {selectedRitualInfo.description}
                            </div>

                            <div className="mt-8 relative z-10 flex justify-end">
                                <button
                                    onClick={() => setSelectedRitualInfo(null)}
                                    className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    {t('lab_understood')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            <ElementalOnboarding
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
            />
        </div>
    );
};

// Custom Alchemical SVG Icons for a premium, esoteric aesthetic
const AlchemicalFire = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 4 4 20 20 20" />
    </svg>
);

const AlchemicalWater = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 20 4 4 20 4" />
    </svg>
);

const AlchemicalEarth = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 20 4 4 20 4" />
        <line x1="8" y1="9" x2="16" y2="9" />
    </svg>
);

const AlchemicalAir = (props: any) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 4 4 20 20 20" />
        <line x1="8" y1="15" x2="16" y2="15" />
    </svg>
);

// --- ALCHEMICAL SACRED GEOMETRY ENGINE ---
// Highly detailed Metatron's Cube and I-Ching Trigrams rotating on independent friction axes.
const SacredAlchemyBackground = () => {
    return (
        <div className="relative w-[150vw] h-[150vw] max-w-[1200px] max-h-[1200px] flex items-center justify-center">
            {/* Metatron's Cube / Seed of Life Base (Counter-Clockwise Slow) */}
            <motion.svg
                viewBox="0 0 800 800"
                className="absolute w-full h-full text-white"
                animate={{ rotate: -360 }}
                transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
            >
                <g stroke="currentColor" strokeWidth="0.5" fill="none">
                    {/* Outer Containment Field */}
                    <circle cx="400" cy="400" r="380" strokeDasharray="4 12" opacity="0.4" />
                    <circle cx="400" cy="400" r="360" strokeWidth="1" opacity="0.2" />
                    
                    {/* Hexagonal Lattice (Fruit of Life nodes) */}
                    {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                        const rad = angle * (Math.PI / 180);
                        // Inner ring
                        const x1 = 400 + Math.cos(rad) * 120;
                        const y1 = 400 + Math.sin(rad) * 120;
                        // Outer ring
                        const x2 = 400 + Math.cos(rad) * 240;
                        const y2 = 400 + Math.sin(rad) * 240;
                        // Extended Node
                        const x3 = 400 + Math.cos(rad) * 360;
                        const y3 = 400 + Math.sin(rad) * 360;

                        return (
                            <g key={i}>
                                <circle cx={x1} cy={y1} r="40" opacity="0.3" />
                                <circle cx={x2} cy={y2} r="40" opacity="0.3" />
                                <circle cx={x3} cy={y3} r="10" opacity="0.8" />
                                {/* Connecting Lines forming Metatron's angles */}
                                <line x1="400" y1="400" x2={x3} y2={y3} opacity="0.2" />
                                <line x1={x1} y1={y1} x2={x2} y2={y2} opacity="0.5" />
                            </g>
                        );
                    })}

                    {/* Core Triangles (Merkaba Base) */}
                    <polygon points="400,160 607,520 193,520" opacity="0.4" />
                    <polygon points="400,640 193,280 607,280" opacity="0.4" />
                </g>
            </motion.svg>

            {/* Middle Layer (I-Ching Trigrams / Ba Gua) (Clockwise Medium) */}
            <motion.svg
                viewBox="0 0 800 800"
                className="absolute w-[85%] h-[85%] text-cyan-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            >
                <g fill="currentColor" opacity="0.6">
                    {/* 8 Trigrams positioned around the edge */}
                    {[
                        { angle: 0, lines: [1, 1, 1] },       // Heaven (Qian)
                        { angle: 45, lines: [0, 1, 1] },      // Lake (Dui)
                        { angle: 90, lines: [1, 0, 1] },      // Fire (Li)
                        { angle: 135, lines: [0, 0, 1] },     // Thunder (Zhen)
                        { angle: 180, lines: [0, 0, 0] },     // Earth (Kun)
                        { angle: 225, lines: [1, 0, 0] },     // Mountain (Gen)
                        { angle: 270, lines: [0, 1, 0] },     // Water (Kan)
                        { angle: 315, lines: [1, 1, 0] },     // Wind (Xun)
                    ].map((trigram, i) => {
                        const rad = (trigram.angle - 90) * (Math.PI / 180);
                        const radius = 320;
                        const x = 400 + Math.cos(rad) * radius;
                        const y = 400 + Math.sin(rad) * radius;
                        
                        return (
                            <g key={i} transform={`translate(${x}, ${y}) rotate(${trigram.angle})`}>
                                {/* Draw the 3 lines of the trigram */}
                                {trigram.lines.map((isSolid, j) => (
                                    <g key={j} transform={`translate(0, ${-20 + j * 12})`}>
                                        {isSolid ? (
                                            <rect x="-20" y="0" width="40" height="4" />
                                        ) : (
                                            <>
                                                <rect x="-20" y="0" width="16" height="4" />
                                                <rect x="4" y="0" width="16" height="4" />
                                            </>
                                        )}
                                    </g>
                                ))}
                            </g>
                        );
                    })}
                </g>
                <circle cx="400" cy="400" r="280" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="2 6" />
            </motion.svg>

            {/* Center Core Oscillator (Fast Counter-Clockwise) */}
            <motion.svg
                viewBox="0 0 800 800"
                className="absolute w-[40%] h-[40%] text-amber-50"
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
                <g stroke="currentColor" strokeWidth="1" fill="none">
                    <circle cx="400" cy="400" r="100" opacity="0.8" strokeDasharray="1 4" />
                    <circle cx="400" cy="400" r="80" opacity="0.5" />
                    {/* Inner Star/Eye */}
                    <path d="M 320 400 Q 400 350 480 400 Q 400 450 320 400" opacity="0.6" />
                    <circle cx="400" cy="400" r="15" fill="currentColor" opacity="0.4" />
                    
                    {/* Alchemical Squares */}
                    <rect x="330" y="330" width="140" height="140" transform="rotate(45 400 400)" opacity="0.3" />
                    <rect x="330" y="330" width="140" height="140" transform="rotate(0 400 400)" opacity="0.3" />
                </g>
            </motion.svg>
        </div>
    );
};

// --- FLUID ORGANIC BACKGROUND (LAVA LAMP EFFECT) ---
// Dark toxic emerald and deep blood red for an esoteric laboratory feel
const LavaLampBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 mix-blend-screen z-0">
            {/* Toxic Emerald Blob */}
            <motion.div 
                className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-[#022c22] rounded-full blur-[140px]"
                animate={{ 
                    x: ['0%', '20%', '-10%', '0%'],
                    y: ['0%', '30%', '-20%', '0%'],
                    scale: [1, 1.2, 0.9, 1]
                }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Deep Red Blood Blob */}
            <motion.div 
                className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vw] bg-[#450a0a] rounded-full blur-[150px]"
                animate={{ 
                    x: ['0%', '-30%', '10%', '0%'],
                    y: ['0%', '-20%', '30%', '0%'],
                    scale: [1, 1.3, 0.8, 1]
                }}
                transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Core Nebula (Darkest Emerald/Teal) */}
            <motion.div 
                className="absolute top-[30%] left-[30%] w-[45vw] h-[45vw] bg-[#064e3b] rounded-full blur-[120px]"
                animate={{ 
                    x: ['0%', '30%', '-20%', '0%'],
                    y: ['0%', '-30%', '20%', '0%'],
                    scale: [1, 1.4, 0.7, 1]
                }}
                transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Volatile Crimson Accent */}
            <motion.div 
                className="absolute top-[60%] left-[10%] w-[35vw] h-[35vw] bg-[#7f1d1d] rounded-full blur-[110px]"
                animate={{ 
                    x: ['0%', '40%', '-15%', '0%'],
                    y: ['0%', '-15%', '40%', '0%'],
                    scale: [1, 1.5, 0.8, 1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
};
