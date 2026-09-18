import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../i18n';
import { useProfile } from '../hooks/useProfile';
import { useSound } from '../hooks/useSound';
import { Play, Sparkles, Zap, Map, Beaker, Eye } from 'lucide-react';

interface WelcomeArchitectExperienceProps {
    onComplete: () => void;
}

export const WelcomeArchitectExperience: React.FC<WelcomeArchitectExperienceProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const { t, language } = useTranslation();
    const { profile } = useProfile();
    const { playSound } = useSound();
    const isEn = language === 'en';

    const handleNext = () => {
        playSound('click');
        if (step < 2) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    const steps = [
        {
            eyebrow: isEn ? `NAOS ${profile?.canonical_archetype?.nombre_en?.toUpperCase() || "ARCHITECT"}` : `NAOS ${profile?.canonical_archetype?.nombre?.toUpperCase() || "ARQUITECTO"}`,
            headline: isEn ? `WELCOME, ${profile?.canonical_archetype?.nombre_en?.toUpperCase() || "ARCHITECT"}` : `BIENVENIDO,\n${profile?.canonical_archetype?.nombre?.toUpperCase() || "ARQUITECTO"}`,
            body: isEn 
                ? "Your system has just expanded.\n\nNAOS can now guide you with greater depth, broader context, and new ways to explore your patterns." 
                : "Tu sistema acaba de expandirse.\n\nNAOS ahora puede acompañarte con más profundidad, más contexto y más formas de explorar tus patrones.",
            cta: isEn ? "CONTINUE" : "CONTINUAR"
        },
        {
            eyebrow: isEn ? "YOUR ACCESS IS EXPANDED" : "TU ACCESO SE HA EXPANDIDO",
            headline: isEn ? "¿WHAT DO YOU NEED NOW?" : "¿Qué necesitas ahora?",
            benefits: [
                {
                    icon: <Zap className="w-5 h-5 text-amber-400" />,
                    title: "SIGIL",
                    desc: isEn ? "42 daily messages and access to deep interpretations." : "42 mensajes diarios y acceso a interpretaciones profundas."
                },
                {
                    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
                    title: "TELEGRAM",
                    desc: isEn ? "Talk to Sigil seamlessly from Telegram." : "Habla con Sigil también desde Telegram."
                },
                {
                    icon: <Map className="w-5 h-5 text-amber-400" />,
                    title: isEn ? "TIME MAP" : "MAPA TEMPORAL",
                    desc: isEn ? "Explore the next 12 months and your Current Energy." : "Explora los próximos 12 meses y tu Energía Actual."
                },
                {
                    icon: <Beaker className="w-5 h-5 text-amber-400" />,
                    title: isEn ? "LABORATORY + PROTOCOLS" : "LABORATORIO + PROTOCOLOS",
                    desc: isEn ? "Access to the Elemental Lab and 21/90 Protocols." : "Acceso al Laboratorio Elemental y Protocolos 21/90."
                },
                {
                    icon: <Eye className="w-5 h-5 text-amber-400" />,
                    title: isEn ? "ORACLE + CONNECTIONS" : "ORÁCULO + VÍNCULOS",
                    desc: isEn ? "Unlimited queries without the Free mode daily quota." : "Consultas sin la cuota diaria del modo Free."
                }
            ],
            cta: isEn ? "CONTINUE" : "CONTINUAR"
        },
        {
            eyebrow: "SYSTEM EXPANDED",
            headline: isEn ? `NAOS ${profile?.canonical_archetype?.nombre_en?.toUpperCase() || "ARCHITECT"}\nIS ACTIVE` : `NAOS ${profile?.canonical_archetype?.nombre?.toUpperCase() || "ARQUITECTO"}\nESTÁ ACTIVO`,
            body: isEn 
                ? "Your identity was only the beginning.\n\nNow you can work with time, connections, memory, and context." 
                : "Tu identidad era el comienzo.\n\nAhora puedes trabajar con el tiempo, los vínculos, la memoria y el contexto.",
            cta: isEn ? "ENTER NAOS" : "ENTRAR A NAOS",
            microcopy: "IDENTITY → PATTERN → CONTEXT → ACTION → EVOLUTION"
        }
    ];

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/95 backdrop-blur-xl overflow-hidden font-sans text-white">
            {/* Background ambient light - Naos Gold style */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-amber-500/5 rounded-full blur-[100px] opacity-80 pointer-events-none" />

            {/* Orbit Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/10 animate-spin-slow w-[600px] h-[600px] pointer-events-none" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-3xl px-6 flex flex-col items-center text-center"
                >
                    {/* Avatar / Identity - Guardian Robot for Step 1 & 3 */}
                    {(step === 0 || step === 2) && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            className="relative mb-12"
                        >
                            <div className="w-24 h-24 rounded-full border border-amber-500/30 flex items-center justify-center bg-black/50 shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden relative">
                                <video
                                    src="/Guardian-Day.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-[150%] h-[150%] object-cover opacity-90 mix-blend-screen"
                                    style={{ filter: 'contrast(1.2) brightness(1.1)', objectPosition: '65% 30%' }}
                                />
                                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(245,158,11,0.3)] pointer-events-none" />
                            </div>
                        </motion.div>
                    )}

                    {step === 0 && (
                        <div className="flex flex-col items-center space-y-6">
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-amber-500/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold"
                            >
                                {current.eyebrow}
                            </motion.p>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-4xl md:text-5xl font-serif whitespace-pre-line text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                            >
                                {current.headline}
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-sm md:text-base text-white/50 max-w-md whitespace-pre-wrap leading-relaxed mt-4"
                            >
                                {current.body}
                            </motion.p>
                        </div>
                    )}

                    {step === 1 && current.benefits && (
                        <div className="flex flex-col items-center w-full space-y-10">
                            <div className="space-y-4">
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-amber-500/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold"
                                >
                                    {current.eyebrow}
                                </motion.p>
                                <motion.h2 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-3xl md:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                                >
                                    {current.headline}
                                </motion.h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-left w-full max-w-2xl mt-8">
                                {current.benefits.map((benefit, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + (idx * 0.1) }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            {benefit.icon}
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <h3 className="text-[11px] uppercase tracking-[0.2em] text-amber-400 font-bold drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{benefit.title}</h3>
                                            <p className="text-xs md:text-sm text-white/50 leading-relaxed">{benefit.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center space-y-6">
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-amber-500/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold"
                            >
                                {current.eyebrow}
                            </motion.p>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-4xl md:text-5xl font-serif whitespace-pre-line text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                            >
                                {current.headline}
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-sm md:text-base text-white/50 max-w-md whitespace-pre-wrap leading-relaxed mt-4"
                            >
                                {current.body}
                            </motion.p>
                        </div>
                    )}

                    {/* Navigation CTA */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-16 flex flex-col items-center w-full max-w-xs mx-auto"
                    >
                        <motion.button
                            onClick={handleNext}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative w-full py-4 px-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-100 font-bold tracking-widest uppercase text-xs hover:bg-amber-500/20 hover:border-amber-500/50 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3"
                        >
                            <span>{current.cta}</span>
                            <Play className="w-3 h-3 fill-current group-hover:translate-x-1 transition-transform" />

                            {/* Pulse Effect */}
                            {step === 2 && (
                                <span className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-20" />
                            )}
                        </motion.button>

                        {step === 2 && (
                            <span className="mt-8 text-[8px] md:text-[9px] uppercase tracking-[0.3em] text-white/20 font-mono">
                                {current.microcopy}
                            </span>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

