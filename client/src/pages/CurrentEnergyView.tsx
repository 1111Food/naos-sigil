import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Battery, Sparkles, Target, Zap } from 'lucide-react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useTranslation } from '../i18n';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { LaborIllusion } from '../components/TimeMap/LaborIllusion';

interface CurrentEnergyViewProps {
    onBack: () => void;
}

const MetricRing = ({ label, value, color }: { label: string, value: number | null, color: string }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    
    // If value is null, show a dashed empty ring with N/A
    if (value === null || value === undefined) {
        return (
            <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-16 h-16">
                        <circle cx="32" cy="32" r={radius} className="stroke-white/20" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                    </svg>
                    <div className="absolute text-[10px] font-medium text-white/50 tracking-widest">-</div>
                </div>
                <span className="text-[10px] font-medium text-white tracking-widest uppercase">{label}</span>
            </div>
        );
    }

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
    const [viewMode, setViewMode] = useState<'symbolic'|'behavioral'>('symbolic');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    
    const generateMutation = useMutation({
        mutationFn: async () => {
            const headers = await getAsyncAuthHeaders('POST');
            const res = await fetch(`${API_BASE_URL}/api/energy/current/generate`, { 
                method: 'POST',
                headers,
                body: JSON.stringify({ lang: language })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');
            return data.energy;
        },
        onSuccess: (newEnergy) => {
            if (newEnergy) {
                qc.setQueryData(['current-energy', profile?.id, language], newEnergy);
                setErrorMsg(null);
            }
        },
        onError: (err: Error) => {
            setErrorMsg(err.message);
        },
        onSettled: () => {
            setGenerating(false);
            setShowIllusion(false);
        }
    });

    const handleGenerate = () => {
        setGenerating(true);
        setShowIllusion(true);
        generateMutation.mutate();
    };


    
    let viewState: 'checking' | 'not_generated' | 'generating' | 'partially_ready' | 'ready' | 'error' = 'checking';
    
    if (loading) viewState = 'checking';
    else if (generating || showIllusion) viewState = 'generating';
    else if (errorMsg) viewState = 'error';
    else if (!energy) viewState = 'not_generated';
    else if (energy.interpretationStatus === 'unavailable') viewState = 'partially_ready';
    else viewState = 'ready';

    if (viewState === 'checking') {

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-white/50">
                <p>{t('syncing_frequencies', 'Sincronizando frecuencias...')}</p>
            </div>
        );
    }

    if (viewState === 'not_generated') {
        return (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative z-10 w-full max-w-4xl mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center"
            >
                <h2 className="text-3xl font-serif italic text-white/90 mb-4">
                    {t('current_energy_title', 'Energía Actual')}
                </h2>
                <p className="text-sm font-mono text-white/50 max-w-md mx-auto mb-12">
                    {t('energy_scan_desc', 'NAOS calculará tu micro-tránsito diario cruzando tus tránsitos astrológicos, numerología y calendario chino.')}
                </p>
                <button 
                    onClick={handleGenerate}
                    disabled={showIllusion}
                    className={`px-8 py-3 bg-naos-gold/10 border border-naos-gold/30 rounded-full text-naos-gold text-sm font-bold uppercase tracking-widest hover:bg-naos-gold/20 transition-all hover:scale-105 active:scale-95 ${showIllusion ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {t('start_energy_scan', 'Iniciar Escaneo Energético')}
                </button>
                {errorMsg && (
                    <div className="mt-6 max-w-md mx-auto text-red-400 text-sm bg-red-950/30 px-6 py-3 rounded-lg border border-red-500/20">
                        {errorMsg}
                    </div>
                )}
                
                {showIllusion && <LaborIllusion />}
            </motion.div>
        );
    }

    
    if (viewState === 'partially_ready') {
        return (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 text-center min-h-[60vh] flex flex-col justify-center"
            >
                <div className="mb-12 p-8 bg-red-900/20 border border-red-500/30 rounded-2xl max-w-xl mx-auto">
                    <h3 className="text-xl font-serif italic text-red-400 mb-2">{language === 'es' ? 'Señales Listas, Interpretación Pendiente' : 'Signals Ready, Interpretation Pending'}</h3>
                    <p className="text-sm text-white/70 mb-6 font-mono">{language === 'es' ? 'Tu configuración cósmica base ha sido mapeada, pero el motor de síntesis experimentó un retraso.' : 'Your cosmic configuration has been mapped, but the synthesis engine experienced a delay.'}</p>
                    <button 
                        onClick={handleGenerate}
                        disabled={showIllusion}
                        className={`px-6 py-2 bg-naos-gold/20 border border-naos-gold/40 rounded-full text-naos-gold text-xs font-bold uppercase tracking-widest hover:bg-naos-gold/30 transition-all ${showIllusion ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {language === 'es' ? 'Reintentar Interpretación' : 'Retry Interpretation'}
                    </button>
                </div>
                {showIllusion && <LaborIllusion />}
            </motion.div>
        );
    }

    if (viewState === 'generating' && !energy) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                {showIllusion && <LaborIllusion />}
            </div>
        );
    }

    if (viewState === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-white">
                <div className="mt-6 text-red-400 text-sm bg-red-950/30 px-6 py-3 rounded-lg border border-red-500/20">
                    {errorMsg}
                </div>
                <button onClick={() => setErrorMsg(null)} className="mt-4 px-4 py-2 bg-white/10 rounded">Volver</button>
            </div>
        );
    }


    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 pb-32"
        >
            <div className="text-center mb-16 mt-8">
                <h1 className="text-4xl font-serif italic text-white/90 mb-4">{t('current_energy_title', 'Energía Actual')}</h1>
                <p className="text-sm font-mono text-white/50 uppercase tracking-[0.2em] mb-8">{new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                
                

                <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-4">
                    <div className="inline-flex bg-black/40 p-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                        <button
                            onClick={() => setViewMode('symbolic')}
                            className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                viewMode === 'symbolic' 
                                ? 'bg-purple-900/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                                : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            Simbólico
                        </button>
                        <button
                            onClick={() => setViewMode('behavioral')}
                            className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                viewMode === 'behavioral' 
                                ? 'bg-blue-900/40 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                : 'text-white/40 hover:text-white/70'
                            }`}
                        >
                            Conductual
                        </button>
                    </div>
                    
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {/* DAILY CARD */}
                <div className="md:col-span-2 relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-naos-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Battery className="text-naos-gold w-5 h-5" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/80">{t('daily_transit', 'Tránsito Diario')}</h3>
                            </div>
                            
                            <h2 className="text-2xl font-serif italic text-naos-gold mb-4">{viewMode === 'symbolic' ? energy?.daily?.title : (energy.behavioral?.title || energy?.daily?.title)}</h2>
                            <p className="text-sm font-mono text-white/70 leading-relaxed mb-8">
                                {viewMode === 'symbolic' ? energy?.daily?.description : (energy.behavioral?.description || energy?.daily?.description)}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-green-400 block mb-2">{t('action', 'Acción')}</span>
                                <span className="text-xs font-mono text-white/80">{viewMode === 'symbolic' ? energy?.daily?.action : (energy.behavioral?.action || energy?.daily?.action)}</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-red-400 block mb-2">{t('avoid', 'Evitar')}</span>
                                <span className="text-xs font-mono text-white/80">{viewMode === 'symbolic' ? energy?.daily?.avoid : (energy.behavioral?.avoid || energy?.daily?.avoid)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* METRICS CARD */}
                <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 h-full flex flex-col justify-between items-center relative">
                        <div className="w-full text-center mb-8">
                            {(viewMode === 'symbolic' ? energy?.daily?.score : (energy.behavioral?.score || energy?.daily?.score)) != null ? (
                                <span className="text-4xl font-serif italic text-white/90">{viewMode === 'symbolic' ? energy?.daily?.score : (energy.behavioral?.score || energy?.daily?.score)}</span>
                            ) : (
                                <span className="text-4xl font-serif italic text-white/40">—</span>
                            )}
                            <span className="text-[10px] uppercase tracking-widest text-white/40 block mt-2">{t('total_alignment', 'Alineación Total')}</span>
                        </div>
                        
                        <div className="w-full flex justify-between px-2 gap-4">
                            <MetricRing label={t('focus', 'Enfoque')} value={energy?.metrics?.focus ?? energy?.daily?.metrics?.focus ?? null} color="stroke-blue-400" />
                            <MetricRing label={t('create', 'Crear')} value={energy?.metrics?.creativity ?? energy?.daily?.metrics?.creativity ?? null} color="stroke-purple-400" />
                            <MetricRing label={t('social', 'Social')} value={energy?.metrics?.relationships ?? energy?.daily?.metrics?.relationships ?? null} color="stroke-pink-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* WEEKLY CARD */}
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent mb-12">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-naos-gold/30 to-transparent"></div>
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Target className="w-5 h-5 text-naos-gold" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-white/50 block mb-2">{t('weekly_macro_theme', 'Tema Macro de la Semana')}</span>
                                <h3 className="text-xl font-serif italic text-white/90 mb-4">{energy?.weekly?.theme ?? ''}</h3>
                                <p className="text-sm font-mono text-white/60 leading-relaxed">
                                    {energy?.weekly?.description ?? ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {showIllusion && <LaborIllusion />}
        </motion.div>
    );
};



