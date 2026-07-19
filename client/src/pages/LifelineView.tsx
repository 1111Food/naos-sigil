import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useTranslation } from '../i18n';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
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
    const [lifeline, setLifeline] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showIllusion, setShowIllusion] = useState(false);
    const [viewMode, setViewMode] = useState<'symbolic' | 'behavioral'>('symbolic');
    const [expandedPinnacle, setExpandedPinnacle] = useState<number | null>(null);
    const [showDeepDive, setShowDeepDive] = useState<number | null>(null);
    const [showCycleDeepDive, setShowCycleDeepDive] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (profile) fetchLifeline();
    }, [profile]);

    const fetchLifeline = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_BASE_URL}/api/lifeline?lang=${language}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            
            if (data.map) setLifeline(data.map);
        } catch (e) {
            console.error("Error fetching Lifeline:", e);
        } finally {
            setLoading(false);
        }
    };

    const executeGeneration = React.useCallback(async () => {
        try {
            setGenerating(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_BASE_URL}/api/lifeline/generate`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lang: language })
            });
            const data = await res.json();
            
            if (data.map) setLifeline(data.map);
        } catch (e) {
            console.error("Error generating Lifeline:", e);
        } finally {
            setGenerating(false);
            setShowIllusion(false);
        }
    }, [language]);

    const handleGenerate = async () => {
        setShowIllusion(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-white/50">
                <motion.button
                    onClick={onBack}
                    className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('time_map', 'Mapa Temporal')}</span>
                </motion.button>
                Sincronizando frecuencias macro...
            </div>
        );
    }

    if (!lifeline && !showIllusion) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[60vh]">
                <motion.button
                    onClick={onBack}
                    className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('time_map', 'Mapa Temporal')}</span>
                </motion.button>
                <h2 className="text-3xl font-serif italic text-white/90 mb-4">El Eje Evolutivo</h2>
                <p className="text-white/70 mb-8 max-w-lg">
                    NAOS compilará la arquitectura profunda de tus etapas de vida, cruzando la matemática pitagórica con tu diseño astral, tu nahual y energía china para crear un modelo predictivo de tu evolución. Esta generación es permanente y única.
                </p>
                <button 
                    onClick={handleGenerate}
                    className="px-8 py-4 bg-naos-gold text-black font-semibold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all"
                >
                    Iniciar Compilación de Línea de Vida
                </button>
            </div>
        );
    }

    // Math calculation for the UI headers
    const bYear = profile?.birth_date ? Number(profile.birth_date.split('-')[0]) : new Date().getFullYear();
    const currentAge = new Date().getFullYear() - bYear;
    
    // Find current pinnacle based on ranges if not stored directly
    let currentPinnacleIndex = 1;
    // ... we rely on the math or just use the UI styling based on current age. Actually the prompt doesn't return the start/end ages, so we just show the 4 stages.

    return (
        <div className="relative min-h-[60vh] flex flex-col items-center justify-start p-6 mt-12 pb-24">
            {showIllusion && <LaborIllusion onComplete={executeGeneration} />}
            
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
                        <h2 className="text-4xl md:text-5xl font-serif italic text-white/90 tracking-wide">
                            Eje Evolutivo
                        </h2>
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-auto" />
                        <p className="text-xs uppercase tracking-[0.5em] text-white/30 font-bold">Arquitectura de Vida</p>
                        <div className="mt-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                            Edad Actual: <span className="text-white font-bold">{currentAge} años</span>
                        </div>
                    </div>

                    {/* Toggle de Jerga */}
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                            <button
                                onClick={() => setViewMode('symbolic')}
                                className={`px-6 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 ${
                                    viewMode === 'symbolic' 
                                    ? 'bg-purple-900/40 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                            >
                                🌌 Modo Simbólico
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
                        <h3 className="text-2xl font-serif italic text-white/90 mb-2">Ciclo Actual (Escala 9 Años)</h3>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-8">Año Personal {lifeline.current_cycle.year_number}</p>
                        
                        {/* Barra de Progreso 1-9 */}
                        <div className="flex justify-between items-center mb-8 relative">
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
                            {[1,2,3,4,5,6,7,8,9].map(num => {
                                const isCurrent = num === lifeline.current_cycle.year_number;
                                const isPast = num < lifeline.current_cycle.year_number;
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Objetivo</span>
                                <p className="text-white/90 text-sm">
                                    {viewMode === 'symbolic' ? lifeline.current_cycle.esoteric_reading.objetivo_evolutivo : lifeline.current_cycle.biohacking_reading.objetivo_evolutivo}
                                </p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-red-400/60 block mb-2">Riesgo</span>
                                <p className="text-white/90 text-sm">
                                    {viewMode === 'symbolic' ? lifeline.current_cycle.esoteric_reading.riesgo_principal : lifeline.current_cycle.biohacking_reading.riesgo_principal}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowCycleDeepDive(!showCycleDeepDive)}
                            className="text-xs uppercase tracking-widest text-naos-gold/70 hover:text-naos-gold flex items-center gap-2 transition-colors"
                        >
                            {showCycleDeepDive ? 'Ocultar Profundización' : 'Profundizar'}
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
                                        {viewMode === 'symbolic' ? lifeline.current_cycle.deep_dive_esoteric : lifeline.current_cycle.deep_dive_biohacking}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Las 4 Grandes Etapas */}
                    <div className="w-full max-w-3xl space-y-6">
                        <h3 className="text-2xl font-serif italic text-white/90 mb-8 text-center">La Década (Pináculos)</h3>
                        
                        {lifeline.pinnacles.map((pin: any, idx: number) => {
                            const isExpanded = expandedPinnacle === idx;
                            const isDeepDive = showDeepDive === idx;
                            const reading = viewMode === 'symbolic' ? pin.esoteric_reading : pin.biohacking_reading;
                            
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
                                            <h4 className="text-xl font-serif italic text-white">Etapa {pin.index}</h4>
                                            <p className="text-sm text-white/70">{reading.objetivo_evolutivo}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase tracking-widest text-white/40">Métrica Principal</span>
                                                <span className="text-xs text-white/60">{reading.metricas_naos}</span>
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
                                                                <span className="text-[10px] uppercase tracking-widest text-red-400/60 block mb-2">Riesgo Principal</span>
                                                                <p className="text-white/80 text-sm">{reading.riesgo_principal}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-blue-400/60 block mb-2">Virtud a Desarrollar</span>
                                                                <p className="text-white/80 text-sm">{reading.virtud_desarrollar}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-purple-400/60 block mb-2">Talento Dormido</span>
                                                                <p className="text-white/80 text-sm">{reading.talento_dormido}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                                                            <h5 className="text-[10px] uppercase tracking-widest text-white/50 mb-6 text-center">Indicadores de Energía</h5>
                                                            <IndicatorBar label="Creatividad" value={pin.indicators.creativity} colorClass="bg-purple-500" />
                                                            <IndicatorBar label="Liderazgo" value={pin.indicators.leadership} colorClass="bg-red-500" />
                                                            <IndicatorBar label="Aprendizaje" value={pin.indicators.learning} colorClass="bg-blue-500" />
                                                            <IndicatorBar label="Expansión" value={pin.indicators.expansion} colorClass="bg-green-500" />
                                                            <IndicatorBar label="Relaciones" value={pin.indicators.relationships} colorClass="bg-pink-500" />
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-center mt-4">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setShowDeepDive(isDeepDive ? null : idx); }}
                                                            className="text-xs uppercase tracking-widest text-purple-400/70 hover:text-purple-400 transition-colors py-2 px-6 rounded-full border border-purple-500/30 hover:bg-purple-900/20"
                                                        >
                                                            {isDeepDive ? 'Ocultar Profundización' : 'Profundizar en la Fusión de las 4 Escuelas'}
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
                                                                    {viewMode === 'symbolic' ? pin.deep_dive_esoteric : pin.deep_dive_biohacking}
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
