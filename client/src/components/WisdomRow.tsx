import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface WisdomRowProps {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: LucideIcon;
    color: string; // Tailwind bg class for glow
    isActive: boolean;
    onClick: () => void;
    delay?: number;
}

export const WisdomRow: React.FC<WisdomRowProps> = ({
    title,
    subtitle,
    description,
    icon: Icon,
    color,
    isActive,
    onClick,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            onClick={isActive ? onClick : undefined}
            className={cn(
                "group relative w-full overflow-hidden rounded-2xl border transition-all duration-500",
                isActive 
                    ? "bg-[#080808]/40 border-white/5 hover:border-white/10 hover:bg-[#0a0a0a]/60 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                    : "border-white/[0.02] opacity-40 grayscale pointer-events-none bg-transparent"
            )}
        >
            {/* Próximamente Overlay */}
            {!isActive && (
                <div className="absolute inset-0 flex items-center justify-end pr-12 bg-black/20 backdrop-blur-[1px] z-20">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold border border-white/5">Próximamente</span>
                </div>
            )}

            <div className="flex items-center p-4 md:p-6 gap-6 relative z-10">
                {/* Icon Container with Glow */}
                <div className="relative shrink-0">
                    <div className={cn(
                        "absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700",
                        color
                    )} />
                    <div className={cn(
                        "relative w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                        isActive ? "bg-white/5 border-white/10 group-hover:border-white/20" : "bg-transparent border-white/5"
                    )}>
                        <Icon strokeWidth={1.5} className="w-5 h-5 text-white/80 group-hover:text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">{subtitle}</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent max-w-[40px]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif italic text-white/90 leading-tight group-hover:text-white transition-colors">{title}</h3>
                    <p className="text-white/40 text-[11px] leading-relaxed font-sans font-light italic truncate max-w-lg group-hover:text-white/60 transition-colors">
                        "{description}"
                    </p>
                </div>

                {/* Action Trigger */}
                <div className="shrink-0 flex items-center gap-2 pr-2">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/10 font-black group-hover:text-white/30 transition-colors hidden md:block">Explorar Nodo</span>
                    <ChevronRight className="w-4 h-4 text-white/5 group-hover:text-white/40 transition-all group-hover:translate-x-1" />
                </div>
            </div>

            {/* Hover Accent Line */}
            <div className={cn(
                "absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-700",
                color,
                "group-hover:w-full"
            )} />
        </motion.div>
    );
};
