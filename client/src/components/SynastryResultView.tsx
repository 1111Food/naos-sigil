// client/src/components/SynastryResultView.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Sparkles, ShieldAlert, Zap, Brain, Heart, Target, Compass, Activity, X, ArrowRight } from 'lucide-react';
import { SYNASTRY_GLOSSARY } from '../constants/synastryGlossary';
import { WisdomOverlay } from './WisdomOverlay';

interface IndexCardProps {
    label: string;
    value: number;
    icon: any;
    delay?: number;
    colorClass?: string;
    onClick?: () => void;
    isActive?: boolean;
}

const IndexCard: React.FC<IndexCardProps> = ({ label, value, icon: Icon, delay = 0, colorClass = "text-white", onClick, isActive }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            let start = 0;
            const end = value;
            const duration = 1000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayValue(end);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(start));
                }
            }, 16);
        }, delay * 1000);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onClick={onClick}
            className={cn(
                "bg-white/5 border rounded-2xl p-4 backdrop-blur-xl group hover:bg-white/10 transition-all flex flex-col h-full min-h-[110px] cursor-pointer",
                isActive ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "border-white/10"
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg bg-black/40 flex-shrink-0", colorClass)}>
                    <Icon size={16} />
                </div>
                <span className="text-lg md:text-xl font-light text-white font-mono">{displayValue}%</span>
            </div>
            <div className="mt-auto space-y-2">
                <span className="text-detail text-secondary block leading-none" title={label}>{label}</span>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
                        className={cn("h-full", colorClass.replace('text-', 'bg-'))}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export const SynastryResultView: React.FC<{ data: any; onNew: () => void; userA: any; userB: any }> = ({ data, onNew, userA, userB }) => {
    const { report, timeWindows, synthesis } = data;
    const indices = report.indices;
    const [activeExplanation, setActiveExplanation] = useState<{ key: string, label: string, text: string, icon: any, color: string } | null>(null);
    const [glossaryEntry, setGlossaryEntry] = useState<{ title: string, description: string } | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [isOrigenExpanded, setIsOrigenExpanded] = useState(false);

    // AI Explanations mapping for the 6 pillars
    const getDeepExplanations = () => synthesis?.explicaciones_pilares || report.explanations || {};

    const indexConfig = [
        { key: 'sexual_erotic', label: report.labels?.['sexual_erotic'] || 'Sinergia de Atracción', icon: Zap, color: 'text-orange-400' },
        { key: 'intellectual_mercurial', label: report.labels?.['intellectual_mercurial'] || 'Estructura Cognitiva', icon: Brain, color: 'text-indigo-400' },
        { key: 'emotional_lunar', label: report.labels?.['emotional_lunar'] || 'Resonancia del Alma', icon: Heart, color: 'text-rose-400' },
        { key: 'karmic_saturnian', label: report.labels?.['karmic_saturnian'] || 'Contrato Kármico', icon: ShieldAlert, color: 'text-amber-500' },
        { key: 'spiritual_neptunian', label: report.labels?.['spiritual_neptunian'] || 'Portal Transpersonal', icon: Compass, color: 'text-blue-400' },
        { key: 'action_martial', label: report.labels?.['action_martial'] || 'Arquitectura de Poder', icon: Target, color: 'text-emerald-400' }
    ];

    const openGlossary = (item: any) => {
        const entry = SYNASTRY_GLOSSARY[item.key];
        if (entry) {
            setGlossaryEntry(entry);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-12">
            {/* Wisdom Overlay for Glossary */}
            <WisdomOverlay
                isOpen={!!glossaryEntry}
                onClose={() => setGlossaryEntry(null)}
                title={glossaryEntry?.title || ""}
                description={glossaryEntry?.description || ""}
                accentColor="purple"
            />

            {/* Reading Guide Modal */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowGuide(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-900 border border-white/10 p-8 rounded-[2rem] max-w-lg w-full relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-serif text-white mb-6 italic">Guía de Interpretación</h3>
                            <div className="space-y-4 text-xs text-white/60 leading-relaxed font-light">
                                <p><strong className="text-emerald-400">80% - 100%</strong>: resonancia de alta frecuencia. Sincronía natural y empuje mutuo.</p>
                                <p><strong className="text-amber-400">50% - 79%</strong>: equilibrio dinámico. Requiere ajuste consciente pero ofrece gran crecimiento.</p>
                                <p><strong className="text-rose-400">0% - 49%</strong>: fricción radical. El vínculo actúa como un espejo de sombras para la evolución.</p>
                                <p className="mt-4 border-t border-white/5 pt-4">Cada pilar representa un área de la vida. Haz clic en ellos para leer la síntesis de la IA dedicada a tu vínculo.</p>
                            </div>
                            <button onClick={() => setShowGuide(false)} className="mt-8 w-full py-3 rounded-full bg-white/5 hover:bg-white/10 text-[10px] uppercase tracking-widest text-white/40">Cerrar</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Section */}
            <div className="text-center space-y-4 mb-20 pt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-white/10 text-primary text-label"
                >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Sincronización de Hilos del Destino</span>
                </motion.div>

                <h2 className="text-5xl md:text-6xl font-serif italic text-primary tracking-tight">MATRIZ DE SINASTRIÍA</h2>
                <p className="text-secondary max-w-xl mx-auto text-sm tracking-widest font-light leading-relaxed">
                    Entrelazando las frecuencias de {userA.name || 'Espectro A'} y {userB.name || 'Espectro B'} en el tejido del Nexo.
                </p>
            </div>

            {/* Header: Soul Mirror */}
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 py-10">
                {/* User A */}
                <div className="flex flex-col items-center md:items-end space-y-4 w-full md:w-1/3">
                    <div className="w-24 h-24 rounded-full border-2 border-cyan-500/30 bg-cyan-900/10 flex items-center justify-center relative shadow-[0_0_20px_rgba(6,182,212,0.1)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent" />
                        <span className="text-3xl font-serif text-primary relative z-10">{userA?.name?.[0]}</span>
                    </div>
                    <div className="text-center md:text-right">
                        <h4 className="text-2xl font-serif text-primary truncate max-w-[200px]">{userA?.name}</h4>
                        <p className="text-label text-secondary">Arquitecto</p>
                    </div>
                </div>

                {/* Connection Score Overlay (Center) */}
                <div className="md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-20 shrink-0 my-4 md:my-0">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        onClick={() => setShowGuide(true)}
                        className="p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden glass-panel cursor-help group"
                    >
                        <div className="absolute inset-0 rounded-full border-[0.5px] border-white/10 animate-[spin_10s_linear_infinite] opacity-50" style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }} />
                        <div className="absolute inset-2 rounded-full border-[0.5px] border-white/5 animate-[spin_15s_linear_infinite_reverse] opacity-50" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
                        <div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-500" />

                        <span className="text-4xl font-light text-primary font-serif tracking-widest relative z-10">{report.score}</span>
                        {synthesis?.subtitulo_score && (
                            <span className="text-[8px] italic text-amber-400 font-serif mt-1 relative z-10 text-center max-w-[120px] leading-tight">
                                {synthesis.subtitulo_score}
                            </span>
                        )}
                        <span className="text-[7px] uppercase tracking-[0.4em] text-secondary mt-2 relative z-10 group-hover:text-white transition-colors">Info</span>
                    </motion.div>
                </div>

                {/* User B */}
                <div className="flex flex-col items-center md:items-start space-y-4 w-full md:w-1/3">
                    <div className="w-24 h-24 rounded-full border-2 border-amber-500/30 bg-amber-900/10 flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.1)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent" />
                        <span className="text-3xl font-serif text-primary relative z-10">{userB?.name?.[0]}</span>
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-2xl font-serif text-primary truncate max-w-[200px]">{userB?.name || 'Vínculo'}</h4>
                        <p className="text-label text-secondary">Vínculo</p>
                    </div>
                </div>
            </div>

            {/* Actionable Narrative Blocks Section */}
            {synthesis && synthesis.diagnostico && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                >
                    {/* Diagnóstico */}
                    <div className="md:col-span-2 glass-panel relative overflow-hidden flex flex-col justify-center p-6 bg-black/40 border border-white/5 rounded-3xl">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/30" />
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400 mb-3">Diagnóstico del Vínculo</h4>
                        <p className="font-serif italic text-lg md:text-xl text-primary leading-relaxed">
                            "{synthesis.diagnostico}"
                        </p>
                    </div>

                    {/* Riesgo */}
                    <div className="glass-panel border-rose-500/10 bg-rose-500/5 relative overflow-hidden flex flex-col justify-center p-6 rounded-3xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/40" />
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert size={14} className="text-rose-400" />
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-rose-400">Punto de Riesgo</h4>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed font-light">
                            {synthesis.riesgo}
                        </p>
                    </div>

                    {/* Acciones */}
                    <div className="md:col-span-3 glass-panel p-6 bg-black/40 border border-white/5 rounded-3xl">
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-4 border-b border-white/5 pb-2">Estrategias de Coherencia (Acciones)</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {synthesis.acciones?.map((action: string, i: number) => (
                                <li key={i} className="flex gap-3 items-start text-xs text-secondary leading-relaxed bg-white/3 p-4 rounded-2xl border border-white/5">
                                    <span className="text-amber-500 font-serif font-bold text-sm">0{i+1}.</span>
                                    <span className="font-light">{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            )}

            {/* Prompt Bloque 2: Cómo se calculó esto (Collapsable) */}
            {synthesis && synthesis.origen_calculo && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6 bg-black/40 border border-white/5 rounded-3xl max-w-5xl mx-auto"
                >
                    <button 
                        onClick={() => setIsOrigenExpanded(!isOrigenExpanded)}
                        className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-2 pb-2 border-b border-white/5 group"
                    >
                        <span>Cómo se calculó esto</span>
                        <motion.div
                            animate={{ rotate: isOrigenExpanded ? 180 : 0 }}
                            className="text-white/40 group-hover:text-white transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {isOrigenExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                    {synthesis.origen_calculo.astrologia && (
                                        <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-xs text-secondary leading-relaxed font-light">
                                            <span className="text-purple-400 font-bold block mb-1">Astrología</span>
                                            <p className="italic">"{synthesis.origen_calculo.astrologia}"</p>
                                        </div>
                                    )}
                                    {synthesis.origen_calculo.numerologia && (
                                        <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-xs text-secondary leading-relaxed font-light">
                                            <span className="text-purple-400 font-bold block mb-1">Numerología</span>
                                            <p className="italic">"{synthesis.origen_calculo.numerologia}"</p>
                                        </div>
                                    )}
                                    {synthesis.origen_calculo.maya && (
                                        <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-xs text-secondary leading-relaxed font-light">
                                            <span className="text-purple-400 font-bold block mb-1">Maya</span>
                                            <p className="italic">"{synthesis.origen_calculo.maya}"</p>
                                        </div>
                                    )}
                                    {/* Prompt Bloque 2: China Option */}
                                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-xs text-secondary leading-relaxed font-light">
                                        <span className="text-purple-400 font-bold block mb-1">China</span>
                                        <p className="italic">"{synthesis.origen_calculo.china || "Comparación de signos anuales y elementos."}"</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Indices: 6 Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {indexConfig.map((idx, i) => (
                    <IndexCard
                        key={idx.key}
                        label={idx.label}
                        value={(indices as any)[idx.key]}
                        icon={idx.icon}
                        delay={0.2 + (i * 0.1)}
                        colorClass={idx.color}
                        onClick={() => setActiveExplanation({
                            key: idx.key,
                            label: idx.label,
                            text: getDeepExplanations()[idx.key] || "Analizando el núcleo de este pilar...",
                            icon: idx.icon,
                            color: idx.color
                        })}
                        isActive={activeExplanation?.label === idx.label}
                    />
                ))}
            </div>

            {/* Deep Narrative Section */}
            <AnimatePresence>
                {activeExplanation && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="glass-panel relative overflow-hidden flex flex-col md:flex-row gap-10 items-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] mx-auto max-w-5xl"
                    >
                        <button onClick={() => setActiveExplanation(null)} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all">
                            <X size={20} />
                        </button>

                        <div className={cn("p-6 rounded-3xl bg-black/40 border border-white/5 shrink-0 shadow-inner", activeExplanation.color)}>
                            <activeExplanation.icon size={48} className="drop-shadow-[0_0_10px_currentColor]" />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <span className={cn("w-2 h-2 rounded-full animate-pulse", (activeExplanation as any).color.replace('text-', 'bg-'))} />
                                <h4 className={cn("text-xs font-serif tracking-[0.4em] uppercase", (activeExplanation as any).color)}>{(activeExplanation as any).label}</h4>
                            </div>

                            {/* Conceptual Definition from Glossary */}
                            <div className="space-y-2">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-secondary font-bold">Definición Alquímica</span>
                                <p className="text-sm text-secondary font-light leading-relaxed">
                                    {SYNASTRY_GLOSSARY[`PILLAR_${(activeExplanation as any).key?.toUpperCase()}`]?.description || "Analizando la esencia de este pilar..."}
                                </p>
                            </div>

                            <div className="h-[1px] w-full bg-primary/5" />

                            {/* AI Synthesis */}
                            <div className="space-y-2">
                                <span className="text-[8px] uppercase tracking-[0.2em] text-secondary font-bold">Síntesis del Oráculo</span>
                                <p className="text-lg md:text-xl text-primary font-serif leading-relaxed tracking-wide italic font-light">
                                    "{(activeExplanation as any).text}"
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 justify-center md:justify-start opacity-30 group cursor-help">
                                <Brain size={12} />
                                <span className="text-[8px] uppercase tracking-widest text-secondary">Memoria de Sistema v3.0 | Proyectado para {userA?.name?.split(' ')[0]} y {userB?.name?.split(' ')[0] || 'Vínculo'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Qualitative Synthesis (Relational Intelligence) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel">
                    <div className="flex items-center gap-3 mb-8 border-b border-primary/5 pb-4">
                        <Sparkles className="text-amber-500/50" size={16} />
                        <h3 className="text-sm font-serif italic text-secondary tracking-widest uppercase">Inteligencia Relacional</h3>
                    </div>
                    <div className="space-y-8">
                        <div>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-secondary font-black block mb-3 border-l tracking-widest pl-3 border-emerald-500/50 uppercase">Palancas de Fusión (Espejos Dorados)</span>
                            <div className="flex flex-wrap gap-2 pl-3">
                                {report.A_StrongCompatibilities.map((s: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => openGlossary(s)}
                                        className="px-4 py-2 glass-card text-[10px] text-secondary font-serif hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 transition-all text-left group"
                                    >
                                        <span className="flex items-center gap-2">
                                            {s.label}
                                            <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-[9px] uppercase tracking-[0.3em] text-secondary font-black block mb-3 border-l tracking-widest pl-3 border-rose-500/50 uppercase">Fricción Transformadora (Zonas de Sombra)</span>
                            <div className="flex flex-wrap gap-2 pl-3">
                                {report.B_PotentialTensions.map((t: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => openGlossary(t)}
                                        className="px-4 py-2 glass-card text-[10px] text-secondary font-serif hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all text-left group"
                                    >
                                        <span className="flex items-center gap-2">
                                            {t.label}
                                            <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTION/GROWTH */}
                <div className="glass-panel relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-secondary font-bold block mb-6 border-b border-primary/5 pb-4">Líneas de Integración Cármica</span>
                    <ul className="space-y-5 relative z-10">
                        {report.C_GrowthAreas.map((g: any, i: number) => (
                            <li key={i} className="flex gap-4 text-xs text-secondary items-start leading-relaxed font-serif group cursor-help" onClick={() => openGlossary(g)}>
                                <span className="text-primary/20 text-[8px] mt-1.5 font-sans tracking-widest group-hover:text-amber-500/50 transition-colors">◇</span>
                                <span className="group-hover:text-primary/80 transition-colors">{g.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* TEMPORAL TIMELINE (LINEA DE VIDA) */}
            <div className="glass-panel relative overflow-hidden group/timeline">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Activity size={24} className="animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif italic text-primary">Línea de Vida</h3>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-secondary mt-1">Sincronía Astral a 30 días</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 rounded-full border border-primary/5 bg-primary/5 flex gap-6">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /><span className="text-[8px] text-secondary uppercase tracking-widest">Flujo</span></div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /><span className="text-[8px] text-secondary uppercase tracking-widest">Tensión</span></div>
                    </div>
                </div>

                <div className="relative h-48 flex gap-1.5 items-end justify-between px-2">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                        <div className="h-[1px] w-full bg-primary/5 relative"><span className="absolute right-0 -top-2 text-[6px] text-secondary uppercase tracking-tighter">100%</span></div>
                        <div className="h-[1px] w-full bg-primary/5 relative"><span className="absolute right-0 -top-2 text-[6px] text-secondary uppercase tracking-tighter">50%</span></div>
                        <div className="h-[1px] w-full bg-primary/5 relative opacity-30"><span className="absolute right-0 -top-2 text-[6px] text-secondary uppercase tracking-tighter">0%</span></div>
                    </div>

                    {timeWindows.map((w: any, i: number) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${w.score}%`, opacity: 1 }}
                                transition={{ delay: 0.5 + (i * 0.02), duration: 0.8 }}
                                className={cn(
                                    "w-full rounded-full transition-all duration-300 relative group-hover:z-10",
                                    w.type === 'FLOW' ? "bg-emerald-500/30 hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                                        w.type === 'TENSION' ? "bg-rose-500/30 hover:bg-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]" :
                                            "bg-primary/10 hover:bg-primary/20"
                                )}
                            />
                            {/* Hover info pill */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block z-50 w-40">
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                                    <p className="font-serif italic text-primary text-xs mb-1">{new Date(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                                    <p className="text-[9px] text-secondary leading-tight">{w.description}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-[8px] uppercase tracking-widest text-secondary">{w.type}</span>
                                        <span className="text-[10px] font-mono text-secondary">{w.score}%</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-8 text-[8px] text-white/20 uppercase tracking-[0.5em] font-black border-t border-white/5 pt-6">
                    <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-white/20" />Presente</span>
                    <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-white/20" />Umbral +30d</span>
                </div>
            </div>

            {/* Traducción Simple Footer */}
            {synthesis?.traduccion_simple && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-2xl mx-auto text-center border-t border-white/5 pt-8 mt-12 mb-4"
                >
                    <span className="text-[8px] uppercase tracking-[0.3em] text-secondary/60">Canalización Simple</span>
                    <p className="font-serif italic text-primary/80 mt-2 text-base max-w-lg mx-auto leading-relaxed">
                        "{synthesis.traduccion_simple}"
                    </p>
                </motion.div>
            )}

            <div className="flex justify-center pt-8">
                <button
                    onClick={onNew}
                    className="group relative px-12 py-5 rounded-full overflow-hidden transition-all active:scale-95"
                >
                    <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 border border-white/10 group-hover:border-white/20 transition-all" />
                    <span className="relative z-10 text-white/40 group-hover:text-white text-[11px] uppercase tracking-[0.4em] font-black transition-colors">Nueva Invocación</span>
                </button>
            </div>
        </div>
    );
};
