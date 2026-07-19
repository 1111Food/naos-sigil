import React, { useState, useEffect } from 'react';
import { useActiveProfile } from '../../hooks/useActiveProfile';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/api';
import { LaborIllusion } from './LaborIllusion';
import { motion } from 'framer-motion';

export const TimeMap: React.FC = () => {
    const { profile } = useActiveProfile();
    const [timeMap, setTimeMap] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showIllusion, setShowIllusion] = useState(false);
    const [viewMode, setViewMode] = useState<'symbolic' | 'behavioral'>('symbolic');
    
    // Check if user is Architect (Premium)
    const isPremium = profile?.plan_type === 'premium' || profile?.plan_type === 'admin';

    useEffect(() => {
        if (!profile) return;
        fetchTimeMap();
    }, [profile]);

    const fetchTimeMap = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_BASE_URL}/api/forecast`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            
            if (data.map) setTimeMap(data.map);
        } catch (e) {
            console.error("Error fetching Time Map:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setShowIllusion(true); // Start cinematic loading
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
                body: JSON.stringify({ lang: 'es' })
            });
            const data = await res.json();
            
            if (data.map) setTimeMap(data.map);
        } catch (e) {
            console.error("Error generating Time Map:", e);
        } finally {
            setGenerating(false);
            setShowIllusion(false);
        }
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-white/50">Sincronizando frecuencias...</div>;
    }

    if (!timeMap && !showIllusion) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-3xl font-serif italic text-white/90 mb-4">El Navegador Temporal</h2>
                <p className="text-white/70 mb-8 max-w-lg">
                    NAOS calculará la interacción de tus energías natales (Astrología, Numerología, Nahual y Animal Chino) con los tránsitos de los próximos 12 meses para generar tu Mapa Temporal personalizado.
                </p>
                <button 
                    onClick={handleGenerate}
                    className="px-8 py-4 bg-naos-gold text-black font-semibold rounded-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all"
                >
                    Generar mi Mapa Temporal
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full pb-20">
            {showIllusion && <LaborIllusion onComplete={executeGeneration} />}
            
            {timeMap && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    
                    {/* Toggle de Jerga (Jargon Toggle) */}
                    <div className="flex justify-center mb-8">
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

                    {/* Panorama Anual */}
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-naos-gold/10 to-transparent pointer-events-none" />
                        <h2 className="text-3xl font-serif italic text-white/90 mb-2">Panorama Anual</h2>
                        <h3 className="text-xl text-naos-gold font-medium mb-6">{timeMap.annual_view.theme}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">El Gran Reto</span>
                                <p className="text-white/90">{timeMap.annual_view.challenge}</p>
                            </div>
                            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                                <span className="text-white/50 text-xs uppercase tracking-wider block mb-1">El Gran Regalo</span>
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
                                            <div className="text-right">
                                                <span className="text-white/40 text-[10px] uppercase">Puntuación Cuántica</span>
                                                <div className="text-2xl font-light text-white">{month.scores.energy}</div>
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
                                                <span className="text-green-400 mr-2">🟢</span>
                                                <span className="text-xs text-white/80">{month.action_hack}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="text-red-400 mr-2">🔴</span>
                                                <span className="text-xs text-white/80">{month.blind_spot}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bars */}
                                        <div className="space-y-2 mt-auto">
                                            <MetricBar label="Amor" value={month.scores.love} />
                                            <MetricBar label="Dinero" value={month.scores.money} />
                                            <MetricBar label="Creatividad" value={month.scores.creativity} />
                                            <MetricBar label="Riesgo" value={month.scores.risk} color="bg-red-500" />
                                        </div>
                                    </div>

                                    {isLocked && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                                            <div className="w-16 h-16 rounded-full bg-naos-gold/20 flex items-center justify-center mb-4">
                                                <span className="text-2xl">🔒</span>
                                            </div>
                                            <h3 className="text-white font-medium mb-2">Desbloquea tu Línea Temporal</h3>
                                            <p className="text-xs text-white/70 mb-4">
                                                Obtén visibilidad completa de tus próximos 11 meses con el Nivel Arquitecto.
                                            </p>
                                            <button className="px-6 py-2 bg-naos-gold text-black text-sm font-semibold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                                                Subir a Arquitecto
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

const MetricBar = ({ label, value, color = 'bg-naos-gold' }: { label: string, value: number, color?: string }) => (
    <div className="flex items-center text-xs">
        <span className="w-20 text-white/50">{label}</span>
        <div className="flex-1 h-1.5 bg-black/50 rounded-full overflow-hidden mx-3">
            <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
        </div>
        <span className="w-6 text-right text-white/80">{value}</span>
    </div>
);
