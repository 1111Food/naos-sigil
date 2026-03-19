import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoherence } from '../hooks/useCoherence';
import { CoherenceDetailOverlay } from './CoherenceDetailOverlay';

export const CoherenceCore: React.FC = () => {
    const { score, index } = useCoherence();
    const [isHovered, setIsHovered] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    // Default values while loading or if index is missing
    const discipline = index?.discipline ?? 50;
    const energy = index?.energy ?? 50;
    const clarity = index?.clarity ?? 50;
    const global = score ?? 50;

    // Visual logic based on global coherence
    const isHigh = global >= 80;
    const isLow = global < 50;

    // Physics parameters
    const rotationDuration = isHigh ? 10 : isLow ? 40 : 25;
    const blurAmount = isLow ? "blur(8px)" : "blur(0px)";
    const opacity = isLow ? 0.6 : isHigh ? 1 : 0.8;

    // Node drift for low coherence
    const nodeAnimation = isLow ? {
        x: [0, 10, -10, 0],
        y: [0, -10, 10, 0],
        transition: { duration: 5, repeat: Infinity, ease: "linear" }
    } : {};

    return (
        <div
            className="relative flex items-center justify-center w-full h-full min-h-[300px] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setShowDetail(true)}
        >
            {/* Mirror of Stability - SVG Core */}
            <div className="relative w-52 h-52 flex items-center justify-center">

                {/* Background Glow */}
                <motion.div
                    animate={{
                        opacity: isHigh ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
                        scale: isHigh ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full blur-[60px] ${isHigh ? 'bg-cyan-500' : 'bg-amber-500/40'}`}
                />

                <motion.svg
                    viewBox="0 0 100 100"
                    className="w-full h-full relative z-10"
                    style={{ filter: blurAmount, opacity }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: rotationDuration, repeat: Infinity, ease: "linear" }}
                >
                    {/* Ring 1 - Discipline (Cyan) */}
                    <motion.circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1"
                        strokeDasharray={`${discipline * 2.5} 250`}
                        strokeLinecap="round"
                        className="opacity-40"
                    />

                    {/* Ring 2 - Energy (Amber) */}
                    <motion.circle
                        cx="50" cy="50" r="32"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray={`${energy * 2} 200`}
                        strokeLinecap="round"
                        className="opacity-30"
                        animate={{ rotate: -360 }}
                        transition={{ duration: rotationDuration * 1.5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Ring 3 - Clarity (Violet/Indigo) */}
                    <motion.circle
                        cx="50" cy="50" r="24"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="0.5"
                        strokeDasharray={`${clarity * 1.5} 150`}
                        strokeLinecap="round"
                        className="opacity-50"
                    />

                    {/* Central Pulse Node */}
                    <motion.circle
                        cx="50" cy="50" r="8"
                        fill={isHigh ? "#22d3ee" : "#f59e0b"}
                        animate={isLow ? {
                            scale: [1, 1.3, 0.8, 1],
                            opacity: [0.5, 1, 0.3, 0.5]
                        } : {
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={isLow ? {
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "anticipate"
                        } : {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                    />

                    {/* Drifting Nodes (Stability Indicators) */}
                    {[0, 120, 240].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const x = 50 + Math.cos(rad) * 45;
                        const y = 50 + Math.sin(rad) * 45;
                        return (
                            <motion.circle
                                key={i}
                                cx={x} cy={y} r="1.5"
                                fill="#fff"
                                animate={nodeAnimation as any}
                                className="opacity-40"
                            />
                        );
                    })}
                </motion.svg>

                {/* Floating Metrics (Hover) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute z-20 flex flex-col items-center pointer-events-none"
                        >
                            <span className="text-4xl font-serif italic text-white/90 mb-1 drop-shadow-md">
                                {global.toFixed(1)}%
                            </span>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] tracking-[0.2em] text-cyan-400 uppercase font-sans font-light">
                                    Disciplina: {discipline.toFixed(0)}
                                </span>
                                <span className="text-[10px] tracking-[0.2em] text-amber-400 uppercase font-sans font-light">
                                    Energía: {energy.toFixed(0)}
                                </span>
                                <span className="text-[10px] tracking-[0.2em] text-purple-400 uppercase font-sans font-light">
                                    Claridad: {clarity.toFixed(0)}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stability Label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="font-serif italic text-white/40 tracking-widest text-xs uppercase">
                        {isHigh ? "Espejo Sincronizado" : isLow ? "Espejo Inestable" : "Espejo en Equilibrio"}
                    </span>
                </div>
            </div>

            <CoherenceDetailOverlay
                isOpen={showDetail}
                onClose={() => setShowDetail(false)}
                metrics={{
                    global,
                    discipline,
                    energy,
                    clarity
                }}
            />
        </div>
    );
};
