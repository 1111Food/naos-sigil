import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useProtocol21 } from '../hooks/useProtocol21';
import { useCoherence } from '../hooks/useCoherence';
import { useSound } from '../hooks/useSound';
import { Leaf, Flame, Moon, Brain, Heart, Info, X } from 'lucide-react';
import { HexagonToggle } from './HexagonToggle';
import { useGuardianState } from '../contexts/GuardianContext';
import { EvolutionBridge } from './EvolutionBridge';
import { ProtocolReminderModal } from './Protocol21/ProtocolReminderModal';
import { useTranslation } from '../i18n';

interface DailyCheckInProps {
    currentDay: number;
    title?: string;
    purpose?: string;
    isCompletedToday?: boolean;
    onSuccess?: () => void;
}

const PILLARS_DATA = [
    { id: 'nutrition', icon: Leaf, titleKey: 'protocol_pillar_nutrition', color: 'emerald', infoKey: 'protocol_desc_nutrition' },
    { id: 'movement', icon: Flame, titleKey: 'protocol_pillar_movement', color: 'orange', infoKey: 'protocol_desc_movement' },
    { id: 'sleep', icon: Moon, titleKey: 'protocol_pillar_sleep', color: 'indigo', infoKey: 'protocol_desc_sleep' },
    { id: 'connection', icon: Brain, titleKey: 'protocol_pillar_connection', color: 'violet', infoKey: 'protocol_desc_connection' },
    { id: 'gratitude', icon: Heart, titleKey: 'protocol_pillar_gratitude', color: 'rose', infoKey: 'protocol_desc_gratitude' }
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
    currentDay,
    title,
    purpose,
    isCompletedToday = false,
    onSuccess
}) => {
    const { t } = useTranslation();
    
    // Fallback localized defaults
    const displayTitle = title || t('protocol_integration_title' as any) || 'Integrar un nuevo hábito';
    const displayPurpose = purpose || t('protocol_evolution_purpose' as any) || 'Evolución guiada por la disciplina';
    const { completeDay, activeProtocol, evolveProtocol, archiveProtocol } = useProtocol21();
    const { logAction } = useCoherence();
    const { playSound } = useSound();
    const { saveRituals } = useGuardianState();

    const [note, setNote] = useState('');
    const [completing, setCompleting] = useState(false);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [checks, setChecks] = useState<Record<string, boolean>>({
        nutrition: false,
        movement: false,
        sleep: false,
        connection: false,
        gratitude: false
    });

    const [floatingText, setFloatingText] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
    const [shakeCount, setShakeCount] = useState(0);

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

    const handleComplete = async (e: React.MouseEvent) => {
        const checkedCount = Object.values(checks).filter(Boolean).length;
        
        if (checkedCount < 3) {
            setShakeCount(prev => prev + 1);
            playSound('click'); // Reject sound or click
            return;
        }

        if (!note.trim() || isCompletedToday) return;
        setCompleting(true);
        try {
            const pillarsSummary = Object.entries(checks)
                .filter(([_, val]) => val)
                .map(([key, _]) => key.toUpperCase())
                .join(', ');

            const fullNote = `[PILLARS: ${pillarsSummary || 'NONE'}] ${note}`;

            await completeDay(currentDay, fullNote);
            await logAction('PROTOCOL_DAY_COMPLETE');

            // Sync with Guardian Context
            await saveRituals(currentDay, checks as any);

            const rewards = [`+3 ${t('discipline')}`, t('protocol_day_validated'), t('protocol_streak_sustained')];
            const randomText = rewards[Math.floor(Math.random() * rewards.length)];

            // Trigger floating dopamine score
            const clickX = e.clientX || window.innerWidth / 2;
            const clickY = e.clientY || window.innerHeight / 2;
            setFloatingText([{ id: Date.now(), x: clickX, y: clickY, text: randomText }]);

            playSound('success');
            setNote('');

            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1200);
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
                whileHover={{ scale: 1.01, backgroundColor: "rgba(6, 182, 212, 0.05)" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsReminderModalOpen(true)}
                className="bg-gradient-to-br from-cyan-900/10 to-black/40 border border-cyan-500/10 p-6 rounded-2xl text-center relative overflow-hidden cursor-pointer group transition-all duration-500 hover:border-cyan-500/30"
                title={t('protocol_alchemical_objective_alt' as any)}
            >
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <p className="text-[8px] uppercase tracking-[0.3em] text-cyan-500 mb-2 font-black flex items-center justify-center gap-2 group-hover:text-cyan-400 transition-colors">
                    <span className="w-4 h-[1px] bg-cyan-500/40"></span>
                    {t('protocol_alchemical_objective')}
                    <span className="w-4 h-[1px] bg-cyan-500/40"></span>
                </p>
                <h2 className="text-2xl text-white font-light tracking-wide group-hover:text-cyan-100 transition-colors">{t(displayTitle as any) || displayTitle}</h2>
                <p className="text-xs text-white/40 italic mt-3 max-w-xl mx-auto leading-relaxed">"{t(displayPurpose as any) || displayPurpose}"</p>
                
                {/* Visual indicator of settings */}
                <div className="absolute bottom-2 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[7px] uppercase tracking-widest text-cyan-500/60">{t('protocol_reminder_setup' as any)}</span>
                    <Info size={10} className="text-cyan-500/40" />
                </div>
            </motion.div>

            {/* Daily Input */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                <h3 className="text-[10px] uppercase tracking-widest text-white/50 mb-6 px-2 text-center">{t('protocol_closing_ritual')} - {t('protocol_day_label')} {currentDay}</h3>

                {isCompletedToday ? (
                    <div className="p-6 text-center text-cyan-500/80 italic text-sm">
                        {t('protocol_day_completed', { day: currentDay })}. {t('protocol_rest_architect') || 'Descansa, Arquitecto.'}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Biophysical Pillars */}
                        <div className="relative">
                             {/* Active Pillar Background Text */}
                             {activeInfo && (
                                 <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden">
                                     <span className="text-[20vw] font-black text-white/[0.02] leading-none tracking-tighter uppercase whitespace-nowrap">
                                         {t(PILLARS_DATA.find(p => p.id === activeInfo)?.titleKey as any).toUpperCase().split('/')[0]}
                                     </span>
                                 </div>
                             )}
                             <div className="flex justify-center gap-1 sm:gap-4 py-6 px-2 pb-8 border-b border-white/5 relative z-10">
                                 {PILLARS_DATA.map((pillar) => (
                                     <div key={pillar.id} className="relative flex flex-col items-center gap-3 w-[65px] sm:w-[90px]">

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
                                                {t(pillar.titleKey as any)}
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
                                                const activeData = PILLARS_DATA.find(p => p.id === activeInfo);
                                                if (!activeData) return null;
                                                return (
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(`mt-1 p-2 rounded-full border border-${activeData.color}-500/20 bg-${activeData.color}-500/10 text-${activeData.color}-400 shadow-[0_0_15px_rgba(var(--${activeData.color}),0.2)]`)}>
                                                            <activeData.icon size={18} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className={cn(`text-xs font-bold uppercase tracking-widest text-${activeData.color}-400`)}>{t('identity_nexus_title')}: {t(activeData.titleKey as any)}</h4>
                                                            <p className="text-sm text-white/80 leading-relaxed font-serif italic">"{t(activeData.infoKey as any)}"</p>
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
                            <label className="text-[8px] uppercase tracking-widest text-white/30 ml-2">{t('protocol_log_title')}</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={t('protocol_log_placeholder') || "¿Cómo mantuviste el pacto hoy? Escribe tus reflexiones..."}
                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                            />
                        </div>

                        {/* Minimum pillars warning */}
                        {Object.values(checks).filter(Boolean).length < 3 && (
                            <p className="text-center text-[10px] text-amber-500/80 uppercase tracking-widest font-mono">
                                {t('protocol_min_pillars_warning')}
                            </p>
                        )}

                        <motion.div
                            animate={shakeCount > 0 ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <button
                                disabled={!note.trim() || completing}
                                onClick={handleComplete}
                                className={cn(
                                    "w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 relative overflow-hidden group",
                                    note.trim() && Object.values(checks).filter(Boolean).length >= 3
                                        ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                        : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                )}
                            >
                                {note.trim() && <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />}
                                <span className="relative z-10">{completing ? t('protocol_sealing') : t('protocol_seal_code')}</span>
                            </button>
                        </motion.div>

                        {/* Floating Action Rewards */}
                        <AnimatePresence>
                            {floatingText.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                                    animate={{ opacity: 0, y: -80, scale: 1.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    onAnimationComplete={() => setFloatingText([])}
                                    style={{ left: item.x - 40, top: item.y - 120 }}
                                    className="fixed pointer-events-none z-[9999] text-amber-500 font-serif italic text-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                                >
                                    {item.text}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Bridge of Evolution Modal */}
            <EvolutionBridge
                isOpen={activeProtocol?.status === 'awaiting_evolution'}
                onEvolve={evolveProtocol}
                onArchive={archiveProtocol}
            />

            {/* Protocol Reminder Modal */}
            {activeProtocol && (
                <ProtocolReminderModal
                    isOpen={isReminderModalOpen}
                    onClose={() => setIsReminderModalOpen(false)}
                    userId={activeProtocol.user_id}
                />
            )}
        </div>
    );
};
