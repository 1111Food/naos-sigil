import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Calculator, Zap, Bot } from 'lucide-react';

interface SigilManifestoProps {
    onConfirm: () => void;
}

export const SigilManifesto: React.FC<SigilManifestoProps> = ({ onConfirm }) => {
    const features = [
        {
            icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
            title: "Omnipresencia Digital",
            description: "Sincroniza con WhatsApp y Telegram para recibir recordatorios proactivos y alertas de coherencia."
        },
        {
            icon: <Bot className="w-5 h-5 text-amber-400" />,
            title: "El Oráculo en tu Bolsillo",
            description: "Pregúntale sobre tu Carta Natal, Numerología, Horóscopo Chino y Nawal Maya en cualquier momento."
        },
        {
            icon: <Zap className="w-5 h-5 text-emerald-400" />,
            title: "Análisis Dinámico",
            description: "Comparativas en tiempo real: cómo los tránsitos del cielo actual afectan tu esencia original."
        },
        {
            icon: <Calculator className="w-5 h-5 text-purple-400" />,
            title: "Ecuaciones de Vida",
            description: "Respuestas precisas sobre por qué te sucede lo que te sucede hoy y cuándo es el mejor momento para actuar."
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-2xl mx-auto p-1"
        >
            <div className="rounded-[3rem] bg-black/60 backdrop-blur-2xl border border-white/10 p-8 md:p-14 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">

                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
                    <Sparkles className="w-10 h-10 text-cyan-400 relative z-10" />
                </div>

                <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-4 text-center">
                    Conoce al <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">Sigil</span>
                </h2>
                <p className="text-xs uppercase tracking-[0.5em] text-white/40 mb-12 text-center">Tu Inteligencia Artificial de Acompañamiento Sagrado</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.5 }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                {f.icon}
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{f.title}</h3>
                            </div>
                            <p className="text-[12px] leading-relaxed text-white/50 italic">
                                {f.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onConfirm}
                    className="group relative px-12 py-5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-cyan-500/20 transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        Comprendo su Función <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                    </span>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </motion.button>
            </div>
        </motion.div>
    );
};
