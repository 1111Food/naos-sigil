import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SlideToEnterProps {
    onUnlock: () => void;
}

export const SlideToEnter: React.FC<SlideToEnterProps> = ({ onUnlock }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const btnWidth = 56; // equivalent to w-14 (14 * 4px = 56px)
    const padding = 8; // Need some padding to fit inside nicely

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }

        const handleResize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const x = useMotionValue(0);
    const controls = useAnimation();

    const handleDragEnd = async (_event: any, info: any) => {
        if (isUnlocked || containerWidth === 0) return;

        // Target is getting close to the right edge
        const threshold = containerWidth - btnWidth - (padding * 3);

        if (info.offset.x >= threshold) {
            setIsUnlocked(true);
            await controls.start({ x: containerWidth - btnWidth - padding });
            onUnlock();
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    // Make text fade out as button moves right
    const opacity = useTransform(x, [0, containerWidth / 2], [1, 0]);

    // Ensure we don't render drag constraints until we have width
    if (containerWidth === 0) {
        return <div ref={containerRef} className="w-full h-16 opacity-0" />;
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-[280px] h-16 mx-auto bg-black/40 border border-white/5 rounded-full overflow-hidden flex items-center shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] backdrop-blur-md">
            {/* Background Track Text/Glow */}
            <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-serif italic flex items-center gap-3">
                    Desliza para conectar <ArrowRight className="w-3 h-3 opacity-50" />
                </span>
            </motion.div>

            {/* Draggable Thumb */}
            <motion.div
                drag={isUnlocked ? false : "x"}
                dragConstraints={{ left: 0, right: containerWidth - btnWidth - padding }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x }}
                whileHover={!isUnlocked ? { scale: 1.05 } : {}}
                whileTap={!isUnlocked ? { cursor: 'grabbing' } : {}}
                className={`absolute left-[4px] w-14 h-14 rounded-full flex items-center justify-center cursor-grab transition-all duration-300 ${isUnlocked
                    ? 'bg-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.6)] border-amber-400'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                    }`}
            >
                {isUnlocked ? (
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/40 blur-[2px] transition-transform group-hover:scale-110" />
                )}
            </motion.div>
        </div>
    );
};
