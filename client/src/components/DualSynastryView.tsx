import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Infinity as InfinityIcon, ArrowRight, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_BASE_URL, getAuthHeaders } from '../lib/api';
import { SynastryResultView } from './SynastryResultView';
import { RelationshipType } from './SynastryModule';

interface DualSynastryViewProps {
    profile: any;
}

export const DualSynastryView: React.FC<DualSynastryViewProps> = ({ profile }) => {
    const [step, setStep] = useState<'FORM' | 'TUNING' | 'RESULT'>('FORM');
    const [activeTab, setActiveTab] = useState<'FORM' | 'HISTORY'>('FORM');

    const [partnerData, setPartnerData] = useState({
        name: '', birthDate: '', birthTime: '12:00', birthCity: 'Guatemala', birthCountry: 'Guatemala'
    });
    const [relationshipType, setRelationshipType] = useState<RelationshipType>(RelationshipType.ROMANTIC);
    const [executionData, setExecutionData] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCalculate = async () => {
        if (!partnerData.name || !partnerData.birthDate || !partnerData.birthCity || !partnerData.birthCountry) {
            setError("La profundidad requiere todos los datos (Nombre, Fecha, Ciudad, País).");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const payload = { userProfile: profile, partnerData: { ...partnerData }, relationshipType };
            setStep('TUNING');

            const response = await fetch(`${API_BASE_URL}/api/synastry/analyze`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || err.error || 'Error en el análisis');
            }

            const result = await response.json();

            setTimeout(() => {
                setExecutionData(result.data);
                setStep('RESULT');
                setIsLoading(false);
            }, 2500);

        } catch (err: any) {
            console.error("❌ Synastry Error:", err);
            setError(err.message || "Interferencia en la red astral. Verifica el servidor.");
            setStep('FORM');
            setIsLoading(false);
        }
    };

    const fetchHistory = useCallback(async () => {
        if (!profile?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/synastry/history`, { headers: getAuthHeaders() });
            if (!response.ok) throw new Error("Registros inalcanzables.");
            const result = await response.json();
            // Filter to only non-group history if possible, though backend returns all
            // We can filter by type here to ensure Dual History only shows Dual types
            const dualHistory = result.filter((item: any) => item.relationship_type !== 'GROUP_DYNAMICS');
            setHistory(dualHistory || []);
        } catch (err) {
            console.error("❌ History Error:", err);
            setError("Fallo al acceder a los registros.");
        } finally {
            setIsLoading(false);
        }
    }, [profile?.id]);

    const handleTabChange = (tab: 'FORM' | 'HISTORY') => {
        setActiveTab(tab);
        if (tab === 'HISTORY') {
            fetchHistory();
        } else {
            setStep('FORM');
        }
    };

    const handleSelectHistory = (item: any) => {
        const results = item.calculated_results;
        setExecutionData(results);
        setPartnerData({
            name: item.partner_name,
            birthDate: '', birthTime: '',
            birthCity: results?.partnerInfo?.birthCity || '',
            birthCountry: results?.partnerInfo?.birthCountry || ''
        });
        setStep('RESULT');
        setActiveTab('FORM'); // switch back to calculator view logic
    };

    const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        let sanitizedId = id;
        if (id && typeof id === 'string' && id.startsWith('r_')) {
            sanitizedId = id.substring(2);
        }
        if (!window.confirm("¿Seguro que deseas liberar este registro de tu historial?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/synastry/record/${sanitizedId}`, {
                method: 'DELETE',
                headers: (() => { const h = getAuthHeaders(); delete h['Content-Type']; return h; })()
            });
            if (!response.ok) throw new Error("No se pudo borrar.");
            setHistory(prev => prev.filter(item => item.id !== id && item.id !== sanitizedId));
        } catch (err) {
            alert("No se pudo borrar el registro.");
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center relative p-4 mt-8">
            <div className="absolute inset-0 bg-[#050505]">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/10 blur-[100px] rounded-full" />
            </div>

            {/* Persistent Tab Menu */}
            <div className="relative z-20 flex justify-center mb-10 w-full max-w-4xl mx-auto border-b border-white/10 pb-4">
                <div className="flex gap-4 p-1 bg-white/5 border border-white/5 rounded-full p-2">
                    <button
                        onClick={() => handleTabChange('FORM')}
                        className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full transition-all ${activeTab === 'FORM' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-white/40 hover:text-white/80'}`}
                    >
                        Invocar Espejo
                    </button>
                    <button
                        onClick={() => handleTabChange('HISTORY')}
                        className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full transition-all ${activeTab === 'HISTORY' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-white/40 hover:text-white/80'}`}
                    >
                        Historial Dual
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'FORM' && (
                    <motion.div key="form-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative z-10 flex flex-col items-center">
                        {step === 'FORM' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-2xl bg-black/40 border border-purple-500/20 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shrink-0"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-serif text-primary mb-3">Resonancia Arquitectónica</h3>
                                    <p className="text-secondary text-label leading-relaxed px-4">Configura los vectores de sincronización para mapear la sinergia oculta entre tú y el Vínculo.</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] tracking-widest uppercase text-center font-bold">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="relative w-full flex justify-center pb-6 border-b border-white/10">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all backdrop-blur-md"
                                            >
                                                <span>
                                                    {[
                                                        { id: RelationshipType.ROMANTIC, label: 'Sinergia Romántica' },
                                                        { id: RelationshipType.AMISTAD, label: 'Sinergia de la Amistad' },
                                                        { id: RelationshipType.PARENTAL, label: 'Sinergia Parental' },
                                                        { id: RelationshipType.BUSINESS, label: 'Sinergia de Negocios' },
                                                    ].find(t => t.id === relationshipType)?.label || 'Seleccionar Sinergia'}
                                                </span>
                                                <ChevronDown size={14} className={cn("transition-transform duration-300 text-purple-400", isDropdownOpen && "rotate-180")} />
                                            </button>

                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                        className="absolute top-14 left-1/2 -translate-x-1/2 w-56 bg-black/90 border border-purple-500/20 rounded-2xl p-1.5 z-30 shadow-2xl backdrop-blur-xl flex flex-col gap-1"
                                                    >
                                                        {[
                                                            { id: RelationshipType.ROMANTIC, label: 'Sinergia Romántica' },
                                                            { id: RelationshipType.AMISTAD, label: 'Sinergia de la Amistad' },
                                                            { id: RelationshipType.PARENTAL, label: 'Sinergia Parental' },
                                                            { id: RelationshipType.BUSINESS, label: 'Sinergia de Negocios' },
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => { setRelationshipType(opt.id); setIsDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left transition-colors flex items-center justify-between",
                                                                    opt.id === relationshipType 
                                                                        ? "bg-purple-500/20 text-purple-200 border border-purple-500/30" 
                                                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                                                )}
                                                            >
                                                                <span>{opt.label}</span>
                                                                {opt.id === relationshipType && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-label text-secondary ml-2">Identidad del Vínculo</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                                placeholder="Nombre (Ej. Nikola Tesla)"
                                                value={partnerData.name}
                                                onChange={e => setPartnerData({ ...partnerData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">Punto Temporal</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 invert-calendar-icon"
                                                    value={partnerData.birthDate}
                                                    onChange={e => setPartnerData({ ...partnerData, birthDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">Hora (Aprox)</label>
                                                <input
                                                    type="time"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 invert-calendar-icon"
                                                    value={partnerData.birthTime}
                                                    onChange={e => setPartnerData({ ...partnerData, birthTime: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">Ciudad Base</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder="Ej: Smiljan"
                                                    value={partnerData.birthCity}
                                                    onChange={e => setPartnerData({ ...partnerData, birthCity: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">País</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder="Ej: Croacia"
                                                    value={partnerData.birthCountry}
                                                    onChange={e => setPartnerData({ ...partnerData, birthCountry: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCalculate}
                                        disabled={isLoading || !partnerData.name || !partnerData.birthDate}
                                        className={`w-full py-5 rounded-2xl border flex items-center justify-center gap-3 transition-all ${(!partnerData.name || !partnerData.birthDate) ? 'bg-black border-white/5 text-white/20' : 'bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30 hover:border-purple-500/50 cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.15)]'}`}
                                    >
                                        <span className="text-[11px] uppercase tracking-[0.3em] font-black">
                                            Sincronizar Códigos
                                        </span>
                                        <ArrowRight size={16} className={(!partnerData.name || !partnerData.birthDate) ? 'opacity-0' : 'opacity-100'} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'TUNING' && (
                            <div className="flex flex-col items-center justify-center pt-20">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-purple-500/20 border-t-purple-500/60" />
                                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border border-pink-500/20 border-b-pink-500/60" />
                                    <InfinityIcon className="w-12 h-12 text-purple-400/50 animate-pulse" />
                                </div>
                                <h3 className="tracking-[0.4em] uppercase text-purple-300 font-bold text-sm animate-pulse">Codificando Vínculo Dual</h3>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4 max-w-sm text-center">Invocando motores de Astrología, Numerología y Diseño Humano</p>
                            </div>
                        )}

                        {step === 'RESULT' && executionData && (
                            <div className="w-full">
                                <div className="flex justify-center mb-6">
                                    <button onClick={() => setStep('FORM')} className="text-[10px] uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                                        Limpiar Análisis
                                    </button>
                                </div>
                                <SynastryResultView
                                    data={executionData}
                                    onNew={() => setStep('FORM')}
                                    userA={profile}
                                    userB={{
                                        ...executionData.partnerInfo,
                                        ...partnerData
                                    }}
                                />
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'HISTORY' && (
                    <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 shrink-0 self-start pb-20">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-white/30" /></div>
                        ) : history.length === 0 ? (
                            <div className="col-span-full flex justify-center py-20 text-white/30 text-xs uppercase tracking-widest">No existe registro akáshico.</div>
                        ) : (
                            history.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-black/40 border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all cursor-pointer group flex flex-col justify-between h-56 relative overflow-hidden backdrop-blur-xl"
                                    onClick={() => handleSelectHistory(item)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
                                    <div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                                                Score: <span className="text-white text-[11px]">{item.calculated_results?.report?.score || '0'}%</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-1">
                                                    {item.relationship_type === RelationshipType.ROMANTIC ? 'Romántico' :
                                                        item.relationship_type === RelationshipType.AMISTAD ? 'Amistad' :
                                                            item.relationship_type === RelationshipType.BUSINESS ? 'Negocios' : 'Familiar'}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="text-white font-serif text-2xl truncate mb-1 pr-4">{item.partner_name}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">
                                            {new Date(item.created_at).toISOString().split('T')[0]}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                                        <span className="text-[9px] uppercase tracking-[0.3em] font-black text-purple-400 group-hover:translate-x-1 transition-transform">Revisar</span>
                                        <button
                                            onClick={(e) => handleDeleteHistory(e, item.id)}
                                            className="w-8 h-8 rounded-full bg-red-500/5 text-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                            title="Liberar Registro"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
