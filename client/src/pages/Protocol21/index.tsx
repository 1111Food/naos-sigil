import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Shield, RotateCcw, BookOpen, X, Sparkles } from 'lucide-react';
import { useProtocol21 } from '../../hooks/useProtocol21';
import { TempleLoading } from '../../components/TempleLoading';
import { WisdomButton } from '../../components/WisdomOverlay';
import { ProtocolWizard } from '../../components/ProtocolWizard';
import { ProtocolVault } from '../../components/Protocol21/ProtocolVault';
import { ProtocolRitual } from '../../components/Protocol21/ProtocolRitual';
import { useProfile } from '../../hooks/useProfile';
import { DailyCheckIn } from '../../components/DailyCheckIn';
import { useTranslation } from '../../i18n';
import { cn } from '../../lib/utils';
import { getDailySynchronyQuote } from '../../utils/dailyOracle';

const getProtocolPhase = (day: number) => {
    // Note: These phases are currently VISUAL ONLY in UX. 
    // They do not dictate actual backend logic or product behavior.
    
    // Determine cycle-agnostic day number
    const cycleDay = day > 21 ? ((day - 22) % 90) + 1 : day;
    
    if (cycleDay >= 1 && cycleDay <= 6) return { name: 'BUILD', color: 'text-cyan-400' };
    if (cycleDay === 7) return { name: 'REFLECT', color: 'text-amber-400' };
    if (cycleDay >= 8 && cycleDay <= 13) return { name: 'DEEPEN', color: 'text-emerald-400' };
    if (cycleDay === 14) return { name: 'RECALIBRATE', color: 'text-purple-400' };
    if (cycleDay >= 15 && cycleDay <= 20) return { name: 'INTEGRATE', color: 'text-blue-400' };
    if (cycleDay === 21) return { name: 'EVOLVE', color: 'text-fuchsia-400' };
    return { name: 'TRANSFORM', color: 'text-cyan-400' }; // Fallback
};

interface Protocol21Props {
    onBack: () => void;
}

