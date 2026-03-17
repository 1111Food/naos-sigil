import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Layers, HelpCircle, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { StrategicCard } from '../components/StrategicCard';
import { BreathingEngine } from '../components/BreathingEngine';
import { useSound } from '../hooks/useSound';

// --- Ritual States ---
type RitualState = 'INVOCATION' | 'CALIBRATION' | 'BREATHING' | 'ENGINE_SELECTION' | 'SPREAD_SELECTION' | 'CARD_SELECTION' | 'REVELATION' | 'INTERPRETATION' | 'CLOSING';
type SpreadType = 'ONE_CARD' | 'THREE_CARD' | 'COMPASS' | 'YES_NO' | 'CELTIC'; // Keep CELTIC in type but remove from UI if needed, or just replace
type OracleState = 'LOADING' | 'VOCAL' | 'SILENT';

interface TarotProps {
    onBack: () => void;
    embedded?: boolean;
    initialIntent?: string;
}

const THEME = {
    bg: 'transparent',
    text: 'text-primary',
    textSoft: 'text-secondary',
    accent: 'text-red-500',
    accentLow: 'text-red-500/40',
    glass: 'glass-card',
    glassHover: 'hover:border-white/20 transition-all duration-700',
};

const MAJOR_ARCANA = [
    "El Loco", "El Mago", "La Sacerdotisa", "La Emperatriz", "El Emperador",
    "El Hierofante", "Los Enamorados", "El Carro", "La Fuerza", "El Ermitaño",
    "La Rueda de la Fortuna", "La Justicia", "El Colgado", "La Muerte", "La Templanza",
    "El Diablo", "La Torre", "La Estrella", "La Luna", "El Sol", "El Juicio", "El Mundo"
];

const NAOS_ARCHETYPES = [
    "El Arquitecto", "El Estratega", "El Custodio", "El Alquimista",
    "El Comandante", "El Orador", "El Visionario", "El Embajador",
    "El Analista", "El Mediador", "El Explorador", "El Guía",
    "El Innovador", "El Guardián", "El Maestro", "El Mentor"
];

