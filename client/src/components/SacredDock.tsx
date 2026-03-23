import React, { useState, memo } from 'react';
import { Home, User, LogOut, Volume2, VolumeX, Aperture, Bot, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../i18n/translations';
import type { AuraType } from '../contexts/ThemeContext';
import { TelegramConnectModal } from './TelegramConnectModal';
import { SigilSettingsModal } from './SigilSettingsModal';
import { ProfileSelector } from './ProfileSelector';

interface SacredDockProps {
    activeView: string;
    onNavigate: (view: any) => void;
    onLogout?: () => void;
}

export const SacredDock: React.FC<SacredDockProps> = memo(({ activeView, onNavigate, onLogout }) => {
    const { activeAura, setAura } = useTheme();
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [showAuras, setShowAuras] = useState(false);
    const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
    const [isSigilSettingsOpen, setIsSigilSettingsOpen] = useState(false);

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

    const { profile } = useProfile();

    const items = [
        { id: 'TEMPLE', icon: Home, label: t('temple'), color: 'text-amber-400' },
        { id: 'PROFILE', icon: User, label: t('profile'), color: 'text-purple-400' },
    ];

    if ((profile as any)?.plan_type === 'admin') {
        items.push({ id: 'ADMIN', icon: Shield, label: 'Admin', color: 'text-red-500' });
    }

    return (
        <>
            <nav className={cn(
                "fixed z-[100] transition-all duration-700",
                "bottom-0 left-0 right-0 h-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] glass-panel rounded-t-[3rem] md:rounded-full border-t border-white/5 md:border-none",
                "md:left-8 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-auto md:h-auto md:max-h-[700px] md:px-4 md:py-8 md:glass-panel shadow-2xl"
            )}>
                <div className="flex md:flex-col items-center justify-around md:justify-center gap-2 md:gap-4 py-3 md:py-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full px-2">
                    
                    {/* Profile Selector (Desktop Only to avoid crowding bottom rail) */}
                    <div className="hidden md:block mb-1 -translate-x-1 scale-90">
                        <ProfileSelector />
                    </div>
                    <div className="hidden md:block w-8 h-px bg-white/10 my-1" />

                    {items.map((item) => {
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={cn(
                                    "flex flex-col md:flex-row items-center gap-1.5 p-3.5 rounded-full transition-all duration-700 group relative",
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
                                        "absolute inset-0 rounded-full blur-lg opacity-10 md:opacity-20 animate-pulse",
                                        item.color.replace('text-', 'bg-')
                                    )} />
                                )}
                            </button>
                        );
                    })}

                    {/* Separador */}
                    <div className="hidden md:block w-8 h-px bg-white/10 my-2" />

                    {/* Ajustes de Sigil (Sigil Settings) */}
                    <div className="relative flex justify-center md:mt-auto md:mb-2">
                        <button
                            onClick={() => setIsSigilSettingsOpen(true)}
                            className={cn(
                                "p-2 md:p-3 rounded-full border transition-all duration-300 group bg-white/5 border-white/10 hover:bg-white/10 text-white/30 hover:text-cyan-400"
                            )}
                            title="Ajustes del Sigil"
                        >
                            <Bot className={cn(
                                "w-5 h-5 md:w-6 md:h-6 transition-all duration-500 group-hover:rotate-12"
                            )} />
                        </button>
                    </div>

                    {/* Aura Theme Control (Colores) */}
                    <div className="relative flex justify-center md:mb-2">
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
                    </div>

                    {/* Selector de Idioma (ES / EN) */}
                    <div className="relative flex justify-center md:mb-2">
                        <button
                            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                            className="p-2 md:p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-all flex items-center justify-center font-bold text-[10px] w-9 h-9 md:w-11 md:h-11"
                            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
                        >
                            {language === 'es' ? 'ES' : 'EN'}
                        </button>
                    </div>

                    {/* Mute Toggle (Sonido) */}
                    <div className="relative flex justify-center md:mb-2 group">
                        <button
                            onClick={toggleMute}
                            className="p-2 md:p-3 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-amber-400 transition-all"
                            title={audioState.isMuted ? 'Activar Vibración' : 'Silenciar'}
                        >
                            {audioState.isMuted ? <VolumeX className="w-5 h-5 md:w-5 md:h-5" /> : <Volume2 className="w-5 h-5 md:w-5 md:h-5" />}
                        </button>

                        <div className="hidden md:group-hover:flex items-center absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-black/80 border border-white/10 rounded-lg p-2 z-50">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={audioState.volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500/50 hover:accent-amber-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Salida Sagrada (Logout) */}
                    {onLogout && (
                        <div className="relative flex justify-center md:mt-auto">
                            <button
                                onClick={onLogout}
                                className="p-2 md:p-3 rounded-xl md:rounded-full transition-all duration-300 hover:bg-red-500/10 group"
                                title="Salir"
                            >
                                <LogOut className="w-5 h-5 md:w-5 md:h-5 text-white/20 group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Fixed Overlay for mobile, absolute panel for desk */}
                <AnimatePresence>
                    {showAuras && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={cn(
                                "fixed md:absolute z-[110] glass-panel shadow-2xl flex md:flex-col gap-3 p-4 rounded-[2.5rem]",
                                "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2", // Mobile float above dock
                                "md:top-1/2 md:bottom-auto md:left-full md:ml-6 md:-translate-y-1/2 md:translate-x-0"  // Desktop aligned with dock
                            )}
                        >
                            {[
                                { id: 'deep-space', label: 'Deep Space', color: 'bg-slate-900', border: 'border-slate-700' },
                                { id: 'zen-stone', label: 'Stone Zen', color: 'bg-neutral-800', border: 'border-neutral-600' },
                                { id: 'astral-turquoise', label: 'Cyan Astral', color: 'bg-cyan-900', border: 'border-cyan-700' },
                                { id: 'mystic-lilac', label: 'Lila Místico', color: 'bg-purple-900', border: 'border-purple-700' },
                                { id: 'naos-red', label: 'Rojo NAOS', color: 'bg-red-900', border: 'border-red-700' },
                                { id: 'temple-gold', label: 'Dorado Templo', color: 'bg-yellow-900', border: 'border-yellow-700' }
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
            </nav>

            {/* Rendered OUTSIDE the nav to avoid z-index stacking context trapping */}
            <TelegramConnectModal
                isOpen={isTelegramModalOpen}
                onClose={() => setIsTelegramModalOpen(false)}
            />

            <SigilSettingsModal
                isOpen={isSigilSettingsOpen}
                onClose={() => setIsSigilSettingsOpen(false)}
                onOpenTelegram={() => {
                    setIsSigilSettingsOpen(false); // Close settings
                    setIsTelegramModalOpen(true);  // Open Telegram modal
                }}
            />
        </>
    );
});
