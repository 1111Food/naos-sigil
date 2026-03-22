import React from 'react';
import { motion } from 'framer-motion';
import { Users, Diamond, ArrowLeft, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { WisdomButton } from './WisdomOverlay';
import { OracleExplainer } from './OracleExplainer';
import { AnimatePresence } from 'framer-motion';

interface SynastryHubProps {
    onSelectView: (view: 'DUAL' | 'GROUP') => void;
    onBack: () => void;
    onShowWisdom: () => void;
}

export const SynastryHub: React.FC<SynastryHubProps> = ({ onSelectView, onBack, onShowWisdom }) => {
    const [explainerType, setExplainerType] = React.useState<'DUAL' | 'GROUP' | null>(null);

    const cards = [
        {
            id: 'DUAL',
            label: 'Sinergia Dual',
            subtitle: 'Exploración de Vínculo 1 a 1',
            icon: Diamond,
            color: 'text-purple-400',
            gradient: "from-purple-500/20 to-pink-500/10",
            border: "border-purple-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]"
        },
        {
            id: 'GROUP',
            label: 'NAOS TEAMS',
            subtitle: 'Análisis de compatibilidad operativa para equipos',
            icon: Users,
            color: 'text-blue-400',
            gradient: "from-blue-500/20 to-cyan-500/10",
            border: "border-blue-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)]"
        }
    ];

    return (
        <motion.div
            key="synastry-hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-center relative p-6 mt-8 lg:mt-16"
        >
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 text-center mb-16 space-y-4">
                <div className="flex justify-center mb-6">
                    <button onClick={onBack} className="p-2 text-white/40 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 rounded-full hover:bg-white/10">
                        <ArrowLeft size={14} /> Volver a Selección
                    </button>
                </div>

                <div className="flex items-center justify-center gap-4 mb-2">
                    <h3 className="font-serif text-xl sm:text-3xl md:text-5xl text-white tracking-[0.2em] uppercase flex items-center justify-center gap-4">
                        <span className="text-white/30">−</span> Sinastría Maestra <span className="text-white/30">−</span>
                    </h3>
                    <WisdomButton onClick={onShowWisdom} color="purple" className="translate-y-1" />
                </div>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-auto" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">Elige la Magnitud del Análisis</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => onSelectView(card.id as 'DUAL' | 'GROUP')}
                        className={cn(
                            "relative group cursor-pointer p-10 rounded-[3rem] border transition-all duration-700 overflow-hidden bg-black/40 backdrop-blur-3xl",
                            card.border,
                            card.glow,
                            "hover:scale-[1.02] hover:bg-white/5"
                        )}
                    >
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", card.gradient)} />
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); setExplainerType(card.id as any); }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:scale-110 hover:bg-white/10 transition-all z-20 group/info"
                        >
                            <Info size={16} className="group-hover/info:rotate-12 transition-transform" />
                        </button>

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="p-5 rounded-full bg-white/5 border border-white/10 group-hover:border-white/30 transition-all duration-500">
                                <card.icon size={36} className={cn("transition-colors", card.color)} />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-[0.1em] text-white/90">
                                    {card.label.toUpperCase()}
                                </h3>
                                <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">
                                    {card.subtitle}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                <span className={cn("text-[10px] uppercase tracking-[0.3em] font-black", card.color)}>Acceder</span>
                                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", card.color.replace('text', 'bg'))} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Sub-Explainer Overlay */}
            <AnimatePresence>
                {explainerType && (
                    <OracleExplainer 
                        type={explainerType} 
                        onClose={() => setExplainerType(null)} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
