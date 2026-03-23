import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Target, User, AlertTriangle, RefreshCw, Hexagon, Sparkles, Heart, Home, Wind, ChevronDown, BookOpen, Info } from 'lucide-react';
import { OracleExplainer } from './OracleExplainer';
import { cn } from '../lib/utils';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { NeonNumber } from './NeonNumber';
import { getNumberText } from '../utils/numberMapper';
import { ArchetypeLibrary } from './ArchetypeLibrary';
import { NAOS_ARCHETYPES } from '../constants/archetypeData';
import { ArchetypeDecodifier } from './ArchetypeDecodifier';

interface NaosIdentitySynthesis {
    arquetipo?: {
        nombre: string;
        frecuencia: string;
        rol: string;
        descripcion: string;
        elemento: string;
        powerLines?: any[];
        desglose?: {
            scores: Record<string, number>;
            contribuciones: {
                astrologia: string[];
                maya: string[];
                chino: string[];
                numerologia: string[];
            }
        };
    };
    interfaz_social: string;
    nucleo_interno: string;
    patron_sombra: string;
    direccion_vital: string;
    tension_evolutiva: string;
    alquimia_vinculos: string;
    arquitectura_entorno: string;
    umbral_manifestacion: string;
}

const colorConfig: Record<string, { main: string, glow: string, bg: string }> = {
    cyan: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', bg: 'rgba(6, 182, 212, 0.1)' },
    amber: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.1)' },
    rose: { main: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', bg: 'rgba(244, 63, 94, 0.1)' },
    emerald: { main: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.1)' },
    indigo: { main: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', bg: 'rgba(99, 102, 241, 0.1)' },
    fuchsia: { main: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)', bg: 'rgba(217, 70, 239, 0.1)' },
};

const frequencyConfig: Record<string, { main: string, glow: string, bg: string }> = {
    'Ígnea': colorConfig.rose,
    'Telúrica': colorConfig.emerald,
    'Etérea': colorConfig.cyan,
    'Abisal': colorConfig.fuchsia,
};

export const NaosIdentityView: React.FC<{ profile: any }> = ({ profile: _profile }) => {
    const cacheKey = `naos_identity_${_profile?.id || 'guest'}`;
    
    // Initial state hydration: Prop > LocalStorage > null
    const [synthesis, setSynthesis] = useState<NaosIdentitySynthesis | null>(() => {
        if (_profile?.naos_identity_code) return _profile.naos_identity_code;
        if (_profile?.naosIdentityCode) return _profile.naosIdentityCode;
        try {
            const cached = localStorage.getItem(cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch (e) { return null; }
    });

    const [loading, setLoading] = useState(false); 
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openModuleId, setOpenModuleId] = useState<string | null>('social');
    const [isArchetypeExpanded, setIsArchetypeExpanded] = useState(false);
    const [showArchetypeLibrary, setShowArchetypeLibrary] = useState(false);
    const [explainerType, setExplainerType] = useState<'IDENTITY_ARCHETYPE' | null>(null);
    const hasAutoRefreshed = React.useRef(false);
    const hasInitialFetched = React.useRef(false);

    const fetchSynthesis = async (refresh = false) => {
        console.log("🧬 [NaosIdentityView] fetchSynthesis triggered. Refresh:", refresh);
        if (refresh) setIsRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            console.log("🔑 [NaosIdentityView] Fetching async auth headers...");
            const authHeaders = await getAsyncAuthHeaders();
            console.log("📡 [NaosIdentityView] Requesting /api/naos-code...");
            const res = await fetch(`${API_BASE_URL}/api/naos-code${refresh ? '?refresh=true' : ''}`, {
                headers: authHeaders as HeadersInit
            });
            console.log("🔌 [NaosIdentityView] Response status:", res.status);
            if (!res.ok) {
                // ... (existing error handling)
                let errMsg = 'Error al compilar el código';
                try {
                    const errData = await res.json();
                    console.error("❌ [NaosIdentityView] API Error Data:", errData);
                    if (errData.details && (errData.details.includes('429') || errData.details.includes('RESOURCE_EXHAUSTED'))) {
                        errMsg = 'El oráculo está en meditación profunda (Límite de Cuota). Intenta de nuevo en unos minutos.';
                    } else if (errData.details && errData.details.includes('TIMEOUT')) {
                        errMsg = 'La red estelar está saturada. El oráculo no respondió a tiempo.';
                    } else if (errData.details && errData.details.includes('SÍNTESIS_INCOMPLETA')) {
                        errMsg = 'La alineación ha sido fragmentada. Por favor, reinicia la sincronización.';
                    } else if (errData.details) {
                        errMsg = `Error de síntesis: ${errData.details}`;
                    }
                } catch (e) { }
                throw new Error(errMsg);
            }
            const data = await res.json();
            console.log("✅ [NaosIdentityView] Synthesis received and cached.");
            
            // Persist to state AND localStorage
            setSynthesis(data);
            try {
                localStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (e) { console.warn("Failed to write to localStorage", e); }

        } catch (err: any) {
            console.error("🔥 [NaosIdentityView] Synthesis Fetch Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const checkCompleteness = () => {
            if (!synthesis) return { isComplete: false, hasArchetype: false };
            
            const hasArchetype = !!(synthesis.arquetipo?.nombre && synthesis.arquetipo.nombre !== "Calculando...");
            const mandatoryKeys = ['alquimia_vinculos', 'arquitectura_entorno', 'umbral_manifestacion'];
            const hasMandatoryBlocks = mandatoryKeys.every(key => {
                const val = (synthesis as any)[key];
                return typeof val === 'string' && val.length > 50 && !val.includes("...");
            });

            return { 
                isComplete: hasArchetype && hasMandatoryBlocks,
                hasArchetype,
                hasMandatoryBlocks
            };
        };

        const { isComplete, hasArchetype, hasMandatoryBlocks } = checkCompleteness();
        
        console.log("🔄 [NaosIdentityView] Status Check:", { 
            hasSynthesis: !!synthesis, 
            loading, 
            isComplete,
            hasArchetype,
            hasMandatoryBlocks,
            autoRefreshed: hasAutoRefreshed.current,
            error: !!error,
            raw_arquetipo: synthesis?.arquetipo
        });

        if (synthesis) {
            console.log("🧬 [NaosIdentityView] Full Synthesis Object Keys:", Object.keys(synthesis));
            if ((synthesis as any).arquetipo) {
                console.log("🧬 [NaosIdentityView] Archetype Sub-object Keys:", Object.keys((synthesis as any).arquetipo));
                console.log("🧬 [NaosIdentityView] Archetype Data:", (synthesis as any).arquetipo);
            } else {
                console.warn("⚠️ [NaosIdentityView] Archetype property MISSING from synthesis object.");
            }
        }
        
        // CASE 1: No data at all, trigger initial fetch
        if (!synthesis && !loading && !hasInitialFetched.current) {
            console.log("🚀 [NaosIdentityView] No cache found. Triggering initial fetch...");
            hasInitialFetched.current = true;
            fetchSynthesis();
        } 
        // CASE 2: Incomplete data, trigger ONE-TIME deep synchronization
        // DO NOT trigger if there is already an error (like Quota 429) to avoid loops
        else if (synthesis && !loading && !isRefreshing && !isComplete && !hasAutoRefreshed.current && !error) {
            console.log("🧬 [NaosIdentityView] Incomplete identity detected. Triggering deep sync...");
            hasAutoRefreshed.current = true;
            // Delay slightly to allow the UI to stabilize
            const timer = setTimeout(() => fetchSynthesis(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [synthesis, loading, isRefreshing, error]);

    const getFormula = (id: string) => {
        try {
            const astro = _profile?.astrology || {};
            const num = _profile?.numerology || {};
            const pin = num.pinaculo || {};
            const maya = _profile?.mayan || {};

            const sun = astro.planets?.find((p: any) => p.name === 'Sun')?.sign || astro.sun?.sign || astro.sunSign || 'Sol';
            const moon = astro.moon?.sign || astro.moonSign || 'Luna';
            const rising = astro.rising?.sign || astro.risingSign || 'Asc';
            const venus = astro.venus?.sign || astro.venusSign || (astro.planets?.find((p: any) => p.name === 'Venus')?.sign) || 'Venus';
            const node = astro.planets?.find((p: any) => p.name === 'North Node' || p.name === 'Nodo Norte')?.sign || 'Nodo';
            const house4 = astro.house4 || (astro.planets?.find((p: any) => p.house === 4 || p.name === 'House 4')?.sign) || 'Casa 4';

            const personality = pin.b || num.tantric?.soul || '?';
            const essence = pin.d || '?';
            const mission = pin.g || '?';
            const realization = pin.h || '?';
            const unconscious = pin.j || '?';
            const shadow = pin.q || '?';
            const lifePath = num.lifePathNumber || '?';

            const animal = _profile?.chinese_animal || 'Animal';
            const element = _profile?.chinese_element || 'Elemento';
            const nawal = maya.kicheName || 'Nawal';
            const tone = maya.tone || '?';

            switch (id) {
                case 'social':
                    return `Integrando la impronta del Ascendente ${rising} con la Personalidad ${personality} y la esencia elemental del ${animal}.`;
                case 'inner':
                    return `Sintonizando el núcleo solar en ${sun} con la pulsación del alma ${essence} y el nawal maya ${nawal}.`;
                case 'shadow':
                    return `Explorando la resonancia de la Luna en ${moon} con las sombras del inconsciente ${unconscious} y el patrón karmático ${shadow}.`;
                case 'vital':
                    return `Trazando el camino del ${node} hacia la Misión ${mission} y el Gradiente de Realización ${realization}.`;
                case 'tension':
                    return `Unificando el Ascendente ${rising} y el Sendero de Vida ${lifePath} bajo la frecuencia evolutiva del Kin ${nawal} ${tone}.`;
                case 'vinculos':
                    return `Sincronizando la frecuencia de Venus en ${venus}, los ciclos del ${animal} y tu Número del Alma ${personality} para la alquimia dual.`;
                case 'entorno':
                    return `Arquitectura del espacio sagrado mediante la Casa 4 en ${house4}, el elemento ${element} y tu vibración del hogar.`;
                case 'manifestacion':
                    return `Umbral de éxito 2026: Tránsitos de Júpiter, tu Año Personal ${mission} y el flujo energético del ${animal}.`;
                default:
                    return '';
            }
        } catch (e) {
            console.warn("⚠️ Error calculating formula for", id, e);
            return "Sincronizando escuelas energéticas...";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <Hexagon className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.6em] text-cyan-400 font-black animate-pulse">Invocando Código de Identidad</p>
                    <p className="text-[8px] uppercase tracking-widest text-white/20">Sincronizando Escuelas Energéticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-xl font-serif italic text-white mb-2">Fallo en la Compilación</h3>
                <p className="text-white/40 mb-8 text-xs uppercase tracking-widest max-w-md leading-relaxed">{error}</p>
                <button
                    onClick={() => fetchSynthesis(true)}
                    className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.3em] text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold"
                >
                    Reiniciar Núcleo
                </button>
            </div>
        );
    }

    const modules = [
        { id: 'social', title: 'Interfaz Social', icon: User, content: synthesis?.interfaz_social || "Alineando...", color: 'cyan', formula: getFormula('social') },
        { id: 'inner', title: 'Núcleo Interno', icon: Shield, content: synthesis?.nucleo_interno || "Alineando...", color: 'amber', formula: getFormula('inner') },
        { id: 'shadow', title: 'Patrón Sombra', icon: AlertTriangle, content: synthesis?.patron_sombra || "Alineando...", color: 'rose', formula: getFormula('shadow') },
        { id: 'vital', title: 'Dirección Vital', icon: Target, content: synthesis?.direccion_vital || "Alineando...", color: 'emerald', formula: getFormula('vital') },
        { id: 'tension', title: 'Tensión Evolutiva', icon: Zap, content: synthesis?.tension_evolutiva || "Alineando...", color: 'indigo', formula: getFormula('tension') },
        { id: 'vinculos', title: 'Alquimia de Vínculos', icon: Heart, content: synthesis?.alquimia_vinculos || "Alineando...", color: 'fuchsia', formula: getFormula('vinculos') },
        { id: 'entorno', title: 'Arquitectura del Entorno', icon: Home, content: synthesis?.arquitectura_entorno || "Alineando...", color: 'cyan', formula: getFormula('entorno') },
        { id: 'manifestacion', title: 'Umbral de Manifestación', icon: Wind, content: synthesis?.umbral_manifestacion || "Alineando...", color: 'amber', formula: getFormula('manifestacion') },
    ];

    const archetype = synthesis?.arquetipo;
    const archColor = archetype ? (colorConfig[archetype.elemento === 'fuego' ? 'rose' : archetype.elemento === 'tierra' ? 'amber' : archetype.elemento === 'aire' ? 'cyan' : 'indigo']) : colorConfig.cyan;


    return (
        <div className="relative w-full max-w-6xl mx-auto px-4 pb-32">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 md:gap-8 pt-8 border-t border-white/5">
                <div className="space-y-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 text-cyan-400 mb-2">
                        <Sparkles size={14} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Bio-Architectural Master Hub</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif italic text-primary tracking-tight">CÓDIGO DE IDENTIDAD</h2>
                </div>

                <button
                    onClick={() => fetchSynthesis(true)}
                    disabled={isRefreshing}
                    className={cn(
                        "group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-500",
                        isRefreshing
                            ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    )}
                >
                    <RefreshCw className={cn("w-3 h-3 text-cyan-400 transition-transform duration-700", isRefreshing && "animate-spin")} />
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/40 group-hover:text-white transition-colors">
                        {isRefreshing ? 'Re-Calculando ADN...' : 'Sincronizar Oráculo'}
                    </span>
                </button>
            </div>

            {/* SINGLE MASTER ARCHETYPE CARD */}
            <div className="flex justify-center mb-16">
                {/* ARCHETYPE CARD (PRIMARY) */}
                <div className="md:col-span-2 lg:col-span-3">
                    <InnerStatCard 
                        label="Arquetipo NAOS" 
                        value={synthesis?.arquetipo?.nombre || 'El Custodio'} 
                        isArchetype={true}
                        archColor={synthesis?.arquetipo?.elemento ? frequencyConfig[synthesis.arquetipo.frecuencia] : undefined}
                        delay={0.1}
                        onClick={() => setIsArchetypeExpanded(!isArchetypeExpanded)}
                        onInfoClick={() => setExplainerType('IDENTITY_ARCHETYPE')}
                    />
                    
                    {/* ACCESO AL CÓDICE & DECODIFICADOR */}
                    <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                        <button 
                            onClick={() => setIsArchetypeExpanded(!isArchetypeExpanded)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] uppercase tracking-[0.3em] font-black transition-all group",
                                isArchetypeExpanded 
                                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                                    : "bg-white/[0.03] border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30"
                            )}
                        >
                            <Sparkles className={cn("w-3 h-3 transition-transform", isArchetypeExpanded && "scale-110")} />
                            {isArchetypeExpanded ? 'Ocultar Ecuación' : 'Decodificar Frecuencia'}
                        </button>

                        <button 
                            onClick={() => setShowArchetypeLibrary(true)}
                            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-[0.3em] font-black text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all group"
                        >
                            <BookOpen className="w-3 h-3 group-hover:scale-110 transition-transform" />
                            Explorar Códice
                        </button>
                    </div>

                    {/* DECODIFICADOR DESPLEGABLE */}
                    <ArchetypeDecodifier 
                        desglose={synthesis?.arquetipo?.desglose} 
                        archColor={synthesis?.arquetipo?.frecuencia ? frequencyConfig[synthesis.arquetipo.frecuencia]?.main : undefined}
                        isOpen={isArchetypeExpanded}
                        onClose={() => setIsArchetypeExpanded(false)}
                    />
                </div>
            </div>


            {/* SYNTHESIS BANNER (Before Accordion) */}
            {archetype && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden glass-panel"
                    style={{ 
                        borderColor: `${archColor.main}33`,
                        boxShadow: `0 0 60px ${archColor.glow}11`
                    }}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Hexagon size={280} style={{ color: archColor.main }} />
                    </div>
                    
                    <div className="relative space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/30 italic">Síntesis Canalizada</span>
                            <div className="h-px w-12" style={{ backgroundColor: archColor.main }} />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-serif italic text-white tracking-tighter">
                                {archetype.nombre}
                            </h1>
                            <p className="text-[11px] uppercase tracking-[0.4em] font-bold" style={{ color: archColor.main }}>
                                {archetype.frecuencia} • {archetype.rol}
                            </p>
                        </div>
                        
                        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent" />
                        
                        <p className="text-xl md:text-2xl text-white/70 font-light italic leading-relaxed max-w-4xl">
                            "{archetype.descripcion}"
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="space-y-4">
                {modules.map((mod, idx) => {
                    const isOpen = openModuleId === mod.id;
                    const Icon = mod.icon;
                    const config = colorConfig[mod.color];
                    const isPlaceHolder = mod.content === "Alineando..." || mod.content?.includes("...");
                    
                    return (
                        <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                "group relative overflow-hidden rounded-[2rem] transition-all duration-700 glass-card",
                                isOpen ? "shadow-2xl scale-[1.02]" : "hover:border-white/20"
                            )}
                            style={{ 
                                borderColor: isOpen ? config.main : undefined,
                                boxShadow: isOpen ? `0 0 40px ${config.bg}` : undefined
                            }}
                        >
                            <button
                                onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                                className="w-full text-left px-8 py-6 flex items-center justify-between group-hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-6">
                                    <motion.div 
                                        animate={isOpen ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : { scale: 1 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="p-3 rounded-xl border transition-all duration-700"
                                        style={{ 
                                            backgroundColor: isOpen ? config.bg : 'rgba(255,255,255,0.02)',
                                            borderColor: isOpen ? config.glow : 'rgba(255,255,255,0.05)',
                                            color: isOpen ? config.main : isPlaceHolder ? 'rgba(255,255,255,0.1)' : config.main + '44'
                                        }}
                                    >
                                        <Icon size={18} />
                                    </motion.div>
                                    <div>
                                        <h3 className={cn(
                                            "text-xl font-serif italic tracking-wide transition-all duration-500",
                                            isOpen ? "text-white" : isPlaceHolder ? "text-white/20" : "text-white/40 group-hover:text-white/80"
                                        )}
                                        style={{ color: isOpen ? '#ffffff' : undefined }}
                                        >
                                            {mod.title}
                                        </h3>
                                        {!isOpen && (
                                            <p className="text-[9px] uppercase tracking-[0.3em] mt-1 line-clamp-1 max-w-xs sm:max-w-md"
                                               style={{ color: isPlaceHolder ? 'rgba(244,63,94,0.3)' : 'rgba(255,255,255,0.15)' }}>
                                                {mod.formula}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ChevronDown className={cn(
                                    "w-4 h-4 text-white/10 transition-transform duration-500",
                                    isOpen && "rotate-180 text-white/60"
                                )} 
                                style={{ color: isOpen ? config.main : undefined }}
                                />
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="px-8 pb-10 pt-2">
                                            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mb-8" />
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-px w-6" style={{ backgroundColor: config.main }} />
                                                        <span className="text-[10px] uppercase tracking-[0.5em] font-black" style={{ color: config.main }}>
                                                            COMPUESTO ALQUÍMICO
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] font-serif italic text-pretty leading-relaxed"
                                                       style={{ color: 'rgba(255,255,255,0.4)' }}
                                                    >
                                                        {mod.formula}
                                                    </p>
                                                    
                                                    <div className="pt-4 flex flex-col gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex gap-1.5">
                                                                {[1, 2, 3].map(i => (
                                                                    <div key={i} className="w-1.5 h-4 rounded-full" 
                                                                         style={{ backgroundColor: i === 1 ? config.main : 'rgba(255,255,255,0.05)' }} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-white/20">
                                                                {!isPlaceHolder ? 'CANALIZADO' : 'PENDIENTE'}
                                                            </span>
                                                        </div>

                                                        {isPlaceHolder && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); fetchSynthesis(true); }}
                                                                disabled={isRefreshing}
                                                                className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-cyan-400 hover:text-white transition-colors animate-pulse"
                                                            >
                                                                <RefreshCw size={10} className={isRefreshing ? "animate-spin" : ""} />
                                                                Re-sincronizar Nodo
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="relative">
                                                    <motion.p 
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={cn(
                                                            "text-xl text-white/80 leading-relaxed font-sans font-extralight italic",
                                                            isPlaceHolder && "text-white/20 blur-[1px]"
                                                        )}
                                                    >
                                                        "{mod.content}"
                                                    </motion.p>
                                                    
                                                    {isPlaceHolder && (
                                                        <div className="mt-8 flex items-center gap-3 px-4 py-2 rounded-full bg-rose-500/5 border border-rose-500/10 w-fit">
                                                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse" />
                                                            <span className="text-[9px] uppercase tracking-[0.4em] font-black text-rose-500/60">SECUENCIA INTERRUMPIDA</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <footer className="mt-24 text-center space-y-4 opacity-10">
                <div className="flex items-center justify-center gap-6">
                    <div className="h-[0.5px] w-16 bg-white" />
                    <Hexagon size={18} />
                    <div className="h-[0.5px] w-16 bg-white" />
                </div>
                <p className="text-[9px] uppercase tracking-[0.8em] font-black text-white">
                    Bio-Architectural Core v2.5 • Synthesis Hub
                </p>
            </footer>

            {/* Arquetipo Library Modal */}
            <AnimatePresence>
                {showArchetypeLibrary && (
                    <ArchetypeLibrary onClose={() => setShowArchetypeLibrary(false)} />
                )}
            </AnimatePresence>

            {/* Explainer Overlay */}
            <AnimatePresence>
                {explainerType && (
                    <OracleExplainer 
                        type={explainerType} 
                        onClose={() => setExplainerType(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- INTERNAL COMPONENTS FOR FORCED INJECTION ---

interface InnerStatCardProps {
    label: string;
    value: any;
    image?: string;
    assetType?: 'nahual' | 'zodiac' | 'chinese' | 'none';
    isNeonNumber?: boolean;
    isArchetype?: boolean;
    archColor?: any;
    color?: 'cyan' | 'fuchsia' | 'amber' | 'emerald' | 'rose';
    delay: number;
    onClick?: () => void;
    onInfoClick?: () => void;
}

const InnerStatCard: React.FC<InnerStatCardProps> = ({ 
    label, value, image, assetType, isNeonNumber, isArchetype, archColor, color, delay, onClick, onInfoClick 
}) => {
    const [imgError, setImgError] = React.useState(false);
    const config = archColor || (color ? colorConfig[color] : colorConfig.cyan);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.8 }}
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-between p-4 rounded-3xl glass-card transition-all duration-700 relative overflow-hidden h-full min-h-[220px]",
                isArchetype ? "border-white/20 mystic-glow" : "border-white/5",
                onClick && "cursor-pointer hover:border-white/20 hover:-translate-y-1"
            )}
            style={{
                borderColor: isArchetype ? `${config.main}44` : undefined,
                boxShadow: isArchetype ? `0 0 30px ${config.glow}11` : undefined
            }}
        >
            <div className="flex items-center gap-1 z-10 shrink-0 mb-1">
                <span className="text-[8px] uppercase tracking-[0.3em] text-white/10">{label}</span>
                {isArchetype && onInfoClick && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onInfoClick(); }}
                        className="p-1 rounded-full text-white/20 hover:text-white hover:scale-110 hover:bg-white/5 transition-all"
                        title="Información"
                    >
                        <Info size={10} />
                    </button>
                )}
            </div>

            <div className="flex-1 w-full relative z-10 flex items-center justify-center p-2">
                {isArchetype ? (
                    <div className="relative w-full aspect-square rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center bg-black/40 group-hover:scale-105 transition-transform duration-700">
                        {/* Render Official Arcano if available */}
                        {(() => {
                            const archInfo = NAOS_ARCHETYPES.find((a: any) => 
                                a.nombre.toLowerCase().trim() === value?.toLowerCase().trim()
                            );
                            if (archInfo?.imagePath) {
                                return (
                                    <div className="absolute inset-0 z-0">
                                        <motion.img 
                                            src={archInfo.imagePath} 
                                            alt={archInfo.nombre}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="w-full h-full object-cover object-center brightness-[1.1] contrast-[1.1]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    </div>
                                );
                            }
                            return (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.05, 1],
                                            opacity: [0.1, 0.2, 0.1]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <Hexagon size={120} style={{ color: config.main }} strokeWidth={1} />
                                    </motion.div>
                                    <Sparkles size={24} className="mb-4 opacity-40 animate-pulse" style={{ color: config.main }} />
                                </div>
                            );
                        })()}
                        
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                            <h3 className="text-2xl font-serif italic text-white tracking-tighter leading-tight mb-1 drop-shadow-lg">
                                {value}
                            </h3>
                            
                            <div className="h-px w-8 bg-gradient-to-r from-transparent via-white/40 to-transparent my-2" />
                            
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black opacity-60 text-white drop-shadow-md">
                                Esencia Primordial
                            </span>
                        </div>
                    </div>
                ) : (isNeonNumber || (image && !imgError)) ? (
                    <div className="relative w-full max-w-[120px] aspect-[3/4] rounded-xl border border-white/10 overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-500 bg-black/80 mx-auto">
                        {isNeonNumber ? (
                            <NeonNumber
                                value={value}
                                color={(color || 'fuchsia') as 'cyan' | 'fuchsia' | 'amber' | 'emerald' | 'rose'}
                                className="absolute inset-0"
                                isFullCard
                            />
                        ) : (
                            <motion.img
                                src={image}
                                alt={label}
                                animate={{ scale: assetType === 'nahual' ? 1.35 : 2.5 }}
                                whileHover={{ scale: assetType === 'nahual' ? 1.45 : 2.6 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                onError={() => setImgError(true)}
                                className="absolute inset-0 w-full h-full object-cover object-center brightness-110"
                                style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                    </div>
                ) : (
                    <span className="text-xl font-thin tracking-widest text-center text-white/80">
                        {value}
                    </span>
                )}
            </div>

            <div className="mt-2 z-10 min-h-[1.2rem] flex items-center justify-center">
                {!isArchetype && (
                    <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-center truncate px-2" style={{ color: isArchetype ? config.main : 'rgba(255,255,255,0.4)' }}>
                        {isNeonNumber ? getNumberText(value) : value}
                    </span>
                )}
            </div>
        </motion.div >
    );
};
