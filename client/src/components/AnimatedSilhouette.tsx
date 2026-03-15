import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface AnimatedSilhouetteProps {
    className?: string;
    showBreathing?: boolean;
    showEnergyCenters?: boolean;
    // The architect will inject the exact SVG path d="..." string here later
    silhouettePath?: string;
}

export const AnimatedSilhouette: React.FC<AnimatedSilhouetteProps> = ({
    className,
    showBreathing = true,
    showEnergyCenters = true,
    silhouettePath = "M50,20c-6.6,0-12,5.4-12,12s5.4,12,12,12s12-5.4,12-12S56.6,20,50,20z M50,48c-13.2,0-26,7.7-26,22.2v50.3 c0,2.1,1.7,3.8,3.8,3.8l0,0l12.4,0c2.1,0,3.8-1.7,3.8-3.8V79.2c0-2.1,1.7-3.8,3.8-3.8l0,0l2.4,0c2.1,0,3.8,1.7,3.8,3.8v41.3 c0,2.1,1.7,3.8,3.8,3.8l0,0l12.4,0c2.1,0,3.8-1.7,3.8-3.8V70.2C76,55.7,63.2,48,50,48z"

}) => {
    // 7 Energy centers (from root to crown) mapped along a vertical axis
    // Assuming a 100x100 viewBox for the placeholder
    const energyCenters = [
        { id: 'root', y: 140, color: '#ef4444' },     // Red / Base
        { id: 'sacral', y: 115, color: '#f97316' },   // Orange
        { id: 'solar', y: 90, color: '#eab308' },     // Yellow
        { id: 'heart', y: 65, color: '#10b981' },     // Green (Emerald)
        { id: 'throat', y: 48, color: '#06b6d4' },    // Cyan
        { id: 'third-eye', y: 32, color: '#8b5cf6' }, // Violet
        { id: 'crown', y: 20, color: '#c084fc' }      // Light Violet / White
    ];

    return (
        <div className={cn("relative flex items-center justify-center w-full h-full", className)}>
            <svg
                viewBox="0 0 100 200"
                className="w-full h-full opacity-80 mix-blend-screen"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Silhouette Path */}
                <motion.path
                    d={silhouettePath}
                    fill="transparent"
                    stroke="rgba(6, 182, 212, 0.4)" /* Cyan accent */
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                />

                {/* Breathing Animation (Diaphragm glow in the center) */}
                {showBreathing && (
                    <motion.ellipse
                        cx="50"
                        cy="78"
                        rx="16"
                        ry="25"
                        fill="rgba(6, 182, 212, 0.15)"
                        filter="blur(4px)"
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{
                            duration: 10, // 4s inhale + 6s exhale
                            ease: "easeInOut",
                            repeat: Infinity,
                            times: [0, 0.4, 1] // 40% inhale, 60% exhale
                        }}
                    />
                )}

                {/* Energy Centers (Staggered pulsing) */}
                {showEnergyCenters && energyCenters.map((center, index) => (
                    <g key={center.id}>
                        {/* Glow effect */}
                        <motion.circle
                            cx="50"
                            cy={center.y}
                            r="3"
                            fill={center.color}
                            filter="blur(3px)"
                            animate={{
                                scale: [1, 1.8, 1],
                                opacity: [0.2, 0.8, 0.2]
                            }}
                            transition={{
                                duration: 4,
                                ease: "easeInOut",
                                repeat: Infinity,
                                delay: index * 0.4 // Stagger from bottom (root) to top
                            }}
                        />
                        {/* Core point */}
                        <motion.circle
                            cx="50"
                            cy={center.y}
                            r="1"
                            fill="#ffffff"
                            animate={{
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 4,
                                ease: "easeInOut",
                                repeat: Infinity,
                                delay: index * 0.4
                            }}
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
};
