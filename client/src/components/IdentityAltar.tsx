import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { User, Hexagon, Sparkles } from 'lucide-react';
import { DeepIdentityView } from './DeepIdentityView';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';
import { WisdomOverlay } from './WisdomOverlay';
import { getZodiacImage } from '../utils/zodiacMapper';
import { getChineseZodiacImage } from '../utils/chineseMapper';
import { getNahualImage } from '../utils/nahualMapper';
import { NeonNumber } from './NeonNumber';
import { getNumberText } from '../utils/numberMapper';
import { CoherenceCore } from './CoherenceCore';
import { NAOS_ARCHETYPES } from '../constants/archetypeData';

// Data Libraries for Quick Intel
import { NAHUAL_WISDOM } from '../data/nahualData';
import { CHINESE_ZODIAC_WISDOM } from '../data/chineseZodiacData';
import { SIGNS_LIB } from '../data/astrologyLibrary';
import { PINNACLE_INTERPRETATIONS } from '../data/pinnacleData';

interface IdentityAltarProps {
    profile: any;
    onEdit: () => void;
    onNavigate?: (view: any, payload?: any) => void;
}

export const IdentityAltar: React.FC<IdentityAltarProps> = ({ profile, onEdit, onNavigate }) => {
    const [showWisdom, setShowWisdom] = React.useState(false);
    const [quickIntel, setQuickIntel] = React.useState<any>(null);
    const [initialDeepTab, setInitialDeepTab] = React.useState<any>(undefined);

    const getSynthesis = () => {
        if (profile?.naos_identity_code) return profile.naos_identity_code;
        if (profile?.naosIdentityCode) return profile.naosIdentityCode;
        try {
            const cached = localStorage.getItem(`naos_identity_${profile?.id || 'guest'}`);
            return cached ? JSON.parse(cached) : null;
        } catch (e) { return null; }
    };
    
    const synthesis = getSynthesis();

    // 1. Essence Number (Life Path Number)
    const essence = profile?.numerology?.lifePathNumber || "?";

    // 2. Dominant Element / Sun Sign Logic
    const sunSign = profile?.astrology?.planets?.find((p: any) => p.name === 'Sun')?.sign || profile?.zodiac_sign || "Desconocido";

    // 3. Chinese Horoscope
    const animal = profile?.chinese_animal || profile?.astrology?.chineseSign || "Dragón";
    const chineseElement = profile?.chinese_element || "";
    const chineseSign = chineseElement ? `${animal} de ${chineseElement}` : animal;

    // 4. Mayan Energy
    const nahuatl = profile?.nawal_maya?.split(' ')[1] || "?";
    const nahualId = profile?.nawal_maya?.toLowerCase().split(' ')[1]?.replace(/'/g, '') || "";

    const [showDeepView, setShowDeepView] = React.useState(false);
    const [rank, setRank] = React.useState("Iniciado");

    // Dynamic Rank Sync
    React.useEffect(() => {
        const fetchRank = async () => {
            try {
                const headers = await getAsyncAuthHeaders();
                const response = await fetch(`${API_BASE_URL}/api/ranking`, {
                    headers: headers as HeadersInit
                });
                if (response.ok) {
                    const data = await response.json();
                    if (profile?.plan_type === 'admin') {
                        setRank('Arquitecto');
                    } else {
                        setRank(data.personal?.tier || "Iniciado");
                    }
                }
            } catch (err) {
                console.error("Failed to sync rank to altar:", err);
            }
        };
        if (profile?.id) fetchRank();
    }, [profile?.id]);

    const getQuickIntelData = (label: string) => {
        if (label.includes('MAYA')) {
            const data = NAHUAL_WISDOM[nahuatl];
            return {
                title: `Misterio de ${nahuatl}`,
                desc: data?.description || "Energía ancestral de la cuenta larga.",
                color: "emerald",
                manualId: "maya",
                deepTab: "MAYA"
            };
        }
        if (label.includes('NUMÉRICA')) {
            const data = PINNACLE_INTERPRETATIONS[essence];
            return {
                title: `Vibración ${essence}`,
                desc: data?.blocks[0] || "Frecuencia fundamental de tu camino de vida.",
                color: "fuchsia",
                manualId: "numero",
                deepTab: "NUMERO"
            };
        }
        if (label.includes('ASTRAL')) {
            const data = SIGNS_LIB[sunSign];
            return {
                title: `Signo de ${sunSign}`,
                desc: data?.essence || "Tu núcleo radiante y propósito vital.",
                color: "cyan",
                manualId: "astro",
                deepTab: "ASTRO"
            };
        }
        if (label.includes('ORIENTAL')) {
            const data = CHINESE_ZODIAC_WISDOM[animal];
            return {
                title: `Tótem: ${animal}`,
                desc: data?.totem_essence || "Tu instinto y sabiduría ancestral oriental.",
                color: "rose",
                manualId: "oriental",
                deepTab: "ORIENTAL"
            };
        }
        if (label.includes('ARQUETIPO')) {
            const arch = synthesis?.arquetipo;
            return {
                title: arch?.nombre || "El Custodio",
                desc: arch?.descripcion || "Resonando con tu frecuencia original...",
                color: "cyan",
                manualId: "naos",
                deepTab: "NAOS"
            };
        }
        return null;
    };

    const archName = synthesis?.arquetipo?.nombre || "El Custodio";
    const archInfo = NAOS_ARCHETYPES.find(a => a.nombre.toLowerCase().trim() === archName.toLowerCase().trim());
    const arcanoImage = archInfo?.imagePath;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative min-h-[60vh] py-12">
            <WisdomOverlay
                key="wisdom-identity"
                isOpen={showWisdom}
                onClose={() => setShowWisdom(false)}
                title="Código de Identidad"
                description="El mapa de tu arquitectura espiritual. Una síntesis exclusiva que unifica para ti 4 escuelas energéticas (Astrología, Numerología, Maya y Oriental) para revelar tu Arcano de Naos: la frecuencia maestra de tu diseño original."
                accentColor="cyan"
            />

            <AnimatePresence>
                {showDeepView && (
                    <DeepIdentityView
                        profile={profile}
                        onClose={() => setShowDeepView(false)}
                        initialTab={initialDeepTab}
                    />
                )}

                {/* 🌌 QUICK INTEL MODAL */}
                {quickIntel && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={cn(
                                "relative w-full max-w-lg bg-black/80 border border-white/10 rounded-[40px] p-10 overflow-hidden shadow-2xl",
                                `ring-1 ring-${quickIntel.color}-500/20 shadow-${quickIntel.color}-500/5`
                            )}
                        >
                            <div className={cn("absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50", `text-${quickIntel.color}-400`)} />

                            <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black mb-8 block text-center">Quick Intel</h3>

                            <div className="flex flex-col items-center gap-6 text-center">
                                <h2 className="text-3xl font-serif italic text-white/90 drop-shadow-md">
                                    {quickIntel.title}
                                </h2>
                                <p className="text-sm text-white/50 leading-relaxed font-light font-sans max-w-sm">
                                    {quickIntel.desc}
                                </p>

                                <div className="flex gap-4 mt-4">
                                    <button
                                        onClick={() => setQuickIntel(null)}
                                        className="px-6 py-2 rounded-full border border-white/5 text-[9px] uppercase tracking-widest text-white/30 hover:bg-white/5 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setQuickIntel(null);
                                            // Prioritize internal deep linking to Deep View tabs as requested
                                            if (quickIntel.deepTab) {
                                                setInitialDeepTab(quickIntel.deepTab);
                                                setShowDeepView(true);
                                            } else if (onNavigate && quickIntel.manualId) {
                                                onNavigate('MANUALS', { initialManual: quickIntel.manualId });
                                            } else {
                                                setShowDeepView(true);
                                            }
                                        }}
                                        className={cn(
                                            "px-8 py-2 rounded-full text-black font-bold text-[9px] uppercase tracking-widest transition-all",
                                            `bg-${quickIntel.color}-400 hover:scale-105`
                                        )}
                                    >
                                        Explorar Código
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <div className="relative w-full max-w-5xl px-6 flex flex-col items-center gap-16">

                {/* HEADLINE */}
                <div className="text-center space-y-2 relative">
                    <div className="flex items-center justify-center gap-4">
                        <h2 className="text-[28px] font-thin tracking-[0.2em] text-primary uppercase">{profile?.name}</h2>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.4em] text-amber-500/80 font-black">{profile?.nickname || "El Arquitecto"}</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <CoherenceCore />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative group cursor-pointer"
                        onClick={() => setShowDeepView(true)}
                    >
                        <div className="absolute inset-0 bg-cyan-400/10 blur-[100px] rounded-full group-hover:bg-cyan-400/30 transition-all duration-1000" />
                        <div className="absolute -inset-12 border border-cyan-500/20 rounded-full animate-spin-slow pointer-events-none drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] border-t-cyan-300" />
                        <div className="absolute -inset-6 border border-fuchsia-500/10 rounded-full animate-[spin_10s_linear_infinite_reverse] pointer-events-none drop-shadow-[0_0_15px_rgba(217,70,239,0.3)] border-b-fuchsia-400" />

                        <div className="relative w-56 h-56 rounded-full glass-panel flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-cyan-400/40 transition-all duration-700 p-8 text-center group-hover:shadow-cyan-400/20">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-fuchsia-500/10 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

                            <span className="relative z-10 text-2xl font-black tracking-[0.5em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white leading-relaxed drop-shadow-[0_0_20px_rgba(103,232,249,0.8)]">
                                CÓDIGO DE<br />IDENTIDAD
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="w-full max-w-5xl mt-2 sm:mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 w-full items-stretch">
                        {/* 1. Astrología */}
                        <StatCard
                            label="SOL ASTRAL"
                            value={sunSign}
                            delay={0.2}
                            image={getZodiacImage(sunSign)}
                            assetType="zodiac"
                            onClick={() => setQuickIntel(getQuickIntelData("SOL ASTRAL"))}
                        />
                        {/* 2. Numerología */}
                        <StatCard
                            label="ENERGÍA NUMÉRICA"
                            value={essence}
                            delay={0.3}
                            isNeonNumber
                            onClick={() => setQuickIntel(getQuickIntelData("ENERGÍA NUMÉRICA"))}
                        />
                        {/* 3. Arquetipo Naos */}
                        <StatCard
                            label="ARQUETIPO NAOS"
                            value={archName}
                            delay={0.1}
                            image={arcanoImage}
                            assetType="none"
                            highlight
                            isArchetypeCard
                            archColor={profile?.naosIdentityCode?.arquetipo?.elemento}
                            onClick={() => setQuickIntel(getQuickIntelData("ARQUETIPO NAOS"))}
                        />
                        {/* 4. Nawal Maya */}
                        <StatCard
                            label="ENERGÍA MAYA"
                            value={nahuatl}
                            delay={0.4}
                            image={getNahualImage(nahualId)}
                            nahualId={nahualId}
                            assetType="nahual"
                            onClick={() => setQuickIntel(getQuickIntelData("ENERGÍA MAYA"))}
                        />
                        {/* 5. Horóscopo Chino */}
                        <StatCard
                            label="ENERGÍA ORIENTAL"
                            value={chineseSign}
                            delay={0.5}
                            image={getChineseZodiacImage(animal)}
                            assetType="chinese"
                            onClick={() => setQuickIntel(getQuickIntelData("ENERGÍA ORIENTAL"))}
                        />
                    </div>
                </div>

                {/* RANK & ACTIONS */}
                <div className="flex flex-col items-center gap-12 mt-4">
                    <StatCard label="Rango" value={rank} highlight delay={0.6} />

                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={onEdit}
                            className="px-8 py-3 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/20 hover:text-white/80 hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <User className="w-3 h-3" />
                            <span>Re-escribir Perfil</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: any;
    image?: string;
    assetType?: 'nahual' | 'zodiac' | 'chinese' | 'none';
    isNeonNumber?: boolean;
    highlight?: boolean;
    isArchetypeCard?: boolean;
    archColor?: string;
    nahualId?: string;
    delay: number;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
    label, value, image, assetType, isNeonNumber, highlight, isArchetypeCard, archColor, delay, onClick 
}) => {
    const [imgError, setImgError] = React.useState(false);

    const getNeonColor = () => {
        if (label.includes('MAYA')) return 'emerald';
        if (label.includes('ORIENTAL')) return 'rose';
        if (label.includes('ASTRAL')) return 'cyan';
        return 'fuchsia';
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.8 }}
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-between p-2 sm:p-4 rounded-2xl glass-card transition-all duration-700 relative overflow-hidden h-full min-h-[200px] sm:min-h-[280px]",
                highlight && (isArchetypeCard ? "border-cyan-500/30 bg-cyan-500/5 shadow-cyan-500/10" : "border-amber-500/20 bg-amber-500/5 shadow-amber-500/10"),
                highlight && !isArchetypeCard && "min-w-[160px] sm:min-w-[200px]",
                onClick && "cursor-pointer hover:border-white/20 hover:-translate-y-1"
            )}
            style={isArchetypeCard ? {
                borderColor: archColor === 'fuego' ? 'rgba(244, 63, 94, 0.4)' : archColor === 'tierra' ? 'rgba(245, 158, 11, 0.4)' : archColor === 'aire' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(99, 102, 241, 0.4)',
                boxShadow: `0 0 30px ${archColor === 'fuego' ? 'rgba(244, 63, 94, 0.1)' : archColor === 'tierra' ? 'rgba(245, 158, 11, 0.1)' : archColor === 'aire' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(99, 102, 241, 0.1)'}`
            } : undefined}
        >
            {image && !imgError && (
                <img
                    src={image}
                    alt={label}
                    onError={() => setImgError(true)}
                    className="absolute inset-0 w-full h-full object-cover opacity-[0.02] blur-md pointer-events-none"
                />
            )}
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/10 mb-0 z-10 shrink-0">{label}</span>

            <div className="flex-1 w-full relative z-10">
                {(isNeonNumber || (image && !imgError)) ? (
                    <div className="relative w-full max-w-[120px] sm:max-w-[160px] aspect-[3/4] rounded-lg border border-white/10 overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-500 bg-black/80 mx-auto">
                        {isNeonNumber ? (
                            <NeonNumber
                                value={value}
                                color={getNeonColor()}
                                className="absolute inset-0"
                                isFullCard
                            />
                        ) : (() => {
                            if (assetType === 'nahual' || assetType === 'chinese') {
                                return (
                                    <motion.img
                                        src={image}
                                        alt={label}
                                        initial={false}
                                        animate={{ scale: 1.35 }}
                                        whileHover={{ scale: 1.45 }}
                                        transition={{ duration: 0.7, ease: "easeOut" }}
                                        onError={() => setImgError(true)}
                                        className="absolute inset-0 w-full h-full object-cover object-center brightness-110"
                                        style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
                                    />
                                );
                            } else {
                                // For Zodiac and others
                                return (
                                    <motion.img
                                        src={image}
                                        alt={label}
                                        initial={false}
                                        animate={{ scale: 2.5 }}
                                        whileHover={{ scale: 2.6 }}
                                        transition={{ duration: 0.7, ease: "easeOut" }}
                                        onError={() => setImgError(true)}
                                        className="absolute inset-0 w-full h-full object-cover object-center brightness-110"
                                        style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
                                    />
                                );
                            }
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                        <div className="absolute inset-0 border border-white/5 rounded-lg pointer-events-none" />
                    </div>
                ) : isArchetypeCard ? (
                    <div className="relative w-full max-w-[120px] sm:max-w-[160px] aspect-[3/4] rounded-lg border border-white/10 overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-500 bg-black/80 mx-auto">
                        {image && !imgError ? (
                            <motion.img
                                src={image}
                                alt={label}
                                initial={false}
                                animate={{ scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                onError={() => setImgError(true)}
                                className="absolute inset-0 w-full h-full object-cover object-center brightness-110 contrast-110"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    className="opacity-10 mb-4"
                                >
                                    <Hexagon size={64} style={{ color: archColor === 'fuego' ? '#f43f5e' : archColor === 'tierra' ? '#f59e0b' : archColor === 'aire' ? '#06b6d4' : '#6366f1' }} />
                                </motion.div>
                                <span className="text-lg sm:text-xl font-thin tracking-widest text-white/90 leading-tight">
                                    {value}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                        
                        {/* Overlay Text for Archetype */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center z-10">
                            {image && !imgError && (
                                <h3 className="text-sm sm:text-base font-serif italic text-white tracking-tighter leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                    {value}
                                </h3>
                            )}
                        </div>

                        <div className="absolute bottom-2 left-0 right-0 p-2 flex items-center justify-center z-20">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 uppercase tracking-[0.3em] text-[7px] font-black text-white/40">
                                <Sparkles size={8} />
                                Master Code
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-4">
                        <span className={cn(
                            "text-xl sm:text-2xl font-thin tracking-widest text-center",
                            highlight ? "text-amber-100 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "text-white/80"
                        )}>
                            {value}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-0 z-10 min-h-[1.2rem] flex items-center justify-center">
                {image && !imgError && !isNeonNumber && (
                    <span className="text-[9px] sm:text-[10px] font-light text-white/30 tracking-[0.1em] uppercase text-center line-clamp-1 px-1">
                        {value}
                    </span>
                )}
                {isNeonNumber && (
                    <span className="text-[9px] sm:text-[10px] font-light text-white/30 tracking-[0.1em] uppercase text-center">
                        {getNumberText(value)}
                    </span>
                )}
                {highlight && !image && !isNeonNumber && (
                    <span className="text-[9px] text-amber-500/60 uppercase tracking-widest font-bold">Rango Actual</span>
                )}
            </div>
        </motion.div >
    );
};
