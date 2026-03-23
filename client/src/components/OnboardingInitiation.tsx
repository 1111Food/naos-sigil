import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { AstralVortex } from './AstralVortex';

interface OnboardingInitiationProps {
    onComplete: () => void;
}

export const OnboardingInitiation: React.FC<OnboardingInitiationProps> = ({ onComplete }) => {
    const { updateProfile } = useProfile();
    const [message, setMessage] = useState('');
    const [fullMessage, setFullMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    
    // Merge states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', birthDate: '', birthTime: '', birthCity: '', birthCountry: '', birthDepartment: ''
    });

    useEffect(() => {
        setFullMessage("Bienvenido al Templo de Naos.\n\nTu arquitectura está siendo trazada a través de las cuatro grandes escuelas:\n\n• El Cosmos Astral y su diseño celeste.\n• La Vibración Numérica de tu esencia.\n• El Nawal Maya de tu cuenta larga.\n• El Tótem Oriental de tu instinto animal.\n\n• El Sigil ha de sintonizar las coordenadas para tu avatar.\n\nSincronizando frecuencias...");
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!fullMessage) return;
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < fullMessage.length) {
                setMessage(fullMessage.slice(0, currentIndex + 1));
                currentIndex++;
            } else { clearInterval(interval); }
        }, 12);
        return () => clearInterval(interval);
    }, [fullMessage]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompleting(true);
        try {
            await updateProfile({
                name: formData.name,
                birthDate: formData.birthDate,
                birthTime: formData.birthTime,
                birthCity: formData.birthCity,
                birthCountry: formData.birthCountry,
                birthDepartment: formData.birthDepartment,
                onboarding_completed: true
            } as any);

            const headers = await getAsyncAuthHeaders();
            await fetch(`${API_BASE_URL}/api/onboarding/complete`, { method: 'POST', headers });

            onComplete();
        } catch (err) {
            console.error('Failed to complete onboarding', err);
            onComplete();
        } finally { setCompleting(false); }
    };

    const containerStyle = { boxShadow: "0 0 40px rgba(6,182,212,0.1), inset 0 0 20px rgba(6,182,212,0.05)" };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-black">
            <AstralVortex />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} className="relative z-10 w-full max-w-lg p-6 md:p-10 rounded-[2.5rem] bg-black/60 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col items-center" style={containerStyle}>
                
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full animate-pulse" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full">
                    {!showForm ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="p-3 rounded-full bg-cyan-500/5 border border-cyan-500/20">
                                <Sparkles className="w-6 h-6 text-cyan-400" />
                            </motion.div>
                            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-serif">Sigil: La Sintonización Inicial</h2>
                            <div className="min-h-[140px] flex items-center justify-center">
                                {loading ? <p className="text-xs uppercase tracking-[0.3em] text-white/30 animate-pulse">Analizando tu Arquitectura...</p> : 
                                <p className="text-sm md:text-base font-serif italic leading-relaxed text-white/90 whitespace-pre-wrap">{message}</p>}
                            </div>
                            {(!loading && message.length === fullMessage.length) && (
                                <button onClick={() => setShowForm(true)} className="group relative px-6 py-3 rounded-xl border border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest transition-all">Sintonizar Coordenadas</button>
                            )}
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-500">
                            <h2 className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-bold">Coordenadas para crear tu avatar</h2>
                            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3 w-full">
                                <input type="text" placeholder="Tu Nombre / Pseudónimo" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40" />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="date" required value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40" />
                                    <input type="time" required value={formData.birthTime} onChange={e => setFormData({ ...formData, birthTime: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="País" required value={formData.birthCountry} onChange={e => setFormData({ ...formData, birthCountry: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40" />
                                    <input type="text" placeholder="Ciudad" required value={formData.birthCity} onChange={e => setFormData({ ...formData, birthCity: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40" />
                                </div>
                                <input type="text" placeholder="Departamento / Provincia (Opcional)" value={formData.birthDepartment} onChange={e => setFormData({ ...formData, birthDepartment: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40" />
                                <button type="submit" disabled={completing} className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 mt-1">
                                    {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activar Arquitectura"}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-[10px] text-white/40 hover:text-white/60 transition-colors">Volver</button>
                            </form>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
