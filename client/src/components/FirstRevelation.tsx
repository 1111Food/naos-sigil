import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../contexts/ProfileContext';
import { patternComposer, LifePathNumber } from '../constants/firstRevelationPattern';
import { ChevronRight } from 'lucide-react';

interface FirstRevelationProps {
    onComplete: (sigilPrompt?: string) => void;
}

export function FirstRevelation({ onComplete }: FirstRevelationProps) {
    const { profile } = useProfile();
    const [step, setStep] = useState(0);

    // Provide safe defaults if profile is somehow missing data
    const solarSign = profile?.zodiac_sign_es || profile?.zodiac_sign || 'Aries';
    const lifePathStr = profile?.life_path_number?.toString() || '1';
    const lifePathNum = parseInt(lifePathStr) as LifePathNumber;
    const mayanSign = profile?.mayan_nahual_es || profile?.mayan_nahual || 'B\'atz\'';
    const chineseSign = profile?.chinese_animal_es || profile?.chinese_animal || 'Dragón';

    const patternData = patternComposer(lifePathNum, solarSign);

    const nextStep = () => {
        setStep(s => s + 1);
    };

    const handleSigilPrompt = (prompt: string) => {
        onComplete(prompt);
    };

    const handleSkipToTemple = () => {
        onComplete();
    };

    const fadeInVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[100px] animate-pulse-slow"></div>
            </div>

            <div className="z-10 w-full max-w-lg text-center flex flex-col items-center justify-center min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <h1 className="text-xl md:text-2xl font-serif tracking-widest uppercase text-white/80">
                                Your Code Is Ready
                            </h1>
                            <div className="w-16 h-px bg-amber-500/50 mx-auto"></div>
                            <p className="text-white/40 text-sm tracking-wider">
                                NAOS has cross-referenced your coordinates.
                            </p>
                            <button onClick={nextStep} className="mt-8 px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center gap-2 mx-auto">
                                Reveal <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <p className="text-cyan-400/80 text-xs tracking-[0.3em] uppercase">Step 1</p>
                            <h2 className="text-sm uppercase tracking-widest text-white/50">Your Core</h2>
                            <h1 className="text-4xl md:text-5xl font-serif text-white">{solarSign}</h1>
                            <button onClick={nextStep} className="mt-12 px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors mx-auto">Next</button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <p className="text-fuchsia-400/80 text-xs tracking-[0.3em] uppercase">Step 2</p>
                            <h2 className="text-sm uppercase tracking-widest text-white/50">Your Path</h2>
                            <h1 className="text-5xl md:text-6xl font-serif text-white">{lifePathNum}</h1>
                            <button onClick={nextStep} className="mt-12 px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors mx-auto">Next</button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <p className="text-emerald-400/80 text-xs tracking-[0.3em] uppercase">Step 3</p>
                            <h2 className="text-sm uppercase tracking-widest text-white/50">Your Maya Sign</h2>
                            <h1 className="text-4xl md:text-5xl font-serif text-white">{mayanSign}</h1>
                            <button onClick={nextStep} className="mt-12 px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors mx-auto">Next</button>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                            <p className="text-rose-400/80 text-xs tracking-[0.3em] uppercase">Step 4</p>
                            <h2 className="text-sm uppercase tracking-widest text-white/50">Your Chinese Archetype</h2>
                            <h1 className="text-4xl md:text-5xl font-serif text-white">{chineseSign}</h1>
                            <button onClick={nextStep} className="mt-12 px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white/10 transition-colors mx-auto">Next</button>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="step5" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 w-full">
                            <h2 className="text-sm uppercase tracking-[0.2em] text-white/50">Your NAOS Code</h2>
                            <div className="flex flex-wrap items-center justify-center gap-3 text-lg md:text-xl font-serif text-white/90 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span>{solarSign}</span>
                                <span className="text-white/30">•</span>
                                <span>{lifePathNum}</span>
                                <span className="text-white/30">•</span>
                                <span>{mayanSign}</span>
                                <span className="text-white/30">•</span>
                                <span>{chineseSign}</span>
                            </div>
                            <p className="text-white/50 text-sm tracking-wider italic">
                                Four signals. One pattern to explore.
                            </p>
                            <button onClick={nextStep} className="mt-8 px-6 py-3 bg-white/10 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white/20 transition-colors mx-auto flex items-center gap-2">
                                Reveal Pattern
                            </button>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div key="step6" variants={fadeInVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 w-full max-w-lg text-center">
                            <h2 className="text-xs uppercase tracking-[0.3em] text-amber-500/80 font-bold">A Pattern Emerges</h2>
                            
                            <h1 className="text-2xl md:text-3xl font-serif text-amber-100 tracking-wide leading-tight">
                                {patternData.primaryAxis}
                            </h1>
                            
                            <div className="w-12 h-px bg-amber-500/30 mx-auto"></div>
                            
                            <p className="text-white/70 text-base md:text-lg leading-relaxed font-serif italic">
                                "You may feel most alive when balancing this polarity. {patternData.expression}"
                            </p>
                            
                            <div className="pt-4 pb-2">
                                <p className="text-white/40 text-xs uppercase tracking-widest mb-6 border border-white/10 inline-block px-4 py-2 rounded-full bg-white/5">
                                    Don't take it as a verdict. Test it.
                                </p>
                            </div>

                            <div className="space-y-4 text-left bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                                <h3 className="text-xs uppercase tracking-widest text-white/50 mb-4 text-center">I found something worth exploring.</h3>
                                
                                <button 
                                    onClick={() => handleSigilPrompt(`Why do I feel stuck lately, considering my pattern is ${patternData.primaryAxis}?`)}
                                    className="w-full p-4 border border-white/5 bg-white/5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-all text-left flex justify-between items-center group"
                                >
                                    <span>Why do I feel stuck lately?</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-widest text-white/40">ASK SIGIL</span>
                                </button>
                                
                                <button 
                                    onClick={() => handleSigilPrompt(`What is this pattern (${patternData.primaryAxis}) trying to show me?`)}
                                    className="w-full p-4 border border-white/5 bg-white/5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-all text-left flex justify-between items-center group"
                                >
                                    <span>What is this pattern trying to show me?</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-widest text-white/40">ASK SIGIL</span>
                                </button>
                                
                                <button 
                                    onClick={() => handleSigilPrompt(`What should I focus on right now?`)}
                                    className="w-full p-4 border border-white/5 bg-white/5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-all text-left flex justify-between items-center group"
                                >
                                    <span>What should I focus on right now?</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-widest text-white/40">ASK SIGIL</span>
                                </button>
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                    onClick={handleSkipToTemple}
                                    className="text-white/30 text-xs uppercase tracking-widest hover:text-white/70 transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-white/40"
                                >
                                    Enter the Temple
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
