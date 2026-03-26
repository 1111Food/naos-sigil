import React, { useState } from 'react';
import { Sparkles, Compass, ChevronDown, Scroll } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { MAYAN_MANUAL } from '../data/manuals/mayan';
import { MAYAN_MANUAL_EN } from '../data/manuals/mayan_en';
import { getNahualImage, getMayanToneName } from '../utils/nahualMapper';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

// Placeholder for glyph path logic if needed, or use image
const GlyphPlaceholder = ({ tone, id, size = 'md', showTone = true }: { tone: number, id?: string, size?: 'xs' | 'sm' | 'md' | 'lg', showTone?: boolean }) => {
    const [imgError, setImgError] = useState(!id);

    const sizeMap = {
        xs: 'w-24',
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64'
    };

    return (
        <div className={cn(
            "relative aspect-[2/3] flex items-center justify-center border border-white/10 rounded-[1.5rem] bg-black/40 backdrop-blur-3xl shadow-[0_0_40px_rgba(16,185,129,0.05)] overflow-hidden group/card transition-all duration-700 hover:border-emerald-500/40",
            sizeMap[size]
        )}>
            {/* Outer Glow Perimeter */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />

            {!imgError && id ? (
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                    <img
                        src={getNahualImage(id)}
                        alt={`Nahual ${id}`}
                        onError={() => setImgError(true)}
                        className={cn(
                            "object-cover object-center brightness-125 transition-transform duration-[2s] group-hover/card:scale-[1.45] drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]",
                            "scale-[1.35]"
                        )}
                        style={{ filter: 'contrast(1.1) saturate(1.2)' }}
                    />
                    {/* Dark Vignette to focus content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                </div>
            ) : (
                <span className={cn("text-white font-thin drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] z-10", size === 'sm' ? 'text-4xl' : 'text-6xl')}>🌞</span>
            )}

            {/* Tone Representation Dots/Bars */}
            {showTone && (
                <div className={cn("absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20", size === 'sm' ? 'top-2' : 'top-4')}>
                    <span className={cn("text-white/40 tracking-[0.5em] uppercase font-black", size === 'sm' ? 'text-[5px]' : 'text-[7px]')}>{useTranslation().t('tone')} {tone}</span>
                    <div className="flex gap-1.5 mt-0.5">
                        {Array.from({ length: tone }).map((_, i) => (
                            <div
                                key={i}
                                className={`
                                    ${tone > 4 && i % 5 === 0 ? (size === 'sm' ? 'w-3 h-0.5' : 'w-6 h-0.5') + ' rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : i % 5 !== 0 || tone <= 4 ? (size === 'sm' ? 'w-0.5 h-0.5' : 'w-1 h-1') + ' rounded-full bg-emerald-400/60' : 'hidden'}
                                `}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface NawalViewProps {
    overrideProfile?: any;
}

export const NawalView: React.FC<NawalViewProps> = ({ overrideProfile }) => {
    // --- UNIFIED STATE (v9.16) ---
    const { profile: activeProfile, loading: activeLoading } = useActiveProfile();

    // Logic for Profile Injection
    const profile = overrideProfile || activeProfile;
    const isLoading = overrideProfile ? false : activeLoading;

    const { t, language } = useTranslation();
    const MAYAN_LIB = language === 'en' ? MAYAN_MANUAL_EN : MAYAN_MANUAL;

    // HOOKS
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);

    if (isLoading) return <div className="p-20 text-center text-white/20 uppercase tracking-[0.4em] text-[10px]">{t('consulting_time')}</div>;

    // GUARDIA: Si no hay perfil con fecha, mostrar estado vacío
    if (!profile || !profile.birthDate) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/20 text-center px-12">
                <p className="text-[10px] uppercase tracking-[0.3em] font-thin">{t('time_awaits_coords')}</p>
            </div>
        );
    }


    const nawal = profile?.mayan;
    const detailedNawal = nawal ? MAYAN_LIB.nahuales.find(n => n.kiche === nawal.kicheName) : null;
    const sequence = MAYAN_LIB.nahuales;
    const centerIndex = sequence.findIndex(n => n.id === detailedNawal?.id);

    const allies = centerIndex !== -1 ? [4, 8, 12, 16].map(offset => sequence[(centerIndex + offset) % 20]) : [];
    const challenges = centerIndex !== -1 ? [sequence[(centerIndex + 10) % 20]] : [];

    const sections = [
        { id: 'significado', title: t('cosmic_meaning'), icon: Sparkles, color: 'emerald', content: detailedNawal?.meaning },
        { id: 'esencia', title: t('sacred_essence'), icon: Sparkles, color: 'teal', content: detailedNawal?.essence },
        { id: 'caracteristicas', title: t('native_characteristics'), icon: Scroll, color: 'amber', content: detailedNawal?.characteristics },
        { id: 'luz', title: t('in_light_gifts'), icon: Sparkles, color: 'emerald', content: detailedNawal?.light },
        { id: 'sombra', title: t('in_shadow_challenges'), icon: Scroll, color: 'rose', content: detailedNawal?.shadow },
        { id: 'mision', title: t('mission_life'), icon: Compass, color: 'cyan', content: detailedNawal?.mission },
        { id: 'consejo', title: t('grandfather_advice'), icon: Scroll, color: 'amber', content: detailedNawal?.advice }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center relative py-10">

            <header className="w-full flex items-center justify-between mb-16 px-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
                <h1 className="text-[10px] font-black tracking-[0.5em] uppercase text-white/40 mx-8">{t('mayan_synchronary')}</h1>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </header>

            <main className="w-full max-w-2xl flex flex-col items-center text-center px-4">
                <AnimatePresence mode="wait">

                    {nawal && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center w-full"
                        >
                            <motion.div
                                initial={{ rotate: -10, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="mb-12 group relative"
                            >
                                <GlyphPlaceholder tone={nawal.tone} id={detailedNawal?.id} />
                            </motion.div>

                            {/* 🏷️ IDENTITY HEADING (Refining Windows Neon GLow) */}
                            <div className="flex flex-col items-center justify-center space-y-4 mb-8 w-full group">
                                <div className="relative bg-white/[0.02] border border-white/5 p-8 md:p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl max-w-2xl w-full text-center space-y-6 transition-all duration-700 hover:border-amber-500/20 hover:bg-white/[0.04] shadow-[0_0_60px_rgba(245,158,11,0.03)] hover:shadow-[0_0_80px_rgba(245,158,11,0.08)]">

                                    {/* Decorative background glow */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-50 rounded-[3rem] pointer-events-none" />

                                    <div className="relative space-y-2">
                                        <h2 className="text-xs md:text-sm font-black text-white/40 uppercase tracking-[0.5em] leading-tight mb-2">
                                            {getMayanToneName(nawal.tone, language)} ({nawal.tone}) — {detailedNawal?.meaning.split(',')[0]}
                                        </h2>
                                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[0.4em] leading-tight text-white mb-2" style={{ textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
                                            <span className="text-amber-500">
                                                {nawal.tone === 1 ? t('the_directions_singular') : t('the_directions_prefix')} {nawal.tone} {t('the_directions_suffix')}
                                            </span> <span className="font-thin tracking-[0.2em]">{nawal.kicheName}</span>
                                        </h2>
                                    </div>

                                    <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

                                    <div className="relative px-4">
                                        <p className="text-[11px] md:text-xs text-white/60 uppercase tracking-[0.3em] font-light leading-relaxed text-justify" style={{ textAlignLast: 'center' }}>
                                            {nawal.meaning}
                                        </p>
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-white/5">
                                        <p className="text-[10px] md:text-xs text-amber-500/40 uppercase tracking-[0.5em] font-black italic">
                                            "{nawal.description}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 🤝 MAYAN ALLIANCES (Dinámica de Alianzas) */}
                            <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Allies */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400">{t('harmonic_allies')}</h4>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {allies.map(allied => (
                                            <div key={allied.id} className="flex flex-col items-center group cursor-help">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5">
                                                    <img 
                                                        src={getNahualImage(allied.id)} 
                                                        alt={allied.kiche} 
                                                        className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                                <span className="text-[8px] uppercase tracking-wider text-white/40 mt-1.5 group-hover:text-emerald-400/80 transition-colors">
                                                    {allied.kiche}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Challenges */}
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                            <Compass className="w-3.5 h-3.5 text-rose-400" />
                                        </div>
                                        <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-rose-400">{t('opponent_challenge')}</h4>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {challenges.map(chall => (
                                            <div key={chall.id} className="flex items-center gap-3 group cursor-help">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-rose-500/30 group-hover:bg-rose-500/5">
                                                    <img 
                                                        src={getNahualImage(chall.id)} 
                                                        alt={chall.kiche} 
                                                        className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] uppercase tracking-wider text-white/80 group-hover:text-rose-400 transition-colors">
                                                        {chall.kiche}
                                                    </span>
                                                    <span className="text-[7px] uppercase tracking-wider text-white/40">
                                                        {t('polar_force')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Wisdom Accordions */}
                            <div className="space-y-4 pt-10 border-t border-white/5 w-full">
                                {sections.map((sec, idx) => {
                                    const isOpen = openSectionId === sec.id;
                                    const Icon = sec.icon;
                                    
                                    const colorClasses = {
                                        emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
                                        teal: "text-teal-400 border-teal-500/30 bg-teal-500/5",
                                        amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
                                        rose: "text-rose-400 border-rose-500/30 bg-rose-500/5",
                                        cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5"
                                    }[sec.color as 'emerald' | 'teal' | 'amber' | 'rose' | 'cyan'] || "text-white border-white/10 bg-white/5";

                                    return (
                                        <motion.div
                                            key={sec.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={cn(
                                                "rounded-2xl border border-white/[0.03] overflow-hidden transition-all duration-300 w-full text-left",
                                                isOpen ? "bg-white/[0.03] shadow-[0_0_50px_rgba(255,255,255,0.01)] border-white/10" : "hover:bg-white/[0.01] hover:border-white/5"
                                            )}
                                        >
                                            <button
                                                onClick={() => setOpenSectionId(isOpen ? null : sec.id)}
                                                className="w-full px-6 py-5 flex items-center justify-between text-left group/btn"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-xl border", colorClasses)}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="text-[11px] uppercase tracking-[0.3em] text-white/70 font-bold group-hover/btn:text-white transition-colors">
                                                        {sec.title}
                                                    </h4>
                                                </div>
                                                <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform duration-300", isOpen ? "rotate-180 text-white" : "group-hover/btn:text-white/60")} />
                                            </button>

                                            <AnimatePresence initial={false}>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                        className="border-t border-white/[0.03]"
                                                    >
                                                        <div className="p-6 text-xs text-white/60 font-serif leading-relaxed italic">
                                                            {sec.content}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
