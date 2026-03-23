import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../contexts/ProfileContext';
import { AstrologyEngine } from '../lib/astrologyEngine';
import { NumerologyEngine } from '../lib/numerologyEngine';
import { MayanEngine } from '../lib/mayanEngine';
import { calculateChineseZodiac } from '../utils/chineseMapper';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, MapPin, LocateFixed, Eye, X, Loader2 } from 'lucide-react';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { AstralVortex } from './AstralVortex';

interface OnboardingInitiationProps {
    onComplete: () => void;
}

export const OnboardingInitiation: React.FC<OnboardingInitiationProps> = ({ onComplete }) => {
    const { updateProfile } = useProfile();
    const { signUp } = useAuth();
    const [message, setMessage] = useState('');
    const [fullMessage, setFullMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    
    // Merge states
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', nickname: '', email: '', password: '', confirmPassword: '', birthDate: '', birthTime: '', birthCity: '', birthCountry: '', birthDepartment: ''
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

        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden. El portal requiere sincronía.");
            return;
        }

        setCompleting(true);
        try {
            console.log("🚀 Sintonizando llave de acceso maestro...");
            const { error: authError } = await signUp(formData.email, formData.password);
            
            if (authError) {
                alert("Error al forjar la llave: " + authError.message);
                setCompleting(false);
                return;
            }

            console.log("🔮 NAOS: Iniciando cálculo místico en cliente...");
            const lat = 14.6349;
            const lng = -90.5069;
            const cleanTime = formData.birthTime ? formData.birthTime.substring(0, 5) : '12:00';
            const birthDateTime = new Date(`${formData.birthDate}T${cleanTime}:00`);
            const astroData = AstrologyEngine.calculateNatalChart(birthDateTime, lat, lng);
            const { lifePathNumber, pinaculo } = NumerologyEngine.calculateFullChart(formData.birthDate);
            const mayanData = MayanEngine.calculateNawal(formData.birthDate);
            const nameNumber = NumerologyEngine.calculateNameNumerology(formData.name);
            const chineseData = calculateChineseZodiac(birthDateTime.toISOString());

            await updateProfile({
                name: formData.name,
                nickname: formData.nickname,
                email: formData.email,
                birthDate: formData.birthDate,
                birthTime: formData.birthTime,
                birthCity: formData.birthCity,
                birthCountry: formData.birthCountry,
                birthDepartment: formData.birthDepartment,
                astrology: astroData,
                numerology: { lifePathNumber, pinaculo, nameNumber },
                mayan: mayanData,
                nawal_maya: `${mayanData.tone} ${mayanData.kicheName}`,
                chinese_animal: chineseData.animal,
                chinese_element: chineseData.element,
                chinese_birth_year: chineseData.birthYear,
                onboarding_completed: true
            } as any);

            const headers = await getAsyncAuthHeaders();
            await fetch(`${API_BASE_URL}/api/onboarding/complete`, { 
                method: 'POST', 
                headers,
                body: JSON.stringify({}) 
            });

            onComplete();
        } catch (err) {
            console.error('Failed to complete onboarding', err);
            onComplete();
        } finally { setCompleting(false); }
    };

    const containerStyle = { boxShadow: "0 0 40px rgba(6,182,212,0.1), inset 0 0 20px rgba(6,182,212,0.05)" };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-black">
            <AstralVortex />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} className={`relative z-10 w-full ${!showForm ? 'max-w-lg' : 'max-w-3xl'} p-6 md:p-10 rounded-[2.5rem] bg-black/60 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col items-center transition-all duration-700`} style={containerStyle}>
                
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
                        <div className="w-full flex flex-col animate-in fade-in duration-500 text-left">
                            <div className="text-center mb-8 relative z-10">
                                <p className="text-cyan-400/80 text-[10px] uppercase tracking-[0.6em] mb-4 font-black">Calibración de Identidad Original</p>
                                <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto" />
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-8 relative z-10 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-cyan-500/50" /> Identidad Terrenal
                                        </label>
                                        <input required type="text" placeholder="Ej. Tu nombre real..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-cyan-500/50" /> Nickname
                                        </label>
                                        <input type="text" placeholder="Ej. L, Viajero, Neo..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.nickname} onChange={e => setFormData({ ...formData, nickname: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-white/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-white/50" /> Correo Electrónico
                                        </label>
                                        <input required type="email" placeholder="Tu correo para Sigil..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 hidden md:block"></div> {/* Separator */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-fuchsia-400/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-fuchsia-500/50" /> Crear Contraseña
                                        </label>
                                        <input required minLength={6} type="password" placeholder="Tu llave secreta..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-fuchsia-400/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-fuchsia-500/50" /> Confirmar Contraseña
                                        </label>
                                        <input required minLength={6} type="password" placeholder="Repite tu llave..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-amber-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-amber-500/50" /> Ciclo Solar (Fecha de Nacimiento)
                                        </label>
                                        <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors [color-scheme:dark]" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-amber-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-amber-500/50" /> Momento Exacto (Hora)
                                        </label>
                                        <input required type="time" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors [color-scheme:dark]" value={formData.birthTime} onChange={e => setFormData({ ...formData, birthTime: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-emerald-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500/50" /> Nación de Origen (País)
                                        </label>
                                        <input required type="text" placeholder="Ej. Guatemala, México..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.birthCountry} onChange={e => setFormData({ ...formData, birthCountry: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-emerald-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500/50" /> Región / Departamento
                                        </label>
                                        <input required type="text" placeholder="Ej. Guatemala, Petén..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.birthDepartment} onChange={e => setFormData({ ...formData, birthDepartment: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black tracking-[0.3em] text-emerald-100/90 uppercase flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500/50" /> Anclaje (Ciudad)
                                        </label>
                                        <input required type="text" placeholder="Ej. Ciudad de Guatemala..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500/40 transition-colors" value={formData.birthCity} onChange={e => setFormData({ ...formData, birthCity: e.target.value })} />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-4">
                                    <button type="submit" disabled={completing} className="group relative w-full sm:w-auto min-w-[280px] py-4 px-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] text-white font-bold uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3">
                                        {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Iniciar Sintonización Ritual"}
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">Volver</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
