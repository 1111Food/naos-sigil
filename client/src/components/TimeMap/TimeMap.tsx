import React, { useState, useEffect } from 'react';
import { useActiveProfile } from '../../hooks/useActiveProfile';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { naosQueryFn, naosQueryMutate } from '../../lib/queryClient';
import { LaborIllusion } from './LaborIllusion';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n';

export const TimeMap: React.FC = () => {
    const { profile } = useActiveProfile();
    const { t, language } = useTranslation();
    const qc = useQueryClient();
    const [generating, setGenerating] = useState(false);
    const [showIllusion, setShowIllusion] = useState(false);
    const [viewMode, setViewMode] = useState<'symbolic' | 'behavioral'>('symbolic');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // Check if user is Architect (Premium)
    const isPremium = profile?.plan_type === 'premium' || profile?.plan_type === 'admin';

    
    const { data: timeMap, isLoading: loading } = useQuery({
        queryKey: ['forecast', profile?.id, language],
        queryFn: () => naosQueryFn<{ map: any } | null>(`${API_BASE_URL}/api/forecast`).then(data => data?.map || null).catch(err => {
            if ((err as any).status === 404) return null;
            throw err;
        }),
        enabled: !!profile?.id,
        staleTime: 1000 * 60 * 15,
    });

    const generateMutation = useMutation({
        mutationFn: () => naosQueryMutate<{ map: any; error?: string }>(`${API_BASE_URL}/api/forecast/generate`, 'POST', { lang: language }).then(data => {
            if (data.error) throw new Error(data.error);
            return data.map;
        }),
        onSuccess: (newMap) => {
            if (newMap) {
                qc.setQueryData(['forecast', profile?.id, language], { map: newMap });
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


    const executeGeneration = React.useCallback(async () => {
        try {
            setGenerating(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_BASE_URL}/api/forecast/generate`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lang: language })
            });
            const data = await res.json();
            
            if (data.map) {
                setTimeMap(data.map);
                setErrorMsg(null);
            } else {
                setErrorMsg(data.error || t('generation_error', 'No fue posible generar el mapa en este momento. Inténtalo nuevamente en unos minutos.'));
            }
        } catch (e) {
            console.error("Error generating Time Map:", e);
            setErrorMsg(t('server_error', 'No fue posible conectar con el sistema. Inténtalo nuevamente en unos minutos.'));
        } finally {
            setGenerating(false);
            setShowIllusion(false);
        }
    }, [language, t]);

    
    let viewState: 'checking' | 'not_generated' | 'generating' | 'ready' | 'error' = 'checking';
    
    if (loading) viewState = 'checking';
    else if (generating || showIllusion) viewState = 'generating';
    else if (errorMsg) viewState = 'error';
    else if (!timeMap) viewState = 'not_generated';
    else viewState = 'ready';

    if (viewState === 'checking') {

        return <div className="p-8 text-center text-white/50">{t('syncing_frequencies', 'Sincronizando frecuencias...')}</div>;
    }

    if (viewState === 'not_generated') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-3xl font-serif italic text-white/90 mb-4">{t('time_navigator_title', t('time_navigator', 'El Navegador Temporal'))}</h2>
                <p className="text-white/70 mb-8 max-w-lg">
                    {t('time_navigator_desc', 'NAOS calculará la interacción de tus energías natales (Astrología, Numerología, Nahual y Animal Chino) con los tránsitos de los próximos 12 meses para generar tu Mapa Temporal personalizado.')}
                </p>
                <button 
                    onClick={handleGenerate}
                    disabled={showIllusion || generating}
                    className={`px-8 py-4 bg-naos-gold text-black font-semibold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all ${(showIllusion || generating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {t('generate_time_map', 'Generar mi Mapa Temporal')}
                </button>
                {errorMsg && (
                    <div className="mt-6 text-red-400 text-sm bg-red-950/30 px-6 py-3 rounded-lg border border-red-500/20">
                        {errorMsg}
                    </div>
                )}
            </div>
        );
    }

    
    if (viewState === 'generating' && !timeMap) {
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
        <div className="relative w-full pb-20">
            {showIllusion && <LaborIllusion />}
            
            {timeMap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    
                    {/* Toggle de Jerga (Jargon Toggle) */}
                    <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-4">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setViewMode('symbolic')}
                                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                    viewMode === 'symbolic' 
                                    ? 'bg-purple-900/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                🔮 Modo Simbólico
                            </button>
                            <button
                                onClick={() => setViewMode('behavioral')}
                                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                    viewMode === 'behavioral' 
                                    ? 'bg-blue-900/40 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                🧠 Modo {t('behavioral', 'Conductual')}
                            </button>
                        </div>
                        
                    </div>

                    {/* {t('annual_panorama', 'Panorama Anual')} */}
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-naos-gold/10 to-transparent pointer-events-none" />
                        <h2 className="text-3xl font-serif italic text-white/90 mb-2">{t('annual_panorama', 'Panorama Anual')}</h2>
                        <h3 className="text-xl text-naos-gold font-medium mb-6">{timeMap.annual_view.theme}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">{t('great_challenge', 'El Gran Reto')}</span>
                                <p className="text-white/90">{timeMap.annual_view.challenge}</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">{t('great_gift', 'El Gran Regalo')}</span>
                                <p className="text-white/90">{timeMap.annual_view.gift}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {timeMap.months.map((month: any, idx: number) => {
                            // Only first month is free, rest are locked if not premium
                            const isLocked = idx > 0 && !isPremium;

                            return (
                                <div key={idx} className="relative">
                                    <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md h-full ${isLocked ? 'blur-sm grayscale opacity-60' : ''}`}>
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <span className="text-naos-gold text-xs font-bold uppercase tracking-widest">{month.month_name} {month.year}</span>
                                                <h4 className="text-white text-lg font-serif italic">{month.frequency}</h4>
                                            </div>
                                            
                                        </div>

                                        <motion.div 
                                            key={viewMode}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <p className="text-sm text-white/70 mb-6 leading-relaxed">
                                                {viewMode === 'symbolic' 
                                                    ? (month.esoteric_reading || month.quantum_reading) 
                                                    : (month.biohacking_reading || month.quantum_reading)}
                                            </p>
                                        </motion.div>

                                        {/* Action Hacks */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-start">
                                                <span className="text-green-400 mr-2">🌱</span>
                                                <span className="text-xs text-white/80">{month.action_hack}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="text-red-400 mr-2">🚫</span>
                                                <span className="text-xs text-white/80">{month.blind_spot}</span>
                                            </div>
                                        </div>

                                        
                                    </div>

                                    {isLocked && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                                            <div className="w-16 h-16 rounded-full bg-naos-gold/20 flex items-center justify-center mb-4">
                                                <span className="text-2xl">ðŸ”’</span>
                                            </div>
                                            <h3 className="text-white font-medium mb-2">{t('unlock_timeline', 'Desbloquea tu Línea Temporal')}</h3>
                                            <p className="text-xs text-white/70 mb-4">
                                                Obtén visibilidad completa de tus próximos 11 meses con el Nivel {profile?.canonical_archetype?.nombre || 'Arquitecto'}.
                                            </p>
                                            <button className="px-6 py-2 bg-naos-gold text-black text-sm font-semibold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                                                Subir a {profile?.canonical_archetype?.nombre || 'Arquitecto'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                </motion.div>
            )}
        </div>
    );
};






