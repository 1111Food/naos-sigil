import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface SigilSyncToggleProps {
    userId: string;
    aspect: string;
    className?: string;
}

export const SigilSyncToggle: React.FC<SigilSyncToggleProps> = ({ userId, aspect, className }) => {
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTuning = async () => {
            setLoading(true);
            const { data, error: _error } = await supabase
                .from('coherence_tunings')
                .select('is_active')
                .eq('user_id', userId)
                .eq('aspect', aspect)
                .single();

            if (data) {
                setIsActive(data.is_active);
            }
            setLoading(false);
        };

        if (userId) fetchTuning();
    }, [userId, aspect]);

    const toggleSync = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        const newState = !isActive;

        try {
            const { error: _error } = await supabase
                .from('coherence_tunings')
                .upsert({
                    user_id: userId,
                    aspect: aspect,
                    is_active: newState,
                    cron_schedule: '08:00,20:00' // Sincronización fija (Mañana y Noche)
                }, { onConflict: 'user_id,aspect' });

            if (!_error) {
                setIsActive(newState);
            }
        } catch (err) {
            console.error("Error toggling Sigil sync:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSync}
            disabled={loading}
            className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-500 border",
                isActive
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-white/[0.03] text-white/10 border-white/5 hover:text-white/30 hover:border-white/10",
                loading && "opacity-50 cursor-wait",
                className
            )}
            title={isActive ? "Sincronización Sigil Activa" : "Sincronizar hábito con el Sigil"}
        >
            <Sparkles
                className={cn(
                    "w-3.5 h-3.5 transition-all duration-700",
                    isActive ? "animate-pulse scale-110" : "opacity-40"
                )}
            />
        </motion.button>
    );
};
