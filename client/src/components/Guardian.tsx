import React from 'react';
import { useTimeBasedMode } from '../hooks/useTimeBasedMode';
import { cn } from '../lib/utils';
import { useGuardianState } from '../contexts/GuardianContext';

import { motion, AnimatePresence } from 'framer-motion';

interface GuardianProps {
    view: 'LANDING' | 'ONBOARDING' | 'TEMPLE' | 'ASTRO' | 'NUMERO' | 'TAROT' | 'FENGSHUI' | 'CHAT' | 'SYNASTRY' | 'MAYA' | 'TRANSITS' | 'ORIENTAL' | 'MANUALS' | 'INTENTION' | 'LOGIN' | 'SANCTUARY' | 'WELCOME_BACK' | 'ENERGY_CODE' | 'ORACLE_SOULS' | 'PROTOCOL' | 'PROTOCOL21' | 'ELEMENTAL_LAB' | 'RANKING' | 'PROFILE' | 'EVOLUTION' | 'IDENTITY_NEXUS' | 'DECISION_ENGINE' | 'MISSION_YEAR';
    onOpenChat?: () => void;
}

export const Guardian: React.FC<GuardianProps> = ({ view, onOpenChat }) => {
    const timeMode = useTimeBasedMode();
    const { state } = useGuardianState();
    const [scrollY, setScrollY] = React.useState(0);

    React.useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine Visibility, Scale and Position based on view
    const isHidden = view === 'LANDING' || view === 'ONBOARDING' || view === 'LOGIN' || (view as any) === 'WELCOME_BACK';
    const isResting = view === 'TEMPLE' || view === 'IDENTITY_NEXUS';
    const isChatting = view === 'CHAT';
    const isManifesting = ['ASTRO', 'NUMERO', 'TAROT', 'FENGSHUI', 'SYNASTRY', 'MAYA', 'TRANSITS', 'ORIENTAL', 'INTENTION', 'ORACLE_SOULS', 'IDENTITY_NEXUS', 'PROTOCOL21'].includes(view);

    // Interaction states
    const isListening = state === 'LISTENING';
    const isResponding = state === 'RESPONDING';

    // Scroll-reactive transforms (base)
    const scrollScale = Math.max(0.92, 1 - scrollY / 1000);
    const scrollOpacity = Math.max(0.85, 1 - scrollY / 2000);

    // Cache busting reference - BUMPED TO 7.6 FOR AUDIT REFRESH
    const assetVersion = "7.6";

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    className={cn(
                        "fixed z-[100] left-1/2 cursor-pointer pointer-events-auto",
                        isResting && "top-[calc(120px+env(safe-area-inset-top))] md:top-[80px]",
                        isChatting && "top-[calc(120px+env(safe-area-inset-top))] md:top-[80px]",
                        isManifesting && "top-[calc(4rem+env(safe-area-inset-top))] left-6 -translate-x-0 !w-20 !h-20"
                    )}
                    animate={{
                        opacity: isManifesting ? 0.4 : scrollOpacity,
                        scale: isManifesting ? 0.6 : (isResting ? scrollScale * 1.2 : scrollScale),
                        x: isManifesting ? 0 : "-50%",
                        y: 0,
                        rotate: isManifesting ? 12 : 0,
                        // STITCH UPDATE: Reduced size by ~30% for subtle guidance
                        width: isManifesting ? 64 : (isResting ? (window.innerWidth < 768 ? 130 : 220) : (window.innerWidth < 768 ? 100 : 180)),
                        height: isManifesting ? 64 : (isResting ? (window.innerWidth < 768 ? 130 : 220) : (window.innerWidth < 768 ? 100 : 180))
                    }}
                    style={{}}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenChat?.();
                    }}
                >
                    {/* Sacred Breathing & Floating Wrapper */}
                    <motion.div
                        animate={{
                            y: [0, -4, 0],
                        }}
                        transition={{
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative w-full h-full"
                        style={isResting ? { transform: 'translateY(5vh)' } : {}}
                    >
                        {/* 1. SYMBOLIC CENTER (The Aura) - ALL GLOWS EXTERMINATED */}
                        <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                            <video
                                src={timeMode === 'DAY' ? `/Guardian-Day.mp4?v=${assetVersion}` : `/Guardian-Night.mp4?v=${assetVersion}`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
                                className={cn(
                                    "w-full h-full object-contain transition-opacity duration-1000 relative z-10"
                                )}
                                style={{
                                    objectPosition: 'center', 
                                    mixBlendMode: 'plus-lighter',
                                    maskImage: 'radial-gradient(circle at center, white 8%, transparent 48%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, white 8%, transparent 48%)',
                                    clipPath: 'circle(32% at 50% 50%)',
                                    WebkitClipPath: 'circle(32% at 50% 50%)',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden',
                                    transform: 'translateZ(0)',
                                    willChange: 'opacity, transform'
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
