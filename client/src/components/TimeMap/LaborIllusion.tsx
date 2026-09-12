import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n';

interface LaborIllusionProps {
    onComplete: () => void;
}

export const LaborIllusion: React.FC<LaborIllusionProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const { language } = useTranslation();

    const steps = language === 'en' ? [
        "\u2728 Calculating astrological transits...",
        "\uD83D\uDD22 Analyzing personal year and month...",
        "\uD83C\uDF15 Interpreting Nahual energy...",
        "\uD83D\uDC09 Synchronizing Chinese Calendar...",
        "\uD83D\uDCBE Integrating your history in NAOS...",
        "\uD83D\uDD2E Merging the 4 Intelligence Sources...",
        "\u23F3 Constructing Timeline...",
        "\u2728 Connecting with Sigil..."
    ] : [
        "\u2728 Calculando tránsitos astrológicos...",
        "\uD83D\uDD22 Analizando año y mes personal...",
        "\uD83C\uDF15 Interpretando energía del Nahual...",
        "\uD83D\uDC09 Sincronizando Calendario Chino...",
        "\uD83D\uDCBE Integrando tu historial en NAOS...",
        "\uD83D\uDD2E Fusionando las 4 Intelligence Sources...",
        "\u23F3 Construyendo Línea Temporal...",
        "\u2728 Conectando con Sigil..."
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
                                <span className="mr-3">{idx < step ? 'âœ“' : 'â–¶'}</span>
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

