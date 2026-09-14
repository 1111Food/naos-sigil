import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useTranslation } from '../i18n';
import { API_BASE_URL } from '../lib/api';
import { naosQueryFn, naosQueryMutate } from '../lib/queryClient';
import { LaborIllusion } from '../components/TimeMap/LaborIllusion';

interface LifelineViewProps {
    onBack: () => void;
}

const IndicatorBar = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div className="flex flex-col gap-1 mb-3">
        <div className="flex justify-between items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/50">{label}</span>
            <span className="text-xs font-mono text-white/80">{value}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${colorClass} shadow-[0_0_10px_currentColor] opacity-80`}
            />
        </div>
    </div>
);

export const LifelineView: React.FC<LifelineViewProps> = ({ onBack }) => {
    const { profile } = useActiveProfile();
    const { t, language } = useTranslation();
    const qc = useQueryClient();
    const [generating, setGenerating] = useState(false);
    const [showIllusion, setShowIllusion] = useState(false);
    const [viewMode, setViewMode] = useState<'symbolic' | 'behavioral'>('symbolic');
    const [expandedPinnacle, setExpandedPinnacle] = useState<number | null>(null);
    const [showDeepDive, setShowDeepDive] = useState<number | null>(null);
    const [showCycleDeepDive, setShowCycleDeepDive] = useState(false);

    const { data: lifeline, isLoading: loading } = useQuery({
        queryKey: ['lifeline', profile?.id, language],
        queryFn: () => naosQueryFn<{ exists: boolean; map?: any }>(`${API_BASE_URL}/api/lifeline?lang=${language}`).then(data => data.exists ? data.map : null),
        enabled: !!profile?.id,
        staleTime: 1000 * 60 * 15, // Cache for 15 mins
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const generateMutation = useMutation({
        mutationFn: () => naosQueryMutate<{ map: any; error?: string }>(`${API_BASE_URL}/api/lifeline/generate`, 'POST', { lang: language }).then(data => {
            if (data.error) throw new Error(data.error);
            return data.map;
        }),
        onSuccess: (newLifeline) => {
            if (newLifeline) {
                qc.setQueryData(['lifeline', profile?.id, language], newLifeline);
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

        const handleGenerate = () => {
        setGenerating(true);
        setShowIllusion(true);
        generateMutation.mutate();
    };

    
    let viewState: 'checking' | 'not_generated' | 'generating' | 'partially_ready' | 'ready' | 'error' = 'checking';
    
    if (loading) viewState = 'checking';
    else if (generating || showIllusion) viewState = 'generating';
    else if (errorMsg) viewState = 'error';
    else if (!lifeline) viewState = 'not_generated';
    else {
        // Evaluate if it's partial
        const hasMissingReadings = !lifeline.current_cycle?.esoteric_reading || lifeline.pinnacles?.some((p: any) => !p.esoteric_reading);
        if (hasMissingReadings) viewState = 'partially_ready';
        else viewState = 'ready';
    }

    if (viewState === 'checking') {

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-white/50">
                <motion.button
                    onClick={onBack}
                    className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('time_map', 'Mapa Temporal')}</span>
                </motion.button>
                {t('evolution_axis_syncing', 'Sincronizando frecuencias macro...')}
            </div>
        );
    }

    if (viewState === 'not_generated') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
                <motion.button
                    onClick={onBack}
                    className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('time_map', 'Mapa Temporal')}</span>
                </motion.button>
                <h2 className="text-3xl font-serif italic text-white/90 mb-4">{t('evolution_axis', 'El Eje Evolutivo')}</h2>
                <p className="text-white/70 mb-8 max-w-lg">
                    {t('evolution_axis_desc', 'NAOS compilará la arquitectura profunda de tus etapas de vida, cruzando la matemática pitagórica con tu diseño astral, tu nahual y energía china para crear un modelo predictivo de tu evolución. Esta generación es permanente y única.')}
                </p>
                <button 
                    onClick={handleGenerate}
                    disabled={showIllusion || generating}
                    className={`px-8 py-4 bg-naos-gold text-black font-semibold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all ${(showIllusion || generating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {t('evolution_axis_btn', 'Iniciar Compilación de Línea de Vida')}
                </button>
                {errorMsg && (
                    <div className="mt-6 text-red-400 text-sm bg-red-950/30 px-6 py-3 rounded-lg border border-red-500/20">
                        {errorMsg}
                    </div>
                )}
            </div>
        );
    }

    
    if (viewState === 'partially_ready') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <motion.button
                    onClick={onBack}
                    className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('time_map', 'Mapa Temporal')}</span>
                </motion.button>
                <div className="p-8 rounded-2xl bg-red-900/20 border border-red-500/30 max-w-xl mx-auto">
                    <h3 className="text-2xl font-serif italic text-red-400 mb-4">{language === 'es' ? 'Arquitectura Calculada, Lectura Pendiente' : 'Architecture Calculated, Reading Pending'}</h3>
                    <p className="text-white/70 mb-8">{language === 'es' ? 'Tu línea de vida matemática ha sido trazada, pero la interpretación profunda experimentó un retraso.' : 'Your mathematical lifeline has been drawn, but the deep interpretation experienced a delay.'}</p>
                    <button 
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-8 py-3 bg-red-500/20 text-red-300 font-bold uppercase tracking-widest text-xs rounded-full hover:bg-red-500/30 transition-all border border-red-500/50"
                    >
                        {language === 'es' ? 'Reintentar Interpretación' : 'Retry Interpretation'}
                    </button>
                </div>
                {showIllusion && <LaborIllusion />}
            </div>
        );
    }
    
    // We only reach here if viewState === 'ready' (or 'generating' but already had valid lifeline)
    if (viewState === 'generating' && !lifeline) {
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
    


    // Math calculation for the UI headers
    const bYear = profile?.birthDate ? Number(profile.birth_date.split('-')[0]) : new Date().getFullYear();
    const currentAge = new Date().getFullYear() - bYear;
    
    // Find current pinnacle based on ranges if not stored directly
    let currentPinnacleIndex = 1;
    // ... we rely on the math or just use the UI styling based on current age. Actually the prompt doesn't return the start/end ages, so we just show the 4 stages.

    return (
        <div className="relative min-h-[60vh] flex flex-col items-center justify-start p-6 mt-12 pb-24">
            {showIllusion && <LaborIllusion />}
            
            {!showIllusion && lifeline && (
                <>
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={onBack}
                        className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('time_map', 'Mapa Temporal')}</span>
                    </motion.button>

                    <div className="flex flex-col items-center justify-center gap-4 text-center mb-12 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-serif italic text-white/90 tracking-wide">{t('evolution_axis_title', 'Eje Evolutivo')}</h2>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-auto" />
                        <p className="text-xs uppercase tracking-[0.5em] text-white/30 font-bold">{t('life_architecture', 'Arquitectura de Vida')}</p>
                        <div className="mt-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                            {t('evolution_axis_current_age', 'Edad Actual:')} <span className="text-white font-bold">{currentAge} {t('evolution_axis_years', 'años')}</span>
                        </div>
                    </div>

                    {/* Toggle de Jerga */}
                    <div className="flex flex-col md:flex-row items-center justify-center mb-12 gap-4">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setViewMode('symbolic')}
                                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                    viewMode === 'symbolic' 
                                    ? 'bg-purple-900/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                {t('evolution_axis_mode_symbolic', '🔮 Modo Simbólico')}
                            </button>
                            <button
                                onClick={() => setViewMode('behavioral')}
                                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                    viewMode === 'behavioral' 
                                    ? 'bg-blue-900/40 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                🧠 Modo Conductual
                            </button>
                        </div>
                        
                    </div>

                    {/* Ciclo de 9 Años */}
                    <div className="w-full max-w-3xl mb-16 relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-naos-gold/5 to-transparent pointer-events-none" />
                        <h3 className="text-2xl font-serif italic text-white/90 mb-2">{lifeline.current_cycle?.title || t('evolution_axis_current_cycle', 'Ciclo Actual (Escala 9 Años)')}</h3>
                        <p className="text-white/70 mb-6">{t('personal_year', 'Año Personal')} {lifeline.current_cycle?.year_number || 1}</p>
                        
                        {/* Barra de Progreso 1-9 */}
                        <div className="flex justify-between items-center mb-8 relative">
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
                            {[1,2,3,4,5,6,7,8,9].map(num => {
                                const currentNum = lifeline.current_cycle?.year_number || 1;
                                const isCurrent = num === currentNum;
                                const isPast = num < currentNum;
                                return (
                                    <div key={num} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                                        ${isCurrent ? 'bg-naos-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-125' : 
                                          isPast ? 'bg-white/20 text-white/60' : 'bg-black border border-white/20 text-white/30'}`}
                                    >
                                        {num}
                                    </div>
                                );
                            })}
                        </div>

                        {(() => {
                            const cycleReading = (viewMode === 'symbolic' ? lifeline.current_cycle?.esoteric_reading : lifeline.current_cycle?.biohacking_reading) || (viewMode === 'behavioral' ? lifeline.current_cycle?.esoteric_reading : lifeline.current_cycle?.biohacking_reading) || { objetivo_evolutivo: 'Información Evolutiva Pendiente', riesgo_principal: t('evolution_axis_missing_reading', 'Lectura no disponible') };
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">{t('objective', 'Objetivo')}</span>
                                        <p className="text-white/90 text-sm">
                                            {cycleReading.objetivo_evolutivo}
                                        </p>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <span className="text-[10px] uppercase tracking-widest text-red-400/60 block mb-2">{t('risk', 'Riesgo')}</span>
                                        <p className="text-white/90 text-sm">
                                            {cycleReading.riesgo_principal}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        <button 
                            onClick={() => setShowCycleDeepDive(!showCycleDeepDive)}
                            className="text-xs uppercase tracking-widest text-naos-gold/70 hover:text-naos-gold flex items-center gap-2 transition-colors"
                        >
                            {showCycleDeepDive ? t('evolution_axis_deep_dive_hide', 'Ocultar Profundización') : t('evolution_axis_deep_dive_show', 'Profundizar')}
                            {showCycleDeepDive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        <AnimatePresence>
                            {showCycleDeepDive && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6 mt-6 border-t border-white/10 text-white/70 leading-relaxed text-sm">
                                        {viewMode === 'symbolic' 
                                            ? (lifeline.current_cycle?.deep_dive_esoteric || t('evolution_axis_missing_esoteric', 'Lectura mística profunda no disponible en este momento.')) 
                                            : (lifeline.current_cycle?.deep_dive_biohacking || t('evolution_axis_missing_biohacking', 'Análisis conductual profundo no disponible en este momento.'))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Las 4 Grandes ${t('evolution_axis_stage', 'Etapa')}s */}
                    <div className="w-full max-w-3xl space-y-6">
                        <h3 className="text-2xl font-serif italic text-white/90 mb-8 text-center">{t('the_decade', 'La Década (Pináculos)')}</h3>
                        
                        {(lifeline.pinnacles || []).map((pin: any, idx: number) => {
                            const isExpanded = expandedPinnacle === idx;
                            const isDeepDive = showDeepDive === idx;
                            const reading = (viewMode === 'symbolic' ? pin.esoteric_reading : pin.biohacking_reading) || (viewMode === 'behavioral' ? pin.esoteric_reading : pin.biohacking_reading) || null;
                            const indicators = pin.indicators;
                            
                            return (
                                <motion.div 
                                    key={idx}
                                    layout
                                    className={`relative rounded-3xl border backdrop-blur-xl transition-all overflow-hidden ${
                                        isExpanded 
                                        ? 'bg-purple-900/10 border-purple-500/30' 
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                                >
                                    <div 
                                        className="p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                        onClick={() => setExpandedPinnacle(isExpanded ? null : idx)}
                                    >
                                        <div className="flex-1 space-y-2">
                                            <h4 className="text-xl font-serif italic text-white">{pin.title || `${t('evolution_axis_stage', 'Etapa')} ${pin.index || idx + 1}`}</h4>
                                            <p className="text-sm text-white/70">{reading?.objetivo_evolutivo || ""}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">{t('main_metric', 'Métrica Principal')}</span>
                                                <span className="text-xs text-white/60">{reading?.metricas_naos || "" || t('evolution_axis_archetypal_coherence', 'Coherencia Arquetípica')}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-8 pt-0 border-t border-white/5 mt-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-6">
                                                        <div className="space-y-6">
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-red-400/60 block mb-2">{t('main_risk', 'Riesgo Principal')}</span>
                                                                <p className="text-white/80 text-sm">{reading?.riesgo_principal || ""}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-blue-400/60 block mb-2">{t('virtue_to_develop', 'Virtud a Desarrollar')}</span>
                                                                <p className="text-white/80 text-sm">{reading?.virtud_desarrollar || ""}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-purple-400/60 block mb-2">{t('dormant_talent', 'Talento Dormido')}</span>
                                                                <p className="text-white/80 text-sm">{reading?.talento_dormido || ""}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                                                            <h5 className="text-[10px] uppercase tracking-widest text-white/50 mb-6 text-center">{t('energy_indicators', 'Indicadores de Energía')}</h5>
                                                            {indicators ? (
                                                                <>
                                                                    <IndicatorBar label={t('evolution_axis_creativity', 'Creatividad')} value={indicators.creativity} colorClass="bg-purple-500" />
                                                                    <IndicatorBar label={t('evolution_axis_leadership', 'Liderazgo')} value={indicators.leadership} colorClass="bg-red-500" />
                                                                    <IndicatorBar label={t('evolution_axis_learning', 'Aprendizaje')} value={indicators.learning} colorClass="bg-blue-500" />
                                                                    <IndicatorBar label={t('evolution_axis_expansion', 'Expansión')} value={indicators.expansion} colorClass="bg-green-500" />
                                                                    <IndicatorBar label={t('relationships', 'Relaciones')} value={indicators.relationships} colorClass="bg-pink-500" />
                                                                </>
                                                            ) : (
                                                                <p className='text-center text-xs text-white/30 italic my-auto'>{t('calculations_unavailable', 'Cálculos no disponibles')}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-center mt-4">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setShowDeepDive(isDeepDive ? null : idx); }}
                                                            className="text-xs uppercase tracking-widest text-purple-400/70 hover:text-purple-400 transition-colors py-2 px-6 rounded-full border border-purple-500/30 hover:bg-purple-900/20"
                                                        >
                                                            {isDeepDive ? t('evolution_axis_deep_dive_hide', 'Ocultar Profundización') : t('evolution_axis_deep_dive_fusion', 'Profundizar en la Fusión de las 4 Intelligence Sources')}
                                                        </button>
                                                    </div>

                                                    <AnimatePresence>
                                                        {isDeepDive && (
                                                            <motion.div 
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-6 mt-6 rounded-xl bg-black/40 border border-white/5 text-white/70 leading-relaxed text-sm">
                                                                    {viewMode === 'symbolic' ? (pin.deep_dive_esoteric || 'Lectura mística de la etapa no disponible.') : (pin.deep_dive_biohacking || 'Integración conductual de la etapa no disponible.')}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};



