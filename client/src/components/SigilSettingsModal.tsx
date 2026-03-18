import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SigilSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenTelegram: () => void;
}

export const SigilSettingsModal: React.FC<SigilSettingsModalProps> = ({ isOpen, onClose, onOpenTelegram }) => {
    const [time, setTime] = useState('08:00');
    const [saving, setSaving] = useState(false);

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

                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-cyan-400 mystic-pulse" />
                        <h3 className="text-lg font-light tracking-wider uppercase text-cyan-100">Configuración del Sigil</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Section 1: Horario */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-white/50 flex items-center gap-1">
                                <Clock size={14}/> Hora de Lectura Diaria
                            </label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/50"
                            />
                            <p className="text-[10px] text-white/30">Define a qué hora deseas que el oráculo despache su sabiduría a tu Telegram.</p>
                        </div>

                        {/* Section 2: Telegram */}
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider font-semibold text-white/50">Canales de Despacho</label>
                            <button 
                                onClick={onOpenTelegram}
                                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Send size={20} className="text-cyan-400 group-hover:scale-110 transition-transform"/>
                                    <span className="text-sm font-light text-white/80">Vincular Telegram</span>
                                </div>
                                <span className="text-xs text-cyan-400/50">Abrir</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button onClick={onClose} className="flex-1 p-3 rounded-xl border border-white/5 text-white/60 hover:bg-white/5 transition-all text-sm font-light">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="flex-1 p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30 transition-all text-sm font-semibold">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </motion.div>
            @</div>
        </AnimatePresence>
    );
};
