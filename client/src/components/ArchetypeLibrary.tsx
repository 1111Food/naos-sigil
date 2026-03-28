import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hexagon, Sparkles, Zap, Shield, Target, User, BookOpen, Info, ChevronRight } from 'lucide-react';
const Spline = React.lazy(() => import('@splinetool/react-spline'));
import { cn } from '../lib/utils';
import { NAOS_ARCHETYPES } from '../constants/archetypeData';
import { NAOS_ARCHETYPES_EN } from '../constants/archetypeData_en';
import type { ArchetypeInfo } from '../constants/archetypeData';
import { useTranslation } from '../i18n';

// Local Error Boundary for Spline to avoid "Fractured Reality" on 3D load failure
class SplineErrorBoundary extends React.Component<{ children: React.ReactNode, fallback?: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any) { console.error("Spline Error caught:", error); }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                    {/* Atmospheric Glow Fallback - subtle and doesn't compete with the card content */}
                    <div className="w-full h-full bg-gradient-to-br from-cyan-900/10 to-transparent blur-xl opacity-30" />
                    <motion.div 
                        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-cyan-500/10"
                    />
                </div>
            );
        }
        return this.props.children;
    }
}


const getFrequencyConfig = (t: any) => ({
    [t('freq_igneous')]: { color: 'text-rose-500', border: 'border-rose-500/20', bg: 'bg-rose-500/5', icon: Zap },
    [t('freq_telluric')]: { color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', icon: Shield },
    [t('freq_ethereal')]: { color: 'text-cyan-500', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', icon: Target },
    [t('freq_abyssal')]: { color: 'text-fuchsia-500', border: 'border-fuchsia-500/20', bg: 'bg-fuchsia-500/5', icon: User },
});

export const ArchetypeLibrary: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t, language } = useTranslation();
    const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeInfo | null>(null);
    const frequencyConfig = getFrequencyConfig(t);

    const LIB = language === 'en' ? NAOS_ARCHETYPES_EN : NAOS_ARCHETYPES;

    const groupedArchetypes = LIB.reduce((acc, curr) => {
        if (!acc[curr.frecuencia]) acc[curr.frecuencia] = [];
        acc[curr.frecuencia].push(curr);
        return acc;
    }, {} as Record<string, ArchetypeInfo[]>);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-6xl max-h-[90vh] bg-black/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                            <BookOpen className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">{t('codex_of_identity')}</h2>
                            <h3 className="text-2xl text-white font-thin tracking-widest uppercase">{t('library_archetypes_title')}</h3>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-8 h-8 font-thin" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                    {Object.entries(groupedArchetypes).map(([frecuencia, archetypes]) => {
                        const config = (frequencyConfig as any)[frecuencia];
                        const Icon = config.icon;

                        return (
                            <section key={frecuencia} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg", config.bg)}>
                                        <Icon className={cn("w-4 h-4", config.color)} />
                                    </div>
                                    <h4 className={cn("text-[11px] uppercase tracking-[0.3em] font-bold", config.color)}>
                                        {t('frequency_label')} {frecuencia}
                                    </h4>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {archetypes.map((arch) => (
                                        <motion.div
                                            key={arch.id}
                                            whileHover={{ y: -4 }}
                                            onClick={() => setSelectedArchetype(arch)}
                                            className="group relative cursor-pointer p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden min-h-[160px]"
                                        >
                                            {/* Arcano Background */}
                                            {arch.imagePath && (
                                                <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                                                    <img 
                                                        src={arch.imagePath} 
                                                        alt="" 
                                                        className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/40" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="relative z-10 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{arch.rol}</span>
                                                    <Info className="w-3 h-3 text-white/10 group-hover:text-white/40 transition-colors" />
                                                </div>
                                                <div>
                                                    <h5 className="text-lg text-white font-medium group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{arch.nombre}</h5>
                                                    <p className="text-[10px] text-white/30 line-clamp-2 mt-2 leading-relaxed">{arch.descripcion}</p>
                                                </div>
                                                <div className="pt-2 flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/20 font-black group-hover:text-white/60 transition-colors">
                                                    {t('explore_codex')} <ChevronRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </motion.div>

            {/* Deep Detail Modal */}
            <AnimatePresence>
                {selectedArchetype && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedArchetype(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl bg-black/40 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row"
                        >
                            {/* Visual Side */}
                            <div className="w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-gradient-to-b from-white/[0.05] to-black/40 flex items-center justify-center p-12 relative overflow-hidden ring-1 ring-white/10">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-cyan-500/20" />
                                </div>
                                
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                    className="absolute w-[150%] aspect-square border-2 border-white/[0.02] rounded-full"
                                />
                                                             <div className="relative z-10 text-center space-y-8 w-full">
                                    <div className="w-full h-64 md:h-80 mx-auto flex items-center justify-center relative group">
                                         {/* Spline 3D Background layer */}
                                         <Suspense fallback={
                                             <div className="w-32 h-32 rounded-full bg-white/[0.03] border border-white/20 flex items-center justify-center shadow-2xl">
                                                 <Hexagon className="w-16 h-16 text-cyan-400 opacity-20" />
                                             </div>
                                         }>
                                             <div className="absolute inset-0 w-full h-full scale-125 md:scale-150 opacity-60">
                                                 <SplineErrorBoundary fallback={
                                                     <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                                         <Hexagon className="w-32 h-32 text-cyan-500 animate-pulse" />
                                                     </div>
                                                 }>
                                                     {/* @ts-ignore */}
                                                     <Spline scene={selectedArchetype?.scene || "https://prod.spline.design/ATZ-SSTV-rM6Z27Z/scene.splinecode"} />
                                                 </SplineErrorBoundary>
                                             </div>

                                         </Suspense>

                                         {/* Official Arcano Foreground layer */}
                                         {selectedArchetype.imagePath && (
                                             <motion.div 
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2, duration: 0.8 }}
                                                className="relative z-20 w-48 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-105 transition-transform duration-700 m-auto"
                                             >
                                                 <img 
                                                    src={selectedArchetype.imagePath} 
                                                    alt={selectedArchetype.nombre}
                                                    className="w-full h-full object-cover brightness-110 contrast-110"
                                                 />
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                             </motion.div>
                                         )}
                                         <div className="absolute inset-0 bg-cyan-400/5 blur-[50px] rounded-full -z-10 opacity-30 group-hover:opacity-60 transition-opacity" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl text-white font-thin tracking-[0.2em] uppercase leading-tight">
                                            {selectedArchetype.nombre}
                                        </h2>
                                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                                            <div className={cn("w-2 h-2 rounded-full animate-pulse", 
                                                selectedArchetype.elemento === 'fuego' ? 'bg-rose-500' :
                                                selectedArchetype.elemento === 'tierra' ? 'bg-emerald-500' :
                                                selectedArchetype.elemento === 'aire' ? 'bg-cyan-500' : 'bg-fuchsia-500'
                                            )} />
                                            <span className="text-[9px] uppercase tracking-widest text-white/60 font-black">
                                                {t('frequency_label')} {selectedArchetype.frecuencia}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="flex-1 p-8 md:p-12 space-y-10 overflow-y-auto max-h-[70vh] md:max-h-none">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.5em] text-cyan-400 font-bold">{t('operative_summary')}</span>
                                        <div className="flex-1 h-px bg-cyan-400/20" />
                                    </div>
                                    <p className="text-xl text-white/80 font-serif italic leading-relaxed">
                                        "{selectedArchetype.descripcion}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Lights */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">{t('lights_label')}</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {selectedArchetype.luces.map((l, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-white/60 font-serif">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                                                    {l}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Shadows */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Zap className="w-4 h-4 text-rose-400" />
                                            <h4 className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">{t('shadows_label')}</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {selectedArchetype.sombras.map((s, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm text-white/40 font-serif italic">
                                                    <div className="w-1 h-1 rounded-full bg-rose-500/20" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 space-y-4">
                                     <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                            <Shield className="w-3 h-3 text-white/40" />
                                        </div>
                                         <div>
                                            <h5 className="text-[9px] uppercase tracking-widest text-white/20 font-bold">{t('human_system_role')}</h5>
                                            <p className="text-xs text-white/60 uppercase tracking-tighter">{selectedArchetype.rol}</p>
                                        </div>
                                     </div>
                                </div>

                                <button 
                                    onClick={() => setSelectedArchetype(null)}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] uppercase tracking-widest font-black hover:bg-white/10 hover:text-white transition-all mt-8"
                                >
                                    {t('close_file')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
