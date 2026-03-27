import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, Target, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAsyncAuthHeaders } from '../lib/api';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';

interface TuningCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    practiceName: string;
    practiceIcon?: React.ReactNode;
}

const CYCLE_PLANS_CONFIG = [
    {
        id: 'monje',
        key: 'monk',
        schedule: '08:00,12:00,16:00,20:00',
        icon: <Target className="w-5 h-5 text-purple-400" />
    },
    {
        id: 'guerrero',
        key: 'warrior',
        schedule: '08:00,20:00',
        icon: <Zap className="w-5 h-5 text-amber-400" />
    },
    {
        id: 'microdosis',
        key: 'micro',
        schedule: '15:00',
        icon: <Sparkles className="w-5 h-5 text-cyan-400" />
    }
];

// @ts-ignore
export const TuningCycleModal: React.FC<TuningCycleModalProps> = ({
    isOpen,
    onClose,
    userId,
    practiceName,
    practiceIcon
}) => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [customTime, setCustomTime] = useState<string>('18:00');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSchedule = async (planId: string, schedule: string) => {
        setLoading(true);
        setSelectedPlan(planId);
        setErrorMsg(null);

        try {
            await getAsyncAuthHeaders(); // Force fresh session if approaching expiration
            if (!userId) throw new Error("No se pudo verificar la sesión de usuario en NAOS.");

            // Workaround for Supabase RLS Upsert Bug: Explicit Check
            const { data: existing } = await supabase
                .from('coherence_tunings')
                .select('id')
                .match({ user_id: userId, module_type: 'elemental_lab', aspect: practiceName })
                .maybeSingle();

            if (existing) {
                const { error: updateError } = await supabase
                    .from('coherence_tunings')
                    .update({
                        cron_schedule: schedule,
                        is_active: true
                    })
                    .eq('id', existing.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('coherence_tunings')
                    .insert({
                        user_id: userId,
                        module_type: 'elemental_lab',
                        aspect: practiceName,
                        cron_schedule: schedule,
                        is_active: true
                    });
                if (insertError) throw insertError;
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedPlan(null);
            }, 2000);
        } catch (err: any) {
            console.error("Error scheduling tuning cycle:", err);
            setErrorMsg(err.message || String(err));
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-cyan-400">
                                    {practiceIcon || <Sparkles className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif italic text-white">{t('tuning_modal_title')}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">{t('tuning_modal_subtitle')}: {practiceName}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-4">
                            {errorMsg && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
                                >
                                    <X className="w-4 h-4 flex-shrink-0" />
                                    <span>{errorMsg}</span>
                                </motion.div>
                            )}

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 flex flex-col items-center text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                        <Zap className="w-8 h-8 animate-pulse" />
                                    </div>
                                    <p className="text-white font-serif italic text-lg">{t('tuning_success_title')}</p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">{t('tuning_success_sub')}</p>
                                </motion.div>
                            ) : (
                                <>
                                    <p className="text-xs text-white/60 mb-6 font-light leading-relaxed">
                                        {t('tuning_modal_desc')}
                                    </p>

                                    <div className="space-y-3">
                                        {CYCLE_PLANS_CONFIG.map((plan) => (
                                            <button
                                                key={plan.id}
                                                disabled={loading}
                                                onClick={() => handleSchedule(plan.id, plan.schedule)}
                                                className={cn(
                                                    "w-full p-5 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 group",
                                                    selectedPlan === plan.id
                                                        ? "bg-cyan-500/10 border-cyan-500/30"
                                                        : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"
                                                )}
                                            >
                                                <div className="p-2 rounded-xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
                                                    {plan.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-sm font-bold text-white/90">{t(`tuning_plan_${plan.key}_title` as any)}</h4>
                                                        <span className="text-[8px] uppercase tracking-widest text-cyan-400 opacity-60 group-hover:opacity-100">{t(`tuning_plan_${plan.key}_sub` as any)}</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/40 leading-relaxed italic">{t(`tuning_plan_${plan.key}_desc` as any)}</p>
                                                </div>
                                            </button>
                                        ))}

                                        {/* CUSTOM TIME PICKER */}
                                        <div className={cn(
                                            "w-full p-5 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer",
                                            selectedPlan === 'custom'
                                                ? "bg-cyan-500/10 border-cyan-500/30"
                                                : "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10"
                                        )}
                                            onClick={() => setSelectedPlan('custom')}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="p-2 rounded-xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
                                                    <Clock className="w-5 h-5 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="text-sm font-bold text-white/90">{t('tuning_plan_custom_title')}</h4>
                                                        <span className="text-[8px] uppercase tracking-widest text-emerald-400 opacity-60 group-hover:opacity-100">{t('tuning_plan_custom_sub')}</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/40 leading-relaxed italic">{t('tuning_plan_custom_desc')}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <input
                                                    type="time"
                                                    value={customTime}
                                                    onChange={(e) => {
                                                        setCustomTime(e.target.value);
                                                        setSelectedPlan('custom');
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSchedule('custom', customTime);
                                                    }}
                                                    disabled={loading || selectedPlan !== 'custom'}
                                                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                                                >
                                                    {t('tuning_btn_schedule')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex items-center justify-center">
                            <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">{t('tuning_footer')}</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