import { useCoherence } from '../hooks/useCoherence';
export const Tarot: React.FC<TarotProps> = ({ onBack, initialIntent }) => {
    const { score } = useCoherence();
    const [ritualState, setRitualState] = useState<RitualState>(initialIntent ? 'CALIBRATION' : 'INVOCATION');
    const [oracleState, setOracleState] = useState<OracleState>('VOCAL');
    const [soulIntent, setSoulIntent] = useState(initialIntent || '');
    const [selectedEngine, setSelectedEngine] = useState<'ARCANOS' | 'ARQUETIPOS'>('ARCANOS');
    const [isSaving, setIsSaving] = useState(false);
    const [spread, setSpread] = useState<SpreadType | null>(null);
    const [deck, setDeck] = useState<number[]>([]);
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [reading, setReading] = useState<any>(null);
    const [bypassedCoherence, setBypassedCoherence] = useState(false);
    const { playSound } = useSound();
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    // Audio Logic Placeholder
    React.useEffect(() => {
        const audioUrl = 'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/frecuencia-tierra.mp3';
        const audio = new Audio(encodeURI(audioUrl));
        audio.loop = true;
        audio.volume = 0.3;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    React.useEffect(() => {
        // Play audio when module is active
        // Note: Browsers require user interaction before playing audio
        if (ritualState !== 'INVOCATION' && audioRef.current) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio autoplay prevented - waiting for interaction:", error);
                });
            }
        }
    }, [ritualState]);

    const pageVariants = {
        initial: { opacity: 0, y: 10 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -10 },
    };

    // Initialize/Shuffle Deck
    const initDeck = () => {
        const deckSize = selectedEngine === 'ARCANOS' ? 22 : 16;
        const rawDeck = Array.from({ length: deckSize }, (_, i) => i);
        for (let i = rawDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rawDeck[i], rawDeck[j]] = [rawDeck[j], rawDeck[i]];
        }
        setDeck(rawDeck);
    };

    const handleSpreadSelect = (s: SpreadType) => {
        playSound('click');
        setSpread(s);
        initDeck();
        setRitualState('CARD_SELECTION');
    };

    const requiredCards = spread === 'ONE_CARD' ? 1 
        : spread === 'YES_NO' ? 2 
        : spread === 'THREE_CARD' ? 3 
        : spread === 'COMPASS' ? 4 
        : 10;

    const handleCardSelect = (index: number) => {
        if (selectedCards.includes(index)) return;
        playSound('click');
        const newSelection = [...selectedCards, index];
        setSelectedCards(newSelection);

        if (newSelection.length === requiredCards) {
            // First move to Revelation phase to manifest the arcanos
            setRitualState('REVELATION');
            setTimeout(() => handleFetchReading(newSelection), 1500);
        }
    };

    const handleFetchReading = async (selectedIndices: number[]) => {
        setOracleState('LOADING');
        setRitualState('INTERPRETATION');

        const cardNames = selectedEngine === 'ARCANOS' ? MAJOR_ARCANA : NAOS_ARCHETYPES;

        const finalCards = selectedIndices.map(idx => {
            const cardId = deck[idx % deck.length];
            return {
                id: cardId,
                name: cardNames[cardId],
                meaning: "La esencia del arcano aguarda tu introspección.",
            };
        });

        try {
            const { endpoints, getAsyncAuthHeaders } = await import('../lib/api');
            const headers = await getAsyncAuthHeaders();
            const response = await fetch(endpoints.tarot, {
                method: 'POST',
                headers: headers as HeadersInit,
                body: JSON.stringify({
                    question: soulIntent,
                    engine: selectedEngine,
                    spreadType: spread || 'ONE_CARD',
                    cards: finalCards,
                    mode: 'INTERPRETATIVE',
                    bypassCoherence: bypassedCoherence
                })
            });

            if (!response.ok) throw new Error('Silence');

            const data = await response.json();
            setReading({
                cards: finalCards,
                interpretation: data.interpretation
            });
            setOracleState('VOCAL');
        } catch (error) {
            console.error("Oracle Silence:", error);
            setReading({
                cards: finalCards,
                interpretation: "Los arcanos se han manifestado, pero la voz del oráculo está en silencio momentáneo. Permanece en la contemplación de los símbolos o intenta profundizar el ritual."
            });
            setOracleState('SILENT');
        }
    };

    // Linear flow enforcement - No automatic resets
    const handleCloseRitual = async (retryCount = 0) => {
        if (!reading) return;
        
        setIsSaving(true);
        try {
            const { endpoints, getAsyncAuthHeaders } = await import('../lib/api');
            const headers = await getAsyncAuthHeaders();
            
            const response = await fetch(`${endpoints.tarot}/save`, {
                method: 'POST',
                headers: headers as HeadersInit,
                body: JSON.stringify({
                    intention: soulIntent,
                    cards: reading.cards,
                    engine: selectedEngine,
                    summary: reading.interpretation
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status} al sellar`);
            }
            
            setRitualState('CLOSING');
        } catch (error: any) {
            console.error(`Error sealing ritual (Attempt ${retryCount + 1}):`, error);
            
            if (retryCount < 1) {
                console.log("Reintentando sellado ritual...");
                return handleCloseRitual(retryCount + 1);
            }

            // If retries fail, we alert the user but let them proceed to close 
            // so they don't get stuck, while acknowledging the data might not be in history.
            alert("El Registro Akáshico está saturado en este momento. Tu ritual ha sido presenciado, pero no pudo ser guardado permanentemente.");
            setRitualState('CLOSING');
        } finally {
            setIsSaving(false);
        }
    };

    const AtmosphericBackground = () => (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Global Aura will show through transparency */}
            <div className="absolute inset-0 transition-colors duration-1000 bg-black/20" />

            {/* Altar Radial Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,rgba(0,0,0,0.5)_100%)]" />

            {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

            {/* Red Ritual Accents (Subtle) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-red-900/5 blur-[120px] rounded-full" />
        </div>
    );

    return (
        <div className={cn("relative min-h-screen w-full overflow-hidden font-serif selection:bg-amber-500/10", THEME.bg, THEME.text)}>
            <AtmosphericBackground />

            {/* Header - Minimal & Ceremonial */}
            <header className="relative z-10 p-6 flex items-center justify-between max-w-6xl mx-auto w-full pt-[max(1.5rem,env(safe-area-inset-top))]">
                <button onClick={onBack} className="p-2 text-secondary hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5 font-light" />
                </button>
                <div className="flex items-center gap-3 tracking-[0.6em] text-[11px] uppercase font-bold text-red-500/60 transition-all duration-1000">
                    <Moon className="w-3.5 h-3.5 opacity-40 animate-pulse" />
                    <span>Radiografía Estratégica</span>
                </div>
                <div className="w-9" />
            </header>

            {/* Main Altar Area */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 min-h-[80vh] flex flex-col items-center">
                <AnimatePresence mode="wait">

                    {/* 1. INVOCATION */}
                    {ritualState === 'INVOCATION' && (
                        <motion.div
                            key="invocation" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full max-w-xl text-center space-y-12 mt-20"
                        >
                            <div className="space-y-6">
                                <h1 className="text-[32px] md:text-[38px] font-light tracking-wide text-primary">¿Qué busca tu alma hoy?</h1>
                                <p className="text-secondary uppercase tracking-[0.2em] text-[10px]">Concentra tu energía en una intención clara para el universo.</p>
                            </div>

                            <div className="relative">
                                <input
                                    type="text" value={soulIntent} onChange={(e) => setSoulIntent(e.target.value)}
                                    placeholder="Manifestar intención..."
                                    className="w-full bg-transparent border-b border-white/5 px-4 py-6 text-[26px] text-center text-amber-50 placeholder:text-white/5 focus:outline-none focus:border-red-500/20 transition-all font-light italic"
                                    autoFocus
                                />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-red-500/40 transition-all duration-1000 group-focus:w-full" />
                            </div>

                            <button
                                onClick={() => { playSound('success'); soulIntent.trim() && setRitualState('CALIBRATION'); }}
                                disabled={!soulIntent.trim()}
                                className={cn(
                                    "px-12 py-3 rounded-full border border-white/5 uppercase tracking-[0.3em] text-[11px] transition-all duration-1000",
                                    soulIntent.trim() ? "text-primary hover:border-white/20 glass-card" : "text-white/10 opacity-50 cursor-not-allowed"
                                )}
                            >
                                Iniciar Ritual
                            </button>
                        </motion.div>
                    )}

                    {/* 1.5 CALIBRATION INTERSTITIAL */}
                    {ritualState === 'CALIBRATION' && (
                        <motion.div
                            key="calibration" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full max-w-xl text-center space-y-12 mt-20"
                        >
                            <div className="space-y-6">
                                <h1 className="text-[28px] font-light tracking-widest text-amber-50/90 uppercase">Sintonización Requerida</h1>
                                <div className="w-16 h-[1px] bg-red-500/30 mx-auto" />
                                <p className={cn(THEME.textSoft, "text-lg font-light leading-relaxed px-8")}>
                                    Has invocado al oráculo por <span className="text-amber-100 italic">"{soulIntent}"</span>.
                                    Para recibir la verdad sin ruido, se recomienda limpiar tu canal.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                <button
                                    onClick={() => {
                                        setBypassedCoherence(false);
                                        setRitualState('BREATHING');
                                    }}
                                    className="px-8 py-4 rounded-full bg-red-900/10 border border-red-500/20 text-red-100 hover:bg-red-900/20 hover:border-red-500/40 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 group"
                                >
                                    <span>🧘‍♂️ Calibrar (1 min)</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setBypassedCoherence(true);
                                        setRitualState('ENGINE_SELECTION');
                                    }}
                                    className="px-8 py-4 rounded-full border border-white/5 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center gap-3"
                                >
                                    <span>⚡ Proceder Directamente</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 1.6 BREATHING RITUAL */}
                    {ritualState === 'BREATHING' && (
                        <motion.div
                            key="breathing" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full flex flex-col items-center justify-center space-y-8"
                        >
                            <BreathingEngine
                                technique="AIR_FLOW"
                                onComplete={() => {
                                    setTimeout(() => setRitualState('ENGINE_SELECTION'), 1000);
                                }}
                            />
                            <button
                                onClick={() => {
                                    setBypassedCoherence(true);
                                    setRitualState('ENGINE_SELECTION');
                                }}
                                className="text-white/20 hover:text-white/40 text-[9px] uppercase tracking-[0.3em] transition-colors"
                            >
                                Saltar Sintonización
                            </button>
                        </motion.div>
                    )}

                    {/* 1.7 ENGINE SELECTION (NEW) */}
                    {ritualState === 'ENGINE_SELECTION' && (
                        <motion.div
                            key="engine-selection" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full text-center space-y-16 mt-10"
                        >
                            <div className="space-y-4">
                                <h2 className="text-[26px] font-light tracking-widest text-amber-50/60 uppercase">Delinea el Motor Oracular</h2>
                                <div className="w-12 h-[1px] bg-red-500/20 mx-auto" />
                                <p className={THEME.textSoft}>¿Qué lenguaje debe usar el Templo hoy?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                <button
                                    onClick={() => { setSelectedEngine('ARCANOS'); setRitualState('SPREAD_SELECTION'); playSound('click'); }}
                                    className={cn("flex flex-col items-center justify-center p-10 rounded-[2rem] text-center group relative overflow-hidden transition-all duration-700", THEME.glass, THEME.glassHover)}
                                >
                                    <Sparkles className="w-8 h-8 mb-6 text-amber-100/20 group-hover:text-amber-100 group-hover:scale-110 transition-all duration-700" />
                                    <h3 className="text-[19px] font-light mb-3 tracking-widest text-amber-50/80 uppercase">Los 22 Arcanos</h3>
                                    <p className="text-[13px] leading-relaxed text-amber-100/20 group-hover:text-amber-100/40 transition-colors uppercase tracking-[0.1em]">
                                        Lee la energía del universo y las fuerzas arquetípicas que envuelven tu consulta.
                                    </p>
                                </button>

                                <button
                                    onClick={() => { setSelectedEngine('ARQUETIPOS'); setRitualState('SPREAD_SELECTION'); playSound('click'); }}
                                    className={cn("flex flex-col items-center justify-center p-10 rounded-[2rem] text-center group relative overflow-hidden transition-all duration-700", THEME.glass, THEME.glassHover)}
                                >
                                    <Layers className="w-8 h-8 mb-6 text-red-500/40 group-hover:text-red-500 group-hover:scale-110 transition-all duration-700" />
                                    <h3 className="text-[19px] font-light mb-3 tracking-widest text-amber-50/80 uppercase">Los 16 Arquetipos</h3>
                                    <p className="text-[13px] leading-relaxed text-amber-100/20 group-hover:text-amber-100/40 transition-colors uppercase tracking-[0.1em]">
                                        Lee la postura operativa y el rol táctico que debes tomar frente a la situación.
                                    </p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. SPREAD SELECTION */}
                    {ritualState === 'SPREAD_SELECTION' && (
                        <motion.div
                            key="selection" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full text-center space-y-16 mt-10"
                        >
                            <div className="space-y-4">
                                <h2 className="text-[26px] font-light tracking-widest text-amber-50/60 uppercase">Elige la estructura del ritual</h2>
                                <div className="w-12 h-[1px] bg-red-500/20 mx-auto" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                                <SpreadCard title="Carta Única" desc="Mensaje esencial del oráculo." icon={Moon} onClick={() => handleSpreadSelect('ONE_CARD')} />
                                <SpreadCard title="Dualidad" desc="Claridad para una duda específica." icon={HelpCircle} onClick={() => handleSpreadSelect('YES_NO')} />
                                <SpreadCard title="Temporalidad" desc="Pasado, presente y el devenir." icon={Layers} onClick={() => handleSpreadSelect('THREE_CARD')} />
                                <SpreadCard title="El Compás NAOS" desc="Fuego, Tierra, Aire y Agua aplicados." icon={Sparkles} onClick={() => handleSpreadSelect('COMPASS')} />
                            </div>
                        </motion.div>
                    )}

                    {/* 3. CARD SELECTION */}
                    {ritualState === 'CARD_SELECTION' && (
                        <motion.div
                            key="deck" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full text-center space-y-10"
                        >
                            <div className="space-y-4">
                                <h2 className="text-[26px] font-light tracking-widest text-amber-50/60 uppercase">
                                    Sintoniza con los {selectedEngine === 'ARCANOS' ? 'Arcanos' : 'Arquetipos'}
                                </h2>
                                <p className={THEME.textSoft}>Selecciona {requiredCards - selectedCards.length} más según tu intuición.</p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto px-4">
                                {[...Array(selectedEngine === 'ARCANOS' ? 22 : 16)].map((_, i) => (
                                    <div key={i} className="w-16 h-28 md:w-20 md:h-32">
                                        <StrategicCard
                                            id={i} isRevealed={false} isSelected={selectedCards.includes(i)}
                                            onClick={() => handleCardSelect(i)}
                                            className={selectedCards.includes(i) ? "opacity-20 translate-y-2" : ""}
                                            type={selectedEngine}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* 4. REVELATION */}
                    {ritualState === 'REVELATION' && (
                        <motion.div
                            key="revelation" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="flex flex-col items-center justify-center space-y-12 py-20"
                        >
                            <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center relative">
                                <Sparkles className="w-8 h-8 text-amber-100/20 animate-pulse" />
                                <div className="absolute inset-0 bg-amber-500/5 blur-3xl animate-pulse" />
                            </div>
                            <p className="text-amber-100/40 tracking-[0.4em] text-[11px] uppercase animate-pulse">Los arcanos se manifiestan...</p>
                        </motion.div>
                    )}

                    {/* 5. INTERPRETATION */}
                    {ritualState === 'INTERPRETATION' && (
                        <motion.div
                            key="interpretation" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="w-full text-center pb-32 space-y-16"
                        >
                            <div className="space-y-4">
                                <p className="text-[11px] uppercase tracking-[0.5em] text-red-500/40">Intención del Alma</p>
                                <h2 className="text-[26px] md:text-[32px] font-light italic text-amber-50/80">"{soulIntent}"</h2>
                            </div>

                            <div className="flex flex-wrap justify-center gap-10">
                                {reading?.cards.map((card: any, idx: number) => (
                                    <div key={idx} className="flex flex-col items-center gap-6 w-52">
                                        <div className="w-52 h-80">
                                            <StrategicCard id={card.id} name={card.name} isRevealed={true} type={selectedEngine} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {oracleState === 'LOADING' ? (
                                <div className="py-12 flex flex-col items-center gap-4">
                                    <div className="w-40 h-[1px] bg-white/5 relative overflow-hidden">
                                        <motion.div
                                            animate={{ x: [-160, 160] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute inset-0 w-20 bg-amber-500/20"
                                        />
                                    </div>
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-amber-100/20 italic">Traduciendo el lenguaje estelar...</p>
                                </div>
                            ) : (
                                <div className="max-w-2xl mx-auto space-y-12">
                                    <div className="relative p-10 glass-panel overflow-hidden">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[1px] bg-red-500/20" />
                                        <p className="text-[17px] uppercase tracking-widest text-red-500/60 mb-6 font-bold">ANÁLISIS SIMBÓLICO</p>
                                        <p className="text-[19px] leading-relaxed text-amber-50/70 font-light italic">
                                            {reading?.interpretation}
                                        </p>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                                        {oracleState === 'SILENT' && (
                                            <button
                                                onClick={() => handleFetchReading(selectedCards)}
                                                className="px-8 py-3 rounded-full border border-red-500/20 text-red-500/60 uppercase tracking-[0.3em] text-[11px] hover:bg-red-500/5 transition-all duration-700"
                                            >
                                                Sintonizar de nuevo
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleCloseRitual()}
                                            disabled={isSaving}
                                            className={cn(
                                                "px-10 py-3 rounded-full bg-white/5 border border-white/10 text-amber-50 hover:bg-white/10 transition-all uppercase tracking-[0.3em] text-[11px] flex items-center gap-3",
                                                isSaving && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-3 h-3 border-t-2 border-red-500 rounded-full animate-spin" />
                                                    Sellando...
                                                </>
                                            ) : (
                                                "Sellar Ritual"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Low Energy Warning Footer */}
                            {score < 40 && !bypassedCoherence && (
                                <div className="mt-8 p-4 rounded-xl bg-red-900/10 border border-red-500/20 text-center animate-pulse">
                                    <p className="text-[10px] uppercase tracking-widest text-red-400/60">
                                        ⚠️ Interpretación generada bajo turbulencia energética. Tómalo con calma.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* 6. CLOSING */}
                    {ritualState === 'CLOSING' && (
                        <motion.div
                            key="closing" variants={pageVariants} initial="initial" animate="in" exit="out"
                            className="flex flex-col items-center justify-center space-y-12 py-32 text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center"
                            >
                                <Sparkles className="w-10 h-10 text-amber-100/20" />
                            </motion.div>
                            <div className="space-y-3">
                                <h3 className="text-[21px] font-light tracking-widest text-amber-50/60 uppercase">Ritual Sellado</h3>
                                <p className={THEME.textSoft}>Que la luz de los Arcanos guíe tu camino.</p>
                            </div>
                            <button
                                onClick={() => { playSound('click'); onBack(); }}
                                className="px-12 py-3 rounded-full border border-white/10 text-amber-50 hover:bg-white/5 transition-all uppercase tracking-[0.3em] text-[11px]"
                            >
                                Volver al Templo
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            {/* Ritual Red Neon Frame */}
            <div className="fixed inset-0 pointer-events-none z-50">
                <div className="absolute inset-0 border-[1px] border-red-500/20 shadow-[inset_0_0_40px_rgba(239,68,68,0.15)]" />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-red-500/40 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-red-500/40 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                />

                {/* Subtle Pulse Atmosphere */}
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(239,68,68,0.05)_100%)]"
                />
            </div>
        </div >
    );
};

interface SpreadCardProps {
    title: string;
    desc: string;
    icon: any;
    onClick: () => void;
}

const SpreadCard = ({ title, desc, icon: Icon, onClick }: SpreadCardProps) => (
    <button
        onClick={onClick}
        className={cn("flex flex-col items-center justify-center p-10 rounded-[2rem] text-center group relative overflow-hidden", THEME.glass, THEME.glassHover)}
    >
        <div className="mb-6 p-4 rounded-full bg-white/[0.02] border border-white/5 text-amber-100/30 group-hover:text-amber-100 group-hover:border-white/10 transition-all duration-700">
            <Icon className="w-6 h-6 stroke-[1.2]" />
        </div>
        <h3 className="text-[19px] font-light mb-3 tracking-widest text-amber-50/80 uppercase">{title}</h3>
        <p className="text-[13px] leading-relaxed text-amber-100/20 group-hover:text-amber-100/40 transition-colors uppercase tracking-[0.1em]">{desc}</p>

        {/* Subtle hover indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-red-500/10 group-hover:w-12 transition-all duration-1000" />
    </button>
);
