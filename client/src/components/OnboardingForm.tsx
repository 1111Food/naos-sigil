import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { AstrologyEngine } from '../lib/astrologyEngine';
import { NumerologyEngine } from '../lib/numerologyEngine';
import { MayanEngine } from '../lib/mayanEngine';
import { IdentityAltar } from './IdentityAltar';
import { AstralVortex } from './AstralVortex';
import { calculateChineseZodiac } from '../utils/chineseMapper';
import { SigilManifesto } from './SigilManifesto';

interface OnboardingFormProps {
    onComplete: (data: any) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
    const { user } = useAuth();
    const { profile, refreshProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [view, setView] = useState<'THRESHOLD' | 'MANIFESTO' | 'CONSOLE'>('THRESHOLD');
    const [loading, setLoading] = useState(false);

    // Initial State derived from profile if available
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        nickname: profile?.nickname || '',
        email: profile?.email || '',
        birthDate: profile?.birthDate || '',
        birthTime: profile?.birthTime || '12:00',
        birthCity: profile?.birthCity || '',
        birthState: '',
        birthCountry: profile?.birthCountry || '',
    });

    const [isDecoding, setIsDecoding] = useState(false);
    const [decodingText, setDecodingText] = useState("");

    // CHECK: Identity Altar Mode
    if (profile?.name && !isEditing) {
        return (
            <IdentityAltar
                profile={profile}
                onEdit={() => setIsEditing(true)}
            />
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.birthDate || !formData.birthCity || !user) return;
        setLoading(true);

        try {
            console.log("🔮 NAOS: Iniciando cálculo místico en cliente...");

            const lat = 14.6349;
            const lng = -90.5069;

            // Extract only HH:mm to prevent invalid date if seconds were included in the database time
            const cleanTime = formData.birthTime ? formData.birthTime.substring(0, 5) : '12:00';
            const birthDateTime = new Date(`${formData.birthDate}T${cleanTime}:00`);
            const astroData = AstrologyEngine.calculateNatalChart(birthDateTime, lat, lng);
            const { lifePathNumber, pinaculo } = NumerologyEngine.calculateFullChart(formData.birthDate);
            const mayanData = MayanEngine.calculateNawal(formData.birthDate);
            const { kicheName, tone } = mayanData;
            const nameNumber = NumerologyEngine.calculateNameNumerology(formData.name);
            const chineseData = calculateChineseZodiac(birthDateTime.toISOString());

            const combinedCity = formData.birthState ? `${formData.birthCity}, ${formData.birthState}` : formData.birthCity;

            const fullProfile = {
                id: user.id,
                email: formData.email,
                name: formData.name,
                full_name: formData.name,
                nickname: formData.nickname,
                birth_date: formData.birthDate,
                birth_time: formData.birthTime,
                birth_city: combinedCity,
                birth_country: formData.birthCountry,
                astrology: astroData,
                numerology: {
                    lifePathNumber,
                    pinaculo,
                    nameNumber
                },
                mayan: mayanData,
                nawal_maya: `${tone} ${kicheName}`,
                chinese_animal: chineseData.animal,
                chinese_element: chineseData.element,
                chinese_birth_year: chineseData.birthYear,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase.from('profiles').upsert(fullProfile);
            if (error) throw error;

            try {
                localStorage.setItem('naos_active_user', JSON.stringify({
                    id: fullProfile.id,
                    nickname: fullProfile.nickname || 'Viajero',
                    email: fullProfile.email
                }));
            } catch (err) {
                console.warn("Storage warning:", err);
            }

            await refreshProfile();

            // Prompt Bloque 1: Secuencia de Revelación
            setIsDecoding(true);
            setDecodingText("Decodificando arquitectura...");
            await new Promise(r => setTimeout(r, 400));
            setDecodingText("Sincronizando patrones...");
            await new Promise(r => setTimeout(r, 400));
            setDecodingText("Estabilizando frecuencia...");
            await new Promise(r => setTimeout(r, 400));

            // TTS (Speech Synthesis)
            if ('speechSynthesis' in window) {
                const msg = new SpeechSynthesisUtterance("Acceso concedido. Tu estructura ha sido interpretada. Este es tu código base.");
                msg.lang = 'es-ES';
                msg.rate = 0.9;
                window.speechSynthesis.speak(msg);
            }

            setIsDecoding(false);
            onComplete(fullProfile);

        } catch (err) {
            console.error("❌ Error en ritual de inicio:", err);
            alert("Hubo un error guardando tu perfil espirital. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden px-4 py-12">
            {view !== 'CONSOLE' && <AstralVortex />}

            <AnimatePresence mode="wait">
                {view === 'THRESHOLD' ? (
                    <motion.div
                        key="threshold"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10 w-[95%] sm:w-[90%] md:max-w-2xl mx-auto rounded-[3rem] bg-black/40 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center p-10 md:p-16 text-center space-y-12"
                    >
                        {/* Inner glowing accent */}
                        <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_0_80px_rgba(6,182,212,0.05)] pointer-events-none" />

                        <h2 className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-serif italic text-white/95 leading-relaxed tracking-wide drop-shadow-md">
                            "Para revelar la arquitectura de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">Avatar</span>, el Templo requiere las coordenadas de tu llegada."
                        </h2>

                        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
                            <button
                                onClick={() => setView('MANIFESTO')}
                                className="group relative w-full py-5 px-8 rounded-full bg-white/5 border border-cyan-500/30 hover:bg-cyan-900/20 hover:border-cyan-400 overflow-hidden transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] text-white font-bold uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <span className="text-cyan-400 group-hover:animate-pulse">✦</span>
                                    Sintonizar Coordenadas
                                    <span className="text-cyan-400 group-hover:animate-pulse">✦</span>
                                </span>
                                {/* Hover sweep effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                            </button>

                            <p className="text-[9px] uppercase tracking-[0.4em] text-cyan-200/40 animate-pulse font-mono">
                                Vórtice de Sintonización Activo
                            </p>
                        </div>
                    </motion.div>
                ) : view === 'MANIFESTO' ? (
                    <SigilManifesto key="manifesto" onConfirm={() => setView('CONSOLE')} />
                ) : (
                    <motion.div
                        key="console"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10 w-[95%] sm:w-[90%] md:max-w-3xl mx-auto rounded-[3rem] bg-black/40 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex flex-col p-8 md:p-14"
                    >
                        {/* Inner glowing accent */}
                        <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_0_80px_rgba(6,182,212,0.05)] pointer-events-none" />

                        <div className="text-center mb-10 relative z-10">
                            <p className="text-cyan-400/80 text-[10px] uppercase tracking-[0.6em] mb-4 font-black">Calibración de Identidad Original</p>
                            <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10 flex-1 flex flex-col justify-between">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {/* Name */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                                        Identidad Terrenal
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Tu nombre completo en este plano..."
                                        className="astral-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* Nickname */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                                        Apodo / Sigilo
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Salsa, Neo, L..."
                                        className="astral-input"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    />
                                </div>

                                {/* Date */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                                        Ciclo Solar (Fecha)
                                    </label>
                                    <input
                                        required
                                        type="date"
                                        className="astral-input [color-scheme:dark]"
                                        value={formData.birthDate}
                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    />
                                </div>

                                {/* Time */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                                        Momento Exacto (Hora)
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        className="astral-input [color-scheme:dark]"
                                        value={formData.birthTime}
                                        onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                                    />
                                </div>

                                {/* Country */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                        Nación de Origen
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej. México, España, Japón..."
                                        className="astral-input"
                                        value={formData.birthCountry}
                                        onChange={(e) => setFormData({ ...formData, birthCountry: e.target.value })}
                                    />
                                </div>

                                {/* State / Region */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                        Región / Estado
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej. Jalisco, Madrid, Texas..."
                                        className="astral-input"
                                        value={formData.birthState}
                                        onChange={(e) => setFormData({ ...formData, birthState: e.target.value })}
                                    />
                                </div>

                                {/* City */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-cyan-100/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                        Anclaje (Ciudad)
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej. Guadalajara, Barcelona, Tokio..."
                                        className="astral-input"
                                        value={formData.birthCity}
                                        onChange={(e) => setFormData({ ...formData, birthCity: e.target.value })}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black tracking-[0.3em] text-white/90 uppercase flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-white/50" />
                                        Correo Electrónico
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="Tu mail (para Telegram)..."
                                        className="astral-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-12 flex flex-col items-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full max-w-sm py-5 px-8 rounded-full bg-white/5 border border-cyan-500/30 hover:bg-cyan-900/20 hover:border-cyan-400 overflow-hidden transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] text-white font-bold uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="w-4 h-4 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                                            <span className="animate-pulse text-cyan-200">Sincronizando Esencia...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="relative z-10 flex items-center gap-3">
                                                <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">✦</span>
                                                Iniciar Ritual de Sintonía
                                                <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">✦</span>
                                            </span>
                                            {/* Hover sweep effect */}
                                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                        </>
                                    )}
                                </motion.button>

                                <p className="text-[8px] text-center text-cyan-100/30 uppercase tracking-[0.4em] mt-8 italic">
                                    La arquitectura de las estrellas será trazada para tu avatar.
                                </p>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prompt Bloque 1: Secuencia de Revelación */}
            <AnimatePresence>
                {isDecoding && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center space-y-8"
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border border-cyan-500/30 border-t-cyan-400 flex items-center justify-center relative shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                        >
                            <div className="absolute inset-3 rounded-full border border-cyan-500/10 border-b-cyan-300 animate-spin" />
                        </motion.div>
                        
                        <motion.p 
                            key={decodingText}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-cyan-200 font-serif italic text-base tracking-wide drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        >
                            {decodingText}
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
