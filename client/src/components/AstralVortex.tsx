import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '11', '22', '33', '7', '9'];

export const AstralVortex: React.FC = () => {
    // Generate stable random properties for each symbol
    const particles = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            xData: Math.random() * 100, // percentage
            yData: Math.random() * 100, // percentage
            scale: 0.5 + Math.random() * 1.5,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * 10,
            isNumber: !['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].includes(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]),
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Dark gradient base to hide edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1f] via-transparent to-[#0a0a1f] opacity-80" />

            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="relative w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw]"
                >
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className={`absolute font-serif ${p.isNumber ? 'text-amber-500/20' : 'text-cyan-500/20'}`}
                            style={{
                                left: `${p.xData}%`,
                                top: `${p.yData}%`,
                                fontSize: `${p.scale}rem`,
                                textShadow: `0 0 10px ${p.isNumber ? 'rgba(245,158,11,0.3)' : 'rgba(6,182,212,0.3)'}`
                            }}
                            animate={{
                                y: ["-20px", "20px", "-20px"],
                                rotate: [0, 180, 360],
                                opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                ease: "linear",
                                delay: p.delay
                            }}
                        >
                            {p.symbol}
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Core Glow behind portal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-cyan-900/20 rounded-full blur-[100px] animate-pulse" />
        </div>
    );
};
