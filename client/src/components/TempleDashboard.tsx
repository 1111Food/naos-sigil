import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { MessageCircle, Compass, PlayCircle, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTimeBasedMode } from '../hooks/useTimeBasedMode';
import { useNaosContext } from '../hooks/useNaosContext';

interface TempleDashboardProps {
    onSelectFeature: (feature: string) => void;
    activeFeature: string;
}

export const TempleDashboard: React.FC<TempleDashboardProps> = ({ onSelectFeature, activeFeature }) => {
    const { t } = useTranslation();
    const timeMode = useTimeBasedMode();
    const { data: context, isLoading } = useNaosContext();
    const [isSettled, setIsSettled] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsSettled(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    const currentState = isLoading ? t('loading') : 
        (context?.pattern?.active_candidates?.length ? 'A PATTERN IS EMERGING' :
        (context?.protocol?.active ? `Protocol ${context.protocol.target_days} · Día ${context.protocol.current_day}` : 
        (context?.identity?.archetype ? `Frecuencia Activa: ${context.identity.archetype}` : 'Sintonizando...')));

    const synthesisText = isLoading ? t('syncing_akashic') :
        (context?.pattern?.active_candidates?.length ? `He observado una recurrencia en tu comportamiento.` :
        (context?.protocol?.active ? `Tu intención de ${context.protocol.intention} está activa en el ciclo actual.` :
        (context?.timeMap?.astronomical_transits ? `Las posiciones planetarias actuales marcan un tránsito relevante.` :
        (context?.memory?.recent_reflections?.length ? `He procesado tus últimas reflexiones. La energía está alineada.` :
        `Descubre los códigos de tu identidad.`))));

    // Dynamic buttons based on context (Max 3 actions)
    const dynamicButtons = [];
    if (context?.pattern?.active_candidates?.length) {
        dynamicButtons.push({ id: 'CHAT', label: 'Explorar Patrón', icon: MessageCircle });
    }
    
    if (context?.protocol?.active) {
        dynamicButtons.push({ id: 'PROTOCOL21', label: 'Continuar Protocolo', icon: PlayCircle });
    } else if (dynamicButtons.length < 3) {
        dynamicButtons.push({ id: 'PROTOCOL21', label: 'Iniciar Protocolo', icon: PlayCircle });
    }
    
    if (dynamicButtons.length < 3) {
        dynamicButtons.push({ id: 'TIME_MAP_NEXUS', label: 'Explorar Time Map', icon: Compass });
    }
    if (dynamicButtons.length < 3) {
        dynamicButtons.push({ id: 'IDENTITY_NEXUS', label: 'Ver Identidad', icon: Eye });
    }

    return (
        <div
            data-energy-mode={timeMode.toLowerCase()}
            className="w-full max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-700 pb-20"
        >
            {/* CURRENT STATE HEADER */}
            <div className="text-center mt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">CURRENT STATE</p>
                <h2 className="text-2xl font-serif text-white/90">{currentState}</h2>
            </div>

            {/* SIGIL GUARDIAN & SYNTHESIS */}
            <div className="flex flex-col items-center justify-center relative">
                <div className="relative group cursor-pointer" onClick={() => onSelectFeature('CHAT')}>
                    <div className="w-[180px] h-[180px] rounded-full flex items-center justify-center relative transition-all duration-1000">
                        <img
                            src={timeMode === 'DAY' ? "/sigil-day.png" : "/sigil-night.png"}
                            alt="Sigil"
                            className={`w-full h-full relative z-10 brightness-110 contrast-105 mix-blend-screen animate-float object-contain ${isSettled ? 'pause-animations' : ''}`}
                            style={{ 
                                objectPosition: '50% 50%',
                                maskImage: 'radial-gradient(circle at center, white 8%, transparent 48%)',
                                WebkitMaskImage: 'radial-gradient(circle at center, white 8%, transparent 48%)',
                                clipPath: 'circle(32% at 50% 50%)',
                                WebkitClipPath: 'circle(32% at 50% 50%)'
                            }}
                        />
                    </div>
                    
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 w-full">
                        <div className={cn(
                            "px-4 py-1 border rounded-full text-[10px] uppercase tracking-widest backdrop-blur-md transition-colors duration-1000",
                            timeMode === 'DAY' ? "bg-amber-500/20 border-amber-500/30 text-amber-500" : "bg-primary/20 border-primary/30 text-primary"
                        )}>
                            SIGIL SYNTHESIS
                        </div>
                    </div>
                </div>

                <p className="mt-10 text-center text-white/70 font-serif italic text-xl max-w-lg px-6 leading-relaxed">
                    "{synthesisText}"
                </p>
            </div>

            {/* NEXT ACTION BUTTONS */}
            <div className="pt-8">
                <p className="text-[10px] text-center uppercase tracking-[0.3em] text-white/40 mb-6">NEXT ACTION</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 max-w-3xl mx-auto">
                    {dynamicButtons.map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => onSelectFeature(btn.id)}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden"
                        >
                            <btn.icon className="w-6 h-6 text-white/70 mb-3 group-hover:scale-110 group-hover:text-white transition-all" />
                            <span className="text-xs font-bold tracking-widest text-white/90 uppercase">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Access Chat Button */}
            <div className="flex justify-center mt-12">
                <button
                    onClick={() => onSelectFeature('CHAT')}
                    className="flex items-center gap-2 px-8 py-4 rounded-full bg-cyan-900/20 border border-cyan-500/30 text-xs uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                >
                    <MessageCircle className="w-4 h-4" />
                    Preguntar a Sigil
                </button>
            </div>
        </div>
    );
};
