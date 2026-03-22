import React, { useState, useRef } from 'react';
import { Hash, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PINNACLE_INTERPRETATIONS, PINNACLE_POSITIONS } from '../data/pinnacleData';
import { cn } from '../lib/utils';
import { useGuardianState } from '../contexts/GuardianContext';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useSubscription } from '../hooks/useSubscription';
import { NeonNumber } from './NeonNumber';
import { getNumberText } from '../utils/numberMapper';

interface NumerologyViewProps {
    data?: any; // Mantener por compatibilidad
    overrideProfile?: any; // Renamed from overrideData
}

export const NumerologyView: React.FC<NumerologyViewProps> = ({ overrideProfile }) => {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [showDeepInsight, setShowDeepInsight] = useState<string | null>(null);
    const [activeCode, setActiveCode] = useState<string | null>(null);
    const listRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const { trackEvent } = useGuardianState();
    
    // --- UNIFIED STATE (v9.16) ---
    const { profile: activeProfile, loading: activeLoading } = useActiveProfile();
    const { status: subscription } = useSubscription(!overrideProfile);

    const isPremium = overrideProfile
        ? true
        : (typeof subscription === 'object' && (subscription?.plan === 'PREMIUM' || subscription?.plan === 'EXTENDED')) ||
        (typeof subscription === 'string' && (subscription === 'PREMIUM' || subscription === 'EXTENDED'));

    // Logic for Profile Injection
    const profile = overrideProfile || activeProfile;
    const loading = overrideProfile ? false : activeLoading;

    // Obtener datos de numerología del perfil
    const data = profile?.numerology;

    if (loading) return <div className="text-white text-center p-8">Cargando frecuencias...</div>;

    if (!profile || (!profile.birthDate && !data)) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-white/50">
                <p className="mb-4">Esencia Incompleta</p>
                <p className="text-xs max-w-xs">Configura tu fecha de nacimiento o calcula un perfil para ver el Pináculo.</p>
            </div>
        );
    }

    const handleOpenModal = (id: string, title: string, number: any) => {
        if (number === undefined || number === null || number === '?') return;
        const numValue = Number(number);
        setExpandedItem(expandedItem === id ? null : id);

        // Track event for Oracle Memory
        trackEvent('PINNACLE', {
            position: title,
            number: numValue,
            archetype: PINNACLE_INTERPRETATIONS[numValue]?.archetype || "Desconocido"
        });
    };

    const scrollToCode = (label: string) => {
        setActiveCode(label);
        setExpandedItem(label); // Auto expand on click from Graph
        const target = listRefs.current[label];
        if (target && scrollContainerRef.current) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Temporary highlight effect
        setTimeout(() => setActiveCode(null), 3000);
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 p-4">

            <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch max-w-4xl mx-auto">
                {/* 🌟 CAMINO DE VIDA (Interactive Card) */}
                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    onClick={() => handleOpenModal('D', 'Frecuencia de Encarnación', data.lifePathNumber)}
                    className="flex-1 relative group overflow-hidden bg-white/[0.02] border border-white/5 p-6 rounded-[36px] text-center backdrop-blur-xl flex flex-col items-center cursor-pointer transition-all hover:border-purple-500/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] max-w-xs"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                        <Hash className="w-32 h-32 text-white" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-6 block">Frecuencia de Encarnación</span>

                    <div className="relative w-32 aspect-[3/4] mb-6">
                        <div className="absolute inset-0 rounded-[1.5rem] border border-white/10 bg-black/40 overflow-hidden shadow-2xl group-hover:border-purple-500/40 transition-colors">
                            <NeonNumber
                                value={data.lifePathNumber}
                                isFullCard={true}
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-lg font-black text-white/80 uppercase tracking-[0.2em]">
                            {getNumberText(data.lifePathNumber)}
                        </h2>
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-light max-w-[200px] mx-auto leading-relaxed">
                            "La arquitectura fundamental de tu espíritu."
                        </p>
                    </div>
                </motion.div>

                {/* 🌟 CÓDIGO DE EXPRESIÓN (Name Number - Interactive Card) */}
                <motion.div
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    onClick={() => handleOpenModal('N', 'Código de Expresión', data.nameNumber)}
                    className="flex-1 relative group overflow-hidden bg-white/[0.02] border border-white/5 p-6 rounded-[36px] text-center backdrop-blur-xl flex flex-col items-center cursor-pointer transition-all hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)] max-w-xs"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:-rotate-12 transition-transform duration-1000">
                        <div className="font-serif italic text-6xl text-white">Abc</div>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black mb-6 block">Código de Expresión</span>

                    <div className="relative w-32 aspect-[3/4] mb-6">
                        <div className="absolute inset-0 rounded-[1.5rem] border border-white/10 bg-black/40 overflow-hidden shadow-2xl group-hover:border-cyan-500/40 transition-colors">
                            <NeonNumber
                                value={data.nameNumber || '?'}
                                color="cyan"
                                isFullCard={true}
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-lg font-black text-white/80 uppercase tracking-[0.2em]">
                            {getNumberText(data.nameNumber) || 'Calculando...'}
                        </h2>
                        <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-light max-w-[200px] mx-auto leading-relaxed">
                            "La frecuencia sonora de tu nombre en este plano."
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Main Content: Pinaculo (Diamond Graph) + Sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Visual Graph Section */}
                <div className="flex-1 bg-black/40 border border-white/5 p-8 rounded-[3rem] overflow-hidden flex flex-col items-center justify-center min-h-fit lg:min-h-[600px]">
                    <div className="mb-0 mt-2 text-center w-full">
                        <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-200">
                            ARQUITECTURA DEL ALMA
                        </h3>
                        <div className="h-[1px] w-48 mx-auto mt-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    <div className="relative w-full aspect-[4/5] max-w-lg">
                        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 400 500">
                            {/* Definitions */}
                            <defs>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#9333ea" />
                                    <stop offset="100%" stopColor="#be123c" />
                                </linearGradient>
                            </defs>

                            {/* Connection Lines (Double Triangle Logic) */}
                            <g stroke="url(#lineGrad)" strokeWidth="1.5" opacity="0.4">
                                {/* BASE LINE (A-B-C-D) */}
                                <line x1="80" y1="250" x2="370" y2="250" strokeOpacity="0.2" />

                                {/* UPDWARD TRIANGLES (Essence) */}
                                <line x1="80" y1="250" x2="140" y2="180" /> {/* A -> E */}
                                <line x1="200" y1="250" x2="140" y2="180" /> {/* B -> E */}

                                <line x1="200" y1="250" x2="260" y2="180" /> {/* B -> F */}
                                <line x1="320" y1="250" x2="260" y2="180" /> {/* C -> F */}

                                <line x1="140" y1="180" x2="200" y2="110" /> {/* E -> G */}
                                <line x1="260" y1="180" x2="200" y2="110" /> {/* F -> G */}

                                <line x1="200" y1="110" x2="200" y2="50" /> {/* G -> H (Crown) */}

                                {/* DOWNWARD TRIANGLES (Shadows) - Expanding downwards */}
                                <line x1="80" y1="250" x2="140" y2="320" /> {/* A -> P */}
                                <line x1="200" y1="250" x2="140" y2="320" /> {/* B -> P */}

                                <line x1="200" y1="250" x2="260" y2="320" /> {/* B -> O */}
                                <line x1="320" y1="250" x2="260" y2="320" /> {/* C -> O */}

                                <line x1="140" y1="320" x2="200" y2="390" /> {/* P -> Q */}
                                <line x1="260" y1="320" x2="200" y2="390" /> {/* O -> Q */}

                                <line x1="200" y1="390" x2="200" y2="450" /> {/* Q -> S (Deep) */}

                                {/* Side Flanks (Bridges) */}
                                <line x1="80" y1="250" x2="40" y2="180" strokeDasharray="4 2" opacity="0.3" /> {/* A -> I? */}
                                <line x1="320" y1="250" x2="360" y2="180" strokeDasharray="4 2" opacity="0.3" /> {/* C -> J? */}
                            </g>

                            {/* NODES RENDERING */}
                            {(() => {
                                const Node = ({ x, y, val, label, color = "#9333ea", small = false }: any) => (
                                    <g
                                        transform={`translate(${x},${y})`}
                                        className="cursor-pointer hover:filter hover:brightness-125 transition-all group"
                                        onClick={() => scrollToCode(label)}
                                    >
                                        <circle r={small ? 14 : 20} fill="#0a0a0a" stroke={color} strokeWidth="2" filter="url(#glow)" className="group-hover:stroke-white transition-colors" />
                                        <text y={small ? 4 : 6} textAnchor="middle" fill="white" fontSize={small ? 10 : 14} fontWeight="bold" fontFamily="serif">{val}</text>
                                        <text y={small ? 28 : 38} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={small ? 8 : 10} fontWeight="bold" className="group-hover:fill-white transition-colors">{label}</text>
                                    </g>
                                );

                                const p = data.pinaculo || { a: '?', b: '?', c: '?', d: '?', e: '?', f: '?', g: '?', h: '?', i: '?', j: '?', k: '?', l: '?', m: '?', n: '?', o: '?', p: '?', q: '?', r: '?', s: '?' };

                                return (
                                    <>
                                        {/* MIDDLE BASE (Self) */}
                                        <Node x="80" y="250" val={p.a} label="A" color="#ef4444" />
                                        <Node x="200" y="250" val={p.b} label="B" color="#a855f7" />
                                        <Node x="320" y="250" val={p.c} label="C" color="#ef4444" />
                                        <Node x="375" y="250" val={p.d} label="D" color="#d946ef" small />

                                        {/* UPPER ESSENCE */}
                                        <Node x="140" y="180" val={p.e} label="E" color="#22c55e" />
                                        <Node x="260" y="180" val={p.f} label="F" color="#eab308" />
                                        <Node x="200" y="110" val={p.g} label="G" color="#22c55e" />
                                        <Node x="200" y="50" val={p.h} label="H" color="#fbbf24" />

                                        {/* LOWER SHADOWS */}
                                        <Node x="140" y="320" val={p.p} label="P" color="#f43f5e" small />
                                        <Node x="260" y="320" val={p.o} label="O" color="#f43f5e" small />
                                        <Node x="200" y="390" val={p.q} label="Q" color="#be123c" small />
                                        <Node x="200" y="450" val={p.s} label="S" color="#881337" small />
                                        <Node x="320" y="390" val={p.r} label="R" color="#be123c" small />

                                        {/* BRIDGES (Upper Right Quadrant) */}
                                        <Node x="280" y="110" val={p.i} label="I" color="#3b82f6" small />
                                        <Node x="320" y="50" val={p.j} label="J" color="#3b82f6" small />
                                    </>
                                )
                            })()}
                        </svg>
                    </div>
                </div>

                {/* Sidebar: CÓDIGOS DE VIDA */}
                <div className="w-full lg:w-96 rounded-[2rem] md:rounded-[3rem] bg-black/40 border border-white/5 overflow-hidden flex flex-col h-auto lg:lg:max-h-[800px]">
                    <div className="p-8 border-b border-white/5 bg-white/[0.02] backdrop-blur-md sticky top-0 z-10">
                        <div className="mb-0 mt-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-rose-500" />
                                Códigos de Vida
                            </h3>
                            <div className="h-[1px] w-full mt-2 bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
                        </div>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="lg:overflow-y-auto p-4 pb-24 lg:pb-4 space-y-2 custom-scrollbar flex-1 scroll-smooth"
                    >
                        {[
                            { l: 'A', t: 'Karma (Mes)', d: 'Tu tarea pendiente de otras vidas.', v: data.pinaculo?.a },
                            { l: 'B', t: 'Personalidad (Día)', d: 'La máscara que muestras al mundo y cómo te perciben.', v: data.pinaculo?.b },
                            { l: 'C', t: 'Vidas Pasadas (Año)', d: 'Lo que fuiste y traes contigo de encarnaciones previas.', v: data.pinaculo?.c },
                            { l: 'D', t: 'Esencia', d: 'Tu núcleo divino, ¿quién eres realmente en tu profundidad?', v: data.pinaculo?.d },
                            { l: 'E', t: 'Regalo Divino', d: 'Un talento concedido para esta vida.', v: data.pinaculo?.e },
                            { l: 'F', t: 'Destino', d: 'Hacia dónde te diriges inevitablemente.', v: data.pinaculo?.f },
                            { l: 'G', t: 'Misión de Vida', d: 'Tu propósito central de encarnación.', v: data.pinaculo?.g },
                            { l: 'H', t: 'Realización', d: 'El logro máximo de tu espíritu.', v: data.pinaculo?.h },
                            { l: 'I', t: 'Subconsciente', d: 'Deseos ocultos y motores internos.', v: data.pinaculo?.i },
                            { l: 'J', t: 'Inconsciente', d: 'Reacciones automáticas y sombra.', v: data.pinaculo?.j },
                            { l: 'N', t: 'Destino (Nombre)', d: 'Tu misión sonora y capacidad de manifestación.', v: data.nameNumber },
                            { l: 'P', t: 'Sombra Inmediata', d: 'Tu primer gran bloqueo.', v: data.pinaculo?.p },
                            { l: 'O', t: 'Inconsciente Negativo', d: 'Patrones repetitivos dañinos.', v: data.pinaculo?.o },
                            { l: 'Q', t: 'Ser Inferior Heredado', d: 'Carga ancestral no resuelta.', v: data.pinaculo?.q },
                            { l: 'R', t: 'Ser Inferior Consciente', d: 'Defectos que conoces pero no cambias.', v: data.pinaculo?.r },
                            { l: 'S', t: 'Ser Inferior Latente', d: 'El enemigo oculto final.', v: data.pinaculo?.s },
                        ].map((item, idx) => {
                            const numValue = Number(item.v);
                            const interp = PINNACLE_INTERPRETATIONS[numValue];
                            const isExpanded = expandedItem === item.l;

                            return (
                                <div
                                    key={idx}
                                    ref={el => { listRefs.current[item.l] = el; }}
                                    onClick={() => handleOpenModal(item.l, item.t, item.v)}
                                    className={cn(
                                        "group p-4 rounded-2xl bg-white/5 border border-white/5 transition-all cursor-pointer relative",
                                        (item.v !== undefined && item.v !== null && item.v !== '?')
                                            ? "hover:bg-purple-500/10 hover:border-purple-500/30"
                                            : "opacity-50 cursor-not-allowed",
                                        activeCode === item.l && "ring-2 ring-purple-500 bg-purple-500/20 border-purple-500/50 scale-[1.02] z-10 shadow-[0_0_20px_rgba(168,85,247,0.3)]",
                                        isExpanded && "bg-purple-900/40 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center text-xs font-bold text-white group-hover:bg-purple-500 group-hover:border-purple-400 transition-colors">
                                                {item.l}
                                            </div>
                                            <span className="text-sm font-bold text-violet-400 group-hover:text-violet-300 transition-colors">{item.t}</span>
                                        </div>
                                        <div className="w-10 aspect-[3/4] rounded-lg border border-purple-500/20 overflow-hidden bg-black/40 flex items-center justify-center flex-shrink-0 group-hover:border-purple-500/40 transition-all">
                                            <NeonNumber
                                                value={item.v ?? '?'}
                                                color="fuchsia"
                                                isFullCard={true}
                                                className="w-full h-full"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/50 pl-11 leading-relaxed border-l-2 border-white/10 ml-4">
                                        {item.d}
                                    </p>

                                    {/* Expanded Contents */}
                                    <AnimatePresence>
                                        {isExpanded && interp && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-4 pt-4 border-t border-white/10 text-sm text-white/70 overflow-hidden"
                                            >
                                                <div className="mb-4">
                                                    <p className="text-[11px] text-purple-300/70 uppercase tracking-widest font-bold mb-2">Arquetipo Maestro</p>
                                                    <p className="text-sm font-serif text-white/90 leading-relaxed italic border-l-2 border-purple-500/40 pl-3">
                                                        "{interp.archetype}"
                                                    </p>
                                                </div>

                                                <div className="space-y-3 mb-4">
                                                    {interp.blocks.map((block, i) => (
                                                        <p key={i} className="text-xs leading-relaxed text-white/80 font-serif text-justify">
                                                            {block}
                                                        </p>
                                                    ))}
                                                </div>

                                                {/* INTERPRETACIÓN PROFUNDA (PREMIUM FEATURE) */}
                                                <div
                                                    className={`mt-2 p-3 bg-gradient-to-br from-purple-900/60 to-slate-900/80 rounded-xl border border-purple-500/20 shadow-lg ${isPremium ? 'cursor-pointer hover:border-purple-400 transition-all active:scale-[0.98]' : 'opacity-80'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isPremium) {
                                                            alert('🔒 Función Premium\n\nDesbloquea el análisis sintético de tu pináculo con el plan Creador.');
                                                        } else {
                                                            setShowDeepInsight(showDeepInsight === item.l ? null : item.l);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                                                        <div className="w-3.5 h-3.5 flex items-center justify-center">⚡</div>
                                                        <span className="text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">Interpretación Profunda</span>
                                                        {isPremium && (
                                                            <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-500 ${showDeepInsight === item.l ? 'rotate-90' : ''}`} />
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-white/40 font-medium">{isPremium ? 'Toca para descubrir la síntesis evolutiva de tu número.' : 'Desbloquea la síntesis evolutiva de tu alma.'}</p>

                                                    <AnimatePresence>
                                                        {isPremium && showDeepInsight === item.l && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="mt-4 pt-4 border-t border-purple-500/30 overflow-hidden"
                                                            >
                                                                <div className="space-y-4 text-white/90 leading-relaxed">
                                                                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                                        <h4 className="text-purple-300 font-bold mb-1 text-sm uppercase tracking-wider">El Núcleo</h4>
                                                                        <p className="text-lg italic font-medium">
                                                                            "La frecuencia {numValue} actuando en tu {PINNACLE_POSITIONS[item.l]?.title || item.t}"
                                                                        </p>
                                                                        <p className="text-white/70 italic text-sm mt-3 pt-3 border-t border-purple-500/10 leading-relaxed">
                                                                            {PINNACLE_POSITIONS[item.l]?.context}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
