import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaborIllusionProps {
    onComplete: () => void;
}

export const LaborIllusion: React.FC<LaborIllusionProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const steps = [
        "☉ Calculando tránsitos astrológicos...",
        "∑ Analizando año y mes personal...",
        "𓂀 Interpretando energía del Nahual...",
        "龍 Sincronizando Calendario Chino...",
        "🧠 Integrando tu historial en NAOS...",
        "🌀 Fusionando las 5 escuelas...",
        "⏳ Construyendo Línea Temporal...",
        "✨ Conectando con Sigil..."
    ];

    useEffect(() => {
        if (step < steps.length) {
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, 1200 + Math.random() * 800); // Random delay between 1.2s and 2s per step
            return () => clearTimeout(timer);
        } else {
            // Give it a final second before completing
            const timer = setTimeout(onComplete, 1000);
            return () => clearTimeout(timer);
        }
    }, [step, steps.length, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-md p-6 font-mono text-naos-gold">
                <AnimatePresence>
                    {steps.map((text, idx) => (
                        idx <= step && (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: idx === step ? 1 : 0.4, y: 0 }}
                                className="mb-3 flex items-center text-sm md:text-base"
                            >
                                <span className="mr-3">{idx < step ? '✓' : '▶'}</span>
                                {text}
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>

                {/* Progress bar */}
                <div className="mt-8 h-1 w-full bg-naos-gold/20 overflow-hidden rounded-full">
                    <motion.div 
                        className="h-full bg-naos-gold"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min((step / steps.length) * 100, 100)}%` }}
                        transition={{ ease: 'linear', duration: 1.5 }}
                    />
                </div>
            </div>
        </div>
    );
};
