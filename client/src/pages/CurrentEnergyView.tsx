import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Battery, Sparkles, Target } from 'lucide-react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useTranslation } from '../i18n';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { LaborIllusion } from '../components/TimeMap/LaborIllusion';

interface CurrentEnergyViewProps {
    onBack: () => void;
    onNavigate?: (view: string, payload?: any) => void;
}

export const CurrentEnergyView: React.FC<CurrentEnergyViewProps> = ({ onNavigate }) => {
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
            {/* SIGIL CTA */}
            <div className="flex justify-center mt-4 mb-8 relative z-50">
                <button
                    onClick={() => onNavigate?.('CHAT', { pendingSigilPrompt: language === 'es' ? 'Ayúdame a entender cómo lo que está activo hoy se relaciona con mi Código de Identidad.' : 'Help me understand how what is active today relates to my Identity Code.' })}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-2xl overflow-hidden hover:border-purple-400/60 transition-all active:scale-[0.98]"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-black/50 border border-purple-500/30 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] uppercase tracking-widest text-purple-300/70 font-medium mb-1">
                                {language === 'es' ? 'Inteligencia Personal' : 'Personal Intelligence'}
                            </span>
                            <span className="block text-sm text-white/90 font-serif tracking-wide">
                                {language === 'es' ? 'EXPLORAR CON SIGIL' : 'EXPLORE WITH SIGIL'}
                            </span>
                        </div>
                    </div>
                </button>
            </div>
            
            {showIllusion && <LaborIllusion />}
        </motion.div>
    );
};



