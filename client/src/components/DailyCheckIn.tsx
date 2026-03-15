import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useProtocol21 } from '../hooks/useProtocol21';
import { useCoherence } from '../hooks/useCoherence';
import { useSound } from '../hooks/useSound';
import { Leaf, Flame, Moon, Brain, Heart, Info, X } from 'lucide-react';
import { HexagonToggle } from './HexagonToggle';
import { useGuardianState } from '../contexts/GuardianContext';
import { SigilSyncToggle } from './SigilSyncToggle';
import { EvolutionBridge } from './EvolutionBridge';

interface DailyCheckInProps {
    currentDay: number;
    title?: string;
    purpose?: string;
    isCompletedToday?: boolean;
    onSuccess?: () => void;
}

const PILLARS = [
    {
        id: 'nutrition', icon: Leaf, title: 'Nutrición', color: 'emerald',
        info: 'Nutrición consciente de alta vibración. Mantener una estructura alta en proteína para síntesis óptima, baja en carbohidratos simples para estabilidad glucémica, y rica en grasas saludables. Mantiene tu cerebro activo, sin los picos de azúcar que distraen y agotan tu energía vital. Tu vehículo exige calidad.'
    },
    {
        id: 'movement', icon: Flame, title: 'Movimiento', color: 'orange',
        info: 'Ejercicio diario como transmutador natural. Estimula la circulación, oxigena tus músculos y segrega un coctel esencial de endorfinas y dopamina. Te ayuda a liberar el estrés acumulado (cortisol) y ancla tu sistema nervioso central en un estado de resiliencia y acción.'
    },
    {
        id: 'sleep', icon: Moon, title: 'Sueño', color: 'indigo',
        info: 'Calidad de descanso 8+ horas. Es el laboratorio de la neuroplasticidad. Mientras duermes, tu cerebro consolida los aprendizajes del día y limpia toxinas. Mantener un ritmo circadiano estable es el cimiento absoluto para una arquitectura mental invencible.'
    },
    {
        id: 'connection', icon: Brain, title: 'Conexión', color: 'violet',
        info: '20 minutos de meditación o respiración táctica diaria. Calibra tu córtex prefrontal, mejora el enfoque y diluye la reactividad emocional. Es el momento arquitectónico donde pasas de estar en "modo supervivencia" a "modo diseño de realidad".'
    },
    {
        id: 'gratitude', icon: Heart, title: 'Gratitud', color: 'rose',
        info: 'El código fuente vibracional. Al agradecer genuinamente lo que posees y lo que estás construyendo, reprogramas el Sistema Activador Reticular (SAR) del cerebro para buscar oportunidades en lugar de amenazas. Transforma el paradigma mental de la escasez a la abundancia estructural.'
    }
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
    currentDay,
    title = 'Integrar un nuevo hábito',
    purpose = 'Evolución guiada por la disciplina',
    isCompletedToday = false,
    onSuccess
}) => {
    const { completeDay, activeProtocol, evolveProtocol, archiveProtocol } = useProtocol21();
    const { logAction } = useCoherence();
    const { playSound } = useSound();
    const { saveRituals } = useGuardianState();

    const [note, setNote] = useState('');
    const [completing, setCompleting] = useState(false);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);
    const [checks, setChecks] = useState<Record<string, boolean>>({
        nutrition: false,
        movement: false,
        sleep: false,
        connection: false,
        gratitude: false
    });

    // Load today's checks from localStorage if any
    const todayStr = new Date().toISOString().split('T')[0];
    useEffect(() => {
        const stored = localStorage.getItem(`elemental_lab_${todayStr}`);
        if (stored) {
            try {
                setChecks(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, [todayStr]);

    const handleCheck = (id: string) => {
        if (isCompletedToday) return;
        const newState = !checks[id];
        const updatedChecks = { ...checks, [id]: newState };
        setChecks(updatedChecks);
        localStorage.setItem(`elemental_lab_${todayStr}`, JSON.stringify(updatedChecks));
        playSound(newState ? 'success' : 'click');
    };

    const handleComplete = async () => {
        if (!note.trim() || isCompletedToday) return;
        setCompleting(true);
        try {
            // Include pillars in the note or save them separately if we had the field
            const pillarsSummary = Object.entries(checks)
                .filter(([_, val]) => val)
                .map(([key, _]) => key.toUpperCase())
                .join(', ');

            const fullNote = `[PILLARS: ${pillarsSummary || 'NONE'}] ${note}`;

            await completeDay(currentDay, fullNote);
            await logAction('PROTOCOL_DAY_COMPLETE');

            // Sync with Guardian Context
            await saveRituals(currentDay, checks as any);

            playSound('success');
            setNote('');

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCompleting(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            {/* Objective Display */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-cyan-900/10 to-black/40 border border-cyan-500/10 p-6 rounded-2xl text-center relative overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <p className="text-[8px] uppercase tracking-[0.3em] text-cyan-500 mb-2 font-black flex items-center justify-center gap-2">
                    <span className="w-4 h-[1px] bg-cyan-500/40"></span>
                    Objetivo Alquímico
                    <span className="w-4 h-[1px] bg-cyan-500/40"></span>
                </p>
                <h2 className="text-2xl text-white font-light tracking-wide">{title}</h2>
                <p className="text-xs text-white/40 italic mt-3 max-w-xl mx-auto leading-relaxed">"{purpose}"</p>
            </motion.div>

            {/* Daily Input */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                <h3 className="text-[10px] uppercase tracking-widest text-white/50 mb-6 px-2 text-center">Ritual de Cierre - Día {currentDay}</h3>

                {isCompletedToday ? (
                    <div className="p-6 text-center text-cyan-500/80 italic text-sm">
                        El día {currentDay} ha sido sellado exitosamente. Descansa, Arquitecto.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Biophysical Pillars */}
                        <div className="relative">
                            <div className="flex justify-center gap-6 sm:gap-10 py-6 px-4 overflow-x-auto pb-8 border-b border-white/5 relative z-10">
                                {PILLARS.map((pillar) => (
                                    <div key={pillar.id} className="relative flex flex-col items-center gap-4 min-w-[100px]">

                                        {/* Main Hexagon Marker */}
                                        <HexagonToggle
                                            checked={checks[pillar.id]}
                                            onClick={() => handleCheck(pillar.id)}
                                            color={pillar.color}
                                        />

                                        <div className="text-center space-y-3">
                                            <span className={cn(
                                                "text-[9px] uppercase font-black tracking-[0.2em] block",
                                                checks[pillar.id] ? `text-${pillar.color}-400` : "text-white/30"
                                            )}>
                                                {pillar.title}
                                            </span>

                                            {/* Control Console */}
                                            <div className="flex items-center justify-center gap-3">
                                                {/* Info Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveInfo(activeInfo === pillar.id ? null : pillar.id);
                                                    }}
                                                    className={cn(
                                                        "p-2 rounded-xl border transition-all duration-300",
                                                        activeInfo === pillar.id
                                                            ? `bg-${pillar.color}-500/20 text-${pillar.color}-400 border-${pillar.color}-500/40 shadow-[0_0_15px_currentColor]`
                                                            : "bg-white/[0.03] text-white/20 border-white/5 hover:text-white/50 hover:bg-white/10"
                                                    )}
                                                    title="Arquitectura del Hábito"
                                                >
                                                    {activeInfo === pillar.id ? <X size={14} strokeWidth={3} /> : <Info size={14} strokeWidth={2.5} />}
                                                </button>

                                                {/* Sigil Sync Button */}
                                                {activeProtocol && (
                                                    <SigilSyncToggle
                                                        userId={activeProtocol.user_id}
                                                        aspect={pillar.id}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tooltip Content Panel */}
                            <AnimatePresence mode="wait">
                                {activeInfo && (
                                    <motion.div
                                        key={activeInfo}
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="overflow-hidden relative z-0"
                                    >
                                        <div className="mt-4 p-5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl relative">
                                            {(() => {
                                                const activeData = PILLARS.find(p => p.id === activeInfo);
                                                if (!activeData) return null;
                                                return (
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(`mt-1 p-2 rounded-full border border-${activeData.color}-500/20 bg-${activeData.color}-500/10 text-${activeData.color}-400 shadow-[0_0_15px_rgba(var(--${activeData.color}),0.2)]`)}>
                                                            <activeData.icon size={18} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className={cn(`text-xs font-bold uppercase tracking-widest text-${activeData.color}-400`)}>Arquitectura de {activeData.title}</h4>
                                                            <p className="text-sm text-white/80 leading-relaxed font-serif italic">"{activeData.info}"</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[8px] uppercase tracking-widest text-white/30 ml-2">Bitácora de Coherencia</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="¿Cómo mantuviste el pacto hoy? Escribe tus reflexiones..."
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                            />
                        </div>

                        <button
                            disabled={!note.trim() || completing}
                            onClick={handleComplete}
                            className={cn(
                                "w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 relative overflow-hidden group",
                                note.trim()
                                    ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                    : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                            )}
                        >
                            {note.trim() && <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />}
                            <span className="relative z-10">{completing ? "Sellando..." : "Sellar Día"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Bridge of Evolution Modal */}
            <EvolutionBridge
                isOpen={activeProtocol?.status === 'awaiting_evolution'}
                onEvolve={evolveProtocol}
                onArchive={archiveProtocol}
            />
        </div>
    );
};
