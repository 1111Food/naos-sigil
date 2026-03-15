import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Hexagon, Sun, Hash, Shield, Zap } from 'lucide-react';

interface ArchetypeDecodifierProps {
    desglose?: {
        scores: Record<string, number>;
        contribuciones: {
            astrologia: string[];
            maya: string[];
            chino: string[];
            numerologia: string[];
        }
    };
    archColor?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ArchetypeDecodifier: React.FC<ArchetypeDecodifierProps> = ({ desglose, archColor = '#06b6d4', isOpen, onClose }) => {
    if (!desglose) return null;

    const schoolConfig = [
        { id: 'astrologia', label: 'Astrología', icon: Sun, color: '#f59e0b', items: desglose.contribuciones.astrologia },
        { id: 'numerologia', label: 'Numerología', icon: Hash, color: '#10b981', items: desglose.contribuciones.numerologia },
        { id: 'maya', label: 'Calendario Maya', icon: Shield, color: '#6366f1', items: desglose.contribuciones.maya },
        { id: 'chino', label: 'Horóscopo Chino', icon: Zap, color: '#f43f5e', items: desglose.contribuciones.chino },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden w-full max-w-4xl mx-auto"
                >
                    <div className="p-6 rounded-3xl bg-black/40 backdrop-blur-md border border-white/5 space-y-6 mt-4 relative">
                        {/* HEADER */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Hexagon size={16} style={{ color: archColor }} className="animate-pulse" />
                                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/60 font-black">Decodificación de Frecuencia</h4>
                            </div>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors text-xs">
                                Cerrar
                            </button>
                        </div>

                        {/* GRID DE ESCUELAS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {schoolConfig.map((school) => {
                                const Icon = school.icon;
                                return (
                                    <div key={school.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 hover:bg-white/[0.03] transition-colors group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg border border-white/10" style={{ color: school.color, backgroundColor: `${school.color}11` }}>
                                                <Icon size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">
                                                {school.label}
                                            </span>
                                        </div>
                                        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                                        <ul className="space-y-1">
                                            {school.items.map((item, i) => (
                                                <li key={i} className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    {item}
                                                </li>
                                            ))}
                                            {school.items.length === 0 && (
                                                <li className="text-[9px] italic text-white/20">Sincronizando...</li>
                                            )}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>

                        {/* TOTAL SCORES (LA ECUACIÓN) */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-transparent via-white/[0.02] to-transparent border-y border-white/5">
                            <div className="flex flex-wrap justify-around items-center gap-4">
                                {Object.entries(desglose.scores).map(([elem, score]) => {
                                    const elementColors: Record<string, string> = { fuego: '#f43f5e', tierra: '#f59e0b', aire: '#06b6d4', agua: '#6366f1' };
                                    const color = elementColors[elem] || '#fff';
                                    return (
                                        <div key={elem} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                            <span className="text-[10px] uppercase tracking-wider text-white/60">{elem}:</span>
                                            <span className="text-xs font-bold text-white" style={{ color: score > 0 ? color : undefined }}>{score} pts</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* MICRO-ANIMATION OR HIGHLIGHT */}
                        <div className="flex items-center justify-center gap-2 text-[9px] text-white/30 uppercase tracking-[0.2em] font-light">
                            <Sparkles size={10} style={{ color: archColor }} />
                            <span>La frecuencia más alta determina tu Arcano Maestro</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