export const Protocol21: React.FC<Protocol21Props> = ({ onBack }) => {
    const { t, language } = useTranslation();
    const { activeProtocol, dailyLogs, loading, completedCount, resetProtocol, startProtocol, evolveProtocol } = useProtocol21();
    const { profile } = useProfile();
    const [showDailySuccess, setShowDailySuccess] = useState(false);
    const [showRitualInfo, setShowRitualInfo] = useState(false); // New state for 'i' info button
    const [showVault, setShowVault] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showRitual, setShowRitual] = useState(true);

    const playMysticChime = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // Deep ambient base
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, ctx.currentTime); // A2
            osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 2);

            // High crystal chime
            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc2.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 1);

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

            osc.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            osc2.start();
            osc.stop(ctx.currentTime + 2);
            osc2.stop(ctx.currentTime + 2);

            if ('vibrate' in navigator) {
                navigator.vibrate([30, 50, 20]); // Subtle double pulse haptics
            }
        } catch (e) {
            console.log('Audio/Haptics not supported');
        }
    };

    const handleReset = async () => {
        if (window.confirm(t('protocol_reset_confirm'))) {
            await resetProtocol();
        }
    };

    if (loading) return <TempleLoading text={t('protocol_synchronizing')} />;

    if (!activeProtocol) {
        return (
            <div className="min-h-screen bg-black/40 text-white pb-24 font-sans backdrop-blur-3xl pt-12">
                <header className="sticky top-0 z-40 bg-transparent p-6 mb-8">
                    <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-full" aria-label="Go back">
                        <ArrowLeft size={20} />
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                        className="text-center mt-6 px-4"
                    >
                        <p className="font-serif italic text-white/50 text-sm md:text-base tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            "{getDailySynchronyQuote(language as any)}"
                        </p>
                    </motion.div>
                </header>
                {showRitual ? (
                    <ProtocolRitual onComplete={() => setShowRitual(false)} />
                ) : (
                    <ProtocolWizard
                        userId={profile?.id || ''}
                        onProtocolCreated={async () => {
                            try {
                                await startProtocol();
                            } catch (err: any) {
                                alert(err.message || t('identity_error_generic'));
                            }
                        }}
                        onCancel={onBack}
                    />
                )}
            </div>
        );
    }

    if (showVault) {
        return (
            <div className="min-h-screen bg-black/40 text-white pb-24 font-sans backdrop-blur-3xl pt-12">
                <header className="sticky top-0 z-40 bg-transparent p-6 mb-8">
                    <button onClick={() => setShowVault(false)} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-full" aria-label="Close Vault">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-serif italic text-amber-500 text-center">{t('akashic_title')}</h1>
                </header>
                <ProtocolVault userId={profile?.id || ''} onClose={() => setShowVault(false)} />
            </div>
        )
    }

    if (activeProtocol.status === 'awaiting_evolution') {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 blur-[120px] rounded-full animate-pulse-slow pointer-events-none" />
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 max-w-md w-full text-center space-y-10"
                >
                    <div className="space-y-4">
                        <Shield size={64} className="mx-auto text-cyan-500/80 mb-8 stroke-[1.5]" />
                        <h1 className="text-3xl md:text-4xl font-serif italic text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            {activeProtocol.target_days} DAYS COMPLETE
                        </h1>
                        <p className="text-sm text-cyan-400/80 uppercase tracking-[0.3em] font-bold">
                            The foundation is built
                        </p>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 text-left shadow-lg backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-widest text-white/50">Your foundation was built on:</p>
                        <p className="text-base font-serif italic text-white/90">"{activeProtocol.purpose}"</p>
                        
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <label className="text-xs uppercase tracking-widest text-cyan-400/80 font-bold block">How would you like to deepen it?</label>
                            <textarea
                                value={newIntention}
                                onChange={(e) => setNewIntention(e.target.value)}
                                placeholder="Enter your intention for Cycle II..."
                                className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4 space-y-6">
                        <button
                            disabled={isEvolving || !newIntention.trim()}
                            onClick={async () => {
                                setIsEvolving(true);
                                try {
                                    await evolveProtocol(newIntention);
                                } catch (e: any) {
                                    // Separar errores técnicos de lógicos (e.g., fetch failed = red)
                                    const msg = e.message?.toLowerCase().includes("fetch") 
                                        ? "Network offline. Please check your connection."
                                        : e.message || "Error starting evolution";
                                    alert(msg);
                                } finally {
                                    setIsEvolving(false);
                                }
                            }}
                            className={cn(
                                "px-10 py-4 border rounded-full uppercase tracking-[0.2em] text-xs font-bold transition-all duration-500 w-full",
                                isEvolving || !newIntention.trim()
                                    ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                                    : "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                            )}
                        >
                            {isEvolving ? "Evolving..." : "Begin Evolution"}
                        </button>
                        
                        <button onClick={onBack} className="text-[10px] text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors">
                            Return to Temple
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }
    const currentDay = activeProtocol.current_day;
    const isDayCompletedRaw = dailyLogs.some(l => l.day_number === currentDay);

    const isCycleII = activeProtocol.target_days === 90;
    const displayTarget = isCycleII ? 69 : 21;
    const displayDay = isCycleII && currentDay > 21 ? currentDay - 21 : currentDay;
    const cycleLabel = isCycleII ? "CYCLE II" : "CYCLE I";
    
    const currentPhase = getProtocolPhase(currentDay);

    return (
        <div className="min-h-screen bg-black/40 text-white pb-24 font-sans backdrop-blur-3xl">
            <AnimatePresence>
                {showDailySuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95">
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} className="relative">
                            <Shield size={120} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />
                            <Check size={40} className="absolute bottom-0 right-0 text-white bg-amber-600 rounded-full p-2" />
                        </motion.div>
                        <h2 className="mt-12 text-3xl font-serif italic text-amber-100">{t('protocol_frequency_elevated')}</h2>
                        <p className="mt-4 text-amber-500 uppercase tracking-widest text-sm">{t('protocol_day_completed', { day: currentDay })}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Overlay (Feed style) */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[999] bg-[#0a0a0b]/98 backdrop-blur-3xl overflow-y-auto"
                    >
                        <div className="max-w-2xl mx-auto px-6 py-12 min-h-full">
                            <div className="flex items-center justify-between mb-12 sticky top-0 py-4 bg-[#0a0a0b]/80 z-10 border-b border-white/5">
                                <h2 className="text-2xl font-serif italic text-white flex items-center gap-3">
                                    <BookOpen className="text-cyan-500" />
                                    {t('protocol_log_title')}
                                </h2>
                                <button onClick={() => setShowHistory(false)} className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-500/50" aria-label="Close History">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {dailyLogs.length === 0 ? (
                                    <div className="text-center py-20 text-white/30 italic font-serif">
                                        {t('protocol_empty_log')}
                                    </div>
                                ) : (
                                    dailyLogs
                                        .slice()
                                        .sort((a, b) => b.day_number - a.day_number) // Newest first
                                        .map((log) => {
                                            // Parse the [PILLARS: X, Y] tag from the note
                                            const noteStr = log.notes || t('protocol_day_validated');
                                            const pillarMatch = noteStr.match(/\[PILLARS: (.*?)\]/);
                                            const pillarsText = pillarMatch ? pillarMatch[1] : t('unknown');
                                            const cleanNote = noteStr.replace(/\[PILLARS: .*?\]\s*/, "").trim() || t('protocol_day_validated');

                                            return (
                                                <motion.div
                                                    key={log.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    className="bg-black/40 border border-white/10 p-6 rounded-3xl relative overflow-hidden group"
                                                >
                                                    {/* Cyber Accent */}
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors" />

                                                    <div className="flex items-center justify-between mb-4 pl-4">
                                                        <span className="text-xs uppercase tracking-[0.2em] font-black text-cyan-400">
                                                            {t('protocol_day_label')} {log.day_number}
                                                        </span>
                                                        <span className="text-[10px] text-white/20 uppercase tracking-widest">
                                                            {new Date((log as any).created_at || Date.now()).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <p className="text-white/80 font-serif leading-relaxed mb-6 pl-4 text-sm md:text-base">
                                                        "{cleanNote || t('protocol_no_reflection')}"
                                                    </p>

                                                    <div className="pl-4 border-t border-white/5 pt-4 flex items-start gap-2">
                                                        <Sparkles size={12} className="text-amber-500 mt-0.5" />
                                                        <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold leading-tight">
                                                            {t('protocol_active_pillars')}: <span className="text-amber-500/80">{pillarsText}</span>
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/5 p-6">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-serif italic">{t('protocols')}</h1>
                        <span className="text-[10px] uppercase tracking-widest text-cyan-400">
                            {cycleLabel} · {t('protocol_day_label')} {displayDay} / {displayTarget}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Modified Info Button calling ProtocolRitual instead of WisdomOverlay */}
                        <WisdomButton color="emerald" onClick={() => setShowRitualInfo(true)} />

                        {/* Bitácora History Button */}
                        <button onClick={() => setShowHistory(true)} className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/70 hover:text-cyan-400 flex items-center gap-2 border border-cyan-500/20 bg-cyan-900/10 px-4 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <BookOpen size={12} />
                            {t('protocol_log_title')}
                        </button>

                        {completedCount > 0 && (
                            <button onClick={() => setShowVault(true)} className="text-[10px] uppercase tracking-[0.2em] text-amber-500/70 hover:text-amber-400 flex items-center gap-2 border border-amber-500/20 bg-amber-900/10 px-4 py-2 rounded-full transition-all duration-300 relative group shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                {t('protocol_vault_title')}
                                <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full text-[9px] font-black">{completedCount}</span>
                            </button>
                        )}
                        <button onClick={handleReset} className="text-[10px] uppercase tracking-wider text-white/30 hover:text-red-400 flex items-center gap-1">
                            <RotateCcw size={12} /> {t('protocol_reset_confirm').split('?')[0]}
                        </button>
                    </div>
                </div>
            </header>
            {/* Warning de día no cerrado */}
            {activeProtocol.current_day > 1 && !dailyLogs.some(l => l.day_number === activeProtocol.current_day - 1) && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="max-w-md mx-auto mt-6 px-5 py-2.5 bg-red-950/20 border border-red-500/20 rounded-full text-center text-red-400 text-[10px] uppercase tracking-widest backdrop-blur-md flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.05)]"
                >
                    <Shield size={12} className="text-red-500 animate-pulse" />
                    {t('protocol_incomplete_warning')}
                </motion.div>
            )}

            {/* Daily Synchrony Quote (Active Cycle) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="max-w-2xl mx-auto px-6 pt-8 pb-2 text-center"
            >
                <p className="font-serif italic text-white/50 text-sm md:text-base tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    "{getDailySynchronyQuote(language as any)}"
                </p>
            </motion.div>

            <main className="max-w-2xl mx-auto px-6 py-6 space-y-8">
                {/* Dynamic Progress Indicator */}
                {(() => {
                    const percentage = (displayDay / displayTarget) * 100;
                    const isHigh = percentage >= 70;
                    const isMid = percentage >= 30 && percentage < 70;

                    return (
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                opacity: 1,
                                boxShadow: [
                                    "0 0 20px rgba(6,182,212,0.05)", 
                                    "0 0 35px rgba(6,182,212,0.15)", 
                                    "0 0 20px rgba(6,182,212,0.05)"
                                ]
                            }}
                            transition={{ 
                                scale: { duration: 0.8, ease: "easeOut" },
                                opacity: { duration: 0.8 },
                                boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="bg-gradient-to-r from-cyan-950/10 to-transparent border border-white/5 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className={cn("text-[9px] uppercase tracking-[0.2em] font-black", currentPhase.color)}>
                                        {cycleLabel} · PHASE: {currentPhase.name}
                                    </span>
                                    <p className="text-[10px] text-white/30 tracking-wider mt-0.5">{t('protocol_day_label')} {displayDay} / {displayTarget}</p>
                                </div>
                                <span className={cn(
                                    "text-lg font-black transition-all duration-1000 font-serif italic",
                                    isHigh ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" : isMid ? "text-cyan-400/80" : "text-white/40"
                                )}>
                                    {displayDay} / {displayTarget}
                                </span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    key={percentage} // Forces animation key triggers on Day complete
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1.5, ease: "backOut" }}
                                    className={cn(
                                        "h-full bg-cyan-500 rounded-full transition-shadow duration-1000",
                                        isHigh ? "shadow-[0_0_30px_rgba(6,182,212,1)] bg-cyan-400" : isMid ? "shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "shadow-[0_0_5px_rgba(6,182,212,0.2)] bg-cyan-600"
                                    )}
                                />
                            </div>
                        </motion.div>
                    );
                })()}

                {/* Progress Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-serif">{t('protocol_alignment_seal')}</span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/70 font-black">{cycleLabel} · {displayDay} / {displayTarget}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: displayTarget }).map((_, i) => {
                            const gridIndex = i + 1;
                            const dayNum = isCycleII ? gridIndex + 21 : gridIndex;
                            const isCompleted = dailyLogs.some(log => log.day_number === dayNum && log.is_completed);
                            const isCurrent = dayNum === activeProtocol.current_day;

                            return (
                                <div
                                    key={dayNum}
                                    onClick={() => isCompleted && setShowHistory(true)} // Open history on click if completed
                                    className={cn(
                                        "aspect-square rounded-sm border flex items-center justify-center text-[10px] font-serif transition-all duration-700 relative",
                                        isCompleted
                                            ? "bg-amber-900/10 border-amber-500/30 text-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.05)] cursor-pointer hover:bg-amber-500/20 hover:scale-105"
                                            : isCurrent
                                                ? "bg-white/5 border-white/20 text-white animate-pulse"
                                                : "bg-transparent border-white/5 text-white/10"
                                    )}
                                >
                                    {dayNum}
                                    {isCompleted && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <DailyCheckIn
                    currentDay={currentDay}
                    title={activeProtocol.title}
                    purpose={activeProtocol.purpose}
                    isCompletedToday={isDayCompletedRaw}
                    onSuccess={() => {
                        playMysticChime();
                        setShowDailySuccess(true);
                        setTimeout(() => setShowDailySuccess(false), 3000);
                    }}
                />
            </main>

            {/* Persistent Exit Button for the user to easily return to the dashboard */}
            <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 pointer-events-none">
                <button
                    onClick={onBack}
                    className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white px-6 py-3 rounded-full flex items-center gap-3 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs uppercase tracking-widest font-black">{t('protocol_back_temple')}</span>
                </button>
            </div>

            {/* Using ProtocolRitual as an info modal connected to WisdomButton */}
            <AnimatePresence>
                {showRitualInfo && (
                    <ProtocolRitual onComplete={() => setShowRitualInfo(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};
