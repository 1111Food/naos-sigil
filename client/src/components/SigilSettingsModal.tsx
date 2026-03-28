import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, Sparkles, Info, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { SigilExplainer } from './SigilExplainer';

interface SigilSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTelegram: () => void;
}

export const SigilSettingsModal: React.FC<SigilSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onOpenTelegram
}) => {
    const { t } = useTranslation();
    const [time, setTime] = useState('08:00');
    const [saving, setSaving] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        return localStorage.getItem('naos_sigil_voice_enabled') === 'true';
    });
    const [showExplainer, setShowExplainer] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const loadSettings = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('oracle_time')
                        .eq('id', user.id)
                        .single();
                    if (data?.oracle_time) setTime(data.oracle_time.substring(0, 5));
                }
            } catch (err) {
                console.error("Error loading oracle time:", err);
            }
        };
        loadSettings();
    }, [isOpen]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ oracle_time: `${time}:00` })
                    .eq('id', user.id);
                if (error) throw error;
            }
            localStorage.setItem('naos_sigil_voice_enabled', isVoiceEnabled ? 'true' : 'false');
            window.dispatchEvent(new Event('sigil_voice_preference_changed'));
            onClose();
        } catch (err: any) {
            console.error("Error saving oracle time:", err);
            alert("No se pudo guardar: " + (err.message || err));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                    onClick={onClose} 
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    className="glass-panel w-full max-w-md p-6 rounded-3xl z-10 border border-white/10 relative overflow-hidden"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
                        <X size={20}/>
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-cyan-400 mystic-pulse" />
                        <h3 className="text-lg font-light tracking-wider uppercase text-cyan-100">{t('sigil_settings')}</h3>
                        <button 
                            onClick={() => setShowExplainer(true)}
                            className="p-1 rounded-full hover:bg-white/10 text-cyan-400/80 hover:text-cyan-400 transition-colors"
                            title={t('sigil_what_is')}
                        >
                            <Info size={14} />
                        </button>
                    </div>

                    <div className="text-[10px] text-cyan-400/90 mb-6 bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20 flex items-center gap-2">
                         <span>✨ <span className="font-bold">{t('sigil_voice_active_msg')}:</span> {t('sigil_voice_active_desc')}</span>
                    </div>

                    <div className="space-y-6">
                        {/* Section 1: Horario */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-white/50 flex items-center gap-1">
                                <Clock size={14}/> {t('daily_reading_time')}
                            </label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50"
                            />
                            <p className="text-[10px] text-white/30">{t('daily_reading_desc')}</p>
                        </div>

                        {/* Section 2: Channels */}
                        <div className="space-y-3">
                            <label className="text-xs uppercase tracking-wider font-semibold text-white/50">{t('dispatch_channels')}</label>
                            
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={onOpenTelegram}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Send size={20} className="text-cyan-400 group-hover:scale-110 transition-transform"/>
                                        <span className="text-sm font-light text-white/80">{t('link_telegram')}</span>
                                    </div>
                                    <span className="text-xs text-cyan-400/50">{t('open')}</span>
                                </button>

                                <button 
                                    disabled
                                    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 opacity-40 grayscale cursor-not-allowed rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageCircle size={20} className="text-green-400"/>
                                        <span className="text-sm font-light text-white/40">{t('link_whatsapp')}</span>
                                    </div>
                                    <span className="text-[8px] uppercase tracking-tighter text-white/30 bg-white/5 px-2 py-1 rounded-full border border-white/10 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors font-black">
                                        {t('whatsapp_coming_soon')}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Section 3: Voz del Sigil */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-white/50 flex items-center gap-1">
                                <Sparkles size={14} className="text-cyan-400"/> {t('voice_in_app')}
                            </label>
                            <button 
                                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles size={20} className={isVoiceEnabled ? "text-cyan-400" : "text-white/20"}/>
                                    <span className="text-sm font-light text-white/80">{t('voice_toggle_label')}</span>
                                </div>
                                <div className={cn(
                                    "w-10 h-5 rounded-full p-1 transition-colors duration-300",
                                    isVoiceEnabled ? "bg-cyan-500/40" : "bg-white/10"
                                )}>
                                    <div className={cn(
                                        "w-3 h-3 rounded-full bg-white transition-transform duration-300",
                                        isVoiceEnabled && "translate-x-5"
                                    )} />
                                </div>
                            </button>
                            <p className="text-[10px] text-white/30">{t('voice_toggle_desc')}</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button onClick={onClose} className="flex-1 p-3 rounded-xl border border-white/5 text-white/60 hover:bg-white/5 transition-all text-sm font-light">
                            {t('cancel')}
                        </button>
                        <button onClick={handleSave} className="flex-1 p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30 transition-all text-sm font-semibold">
                            {saving ? t('saving') : t('save')}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showExplainer && (
                            <SigilExplainer onClose={() => setShowExplainer(false)} />
                        )}
                    </AnimatePresence>
                </motion.div>
            @</div>
        </AnimatePresence>
    );
};
