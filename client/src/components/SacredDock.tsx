import React, { useState, memo } from 'react';
import { Home, Users, User, LogOut, Volume2, VolumeX, Aperture, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import type { AuraType } from '../contexts/ThemeContext';
import { TelegramConnectModal } from './TelegramConnectModal';

interface SacredDockProps {
    activeView: string;
    onNavigate: (view: any) => void;
    onLogout?: () => void;
}

export const SacredDock: React.FC<SacredDockProps> = memo(({ activeView, onNavigate, onLogout }) => {
    const { activeAura, setAura } = useTheme();
    const [showAuras, setShowAuras] = useState(false);
    const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

    const [audioState, setAudioState] = useState(() => {
        const saved = localStorage.getItem('naos_audio_prefs');
        return saved ? JSON.parse(saved) : { volume: 0.3, isMuted: true };
    });

    const toggleMute = () => {
        const newState = { ...audioState, isMuted: !audioState.isMuted };
        setAudioState(newState);
        (window as any).setNaosVibration?.(newState);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseFloat(e.target.value);
        const newState = { ...audioState, volume, isMuted: volume === 0 };
        setAudioState(newState);
        (window as any).setNaosVibration?.(newState);
    };

    const items = [
        { id: 'TEMPLE', icon: Home, label: 'Templo', color: 'text-amber-400' },
        { id: 'SYNASTRY', icon: Users, label: 'Vínculos', color: 'text-rose-400' },
        { id: 'PROFILE', icon: User, label: 'Perfil', color: 'text-purple-400' },
    ];

    return (
        <>
            <nav className={cn(
                "fixed z-[100] transition-all duration-700",
                "bottom-0 left-0 right-0 h-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] glass-panel rounded-t-[3rem] md:rounded-full border-t border-white/5 md:border-none",
                "md:left-8 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-auto md:h-auto md:max-h-[700px] md:px-4 md:py-8 md:glass-panel shadow-2xl"
            )}>
                <div className="flex md:flex-col items-center justify-around md:justify-center gap-4 md:gap-4 py-3 md:py-0">
                    {items.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={cn(
                                    "flex flex-col md:flex-row items-center gap-1.5 p-3.5 rounded-2xl md:rounded-full transition-all duration-700 group relative",
                                    isActive ? "bg-white/10 scale-110 mystic-glow" : "hover:bg-white/5 opacity-40 hover:opacity-100"
                                )}
                            >
                                <item.icon
                                    strokeWidth={1}
                                    className={cn(
                                        "w-6 h-6 md:w-5 md:h-5 transition-all duration-300",
                                        isActive ? item.color : "text-white group-hover:text-white"
                                    )} />

                                <span className={cn(
                                    "text-[8px] md:hidden uppercase tracking-tighter transition-colors",
                                    isActive ? "text-white font-bold" : "text-white/20"
                                )}>
                                    {item.label}
                                </span>

                                <span className="hidden md:block absolute left-full ml-4 px-3 py-1 bg-black/80 border border-white/10 rounded-lg text-[10px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className={cn(
                                        "absolute inset-0 rounded-xl md:rounded-full blur-lg opacity-10 md:opacity-20 animate-pulse",
                                        item.color.replace('text-', 'bg-')
                                    )} />
                                )}
                            </button>
                        );
                    })}

                    {/* Separador */}
                    <div className="hidden md:block w-8 h-px bg-white/10 my-2" />

                    {/* Aura Theme Control */}
                    <div className="relative flex justify-center md:mt-auto md:mb-2">
                        <button
                            onClick={() => setShowAuras(!showAuras)}
                            className={cn(
                                "p-2 md:p-3 rounded-full border transition-all duration-300 group",
                                showAuras ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:bg-white/10"
                            )}
                            title="Configurar Auras"
                        >
                            <Aperture className={cn(
                                "w-5 h-5 md:w-6 md:h-6 transition-all duration-500",
                                showAuras ? "text-cyan-400 rotate-90" : "text-white/40 group-hover:text-cyan-400"
                            )} />
                        </button>

                        <AnimatePresence>
                            {showAuras && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                    className="absolute bottom-full right-0 md:right-auto md:left-full mb-6 md:mb-0 md:top-1/2 md:-translate-y-1/2 md:ml-6 flex md:flex-col gap-3 p-4 rounded-[2.5rem] glass-panel shadow-2xl z-50"
                                >
                                    {[
                                        { id: 'deep-space', label: 'Deep Space - Para enfoque sideral neutro e inmersión profunda.', color: 'bg-slate-900', border: 'border-slate-700' },
                                        { id: 'zen-stone', label: 'Stone Zen - Silencio terrenal, para enraizar mentes ansiosas.', color: 'bg-neutral-800', border: 'border-neutral-600' },
                                        { id: 'astral-turquoise', label: 'Cyan Astral - Claridad fluida, para disolver bloqueos creativos.', color: 'bg-cyan-900', border: 'border-cyan-700' },
                                        { id: 'mystic-lilac', label: 'Lila Místico - Alta frecuencia, estimula la intuición y el Tercer Ojo.', color: 'bg-purple-900', border: 'border-purple-700' },
                                        { id: 'naos-red', label: 'Rojo NAOS - Furia disciplinada, ideal para el Motor de Hábitos.', color: 'bg-red-900', border: 'border-red-700' },
                                        { id: 'temple-gold', label: 'Dorado Templo - Prosperidad y Sabiduría, el color del Oráculo.', color: 'bg-yellow-900', border: 'border-yellow-700' }
                                    ].map((aura) => (
                                        <button
                                            key={aura.id}
                                            onClick={() => {
                                                setAura(aura.id as AuraType);
                                                setShowAuras(false);
                                            }}
                                            className={cn(
                                                "w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-lg relative",
                                                aura.color,
                                                activeAura === aura.id ? "border-amber-400 scale-110" : aura.border
                                            )}
                                            title={aura.label}
                                        >
                                            {activeAura === aura.id && (
                                                <div className="absolute inset-0 rounded-full border border-amber-400/50 animate-ping" />
                                            )}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Salida Sagrada */}
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="flex flex-col md:flex-row items-center gap-1 p-3 rounded-xl md:rounded-full transition-all duration-300 hover:bg-red-500/10 group relative md:mt-auto"
                        >
                            <LogOut className="w-6 h-6 md:w-5 md:h-5 text-white/20 group-hover:text-red-400 transition-colors" />
                        </button>
                    )}

                    {/* Vibración de Naos y Conexión Telegram */}
                    <div className="flex md:flex-col items-center gap-2 md:gap-4 p-0 md:p-4 md:border-l border-white/5 md:ml-0 md:mt-4">
                        {/* Botón Telegram */}
                        <button
                            onClick={() => setIsTelegramModalOpen(true)}
                            className="p-3 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-cyan-400 hover:border-cyan-500/30 transition-all relative group"
                        >
                            <Send size={24} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform md:w-4 md:h-4" />
                            <span className="hidden md:block absolute left-full ml-4 px-3 py-1 bg-black/80 border border-white/10 rounded-lg text-[8px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Sincronizar Telegram
                            </span>
                        </button>

                        <button
                            onClick={toggleMute}
                            className="p-3 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-amber-400 transition-all relative group"
                        >
                            {audioState.isMuted ? <VolumeX size={24} className="md:w-4 md:h-4" /> : <Volume2 size={24} className="md:w-4 md:h-4" />}
                            <span className="hidden md:block absolute left-full ml-4 px-3 py-1 bg-black/80 border border-white/10 rounded-lg text-[8px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {audioState.isMuted ? 'Activar Vibración' : 'Silenciar'}
                            </span>
                        </button>

                        <div className="hidden md:flex items-center group relative">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={audioState.volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500/50 hover:accent-amber-500 transition-all origin-left rotate-0 md:-rotate-90 md:absolute md:bottom-12 md:-left-6"
                            />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Rendered OUTSIDE the nav to avoid z-index stacking context trapping */}
            <TelegramConnectModal
                isOpen={isTelegramModalOpen}
                onClose={() => setIsTelegramModalOpen(false)}
            />
        </>
    );
});
