import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Clock, MessageCircle, Check, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n';

interface ProtocolReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const ProtocolReminderModal: React.FC<ProtocolReminderModalProps> = ({ isOpen, onClose, userId }) => {
    const { t } = useTranslation();
    const [reminderTime, setReminderTime] = useState('08:00');
    const [isTelegramEnabled, setIsTelegramEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen || !userId) return;

        const fetchSettings = async () => {
            setLoading(true);
            const { data, error: _error } = await supabase
                .from('coherence_tunings')
                .select('*')
                .eq('user_id', userId)
                .eq('aspect', 'protocol21')
                .maybeSingle();

            if (data) {
                if (data.cron_schedule) {
                    setReminderTime(data.cron_schedule.substring(0, 5));
                }
                setIsTelegramEnabled(data.is_active || false);
            }
            setLoading(false);
        };

        fetchSettings();
    }, [isOpen, userId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Match-then-Update/Insert pattern to bypass missing unique constraint
            const { data: existing } = await supabase
                .from('coherence_tunings')
                .select('id')
                .match({ user_id: userId, aspect: 'protocol21' })
                .maybeSingle();

            if (existing) {
                const { error: updateError } = await supabase
                    .from('coherence_tunings')
                    .update({
                        cron_schedule: reminderTime,
                        is_active: isTelegramEnabled
                    })
                    .eq('id', existing.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('coherence_tunings')
                    .insert({
                        user_id: userId,
                        aspect: 'protocol21',
                        cron_schedule: reminderTime,
                        is_active: isTelegramEnabled
                    });
                if (insertError) throw insertError;
            }
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.error("Error saving reminder settings:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
                        
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                        <Bell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif italic text-white">{t('protocol_reminder_title' as any)}</h3>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/60 font-black">NAOS PROTOCOL 21 // ALCHEMY</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="py-12 flex flex-col items-center text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                        <Check size={32} className="animate-pulse" />
                                    </div>
                                    <p className="text-white font-serif italic text-lg">{t('protocol_reminder_success' as any)}</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <Clock size={12} className="text-cyan-500" />
                                            {t('protocol_reminder_time' as any)}
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="time"
                                                value={reminderTime}
                                                onChange={(e) => setReminderTime(e.target.value)}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-2xl font-light text-white focus:outline-none focus:border-cyan-500/40 transition-all text-center [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 mb-2 block">
                                            {t('protocol_reminder_channels' as any)}
                                        </label>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setIsTelegramEnabled(!isTelegramEnabled)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-500",
                                                    isTelegramEnabled 
                                                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400" 
                                                        : "bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/[0.05]"
                                                )}
                                            >
                                                <MessageCircle className={cn("w-6 h-6", isTelegramEnabled ? "animate-pulse" : "")} />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">{t('protocol_reminder_telegram' as any)}</span>
                                            </button>

                                            <button
                                                disabled
                                                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border bg-white/[0.01] border-white/5 text-white/10 cursor-not-allowed opacity-50 relative overflow-hidden group"
                                            >
                                                <MessageCircle className="w-6 h-6 grayscale" />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">WhatsApp</span>
                                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[6px] font-black tracking-tighter text-white/40 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors uppercase">
                                                    {t('whatsapp_coming_soon')}
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        disabled={saving || loading}
                                        className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-cyan-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <Sparkles className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        {t('protocol_reminder_sync' as any)}
                                    </motion.button>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-center">
                            <p className="text-[7px] uppercase tracking-[0.4em] text-white/20">Archived in Oracle Core v3.0</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


