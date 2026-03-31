import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Clock, MessageCircle, Check, Bell, Activity, Wind, Zap, Quote } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../i18n';
import { getAsyncAuthHeaders } from '../../lib/api';

interface LaboratoryReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

type PracticeType = 'meditation' | 'breathing' | 'declaration';
type FrequencyType = 'daily' | 'once';

export const LaboratoryReminderModal: React.FC<LaboratoryReminderModalProps> = ({ isOpen, onClose, userId }) => {
    const { t } = useTranslation();
    const [reminderTime, setReminderTime] = useState('08:00');
    const [practiceType, setPracticeType] = useState<PracticeType>('meditation');
    const [frequency, setFrequency] = useState<FrequencyType>('daily');
    const [isTelegramEnabled, setIsTelegramEnabled] = useState(true);
    const [existingTunings, setExistingTunings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const fetchSettings = async () => {
        if (!userId) return;
        setLoading(true);
        const { data, error: _error } = await supabase
            .from('coherence_tunings')
            .select('*')
            .eq('user_id', userId)
            .like('aspect', 'lab_%');

        if (data) {
            setExistingTunings(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!isOpen || !userId) return;
        fetchSettings();
    }, [isOpen, userId]);

    const handleSave = async () => {
        setSaving(true);
        const baseAspect = `lab_${practiceType}`;
        const typeTunings = existingTunings.filter(t => t.aspect.startsWith(baseAspect));

        if (typeTunings.length >= 10) {
            alert(t('lab_max_reached' as any));
            setSaving(false);
            return;
        }

        // Find existing record with same time OR next available slot
        const existingRecord = typeTunings.find(t => t.cron_schedule === reminderTime);
        
        // Final aspect name (slot-based)
        let finalAspect = baseAspect;
        if (!existingRecord) {
            // Find first free slot (0-9)
            const usedSlots = typeTunings.map(t => {
                const parts = t.aspect.split('_');
                const last = parts[parts.length - 1];
                const slot = parseInt(last);
                return isNaN(slot) ? -1 : slot;
            });
            let nextSlot = 0;
            while (usedSlots.includes(nextSlot)) nextSlot++;
            finalAspect = `${baseAspect}_${nextSlot}`;
        } else {
            finalAspect = existingRecord.aspect;
        }

        try {
            const payload = {
                user_id: userId,
                aspect: finalAspect,
                cron_schedule: reminderTime,
                is_active: isTelegramEnabled,
                module_type: frequency === 'once' ? 'once' : 'daily'
            };

            if (existingRecord) {
                const { error: updateError } = await supabase
                    .from('coherence_tunings')
                    .update(payload)
                    .eq('id', existingRecord.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('coherence_tunings')
                    .insert(payload);
                if (insertError) throw insertError;
            }
            
            setSuccess(true);
            await fetchSettings();
            setTimeout(() => {
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            console.error("Error saving laboratory reminder settings:", err);
            // Handle unique constraint error if slot logic fails somehow
            if (err.message?.includes('unique constraint')) {
                alert("Conflict with existing schedule. Try a different time or frequency.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            console.log("🗑️ Attempting to delete tuning:", id);
            const headers = await getAsyncAuthHeaders();
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/tunings/${id}`, {
                method: 'DELETE',
                headers
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Server error en borrado');
            }
            
            // alert("Borrado exitoso en servidor. Actualizando lista...");
            await fetchSettings();
            // alert("Lista actualizada.");
        } catch (err: any) {
            console.error("Error deleting tuning:", err);
            alert(`Fallo crítico al borrar: ${err.message || 'Error desconocido'}`);
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
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                        
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-serif italic text-white">{t('lab_reminder_title')}</h3>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-purple-500/60 font-black">NAOS LABORATORY // EVOLUTION</p>
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
                                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                                        <Check size={32} className="animate-pulse" />
                                    </div>
                                    <p className="text-white font-serif italic text-lg">{t('lab_reminder_success')}</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Type Selection */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">{t('lab_practice_type')}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'meditation', icon: Zap, label: t('lab_type_meditation') },
                                                { id: 'breathing', icon: Wind, label: t('lab_type_breathing') },
                                                { id: 'declaration', icon: Quote, label: t('lab_type_declaration') }
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setPracticeType(type.id as PracticeType)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                                                        practiceType === type.id 
                                                            ? "bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                                                            : "bg-white/[0.02] border-white/5 text-white/20 hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <type.icon size={16} />
                                                    <span className="text-[8px] uppercase tracking-tighter font-black">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Frequency Selection */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">{t('lab_frequency')}</label>
                                        <div className="flex bg-white/[0.03] border border-white/10 p-1 rounded-2xl">
                                            <button
                                                onClick={() => setFrequency('daily')}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all",
                                                    frequency === 'daily' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                                                )}
                                            >
                                                {t('lab_freq_daily')}
                                            </button>
                                            <button
                                                onClick={() => setFrequency('once')}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all",
                                                    frequency === 'once' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                                                )}
                                            >
                                                {t('lab_freq_once')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Time Selection */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <Clock size={12} className="text-purple-500" />
                                            {t('protocol_reminder_time' as any)}
                                        </label>
                                        <input
                                            type="time"
                                            value={reminderTime}
                                            onChange={(e) => setReminderTime(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-2xl font-light text-white focus:outline-none focus:border-purple-500/40 transition-all text-center [color-scheme:dark]"
                                        />
                                    </div>

                                    {/* Channels */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] uppercase tracking-widest text-white/40">{t('protocol_reminder_channels' as any)}</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setIsTelegramEnabled(!isTelegramEnabled)}
                                                className={cn(
                                                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all",
                                                    isTelegramEnabled 
                                                        ? "bg-purple-500/10 border-purple-500/40 text-purple-400" 
                                                        : "bg-white/[0.03] border-white/5 text-white/30 hover:bg-white/[0.05]"
                                                )}
                                            >
                                                <MessageCircle className={cn("w-6 h-6", isTelegramEnabled ? "animate-pulse" : "")} />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">Telegram</span>
                                            </button>

                                            <button
                                                disabled
                                                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border bg-white/[0.01] border-white/5 text-white/10 cursor-not-allowed opacity-50 relative overflow-hidden"
                                            >
                                                <MessageCircle className="w-6 h-6 grayscale" />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">WhatsApp</span>
                                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[6px] font-black tracking-tighter text-white/40 uppercase">
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
                                        className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-purple-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className={cn("w-4 h-4", saving ? "animate-spin" : "")} />
                                        {t('lab_reminder_sync')}
                                    </motion.button>

                                    {/* Active Reminders List */}
                                    {existingTunings.length > 0 && (
                                        <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                                                <Bell size={12} className="text-purple-500" />
                                                {t('lab_existing_reminders' as any)}
                                            </label>
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {existingTunings.map((tuning) => (
                                                    <div 
                                                        key={tuning.id}
                                                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-purple-400">
                                                                {tuning.aspect.includes('meditation') && <Zap size={14} />}
                                                                {tuning.aspect.includes('breathing') && <Wind size={14} />}
                                                                {tuning.aspect.includes('declaration') && <Quote size={14} />}
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-white font-medium">{tuning.cron_schedule}</p>
                                                                 <p className="text-[8px] text-white/40 uppercase tracking-tighter">
                                                                    {t(`lab_type_${tuning.aspect.replace('lab_', '').replace(/_\d+$/, '')}` as any)} • {tuning.module_type === 'once' ? t('lab_freq_once' as any) : t('lab_freq_daily' as any)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(tuning.id);
                                                            }}
                                                            className="p-3 -m-1 text-white/40 hover:text-red-400 transition-colors relative z-[100]"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex items-center justify-center">
                            <p className="text-[7px] uppercase tracking-[0.4em] text-white/20">Archived in Evolution Stream v1.2</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
