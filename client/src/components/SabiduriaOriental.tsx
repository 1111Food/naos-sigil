import React, { useState } from 'react';
import { Scroll, Sparkles, Users, Heart, Coins, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { useGuardianState } from '../contexts/GuardianContext';
import { CHINESE_ZODIAC_WISDOM } from '../data/chineseZodiacData';
import { getChineseZodiacImage } from '../utils/chineseMapper';
import { cn } from '../lib/utils';

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

export const SabiduriaOriental: React.FC<SabiduriaOrientalProps> = ({ overrideProfile }) => {
    const { profile: hookProfile, loading } = useProfile();
    // Logic: Use passed profile (override) OR hook profile
    const profile = overrideProfile || hookProfile;

    // HOOKS FIRST:
    const { trackEvent } = useGuardianState();
    const [openSectionId, setOpenSectionId] = useState<string | null>(null);

    // ✨ CLIENT-SIDE CALCULATION - No server dependency!
    const calculateChineseZodiac = (birthDateISO: string) => {
        const date = new Date(birthDateISO);
        let year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();

        // Lichun (Start of Solar Spring) usually falls on Feb 4.
        // If birth is before Feb 4, use previous Chinese year.
        if (month < 2 || (month === 2 && day < 4)) {
            year--;
        }

        const ANIMALS = [
            "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
            "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"
        ];

        // Animal: Cycle starts from 1900 (Metal Rat)
        const animalIdx = (year - 1900) % 12;
        const animal = ANIMALS[animalIdx];

        // Element: Use the LAST DIGIT RULE (Heavenly Stems)
        // This is the correct traditional method
        const lastDigit = year.toString().slice(-1);
        let element: string;

        switch (lastDigit) {
            case '0':
            case '1':
                element = 'Metal';
                break;
            case '2':
            case '3':
                element = 'Agua';
                break;
            case '4':
            case '5':
                element = 'Madera';
                break;
            case '6':
            case '7':
                element = 'Fuego';  // ✅ 1986 ends in 6 -> Fuego
                break;
            case '8':
            case '9':
                element = 'Tierra';
                break;
            default:
                element = 'Fuego';
        }

        return {
            animal,
            element,
            birthYear: year
        };
    };

    // Calculate locally if we have birthDate
    const chineseData = profile?.birthDate ? calculateChineseZodiac(profile.birthDate) : null;
    const animalData = chineseData?.animal ? CHINESE_ZODIAC_WISDOM[chineseData.animal] : null;

    // --- PARSE COMPATIBILITY ---
    const parseCompatibility = (compString?: string) => {
        if (!compString) return { allies: [], enemies: [] };
        // Example: "Mejor con: Dragón, Mono, Buey. / Evitar: Caballo."
        const parts = compString.split('/');
        
        const alliesStr = parts.find(p => p.toLowerCase().includes('mejor')) || '';
        const enemiesStr = parts.find(p => p.toLowerCase().includes('evitar')) || '';

        const extractAnimals = (str: string) => {
            return str
                .replace(/Mejor con:/i, '')
                .replace(/Evitar:/i, '')
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

    const elementDescription = chineseData?.element ? getElementWisdom(chineseData.element) : '';

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
        if (loading && !overrideProfile) return <div className="p-8 text-center text-white/50">Cargando sabiduría...</div>;
        return <div className="p-8 text-center text-white/50">Esencia Incompleta. Se requiere fecha de nacimiento.</div>;
    }


    const sections = [
        { 
            id: 'elemento', 
            title: 'Naturaleza de Elemento', 
            icon: Sparkles, 
            color: 'cyan', 
            content: `"${elementDescription}"` 
        },
        { 
            id: 'horizonte', 
            title: 'Horizonte 2026', 
            icon: Sparkles, 
            color: 'amber', 
            content: `Año del Caballo de Fuego (Bing Wu). ${animalData?.forecast_2026_title || 'Expansión solar'}. Tiempo de expansión solar y decisiones audaces.` 
        },
        { 
            id: 'alianzas', 
            title: 'Dinámica de Alianzas', 
            icon: Users, 
            color: 'indigo', 
            content: (
                <div className="space-y-3 pt-2">
                    <div>
                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 block mb-1">Trígono Compatible</span>
                        <div className="flex flex-wrap gap-2">
                            {allies.map(ally => (
                                <div key={ally} className="px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center gap-1 shrink-0" title={ally}>
                                    <span className="text-sm">{getAnimalEmoji(ally)}</span> {ally}
                                </div>
                            ))}
                        </div>
                    </div>
                    {enemies.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                            <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 block mb-1">Eje de Tensión</span>
                            <div className="flex flex-wrap gap-2">
                                {enemies.map(en => (
                                    <div key={en} className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-center gap-1 shrink-0" title={en}>
                                        <span className="text-sm">{getAnimalEmoji(en)}</span> {en}
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
            title: 'Esencia del Tótem', 
            icon: Scroll, 
            color: 'rose', 
            content: `"${animalData?.totem_essence}"` 
        },
        { 
            id: 'sombra', 
            title: 'Sombra Consciente', 
            icon: Scroll, 
            color: 'amber', 
            content: animalData?.totem_shadow 
        },
        { 
            id: 'amor', 
            title: 'Amor y Vínculos', 
            icon: Heart, 
            color: 'rose', 
            content: animalData?.forecast_love 
        },
        { 
            id: 'abundancia', 
            title: 'Abundancia y Flujo', 
            icon: Coins, 
            color: 'emerald', 
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
                    <h2 className="text-[11px] uppercase tracking-[0.5em] text-rose-500/60 font-bold">Sabiduría Oriental</h2>
                    <h3 className="text-2xl text-amber-50/40 font-serif italic">EL VACÍO ES FORMA</h3>
                    <p className="text-white/30 italic font-serif">
                        "El pincel aún no toca el pergamino sagrado."
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
                            Sabiduría Oriental
                        </h2>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mt-1">Zodíaco Imperial & BaZi</p>
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
                            <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">Arquetipo Animal</p>
                            <h3 className="text-4xl md:text-5xl font-thin text-white tracking-widest uppercase">
                                {chineseData?.animal || '...'} <span className="text-cyan-400/40">/ {chineseData?.element || '...'}</span>
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Wisdom Accordions */}
                <div className="space-y-4 pt-10 border-t border-white/5">
                    {sections.map((sec, idx) => {
                        const isOpen = openSectionId === sec.id;
                        const Icon = sec.icon;
                        
                        const colorClasses = {
                            cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
                            amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
                            indigo: "text-indigo-400 border-indigo-500/30 bg-indigo-500/5",
                            rose: "text-rose-400 border-rose-500/30 bg-rose-500/5",
                            emerald: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5"
                        }[sec.color as 'cyan' | 'amber' | 'indigo' | 'rose' | 'emerald'] || "text-white border-white/10 bg-white/5";

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
                                        <div className={cn("p-2 rounded-xl border", colorClasses)}>
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

function getAnimalEmoji(animal: string): string {
    const map: Record<string, string> = {
        'Rata': '🐀', 'Buey': '🐂', 'Tigre': '🐅', 'Conejo': '🐇',
        'Dragón': '🐉', 'Serpiente': '🐍', 'Caballo': '🐎', 'Cabra': '🐐',
        'Mono': '🐒', 'Gallo': '🐓', 'Perro': '🐕', 'Cerdo': '🐖'
    };
    return map[animal] || '🏮';
}

function getElementWisdom(element: string): string {
    const map: Record<string, string> = {
        "Madera": "Fuerza en la flexibilidad y regeneración constante.",
        "Fuego": "Chispa divina de liderazgo, pasión y verdad.",
        "Tierra": "Cimiento paciente, sabio y profundamente nutricio.",
        "Metal": "Espíritu forjado en silencio, claridad y firmeza.",
        "Agua": "Fluidez intuitiva que comunica verdades profundas."
    };
    return map[element] || '';
}
