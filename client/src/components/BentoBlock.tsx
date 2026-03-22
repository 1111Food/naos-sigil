import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface BentoBlockProps {
    title: string;
    accent: 'emerald' | 'cyan' | 'magenta' | 'orange' | 'violet' | 'purple' | 'red' | 'gold';
    status?: string;
    summary?: { label: string; value: string }[];
    cta?: string;
    onClick?: () => void;
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    clipPath: string;
    pathData: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    locked?: boolean;
}

export const BentoBlock: React.FC<BentoBlockProps> = memo(({ title, accent, status, summary, cta, onClick, secondaryAction, clipPath, pathData, position = 'top-left', locked = false }) => {
    const glows = {
        cyan: 'hover:shadow-[0_0_60px_-20px_rgba(30,64,175,0.6)] border-blue-400/30',
        magenta: 'hover:shadow-[0_0_60px_-20px_rgba(139,92,246,0.6)] border-purple-400/30',
        emerald: 'hover:shadow-[0_0_60px_-20px_rgba(16,185,129,0.6)] border-emerald-400/30',
        orange: 'hover:shadow-[0_0_60px_-20px_rgba(245,158,11,0.6)] border-amber-400/30',
        violet: 'hover:shadow-[0_0_60px_-20px_rgba(139,92,246,0.6)] border-violet-400/30',
        purple: 'hover:shadow-[0_0_60px_-20px_rgba(168,85,247,0.6)] border-purple-400/30',
        red: 'hover:shadow-[0_0_60px_-20px_rgba(220,38,38,0.5)] border-red-500/30',
        gold: 'hover:shadow-[0_0_60px_-20px_rgba(217,119,6,0.6)] border-yellow-500/40'
    };

    const textAccents = {
        cyan: 'text-blue-400',
        magenta: 'text-purple-400',
        emerald: 'text-emerald-400',
        orange: 'text-amber-400',
        violet: 'text-violet-400',
        purple: 'text-purple-400',
        red: 'text-red-500',
        gold: 'text-yellow-500'
    };


    const bgAccents = {
        cyan: 'bg-gradient-to-br from-blue-900/40 to-blue-950/60 aura-zen-white:from-blue-500/30 aura-zen-white:to-blue-600/40',
        magenta: 'bg-gradient-to-br from-purple-900/40 to-purple-950/60 aura-zen-white:from-purple-500/30 aura-zen-white:to-purple-600/40',
        emerald: 'bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 aura-zen-white:from-emerald-500/30 aura-zen-white:to-emerald-600/40',
        orange: 'bg-gradient-to-br from-amber-900/30 to-orange-950/60 aura-zen-white:from-amber-400/30 aura-zen-white:to-orange-500/40',
        violet: 'bg-gradient-to-br from-violet-900/40 to-fuchsia-950/60 aura-zen-white:from-violet-400/30 aura-zen-white:to-fuchsia-500/40',
        purple: 'bg-gradient-to-br from-purple-900/40 to-indigo-950/60 aura-zen-white:from-purple-400/30 aura-zen-white:to-indigo-500/40',
        red: 'bg-gradient-to-br from-red-600/30 to-red-900/60 aura-zen-white:from-red-500/40 aura-zen-white:to-red-700/50',
        gold: 'bg-gradient-to-br from-yellow-500/30 to-amber-700/60 aura-zen-white:from-yellow-400/40 aura-zen-white:to-amber-600/50'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={!locked ? {
                scale: 1.02,
                zIndex: 50,
                transition: { duration: 0.5, ease: 'easeOut' }
            } : {}}
            className={cn(
                "relative w-full h-full group transition-all duration-700 flex flex-col items-center justify-center",
                locked ? "cursor-not-allowed" : "cursor-pointer"
            )}
            onClick={!locked ? onClick : undefined}
        >
            <div
                className={`absolute inset-0 glass-card ${bgAccents[accent]} ${glows[accent]} transition-all duration-700`}
                style={{ clipPath }}
            >
                <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-br ${accent === 'cyan' ? 'from-blue-500' :
                    accent === 'magenta' ? 'from-purple-500' :
                        accent === 'emerald' ? 'from-emerald-500' :
                            accent === 'purple' ? 'from-purple-500' :
                                accent === 'red' ? 'from-red-500' :
                                    accent === 'gold' ? 'from-yellow-400' : 'from-amber-500'
                    } to-transparent`} />
            </div>

            <div className="absolute inset-0 pointer-events-none p-[0.5px]">
                <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <path
                        d={pathData}
                        vectorEffect="non-scaling-stroke"
                        className={`fill-none stroke-[2px] ${accent === 'cyan' ? 'stroke-blue-400' :
                            accent === 'magenta' ? 'stroke-purple-400' :
                                accent === 'emerald' ? 'stroke-emerald-400' :
                                    accent === 'purple' ? 'stroke-purple-400' :
                                        accent === 'red' ? 'stroke-red-500' :
                                            accent === 'gold' ? 'stroke-yellow-500' : 'stroke-orange-400'} transition-all duration-700 shadow-[0_0_10px_currentColor]`}
                        style={{
                            strokeLinejoin: 'round',
                            opacity: 0.4,
                        }}
                    />
                </svg>
            </div>

            <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center space-y-2 md:space-y-4 lg:space-y-8 px-[10%] ${position === 'top-left' ? 'pr-[15%] pb-[15%]' :
                position === 'top-right' ? 'pl-[15%] pb-[15%]' :
                    position === 'bottom-left' ? 'pr-[15%] pt-[15%]' :
                        'pl-[15%] pt-[15%]'
                }`}>
                <div className="flex flex-col items-center gap-1 md:gap-6 text-center w-full">
                    <div className="space-y-1 md:space-y-3 flex flex-col items-center">
                        <h3 className="text-[11px] sm:text-sm md:text-2xl lg:text-3xl font-serif italic tracking-[0.02em] theme-aware-text bento-title transition-all duration-700 leading-tight">
                            {title}
                        </h3>
                        <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/40 transition-all duration-1000 bento-divider" />
                    </div>
                    {status && (
                        <span className={`text-[6px] md:text-[10px] px-2 md:px-4 py-1 md:py-1.5 rounded-full border border-current font-black tracking-[0.2em] bg-black/40 uppercase bento-status aura-zen-white:text-white aura-zen-white:border-white/20 ${textAccents[accent]}`}>
                            {status}
                        </span>
                    )}
                </div>

                {summary && summary.length > 0 && (
                    <div className="space-y-2 md:space-y-4 w-full">
                        {summary.map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-0.5">
                                <span className="text-[7px] md:text-[9px] uppercase tracking-[0.25em] text-white/30 font-black bento-label">
                                    {item.label}
                                </span>
                                <span className="text-xs sm:text-lg md:text-xl lg:text-2xl font-serif italic tracking-[0.05em] theme-aware-text bento-title text-center">
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {secondaryAction && (
                    <div className="pt-1 md:pt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); secondaryAction.onClick(); }}
                            className="flex items-center gap-1 md:gap-3 py-1 md:py-2 px-3 md:px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            <span className="text-[6px] md:text-[9px] uppercase tracking-[0.2em] font-black text-white/60">
                                {secondaryAction.label}
                            </span>
                        </button>
                    </div>
                )}

                {cta && (
                    <div className="flex items-center justify-center gap-1 md:gap-3 pt-3 md:pt-6 border-t border-white/10 w-full mt-2 md:mt-4 bento-divider">
                        <span className="text-[6px] md:text-[10px] uppercase tracking-[0.3em] font-black text-white/40 group-hover:text-white bento-label aura-zen-white:group-hover:text-black transition-colors min-w-0 truncate">
                            {cta}
                        </span>
                        <div className="w-4 h-4 md:w-8 md:h-8 shrink-0 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all aura-zen-white:border-black/10 aura-zen-white:group-hover:bg-black aura-zen-white:group-hover:text-white">
                            <span className="text-[8px] md:text-sm">→</span>
                        </div>
                    </div>
                )}
            </div>

            {/* LOCKED OVERLAY */}
            {locked && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]" style={{ clipPath }}>
                    <Lock className="w-6 h-6 text-amber-500/80 mb-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.2em] font-black text-amber-500/70 text-center px-4">
                        Disponible en modo Arquitecto (Premium)
                    </span>
                </div>
            )}
        </motion.div>
    );
});
