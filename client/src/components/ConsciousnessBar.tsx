import React from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { Sparkles } from 'lucide-react';

export const ConsciousnessBar: React.FC = () => {
    const { profile } = useProfile();
    const points = profile?.consciousness_points || 0;
    const level = profile?.consciousness_level || 'Iniciado';

    const getNextThreshold = () => {
        if (points < 50) return 50;
        if (points < 200) return 200;
        if (points < 500) return 500;
        if (points < 1000) return 1000;
        return 5000; // max cap
    };

    const nextThreshold = getNextThreshold();
    const progress = Math.min((points / nextThreshold) * 100, 100);

    return (
        <div className="flex flex-col items-center gap-1 w-full max-w-[180px]">
            {profile?.plan_type === 'premium' && (
                <div className="text-[7px] uppercase tracking-[0.25em] font-black text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.4)] mb-0.5">
                    Modo Arquitecto
                </div>
            )}
            <div className="flex justify-between w-full text-[9px] uppercase tracking-wider text-white/50 px-0.5">
                <span className="flex items-center gap-1 font-bold text-cyan-400">
                    <Sparkles className="w-2.5 h-2.5" /> {level}
                </span>
                <span>{points} / {nextThreshold} pts</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/5 border border-white/5 overflow-hidden backdrop-blur-sm">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                />
            </div>
        </div>
    );
};
