import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Battery, Sparkles, Target, Zap } from 'lucide-react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useTranslation } from '../i18n';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { LaborIllusion } from '../components/TimeMap/LaborIllusion';

interface CurrentEnergyViewProps {
    onBack: () => void;
}

const MetricRing = ({ label, value, color }: { label: string, value: number, color: string }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="transform -rotate-90 w-16 h-16">
                    <circle cx="32" cy="32" r={radius} className="stroke-white/10" strokeWidth="4" fill="none" />
                    <motion.circle 
                        cx="32" 
                        cy="32" 
                        r={radius} 
                        className={color}
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <span className="absolute text-xs font-mono text-white/80">{value}%</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-white/50">{label}</span>
        </div>
    );
};

export const CurrentEnergyView: React.FC<CurrentEnergyViewProps> = ({ onBack }) => {
    const { profile } = useActiveProfile();
    const { t, language } = useTranslation();
    const qc = useQueryClient();
    const [showIllusion, setShowIllusion] = useState(false);
    const [generating, setGenerating] = useState(false);

    const { data: energy, isLoading: loading } = useQuery({
        queryKey: ['current-energy', profile?.id, language],
        queryFn: async () => {
            const headers = await getAsyncAuthHeaders('GET');
            const res = await fetch(`${API_BASE_URL}/api/energy/current?lang=${language}`, { headers });
            
            if (res.status === 404) return null;
            if (!res.ok) throw new Error('Failed to fetch energy');
            
            const data = await res.json();
            return data.energy || null;
        },
        enabled: !!profile?.id,
        staleTime: 1000 * 60 * 15, // Energy is stable, cache for 15 minutes
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleGenerate = async () => {
        setShowIllusion(true);
    };

    const executeGeneration = React.useCallback(async () => {
        try {
            setGenerating(true);
            const headers = await getAsyncAuthHeaders('GET');
            const res = await fetch(`${API_BASE_URL}/api/energy/current?lang=${language}`, { headers });
            
            if (res.ok) {
                const data = await res.json();
                if (data.energy) {
                    qc.setQueryData(['current-energy', profile?.id, language], data.energy);
                }
            }
        } catch (e) {
            console.error("Error generating Energy:", e);
        } finally {
            setGenerating(false);
            setShowIllusion(false);
        }
    }, [language]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-white/50">
                <motion.button
                    onClick={onBack}
                    className="absolute top-6 left-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {language === 'en' ? 'Back' : 'Volver'}
                </motion.button>
                <p>{language === 'en' ? 'Tuning into your frequency...' : 'Sincronizando frecuencias...'}</p>
            </div>
        );
    }

    if (!energy) {
        return (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center"
            >
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {language === 'en' ? 'Back' : 'Volver'}
                </button>
                
                <h2 className="text-3xl font-serif italic text-white/90 mb-4">
                    {language === 'en' ? 'Current Energy' : 'Energía Actual'}
                </h2>
                <p className="text-sm font-mono text-white/50 max-w-md mx-auto mb-12">
                    {language === 'en' 
                        ? 'NAOS will calculate your micro-evolution axis by intersecting daily astrological transits, numerology, and chinese calendar.'
                        : 'NAOS calculará tu micro-tránsito diario cruzando tus tránsitos astrológicos, numerología y calendario chino.'}
                </p>
                <button 
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-naos-gold/10 border border-naos-gold/30 rounded-full text-naos-gold text-sm font-bold uppercase tracking-widest hover:bg-naos-gold/20 transition-all hover:scale-105 active:scale-95"
                >
                    {language === 'en' ? 'Initialize Energy Scan' : 'Iniciar Escaneo Energético'}
                </button>
                
                {showIllusion && <LaborIllusion onComplete={executeGeneration} />}
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 pb-32"
        >
            <button
                onClick={onBack}
                className="absolute top-6 left-6 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-white transition-colors group z-50"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                {language === 'en' ? 'Back' : 'Volver'}
            </button>

            <div className="text-center mb-16 mt-8">
                <h1 className="text-4xl font-serif italic text-white/90 mb-4">{language === 'en' ? 'Current Energy' : 'Energía Actual'}</h1>
                <p className="text-sm font-mono text-white/50 uppercase tracking-[0.2em]">{new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* DAILY CARD */}
                <div className="md:col-span-2 relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-naos-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Battery className="text-naos-gold w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/80">{language === 'en' ? 'Daily Vibe' : 'Tránsito Diario'}</h3>
                            </div>
                            
                            <h2 className="text-2xl font-serif italic text-naos-gold mb-4">{energy.daily.title}</h2>
                            <p className="text-sm font-mono text-white/70 leading-relaxed mb-8">
                                {energy.daily.description}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-green-400 block mb-2">{language === 'en' ? 'Action' : 'Acción'}</span>
                                <span className="text-xs font-mono text-white/80">{energy.daily.action}</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-red-400 block mb-2">{language === 'en' ? 'Avoid' : 'Evitar'}</span>
                                <span className="text-xs font-mono text-white/80">{energy.daily.avoid}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* METRICS CARD */}
                <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between items-center relative">
                        <div className="w-full text-center mb-8">
                            <span className="text-4xl font-serif italic text-white/90">{energy.daily.score}</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/40 block mt-2">{language === 'en' ? 'Alignment Score' : 'Alineación Total'}</span>
                        </div>
                        
                        <div className="w-full flex justify-between px-2 gap-4">
                            <MetricRing label={language === 'en' ? 'Focus' : 'Enfoque'} value={energy.metrics.focus} color="stroke-blue-400" />
                            <MetricRing label={language === 'en' ? 'Create' : 'Crear'} value={energy.metrics.creativity} color="stroke-purple-400" />
                            <MetricRing label={language === 'en' ? 'Social' : 'Social'} value={energy.metrics.relationships} color="stroke-pink-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* WEEKLY CARD */}
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent mb-12">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-naos-gold/30 to-transparent"></div>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                            <Zap className="text-naos-gold w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-white/50 block mb-2">{language === 'en' ? 'Weekly Macro Theme' : 'Tema Macro de la Semana'}</span>
                            <h3 className="text-xl font-serif italic text-white/90 mb-4">{energy.weekly.theme}</h3>
                            <p className="text-sm font-mono text-white/60 leading-relaxed">
                                {energy.weekly.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {showIllusion && <LaborIllusion onComplete={executeGeneration} />}
        </motion.div>
    );
};
