import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createProtocol } from '../services/supabaseService';

interface ProtocolWizardProps {
    userId: string;
    onProtocolCreated: () => void;
    onCancel: () => void;
}

export const ProtocolWizard: React.FC<ProtocolWizardProps> = ({ userId, onProtocolCreated, onCancel }) => {
    const [title, setTitle] = useState('');
    const [purpose, setPurpose] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !purpose.trim()) return;
        setIsSubmitting(true);
        try {
            await createProtocol(userId, title, purpose);
            console.log("Protocolo creado exitosamente");
            onProtocolCreated();
        } catch (error) {
            console.error("Hubo un error al guardar", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 md:p-12 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 text-white w-full max-w-lg mx-auto shadow-2xl relative overflow-hidden group transition-all duration-1000"
        >
            {/* Inner Glow Aura */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-amber-500/5 opacity-50 pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
                <motion.h2
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-serif italic mb-2 text-center text-white/90 drop-shadow-md"
                >
                    Firma del Arquitecto
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 mb-10 text-center font-bold"
                >
                    Sello de Compromiso • 21 Días
                </motion.p>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col gap-3 group/input"
                    >
                        <label className="text-[10px] uppercase tracking-widest text-white/40 group-focus-within/input:text-cyan-400 transition-colors">
                            ¿Qué estructura deseas integrar?
                        </label>
                        <input
                            type="text"
                            placeholder="Ej. Meditación Consciente al despertar"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-cyan-500/50 focus:bg-cyan-950/20 outline-none text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] text-white/90 placeholder:text-white/20"
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col gap-3 group/input"
                    >
                        <label className="text-[10px] uppercase tracking-widest text-white/40 group-focus-within/input:text-amber-500/70 transition-colors">
                            Propósito de la Modificación
                        </label>
                        <textarea
                            placeholder="Ej. Para anclar mi energía vital antes de interactuar con el mundo..."
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500/50 focus:bg-amber-950/20 outline-none text-sm transition-all resize-none h-24 shadow-inner focus:shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white/90 placeholder:text-white/20"
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-4 mt-6"
                    >
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 px-4 text-[10px] uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            disabled={isSubmitting}
                        >
                            Abordar
                        </button>
                        <button
                            type="submit"
                            className="flex-2 py-3 px-8 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Iniciando Secuencia...' : 'Sellar Código'}
                        </button>
                    </motion.div>
                </form>
            </div>
        </motion.div>
    );
};
