import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Droplet, Wind, Mountain, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSound } from '../hooks/useSound';
import { getAuthHeaders, API_BASE_URL } from '../lib/api';

interface FloatingLaboratorioProps {
    onNavigate: (view: any, payload?: any) => void;
}

export const FloatingLaboratorio: React.FC<FloatingLaboratorioProps> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { playSound } = useSound();

    const actions = [
        { label: "Activarme", element: "FIRE", icon: Flame, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20", techId: "fire-1" },
        { label: "Calmarme", element: "WATER", icon: Droplet, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20", techId: "water-1" },
        { label: "Enfocarme", element: "EARTH", icon: Mountain, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20", techId: "earth-1" },
        { label: "Fluir", element: "AIR", icon: Wind, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20", techId: "air-1" }
    ];

    const handleAction = async (techId: string, label: string) => {
        playSound('transition');
        setIsOpen(false);

        try {
            fetch(`${API_BASE_URL}/api/trigger/lab-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ element: label })
            });
        } catch (e) {
            console.warn("Lab Trigger Trigger Failed:", e);
        }

        onNavigate('SANCTUARY', { type: 'BREATH', techId });
    };

    return (
        <div className="fixed bottom-10 right-6 z-[600] flex flex-col items-end gap-3">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="flex flex-col gap-2 bg-black/80 backdrop-blur-2xl border border-white/10 p-3 rounded-2xl shadow-2xl mr-1"
                    >
                        <p className="text-[8px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1 text-center">Ritual Rápido</p>
                        {actions.map((act) => (
                            <button
                                key={act.element}
                                onClick={() => handleAction(act.techId, act.label)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 w-40 text-left group",
                                    act.bg
                                )}
                            >
                                <act.icon size={14} className={act.color} />
                                <span className="text-[10px] font-black uppercase tracking-wider text-white/80 group-hover:text-white">{act.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => { playSound('click'); setIsOpen(!isOpen); }}
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 shadow-lg relative",
                    isOpen 
                        ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] rotate-45" 
                        : "bg-black/60 backdrop-blur-md border-white/10 hover:border-cyan-500/40 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                )}
            >
                {/* Micro particle/pulse surrounding effect inside button */}
                <div className="absolute inset-2 rounded-full border border-white/5 animate-ping opacity-30" />
                <Zap size={18} className={isOpen ? "text-cyan-400" : "text-white/60"} />
            </button>
        </div>
    );
};
