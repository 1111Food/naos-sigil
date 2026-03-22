import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ShieldAlert } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    feature: 'sigil' | 'synastry' | 'protocol' | 'evolution' | 'profile';
    onClose: () => void;
}

const FEATURE_CONTENT = {
    sigil: {
        title: "La integración requiere silencio",
        body: "NAOS ha detectado que estás listo para trabajar a un nivel más profundo. El oráculo completo tiene memoria y voz continua.",
        icon: Sparkles
    },
    synastry: {
        title: "Acceso restringido al Arquitecto",
        body: "Esta función te permite reconfigurar tu energía y comprender vínculos en su diseño original. Desbloquea la lectura avanzada.",
        icon: ShieldAlert
    },
    protocol: {
        title: "Este portal aún no está abierto",
        body: "Los protocolos 21 y 90 requieren calibración avanzada de arquitectura personal. Activa el modo completo para ingresar.",
        icon: Sparkles
    },
    evolution: {
        title: "Tu siguiente nivel está bloqueado",
        body: "El Laboratorio Elemental completo está disponible para quienes operan desde su diseño expandido. Oxigena tu mente.",
        icon: Sparkles
    },
    profile: {
        title: "Capacidad de geometría alcanzada",
        body: "Para gestionar múltiples arquitecturas humanas simultáneamente, expande tu acceso al nivel de Arquitecto.",
        icon: Sparkles
    }
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, feature, onClose }) => {
    const content = FEATURE_CONTENT[feature] || FEATURE_CONTENT.sigil;
    const Icon = content.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm glass-panel bg-black/90 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center gap-5 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
                    >
                        {/* Close button */}
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>

                        {/* Icon Glow */}
                        <div className="relative mt-2 p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <Icon className="w-6 h-6 text-cyan-400" />
                        </div>

                        {/* Text */}
                        <div className="flex flex-col gap-2">
                            <h2 className="text-base font-serif italic tracking-wide text-white/90">
                                {content.title}
                            </h2>
                            <p className="text-xs text-white/60 leading-relaxed px-2">
                                {content.body}
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col gap-2 w-full pt-2">
                            <button 
                                onClick={() => { alert("Redirigiendo a activación..."); onClose(); }}
                                className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                            >
                                Activar Modo Arquitecto
                            </button>
                            <button 
                                onClick={onClose}
                                className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white/60 transition-all"
                            >
                                Seguir explorando
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
