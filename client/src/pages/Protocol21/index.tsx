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
import { cn } from '../../lib/utils';
import { getDailySynchronyQuote } from '../../utils/dailyOracle';

interface Protocol21Props {
    onBack: () => void;
}

export const Protocol21: React.FC<Protocol21Props> = ({ onBack }) => {
    const { activeProtocol, dailyLogs, loading, completedCount, resetProtocol, startProtocol } = useProtocol21();
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
        if (window.confirm("¿Reiniciar protocolo?")) {
            await resetProtocol();
        }
    };

    if (loading) return <TempleLoading text="Sincronizando Frecuencia..." />;

    if (!activeProtocol) {
        return (
            <div className="min-h-screen bg-black/40 text-white pb-24 font-sans backdrop-blur-3xl pt-12">
                <header className="sticky top-0 z-40 bg-transparent p-6 mb-8">
                    <button onClick={onBack} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                        className="text-center mt-6 px-4"
                    >
                        <p className="font-serif italic text-white/50 text-sm md:text-base tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                            "{getDailySynchronyQuote()}"
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
                                alert(err.message || 'Error iniciando ciclo de 21 días');
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
                    <button onClick={() => setShowVault(false)} className="p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-serif italic text-amber-500 text-center">Archivo Akáshico</h1>
                </header>
                <ProtocolVault userId={profile?.id || ''} onClose={() => setShowVault(false)} />
            </div>
        )
    }

    const currentDay = activeProtocol.current_day;
    const isDayCompletedRaw = dailyLogs.some(l => l.day_number === currentDay);

    return (
        <div className="min-h-screen bg-black/40 text-white pb-24 font-sans backdrop-blur-3xl">
            <AnimatePresence>
                {showDailySuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95">
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} className="relative">
                            <Shield size={120} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />
                            <Check size={40} className="absolute bottom-0 right-0 text-white bg-amber-600 rounded-full p-2" />
                        </motion.div>
                        <h2 className="mt-12 text-3xl font-serif italic text-amber-100">¡FRECUENCIA ELEVADA!</h2>
                        <p className="mt-4 text-amber-500 uppercase tracking-widest text-sm">Día {currentDay} Completado</p>
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
                                    Bitácora de Coherencia
                                </h2>
                                <button onClick={() => setShowHistory(false)} className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {dailyLogs.length === 0 ? (
                                    <div className="text-center py-20 text-white/30 italic font-serif">
                                        No hay registros en el archivo aún. Inicia tu alquimia hoy.
                                    </div>
                                ) : (
                                    dailyLogs
                                        .slice()
                                        .sort((a, b) => b.day_number - a.day_number) // Newest first
                                        .map((log) => {
                                            // Parse the [PILLARS: X, Y] tag from the note
                                            const noteStr = log.notes || "Día documentado sin reflexiones extensas.";
                                            const pillarMatch = noteStr.match(/\[PILLARS: (.*?)\]/);
                                            const pillarsText = pillarMatch ? pillarMatch[1] : "No documentados";
                                            const cleanNote = noteStr.replace(/\[PILLARS: .*?\]\s*/, "").trim() || "Sin reflexión documentada.";

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
                                                            Día {log.day_number}
                                                        </span>
                                                        <span className="text-[10px] text-white/20 uppercase tracking-widest">
                                                            {new Date((log as any).created_at || Date.now()).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <p className="text-white/80 font-serif leading-relaxed mb-6 pl-4 text-sm md:text-base">
                                                        "{cleanNote || "Sin reflexión documentada."}"
                                                    </p>

                                                    <div className="pl-4 border-t border-white/5 pt-4 flex items-start gap-2">
                                                        <Sparkles size={12} className="text-amber-500 mt-0.5" />
                                                        <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold leading-tight">
                                                            Pilares Activos: <span className="text-amber-500/80">{pillarsText}</span>
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
                        <h1 className="text-xl font-serif italic">Protocolo 21</h1>
                        <span className="text-[10px] uppercase tracking-widest text-cyan-400">Día {currentDay} / 21</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Modified Info Button calling ProtocolRitual instead of WisdomOverlay */}
                        <WisdomButton color="emerald" onClick={() => setShowRitualInfo(true)} />

                        {/* Bitácora History Button */}
                        <button onClick={() => setShowHistory(true)} className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/70 hover:text-cyan-400 flex items-center gap-2 border border-cyan-500/20 bg-cyan-900/10 px-4 py-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <BookOpen size={12} />
                            Bitácoras
                        </button>

                        {completedCount > 0 && (
                            <button onClick={() => setShowVault(true)} className="text-[10px] uppercase tracking-[0.2em] text-amber-500/70 hover:text-amber-400 flex items-center gap-2 border border-amber-500/20 bg-amber-900/10 px-4 py-2 rounded-full transition-all duration-300 relative group shadow-[0_0_15px_rgba(245,158,11,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                Bóveda
                                <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full text-[9px] font-black">{completedCount}</span>
                            </button>
                        )}
                        <button onClick={handleReset} className="text-[10px] uppercase tracking-wider text-white/30 hover:text-red-400 flex items-center gap-1">
                            <RotateCcw size={12} /> Reiniciar
                        </button>
                    </div>
                </div>
            </header>

            {/* Daily Synchrony Quote (Active Cycle) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="max-w-2xl mx-auto px-6 pt-10 pb-2 text-center"
            >
                <p className="font-serif italic text-white/50 text-sm md:text-base tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    "{getDailySynchronyQuote()}"
                </p>
            </motion.div>

            <main className="max-w-3xl mx-auto px-6 py-6 space-y-10">
                {/* 21-Day Progress Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-serif">Alineación del Sello</span>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/70 font-black">Día {activeProtocol.current_day} / 21</span>
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                        {Array.from({ length: 21 }).map((_, i) => {
                            const dayNum = i + 1;
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
                    <span className="text-xs uppercase tracking-widest font-black">Volver al Templo</span>
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
