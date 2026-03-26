import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flower2, Users, ArrowLeft, Eye, History, X, Calendar, ChevronDown, Info } from 'lucide-react';
import { OracleExplainer } from '../components/OracleExplainer';
import { OracleOnboarding } from '../components/OracleOnboarding';
const Spline = React.lazy(() => import('@splinetool/react-spline'));
 // Added History, X, ChevronDown, Calendar
import { Tarot } from './Tarot';
import { SynastryModule } from '../components/SynastryModule';
import { useCoherence } from '../hooks/useCoherence';
import { cn } from '../lib/utils';
import { LowEnergyWarningModal } from '../components/LowEnergyWarningModal';
import { useSound } from '../hooks/useSound';
import { useTranslation } from '../i18n';

// Local Error Boundary for Spline to avoid "Fractured Reality" on 3D load failure
class SplineErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: any) { console.error("Spline Error caught:", error); }
    render() {
        if (this.state.hasError) return <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/10 to-black/40 animate-pulse" />;
        return this.props.children;
    }
}

interface OracleSoulsViewProps {
    onBack: () => void;
    onNavigate: (view: any) => void;
}

type Tab = 'TAROT' | 'SOULS';

export const OracleSoulsView: React.FC<OracleSoulsViewProps> = ({ onBack, onNavigate }) => {
    const { t, language } = useTranslation();
    const { score } = useCoherence();
    const [activeTab, setActiveTab] = useState<Tab | null>(null);
    const [step, setStep] = useState<'LOBBY' | 'INTENTION' | 'ACTIVE'>('LOBBY');
    const [intention, setIntention] = useState('');
    const [pendingTab, setPendingTab] = useState<Tab | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const [hasProceeded, setHasProceeded] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [historyRecords, setHistoryRecords] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
    const [explainerType, setExplainerType] = useState<'TAROT' | 'SOULS' | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { playSound } = useSound();

    const handleSelectPillar = (tab: Tab) => {
        playSound('click');
        setPendingTab(tab);
        if (score < 40 && !hasProceeded) {
            setShowWarning(true);
        } else {
            if (tab === 'SOULS') {
                setActiveTab(tab);
                setStep('ACTIVE');
            } else {
                setStep('INTENTION');
            }
        }
    };

    const handleProceed = () => {
        playSound('success');
        setHasProceeded(true);
        setShowWarning(false);
        if (pendingTab === 'SOULS') {
            setActiveTab(pendingTab);
            setStep('ACTIVE');
        } else {
            setStep('INTENTION');
        }
    };

    const handleStartRitual = () => {
        if (!intention.trim()) return;
        playSound('success');
        setActiveTab(pendingTab);
        setStep('ACTIVE');
    };

    const handleElevate = () => {
        onNavigate('SANCTUARY');
    };

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const { endpoints, getAsyncAuthHeaders } = await import('../lib/api');
            const headers = await getAsyncAuthHeaders();
            const response = await fetch(`${endpoints.tarot}/history`, { headers: headers as HeadersInit });
            if (response.ok) {
                const data = await response.json();
                setHistoryRecords(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const toggleHistory = () => {
        if (!showHistory) {
            fetchHistory();
        }
        setShowHistory(!showHistory);
        playSound('click');
    };

    const tabs = [
        {
            id: 'TAROT',
            label: language === 'en' ? 'Individual Reading' : 'Consulta Individual',
            subtitle: language === 'en' ? 'Consult the Arcana or your Archetype to guide your own path.' : 'Consulta los Arcanos o tu Arquetipo para guiar tu propio camino.',
            icon: Flower2,
            color: 'text-rose-400',
            gradient: "from-rose-500/20 to-orange-500/10",
            border: "border-rose-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]",
            scene: "https://prod.spline.design/kZSsq6RJS9Yk4zJS/scene.splinecode"
        },
        {
            id: 'SOULS',
            label: language === 'en' ? 'Link Dynamics' : 'Dinámicas de Vínculos',
            subtitle: language === 'en' ? 'Analyze the synergy, clashes and purposes between you and another soul.' : 'Analiza la sinergia, choques y propósitos entre tú y otra alma.',
            icon: Users,
            color: 'text-purple-400',
            gradient: "from-purple-500/20 to-indigo-500/10",
            border: "border-purple-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]",
            scene: "https://prod.spline.design/kZSsq6RJS9Yk4zJS/scene.splinecode"
        },
    ];

    React.useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_oracle_onboarding');
        if (!hasSeen) {
            setShowOnboarding(true);
        }
    }, []);

    return (
        <div className="w-full min-h-screen relative overflow-hidden">
            <AnimatePresence mode="wait">
                {step === 'LOBBY' && (
                    <motion.div
                        key="lobby"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
                    >
                        {/* 3D ATMOSPHERIC BACKGROUND */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                            <SplineErrorBoundary>
                                <Suspense fallback={<div className="w-full h-full bg-black/20 animate-pulse" />}>
                                    <Spline 
                                        scene="https://prod.spline.design/ATZ-SSTV-rM6Z27Z/scene.splinecode" 
                                    />
                                </Suspense>
                            </SplineErrorBoundary>
                        </div>
                        
                        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
                        
                        <motion.button
                            onClick={() => { playSound('click'); onBack(); }}
                            className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-secondary hover:text-primary transition-colors group z-50"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('back_temple')}</span>
                        </motion.button>

                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-4xl md:text-5xl font-serif italic text-primary tracking-wide">
                                {language === 'en' ? "The Temple Threshold" : "El Umbral del Templo"}
                            </h2>
                            <div className="h-px w-32 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent mx-auto" />
                            <p className="text-[11px] uppercase tracking-[0.6em] text-secondary font-black">{language === 'en' ? "Welcome to the Oracular Nexus" : "Bienvenido al Nexo Oracular"}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl z-10">
                            {tabs.map((tab, i) => (
                                <motion.div
                                    key={tab.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.2, duration: 0.8 }}
                                    onClick={() => handleSelectPillar(tab.id as Tab)}
                                    className={cn(
                                        "relative group cursor-pointer p-12 rounded-[3.5rem] transition-all duration-700 overflow-hidden glass-panel shadow-2xl",
                                        "hover:scale-[1.03] hover:border-white/20"
                                    )}
                                >
                                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", tab.gradient)} />
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); playSound('click'); setExplainerType(tab.id as any); }}
                                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:scale-110 hover:bg-white/10 transition-all z-20 group/info"
                                    >
                                        <Info size={16} className="group-hover/info:rotate-12 transition-transform" />
                                    </button>

                                    <div className="relative z-10 flex flex-col items-center text-center space-y-8 h-full justify-center">
                                        <div className="relative w-full h-48 flex items-center justify-center">
                                            <div className="absolute inset-0 z-0 scale-150 opacity-80 pointer-events-none">
                                                <SplineErrorBoundary>
                                                    <Suspense fallback={<div className="w-full h-full bg-white/5 rounded-full animate-pulse" />}>
                                                        {/* @ts-ignore */}
                                                        <Spline scene={tab.scene} />
                                                    </Suspense>
                                                </SplineErrorBoundary>
                                            </div>
                                            <div className="relative z-10 p-5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 group-hover:border-white/30 transition-all duration-500">
                                                <tab.icon size={40} className={cn("transition-colors", tab.color)} />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-2xl font-bold tracking-[0.15em] text-primary uppercase">
                                                {tab.label}
                                            </h3>
                                            <p className="text-[13px] text-secondary uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                                                {tab.subtitle}
                                            </p>
                                        </div>

                                        <div className="pt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                                            <span className="text-[11px] uppercase tracking-[0.4em] font-black text-rose-400">{language === 'en' ? "Transcend" : "Trascender"}</span>
                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* History Trigger */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            onClick={toggleHistory}
                            className="mt-16 flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all group"
                        >
                            <History size={16} className="group-hover:rotate-[-45deg] transition-transform duration-700" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black">
                                {language === 'en' ? "My Akashic Record" : "Mi Registro Akáshico"}
                            </span>
                        </motion.button>
                    </motion.div>
                )}

                {step === 'INTENTION' && (
                    <motion.div
                        key="intention"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center"
                    >
                         <button
                            onClick={() => { playSound('click'); setStep('LOBBY'); }}
                            className="absolute top-12 left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                                {language === 'en' ? "Back to Threshold" : "Regresar al Umbral"}
                            </span>
                        </button>

                        <div className="space-y-12 w-full max-w-xl">
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-5xl font-serif italic text-white/90 tracking-wide">
                                    {language === 'en' ? "What does your soul seek today?" : "¿Qué busca tu alma hoy?"}
                                </h1>
                                <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent mx-auto" />
                                <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">
                                    {pendingTab === 'TAROT' 
                                        ? (language === 'en' ? 'Individual Reading' : 'Consulta Individual') 
                                        : (language === 'en' ? 'Link Dynamics' : 'Dinámicas de Vínculos')}
                                </p>
                            </div>

                            <div className="relative group">
                                <input
                                    type="text"
                                    value={intention}
                                    onChange={(e) => setIntention(e.target.value)}
                                    placeholder={language === 'en' ? "Manifest your intention..." : "Manifiesta tu intención..."}
                                    className="w-full bg-transparent border-b border-white/10 px-4 py-8 text-2xl md:text-3xl text-center text-white placeholder:text-white/5 focus:outline-none focus:border-rose-500/40 transition-all font-serif italic"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleStartRitual()}
                                />
                                <motion.div 
                                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-rose-500/0 via-rose-500/40 to-rose-500/0"
                                    initial={{ width: 0, left: "50%" }}
                                    whileFocus={{ width: "100%", left: "0%" }}
                                />
                            </div>

                            <button
                                onClick={handleStartRitual}
                                disabled={!intention.trim()}
                                className={cn(
                                    "px-14 py-4 rounded-full border transition-all duration-700 uppercase tracking-[0.4em] text-[11px] font-black",
                                    intention.trim() 
                                        ? "text-white border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40 shadow-xl" 
                                        : "text-white/10 border-white/5 opacity-50 cursor-not-allowed"
                                )}
                            >
                                {language === 'en' ? "Start Tuning" : "Iniciar Sintonización"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 'ACTIVE' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full pt-20 pb-32"
                    >
                        {/* Header / Nav */}
                        <div className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-white/10 pt-[env(safe-area-inset-top)]">
                            <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <button onClick={() => { playSound('click'); setStep('LOBBY'); setActiveTab(null); }} className="p-2 text-white/50 hover:text-white transition-colors">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h1 className="text-xl font-serif text-white italic flex items-center gap-2">
                                            <Eye size={16} className="text-rose-400" />
                                            {language === 'en' ? "Oracle & Bonds" : "Oráculo & Vínculos"}
                                        </h1>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40">
                                            {language === 'en' ? "Mystical & Relational Exploration" : "Exploración Mística & Relacional"}
                                        </p>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                    {tabs.map((tab) => {
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    playSound('click');
                                                    setActiveTab(tab.id as Tab);
                                                }}
                                                className={cn(
                                                    "relative px-4 py-2 rounded-full flex items-center gap-2 transition-all whitespace-nowrap",
                                                    isActive ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                                )}
                                            >
                                                <tab.icon size={14} className={isActive ? tab.color : ""} />
                                                <span className="text-xs uppercase tracking-wider font-medium">
                                                    {tab.id === 'TAROT' 
                                                        ? (language === 'en' ? 'Oracle' : 'Oráculo') 
                                                        : (language === 'en' ? 'Bonds' : 'Vínculos')}
                                                </span>

                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeTabOracle"
                                                        className={cn("absolute inset-0 rounded-full border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]", "bg-gradient-to-r from-transparent via-white/5 to-transparent")}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Content Content */}
                        <div className="max-w-5xl mx-auto px-4 mt-16 md:mt-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeTab === 'TAROT' && (
                                        <div className="bg-black/20 rounded-3xl border border-white/5 p-1 md:p-4">
                                            <Tarot 
                                                onBack={() => { playSound('click'); setStep('LOBBY'); setActiveTab(null); }} 
                                                initialIntent={intention}
                                                embedded 
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'SOULS' && (
                                        <div className="bg-black/20 rounded-3xl border border-white/5 p-2 sm:p-4 md:p-8">
                                             <SynastryModule onSwitchToTarot={() => { playSound('click'); setStep('LOBBY'); setActiveTab(null); }} />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Akáshic Record Modal */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                             className="fixed top-0 right-0 bottom-0 w-full max-w-md glass-panel border-l border-white/10 z-[101] flex flex-col shadow-2xl rounded-l-[3rem] md:rounded-none"
                        >
                            <div className="p-8 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                        <History size={20} className="text-rose-400" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-serif text-primary italic">
                                            {language === 'en' ? "Akashic Record" : "Registro Akáshico"}
                                        </h3>
                                        <p className="text-secondary text-label leading-normal">
                                            {language === 'en' 
                                                ? "Access the memory of your past rituals and observe the evolution of your destiny thread." 
                                                : "Accede a la memoria de tus rituales pasados y observa la evolución de tu hilo del destino."}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 text-white/20 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {isLoadingHistory ? (
                                    <div className="flex flex-col items-center justify-center h-40 space-y-4">
                                        <div className="w-6 h-6 border-t-2 border-rose-500 rounded-full animate-spin" />
                                        <p className="text-[10px] uppercase tracking-widest text-white/20 italic">
                                            {language === 'en' ? "Accessing record..." : "Accediendo al registro..."}
                                        </p>
                                    </div>
                                ) : historyRecords.length === 0 ? (
                                    <div className="text-center py-20 space-y-4">
                                        <p className="text-[11px] uppercase tracking-widest text-white/20">
                                            {language === 'en' ? "No traces in the ether yet." : "Aún no hay huellas en el éte."}
                                        </p>
                                    </div>
                                ) : (
                                    historyRecords.map((record) => (
                                        <motion.div
                                            key={record.id}
                                            layout
                                            className="group bg-white/[0.02] border border-white/5 rounded-3xl p-6 transition-all hover:bg-white/[0.04] hover:border-white/10"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                                    <Calendar size={10} className="text-rose-400/60" />
                                                    <span className="text-[9px] uppercase tracking-tighter text-white/60">
                                                        {new Date(record.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] uppercase tracking-widest text-red-500/40 font-bold">
                                                    {record.engine}
                                                </span>
                                            </div>

                                            <h4 className="text-lg font-serif italic text-amber-50/80 mb-4 px-2">
                                                "{record.intention}"
                                            </h4>

                                            <button
                                                onClick={() => {
                                                    playSound('click');
                                                    setExpandedRecord(expandedRecord === record.id ? null : record.id);
                                                }}
                                                className="w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-black/40 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-all group/btn"
                                            >
                                                <span>{language === 'en' ? "View Interpretation" : "Ver Interpretación"}</span>
                                                <ChevronDown 
                                                    size={14} 
                                                    className={cn("transition-transform duration-500", expandedRecord === record.id && "rotate-180")} 
                                                />
                                            </button>

                                            <AnimatePresence>
                                                {expandedRecord === record.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-4 p-4 border-t border-white/5 space-y-4">
                                                            <div className="flex gap-2 flex-wrap mb-4">
                                                                {record.cards.map((c: any, ci: number) => (
                                                                    <span key={ci} className="text-[10px] text-rose-300/60 bg-rose-500/5 px-2 py-1 rounded-md border border-rose-500/10">
                                                                        {c.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-[13px] leading-relaxed text-white/60 italic">
                                                                {record.summary}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 border-t border-white/5 text-center">
                                <p className="text-[9px] uppercase tracking-[0.4em] text-white/10 italic">
                                    {language === 'en' ? "Only the last 3 memories are kept." : "Solo se conservan las últimas 3 memorias."}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Warning Modal */}
            <LowEnergyWarningModal
                isOpen={showWarning}
                currentCoherence={score}
                onElevate={handleElevate}
                onProceed={handleProceed}
                onCancel={() => setShowWarning(false)}
            />

            {/* Oracle Explainer Overlay */}
            <AnimatePresence>
                {explainerType && (
                    <OracleExplainer 
                        type={explainerType} 
                        onClose={() => setExplainerType(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Oracle Onboarding Wizard */}
            <OracleOnboarding 
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
            />
        </div>
    );
};
