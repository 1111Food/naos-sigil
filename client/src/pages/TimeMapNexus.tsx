import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CalendarDays, Zap, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { useTranslation } from '../i18n';
import { useActiveProfile } from '../hooks/useActiveProfile';

interface TimeMapNexusProps {
    onNavigate: (view: any) => void;
    onBack: () => void;
}

export const TimeMapNexus: React.FC<TimeMapNexusProps> = ({ onNavigate, onBack }) => {
    const { playSound } = useSound();
    const { t } = useTranslation();
    const { profile } = useActiveProfile();
    const isAdmin = profile?.plan_type === 'admin';

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const options = [
        {
            id: 'TIME_MAP_LIFELINE',
            title: t('lifeline_title', 'Línea de Vida (Macro)'),
            subtitle: t('lifeline_subtitle', 'Ciclos Mayores y Pináculos'),
            icon: Clock,
            color: "from-purple-500/20 to-magenta-500/10",
            border: "border-purple-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]",
            locked: !isAdmin,
            status: isAdmin ? t('access', 'Acceder') : t('coming_soon', 'Próximamente')
        },
        {
            id: 'TIME_MAP_ANNUAL',
            title: t('annual_horizon_title', 'Horizonte Anual (Meso)'),
            subtitle: t('annual_horizon_subtitle', 'Simulador Cuántico de 12 Meses'),
            icon: CalendarDays,
            color: "from-naos-gold/20 to-yellow-500/10",
            border: "border-naos-gold/30",
            glow: "shadow-[0_0_40px_-10px_rgba(212,175,55,0.4)]",
            locked: false,
            status: t('access', 'Acceder')
        },
        {
            id: 'TIME_MAP_CURRENT',
            title: t('current_energy_title', 'Energía Actual (Micro)'),
            subtitle: t('current_energy_subtitle', 'Tránsito Semanal y Diario'),
            icon: Zap,
            color: "from-blue-500/20 to-cyan-500/10",
            border: "border-blue-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(30,64,175,0.4)]",
            locked: !isAdmin,
            status: isAdmin ? t('access', 'Acceder') : t('coming_soon', 'Próximamente')
        }
    ];

    return (
        <div className="relative min-h-[60vh] flex flex-col items-center justify-center p-6 mt-12">
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { playSound('click'); onBack(); }}
                className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('identity_nexus', 'Nexo de Identidad')}</span>
            </motion.button>

            <div className="flex flex-col items-center justify-center gap-4 text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif italic text-white/90 tracking-wide">
                    {t('time_map', 'Mapa Temporal')}
                </h2>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-naos-gold/50 to-transparent mx-auto" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">{t('time_navigator', 'Navegador del Tiempo')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                {options.map((opt, i) => (
                    <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => { 
                            if (opt.locked) {
                                playSound('click');
                                return;
                            }
                            playSound('click'); 
                            onNavigate(opt.id); 
                        }}
                        className={cn(
                            "relative group cursor-pointer p-10 rounded-[3rem] border transition-all duration-700 overflow-hidden bg-black/40 backdrop-blur-3xl",
                            opt.border,
                            opt.glow,
                            opt.locked ? "opacity-75 grayscale-[0.5]" : "hover:scale-[1.02] hover:bg-white/5"
                        )}
                    >
                        {opt.locked && (
                            <div className="absolute top-6 left-6 p-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500 z-20">
                                <Lock size={12} />
                            </div>
                        )}

                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", opt.color)} />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:border-white/30 transition-all duration-500">
                                <opt.icon size={32} className="text-white/60 group-hover:text-white transition-colors" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xl font-serif italic tracking-wider text-white/90">
                                    {opt.title}
                                </h3>
                                <p className="text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    {opt.subtitle}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                <span className={cn(
                                    "text-[10px] uppercase tracking-[0.3em] font-black",
                                    opt.locked ? "text-amber-400" : "text-naos-gold"
                                )}>
                                    {opt.status}
                                </span>
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", opt.locked ? "bg-amber-500" : "bg-naos-gold")} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
