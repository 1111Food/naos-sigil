import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Sun, Target, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface CoherenceDetailOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    metrics: {
        global: number;
        discipline: number;
        energy: number;
        clarity: number;
    };
}

export const CoherenceDetailOverlay: React.FC<CoherenceDetailOverlayProps> = ({ isOpen, onClose, metrics }) => {
    const stats = [
        {
            label: 'COHERENCIA GLOBAL',
            value: metrics.global,
            icon: Target,
            color: 'text-white',
            bg: 'bg-white/5',
            border: 'border-white/20',
            desc: 'Sincronía biopsicosocial total.',
            info: {
                how: 'Integra las 3 métricas base en una meta-puntuación.',
                measures: 'El equilibrio dinámico entre intención, acción y vitalidad.'
            }
        },
        {
            label: 'DISCIPLINA',
            value: metrics.discipline,
            icon: Trophy,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/30',
            desc: 'Rigor en rituales sagrados.',
            info: {
                how: 'Premia la constancia diaria en protocolos.',
                measures: 'Tu capacidad de mantener compromisos con tu arquitectura interna.'
            }
        },
        {
            label: 'ENERGÍA',
            value: metrics.energy,
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            desc: 'Vitalidad pránica disponible.',
            info: {
                how: 'Se regenera con descanso y se consume con acción.',
                measures: 'Reservas biológicas para manifestar cambios en el éter.'
            }
        },
        {
            label: 'CLARIDAD',
            value: metrics.clarity,
            icon: Sun,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/30',
            desc: 'Nitidez del propósito mental.',
            info: {
                how: 'Alineada con tránsitos y rituales de enfoque.',
                measures: 'Reducción del ruido cognitivo y alineación con la Verdad.'
            }
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#050505] border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* DECORATIVE ELEMENTS */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

                        <div className="mb-12 flex items-start justify-between">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 mb-2 font-black">Métricas de Sintonización</h3>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-serif italic text-white/90">Interfaz de Medición</h2>
                                    <div className="relative group/global-info">
                                        <Info size={18} className="text-cyan-400/40 hover:text-cyan-400 transition-colors cursor-help mt-1" />
                                        <div className="absolute top-0 left-full ml-4 w-72 p-5 rounded-2xl bg-black/95 border border-white/10 backdrop-blur-xl opacity-0 invisible group-hover/global-info:opacity-100 group-hover/global-info:visible transition-all z-[210] shadow-2xl">
                                            <div className="space-y-4">
                                                <h4 className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold border-b border-white/5 pb-2">Propósito del Dashboard</h4>
                                                <p className="text-[10px] text-white/80 leading-relaxed">
                                                    Este panel refleja tu **Estado de Coherencia** actual. Es un espejo dinámico de tu alineación interna y externa.
                                                </p>
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <div className="w-1 h-auto bg-cyan-500/50 rounded-full" />
                                                        <div className="text-[9px] text-white/60 leading-tight">
                                                            <strong className="text-white">Dinámica:</strong> Las métricas fluctúan según tus rituales, protocolos, meditaciones y ejercicios de respiración.
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <div className="w-1 h-auto bg-purple-500/50 rounded-full" />
                                                        <div className="text-[9px] text-white/60 leading-tight">
                                                            <strong className="text-white">Consciencia:</strong> Un registro en tiempo real de tu paz mental y presencia en el Templo.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "p-6 rounded-3xl border transition-all duration-500 group relative",
                                        stat.bg,
                                        stat.border,
                                        "hover:bg-white/[0.08]"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("p-3 rounded-2xl bg-black/40 border border-white/5", stat.color)}>
                                                <stat.icon size={24} />
                                            </div>
                                            <div>
                                                <div className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{stat.label}</div>
                                                <div className="text-2xl font-black text-white">{stat.value.toFixed(1)}%</div>
                                            </div>
                                        </div>
                                        
                                        <div className="relative group/info">
                                            <Info size={14} className="text-white/20 hover:text-white/60 transition-colors cursor-help" />
                                            <div className="absolute top-full right-0 mt-2 w-48 p-3 rounded-xl bg-black/90 border border-white/10 backdrop-blur-md opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-20 shadow-xl">
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="text-[7px] uppercase tracking-widest text-cyan-400 mb-0.5">Mecánica</div>
                                                        <div className="text-[9px] text-white/70 leading-tight">{stat.info.how}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[7px] uppercase tracking-widest text-purple-400 mb-0.5">Qué Mide</div>
                                                        <div className="text-[9px] text-white/70 leading-tight">{stat.info.measures}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed font-light">
                                        {stat.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 text-center">
                            <button
                                onClick={onClose}
                                className="px-12 py-3 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-cyan-500/40 transition-all hover:scale-105"
                            >
                                Sincronización Completa
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
