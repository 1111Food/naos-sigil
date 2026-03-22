import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PlanSelectionViewProps {
    onBack?: () => void;
    onSelectPlan: (plan: 'monthly' | 'yearly') => void;
}

export const PlanSelectionView: React.FC<PlanSelectionViewProps> = ({ onBack, onSelectPlan }) => {
    return (
        <div className="flex flex-col items-center text-center gap-4 w-full animate-in fade-in duration-300">
            <h2 className="text-base font-serif italic tracking-wide text-white/90">
                Selecciona tu nivel de acceso
            </h2>
            <p className="text-xs text-white/50 px-4 leading-relaxed">
                Desbloquea tu arquitectura completa para operar desde tu diseño original.
            </p>

            <div className="flex flex-col gap-3 w-full mt-2">
                {/* Monthly */}
                <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    onClick={() => onSelectPlan('monthly')}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
                >
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Mensual</span>
                        <span className="text-[10px] text-white/40">Acceso continuo</span>
                    </div>
                    <span className="text-sm font-black text-cyan-400">$11.11 <span className="text-[10px] font-normal text-white/40">/ mes</span></span>
                </motion.div>

                {/* Yearly */}
                <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(6,182,212,0.05)' }}
                    onClick={() => onSelectPlan('yearly')}
                    className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between cursor-pointer transition-all relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Mejor Valor
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Anual</span>
                        <span className="text-[10px] text-cyan-300/60">Ahorra más del 30%</span>
                    </div>
                    <span className="text-sm font-black text-cyan-400">$88 <span className="text-[10px] font-normal text-white/40">/ año</span></span>
                </motion.div>
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full px-2 mt-2">
                {[
                    "Acceso total a tu código energético",
                    "IA Sigil con memoria",
                    "Protocolos de transformación",
                    "Laboratorio de evolución"
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-white/70">
                        <Check className="w-3 h-3 text-cyan-400" />
                        <span>{item}</span>
                    </div>
                ))}
            </div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="mt-2 text-[10px] text-white/40 hover:text-white/60 transition-colors uppercase tracking-wider font-semibold"
                >
                    Volver
                </button>
            )}
        </div>
    );
};
