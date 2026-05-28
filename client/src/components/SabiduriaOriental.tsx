import React, { useState } from 'react';
import { Scroll, Sparkles, Users, Heart, Coins, ChevronDown, Lock, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { useSubscription } from '../hooks/useSubscription';
import { CHINESE_ZODIAC_WISDOM } from '../data/chineseZodiacData';
import { CHINESE_ZODIAC_WISDOM_EN } from '../data/chineseZodiacData_en';
import { getChineseZodiacImage } from '../utils/chineseMapper';
import { cn } from '../lib/utils';
import { useTranslation } from '../i18n';
import { calculateChineseZodiac } from '../utils/chineseMapper';
import { getAsyncAuthHeaders, API_BASE_URL } from '../lib/api';

interface SabiduriaOrientalProps {
    overrideProfile?: any;
}

// 🏮 CHINESE ANIMAL IMAGE COMPONENT
const ChineseAnimalImage = ({ animal, className }: { animal: string, className?: string }) => {
    const [imgError, setImgError] = React.useState(false);
    if (!animal) return null;

    if (imgError) {
        return <span className={cn("text-7xl drop-shadow-[0_0_20px_rgba(255,215,0,0.2)]", className)}>{getAnimalEmoji(animal)}</span>;
    }

    return (
        <img
            src={getChineseZodiacImage(animal)}
            alt={animal}
            onError={() => setImgError(true)}
            className={cn("drop-shadow-[0_0_25px_rgba(225,29,72,0.6)] brightness-125 filter", className)}
        />
    );
};
// @ts-ignore
export const SabiduriaOriental: React.FC<SabiduriaOrientalProps> = ({ overrideProfile }) => {
    const { profile: hookProfile, loading } = useProfile();
    // Logic: Use passed profile (override) OR hook profile
    const profile = overrideProfile || hookProfile;
    const { t, language } = useTranslation();
    const CHINESE_LIB = language === 'en' ? CHINESE_ZODIAC_WISDOM_EN : CHINESE_ZODIAC_WISDOM;

    // HOOKS FIRST:
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);

    const { status: subscription } = useSubscription(!overrideProfile);
    const isPremium = overrideProfile
        ? true
        : (profile?.plan_type === 'premium' || profile?.plan_type === 'premium_plus' || profile?.plan_type === 'admin') ||
        (typeof subscription === 'object' && (subscription?.plan === 'PREMIUM' || subscription?.plan === 'EXTENDED')) ||
        (typeof subscription === 'string' && (subscription === 'PREMIUM' || subscription === 'EXTENDED'));

    const [showDeepInsight, setShowDeepInsight] = useState<boolean>(false);
    const [aiInterpretations, setAiInterpretations] = useState<Record<string, string>>({});
    const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

    const fetchAiInterpretation = async (animalName: string) => {
        if (aiInterpretations[animalName]) return;

        setAiLoading(prev => ({ ...prev, [animalName]: true }));
        try {
            const authHeaders = await getAsyncAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/energy-code/interpret`, {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json'
                } as HeadersInit,
                body: JSON.stringify({
                    school: 'ORIENTAL',
                    animal: animalName,
                    language: language
                })
            });

            if (!res.ok) throw new Error("Fallo al obtener la sintonía.");
            const data = await res.json();
            setAiInterpretations(prev => ({ ...prev, [animalName]: data.interpretation }));
        } catch (err) {
            console.error("🔥 Error fetching AI interpretation:", err);
            setAiInterpretations(prev => ({ 
                ...prev, 
                [animalName]: language === 'en' 
                    ? "⚠️ Failed to sintonize with the oracle. Reopen to retry." 
                    : "⚠️ No se pudo establecer sintonía con el oráculo. Cierra y vuelve a abrir." 
            }));
        } finally {
            setAiLoading(prev => ({ ...prev, [animalName]: false }));
        }
    };

    const renderFormattedContent = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n');
        return (
            <div className="space-y-4 font-serif leading-relaxed text-sm text-white/70">
                {lines.map((line, i) => {
                    const trimmed = line.trim();
                    if (trimmed === '⸻' || trimmed === '---' || trimmed.startsWith('⸻')) {
                        return <div key={i} className="my-8 h-px w-full bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />;
                    }
                    
                    // Match headers with or without emojis
                    const isHeader = trimmed.match(/^(🧠|🗣️|📚|🧩|👨‍👩‍👧|🌍|🧭|⚡|🌑|🔥|🧬|🔍|🎭|💼|👁️|🌊|🤝|🏮|🐅|❤️|📈)/) || 
                                     (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.substring(2, trimmed.length-2).includes('**') && trimmed.length < 50);

                    if (isHeader) {
                        const cleanHeader = trimmed.replace(/^(🧠|🗣️|📚|🧩|👨‍👩‍👧|🌍|🧭|⚡|🌑|🔥|🧬|🔍|🎭|💼|👁️|🌊|🤝|🏮|🐅|❤️|📈)/, '').replace(/\*\*/g, '').trim();
                        return (
                            <div key={i} className="flex items-center gap-3 mt-8 mb-4">
                                <span className="text-[10px] uppercase tracking-[0.4em] text-rose-400 font-bold">{cleanHeader}</span>
                                <div className="flex-1 h-px bg-rose-500/20" />
                            </div>
                        );
                    }
                    
                    if (trimmed.includes('**')) {
                        const parts = trimmed.split('**');
                        return (
                            <p key={i} className="text-justify leading-relaxed">
                                {parts.map((part, index) => 
                                    index % 2 === 1 ? <strong key={index} className="text-white/90 font-bold">{part}</strong> : part
                                )}
                            </p>
                        );
                    }
                    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                        const content = trimmed.substring(2);
                        if (content.includes('**')) {
                            const parts = content.split('**');
                            return (
                                <li key={i} className="ml-4 list-none relative text-white/70 text-sm text-justify pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-rose-500/40 before:rounded-full">
                                    {parts.map((part, index) => 
                                        index % 2 === 1 ? <strong key={index} className="text-white/90 font-bold">{part}</strong> : part
                                    )}
                                </li>
                            );
                        }
                        return (
                            <li key={i} className="ml-4 list-none relative text-white/70 text-sm text-justify pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-rose-500/40 before:rounded-full">
                                {content}
                            </li>
                        );
                    }
                    if (trimmed === '') {
                        return <div key={i} className="h-2" />;
                    }
                    return <p key={i} className="text-justify leading-relaxed">{trimmed}</p>;
                })}
            </div>
        );
    };

    // Calculate locally if we have birthDate
    const chineseData = profile?.birthDate ? calculateChineseZodiac(profile.birthDate, language) : null;
    const animalData = chineseData?.animal ? CHINESE_LIB[chineseData.animal] : null;

    // --- PARSE COMPATIBILITY ---
    const parseCompatibility = (compString?: string) => {
        if (!compString) return { allies: [], enemies: [] };
        // Example: "Mejor con: Dragón, Mono, Buey. / Evitar: Caballo."
        const parts = compString.split('/');
        
        const alliesStr = parts.find(p => p.toLowerCase().includes('mejor') || p.toLowerCase().includes('best')) || '';
        const enemiesStr = parts.find(p => p.toLowerCase().includes('evitar') || p.toLowerCase().includes('avoid')) || '';

        const extractAnimals = (str: string) => {
            return str
                .replace(/Mejor con:/i, '')
                .replace(/Best with:/i, '')
                .replace(/Evitar:/i, '')
                .replace(/Avoid:/i, '')
                .replace(/\./g, '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
        };

        return {
            allies: extractAnimals(alliesStr),
            enemies: extractAnimals(enemiesStr)
        };
    };

    const { allies, enemies } = parseCompatibility(animalData?.compatibility);

    const elementDescription = chineseData?.element ? getElementWisdom(chineseData.element, language) : '';

    // --- DEBUG (can be removed later) ---
    React.useEffect(() => {
        if (chineseData) {
            console.log("🏮 SabiduriaOriental: Cálculo local completado");
            console.log("   📅 Birth Date:", profile?.birthDate);
            console.log("   🐉 Animal:", chineseData.animal);
            console.log("   🔥 Elemento:", chineseData.element);
            console.log("   📆 Año Chino:", chineseData.birthYear);
        }
    }, [chineseData, profile?.birthDate]);

    // Validación flexible (MOVED AFTER HOOKS/LOGIC)
    if (!profile || !profile.birthDate) {
        if (loading && !overrideProfile) return <div className="p-8 text-center text-white/50">{t('calculating')}</div>;
        return <div className="p-8 text-center text-white/50">{t('incomplete_essence')}</div>;
    }


    const sections = [
        { 
            id: 'elemento', 
            title: t('element_nature'), 
            icon: Sparkles, 
            content: `"${elementDescription}"` 
        },
        { 
            id: 'horizonte', 
            title: t('horizon_2026'), 
            icon: Sparkles, 
            content: animalData?.forecast_2026_title ? `${animalData.forecast_2026_title}. ${animalData.forecast_general}` : t('year_of_horse_desc')
        },
        { 
            id: 'alianzas', 
            title: t('alliance_dynamics'), 
            icon: Users, 
            content: (
                <div className="space-y-3 pt-2">
                    <div>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 block mb-2">{t('best_with')}</span>
                        <div className="flex flex-wrap gap-2">
                            {allies.map(ally => (
                                <div key={ally} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2 shrink-0" title={ally}>
                                    <span className="text-sm grayscale opacity-70">{getAnimalEmoji(ally, language)}</span> {ally}
                                </div>
                            ))}
                        </div>
                    </div>
                    {enemies.length > 0 && (
                        <div className="pt-4 border-t border-white/5">
                            <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 block mb-2">{t('avoid')}</span>
                            <div className="flex flex-wrap gap-2">
                                {enemies.map(en => (
                                    <div key={en} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 flex items-center gap-2 shrink-0" title={en}>
                                        <span className="text-sm grayscale opacity-70">{getAnimalEmoji(en, language)}</span> {en}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        { 
            id: 'esencia', 
            title: t('totem_essence'), 
            icon: Scroll, 
            content: `"${animalData?.totem_essence}"` 
        },
        { 
            id: 'sombra', 
            title: t('conscious_shadow'), 
            icon: Scroll, 
            content: animalData?.totem_shadow 
        },
        { 
            id: 'amor', 
            title: t('love_bonds'), 
            icon: Heart, 
            content: animalData?.forecast_love 
        },
        { 
            id: 'abundancia', 
            title: t('abundance_flow'), 
            icon: Coins, 
            content: animalData?.forecast_wealth 
        }
    ];

    if (!profile?.birthDate) {
        return (
            <div className="w-full max-w-2xl mx-auto p-12 rounded-[3rem] bg-white/[0.02] border border-rose-900/20 backdrop-blur-xl relative overflow-hidden text-center space-y-8">
                <div className="w-24 h-24 mx-auto rounded-full border border-rose-900/20 flex items-center justify-center bg-rose-900/5 relative">
                    <Scroll className="w-10 h-10 text-rose-500/40" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-[11px] uppercase tracking-[0.5em] text-rose-500/60 font-bold">{t('oriental_wisdom')}</h2>
                    <h3 className="text-2xl text-amber-50/40 font-serif italic">{t('void_is_form')}</h3>
                    <p className="text-white/30 italic font-serif">
                        "{t('brush_not_touched')}"
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-8 md:p-12 rounded-[3rem] bg-gradient-to-br from-rose-950/20 to-black/40 border border-rose-900/20 backdrop-blur-2xl relative overflow-hidden group">
            {/* Watermark Scroll */}
            <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Scroll className="w-24 h-24 text-rose-500" />
            </div>

            <div className="relative z-10 space-y-12">
                {/* Header */}
                <div className="flex items-center gap-6">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <Scroll className="w-6 h-6 text-cyan-400/60" />
                    </div>
                    <div>
                        <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-cyan-500" />
                            {t('oriental_wisdom')}
                        </h2>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mt-1">{t('imperial_zodiac_bazi')}</p>
                    </div>
                </div>

                {/* Main Identity */}
                <div className="flex flex-col md:flex-row items-center gap-12 py-10 border-b border-white/5">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative group/animal"
                    >
                        <div className="w-48 aspect-[2/3] rounded-[2rem] bg-black/40 border border-rose-500/20 flex items-center justify-center relative z-10 overflow-hidden backdrop-blur-3xl shadow-2xl group-hover/animal:border-rose-500/40 transition-all duration-700">
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0 group-hover/animal:opacity-100 transition-opacity" />
                            <ChineseAnimalImage
                                animal={chineseData?.animal || ''}
                                className="w-full h-full object-cover object-center scale-[1.35] transition-transform group-hover/animal:scale-[1.45] duration-700"
                            />
                            {/* Dark Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                        </div>
                        <div className="absolute -inset-4 bg-rose-500/5 blur-[40px] rounded-full opacity-0 group-hover/animal:opacity-100 transition-opacity" />
                    </motion.div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">{t('animal_archetype')}</p>
                            <h3 className="text-4xl md:text-5xl font-thin text-white tracking-widest uppercase">
                                {chineseData?.animal || '...'} <span className="text-cyan-400/40">/ {chineseData?.element || '...'}</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* INTERPRETACIÓN PROFUNDA (PREMIUM FEATURE) */}
                <div
                    className="w-full mt-10 p-5 bg-gradient-to-br from-rose-950/60 to-slate-950/80 rounded-[2rem] border border-rose-500/20 shadow-lg cursor-pointer hover:border-rose-400 transition-all active:scale-[0.98] text-left"
                    onClick={(e) => {
                        e.stopPropagation();
                        const isOpening = !showDeepInsight;
                        setShowDeepInsight(isOpening);
                        if (isOpening && isPremium && chineseData?.animal) {
                            fetchAiInterpretation(chineseData.animal);
                        }
                    }}
                >
                    <div className="flex items-center gap-2 text-amber-400 mb-1">
                        <Zap className={`w-4 h-4 ${isPremium ? 'animate-pulse' : 'text-gray-500'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">{t('deep_interpretation')}</span>
                        {isPremium && (
                            <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-500 ${showDeepInsight ? 'rotate-90' : ''}`} />
                        )}
                    </div>
                    <p className="text-[9px] text-white/40 font-medium">
                        {isPremium ? (chineseData?.animal && aiLoading[chineseData.animal] ? t('sintonizando_eter') : t('deep_interpretation_tap')) : t('deep_interpretation_lock')}
                    </p>

                    <AnimatePresence>
                        {showDeepInsight && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-rose-500/30 overflow-hidden"
                            >
                                {isPremium ? (
                                    chineseData?.animal && aiLoading[chineseData.animal] ? (
                                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                            <div className="w-8 h-8 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                                            <span className="text-[9px] uppercase tracking-[0.3em] text-amber-400/70 font-bold animate-pulse">
                                                {t('sintonizando_eter')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 text-white/90 leading-relaxed font-sans text-xs">
                                            {chineseData?.animal && renderFormattedContent(aiInterpretations[chineseData.animal])}
                                        </div>
                                    )
                                ) : (
                                    <div className="p-4 bg-black/40 rounded-xl border border-dashed border-rose-500/30 text-center space-y-3">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto">
                                            <Lock className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <h5 className="text-xs font-bold text-white uppercase tracking-widest">{t('reserved_content')}</h5>
                                        <p className="text-[10px] text-white/50 leading-relaxed max-w-sm mx-auto">
                                            {t('pinnacle_lock_desc')}
                                        </p>
                                        <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all">
                                            {t('view_plans')}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Wisdom Accordions */}
                <div className="space-y-4 pt-10 border-t border-white/5">
                    {sections.map((sec, idx) => {
                        const isOpen = openSectionId === sec.id;
                        const Icon = sec.icon;
                        
                        return (
                            <motion.div
                                key={sec.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    "rounded-2xl border border-white/[0.03] overflow-hidden transition-all duration-300",
                                    isOpen ? "bg-white/[0.03] shadow-[0_0_50px_rgba(255,255,255,0.01)] border-white/10" : "hover:bg-white/[0.01] hover:border-white/5"
                                )}
                            >
                                <button
                                    onClick={() => setOpenSectionId(isOpen ? null : sec.id)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl border text-rose-400 border-rose-500/20 bg-rose-500/5 group-hover/btn:border-rose-500/40 transition-colors">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-[11px] uppercase tracking-[0.3em] text-white/70 font-bold group-hover/btn:text-white transition-colors">
                                            {sec.title}
                                        </h4>
                                    </div>
                                    <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform duration-300", isOpen ? "rotate-180 text-white" : "group-hover/btn:text-white/60")} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="border-t border-white/[0.03]"
                                        >
                                            <div className="p-6 text-sm text-white/60 font-serif leading-relaxed italic">
                                                {sec.content}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

function getAnimalEmoji(animal: string, language?: string): string {
    const map_es: Record<string, string> = {
        'Rata': '🐀', 'Buey': '🐂', 'Tigre': '🐅', 'Conejo': '🐇',
        'Dragón': '🐉', 'Serpiente': '🐍', 'Caballo': '🐎', 'Cabra': '🐐',
        'Mono': '🐒', 'Gallo': '🐓', 'Perro': '🐕', 'Cerdo': '🐖'
    };
    const map_en: Record<string, string> = {
        'Rat': '🐀', 'Ox': '🐂', 'Tiger': '🐅', 'Rabbit': '🐇',
        'Dragon': '🐉', 'Snake': '🐍', 'Horse': '🐎', 'Goat': '🐐',
        'Monkey': '🐒', 'Rooster': '🐓', 'Dog': '🐕', 'Pig': '🐖'
    };
    const map = language === 'en' ? map_en : map_es;
    return map[animal] || '🏮';
}

function getElementWisdom(element: string, language?: string): string {
    const map_es: Record<string, string> = {
        "Madera": "Fuerza en la flexibilidad y regeneración constante.",
        "Fuego": "Chispa divina de liderazgo, pasión y verdad.",
        "Tierra": "Cimiento paciente, sabio y profundamente nutricio.",
        "Metal": "Espíritu forjado en silencio, claridad y firmeza.",
        "Agua": "Fluidez intuitiva que comunica verdades profundas."
    };
    const map_en: Record<string, string> = {
        "Wood": "Strength in flexibility and constant regeneration.",
        "Fire": "Divine spark of leadership, passion, and truth.",
        "Earth": "Patient, wise, and deeply nurturing foundation.",
        "Metal": "Spirit forged in silence, clarity, and firmness.",
        "Water": "Intuitive fluidity that communicates deep truths."
    };
    const map = language === 'en' ? map_en : map_es;
    return map[element] || '';
}
