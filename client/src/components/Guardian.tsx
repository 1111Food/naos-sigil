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

    // Cache busting reference
    const assetVersion = React.useMemo(() => new Date().getTime(), []);

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
                            scale: isListening ? 1.03 : isResponding ? 1.05 : [1, 1.02, 1],
                        }}
                        transition={{
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                            scale: isListening || isResponding
                                ? { duration: 0.5 }
                                : { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative w-full h-full"
                        style={isResting ? { transform: 'translateY(5vh)' } : {}}
                    >
                        {/* Main Guardian Identity - ULTRA-TIGHT MASKED VIDEO */}
                        <div className="relative w-full h-full pointer-events-none flex items-center justify-center">
                            <video
                                key={`${timeMode}-${assetVersion}`}
                                src={timeMode === 'DAY' ? `/Guardian-Day.mp4?v=${assetVersion}` : `/Guardian-Night.mp4?v=${assetVersion}`}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
                                poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                                className={cn(
                                    "w-full h-full object-contain transition-opacity duration-1000 relative z-10"
                                )}
                                style={{
                                    objectPosition: 'center', 
                                    mixBlendMode: 'screen',
                                    backgroundColor: 'transparent',
                                    maskImage: 'radial-gradient(circle at center, white 2%, transparent 35%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, white 2%, transparent 35%)',
                                    clipPath: 'circle(25% at 50% 50%)',
                                    WebkitClipPath: 'circle(25% at 50% 50%)',
                                    willChange: 'transform, opacity'
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
