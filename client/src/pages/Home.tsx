
import React from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { TempleAura } from '../remotion/TempleAura';
import { motion } from 'framer-motion';
import { useEnergy } from '../hooks/useEnergy';
import { cn } from '../lib/utils';
import { useCoherence } from '../hooks/useCoherence';
import { useProfile } from '../hooks/useProfile';
import { usePerformance } from '../context/PerformanceContext';
import { supabase } from '../lib/supabase';
import { IntentionWidget } from '../components/IntentionWidget';
import { BentoBlock } from '../components/BentoBlock';
import { useSound } from '../hooks/useSound';
import { useUpgrade } from '../contexts/UpgradeContext';
import { ProfileSelector } from '../components/ProfileSelector';

interface HomeProps {
    onSelectFeature: (feature: any, payload?: any) => void;
    activeFeature?: string;
}

export const Home: React.FC<HomeProps> = ({ onSelectFeature }) => {
    const { score, volatility } = useCoherence();
    const { profile, loading } = useProfile();
    const { triggerUpgrade } = useUpgrade();
    const { energy } = useEnergy();
    const { isSettled } = usePerformance();
    const playerRef = React.useRef<PlayerRef>(null);

    const isPremium = (profile as any)?.plan_type === 'premium' || (profile as any)?.plan_type === 'admin';

    React.useEffect(() => {
        if (!playerRef.current) return;
        if (isSettled) {
            playerRef.current.pause();
        } else {
            playerRef.current.play();
        }
    }, [isSettled]);
    
    // Viewport dimensions for responsive player
    const [viewport, setViewport] = React.useState({ 
        width: typeof window !== 'undefined' ? window.innerWidth : 1920, 
        height: typeof window !== 'undefined' ? window.innerHeight : 1080 
    });

    React.useEffect(() => {
        const handleResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // El Templo Dormido (Onboarding State)
    const [isDormant, setIsDormant] = React.useState(true);

    React.useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_identity');
        setIsDormant(!hasSeen);
    }, []);

    const { playSound } = useSound();
    // Focused block state removed for Protocol/Lab as they now navigate directly.

    const isBunkerMode = volatility?.system_recommendation === 'TRIGGER_TRIAGE_MODE';

    // Realtime & Fetch Logic
    React.useEffect(() => {
        if (!profile?.id) return;

        const fetchIntentions = async () => {
            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const startOfDayUTC = startOfDay.toISOString();

                await supabase
                    .from('intentions')
                    .select('intention_text')
                    .eq('user_id', profile.id)
                    .gte('created_at', startOfDayUTC)
                    .order('created_at', { ascending: false });

                // Intentions logic removed as per activeIntentions removal
            } catch (error) {
                console.error("Error fetching intentions:", error);
            }
        };

        fetchIntentions();

        const channel = supabase
            .channel('intentions_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'intentions',
                    filter: `user_id=eq.${profile.id}`
                },
                (payload) => {
                    console.log('⚡ Realtime Update:', payload);
                    fetchIntentions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id]);

    const playerProps = React.useMemo(() => ({ score }), [score]);
    const playerStyle = React.useMemo(() => ({ width: '100%', height: '100%', objectFit: 'cover' as const, filter: isBunkerMode ? 'hue-rotate(320deg) saturate(0.8)' : 'none' }), [isBunkerMode]);

    return (
        <div className={`relative min-h-screen w-full flex flex-col items-center justify-start font-sans text-white transition-colors duration-1000 ${isBunkerMode ? 'bg-red-950/20' : 'bg-transparent'}`}>
            
            {/* 0. PROFILE SELECTOR FLOOR */}
            <div className="absolute top-6 right-6 z-[100]">
                <ProfileSelector />
            </div>

            {/* 1. BACKGROUND ENGINE */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <Player
                    ref={playerRef}
                    component={TempleAura}
                    durationInFrames={900}
                    compositionWidth={viewport.width} compositionHeight={viewport.height} fps={60}
                    style={{ ...playerStyle, background: 'transparent' }}
                    autoPlay loop controls={false}
                    inputProps={playerProps}
                    acknowledgeRemotionLicense
                />
            </div>
            {isBunkerMode && <div className="fixed inset-0 z-[1] bg-red-900/5 mix-blend-color-burn pointer-events-none" />}

            {/* 2. SIGIL LAYER (PERSISTENT NARRATOR) */}
            <header className="relative z-50 w-full max-w-2xl px-6 pt-12 pb-8 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="w-full text-center cursor-pointer group"
                    onClick={() => { 
                        if (!isPremium) {
                            triggerUpgrade('sigil');
                            return;
                        }
                        playSound('click'); 
                        onSelectFeature('CHAT'); 
                    }}
                >
                    <div className="relative p-6 rounded-[2rem] glass-card hover:border-white/10 transition-all aura-zen-white:hover:border-black/20">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-500/20 blur-2xl rounded-full" />
                        <p className="text-lg md:text-xl font-serif italic theme-aware-text leading-relaxed transition-colors">
                            {isDormant ? (
                                "Tus coordenadas han sido procesadas. Entra a tu Código de Identidad para revelar tus Arquetipos y despertar el Templo."
                            ) : (
                                energy?.guidance ? `"${energy.guidance}"` : "Sincronizando frecuencias natales..."
                            )}
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-3 opacity-20 group-hover:opacity-60 transition-opacity aura-zen-white:opacity-10 aura-zen-white:group-hover:opacity-40">
                            <div className="h-[0.5px] w-4 bg-current" />
                            <span className="text-[8px] uppercase tracking-[0.6em] font-black theme-aware-text">Sigil Guardian</span>
                            <div className="h-[0.5px] w-4 bg-current" />
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* 3. BENTO GRID (THE PIECES) */}
            <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 flex-1 flex flex-col justify-center gap-12">

                {/* 1. SVG CLIP PATHS DEFINITIONS */}
                <svg width="0" height="0" className="absolute pointer-events-none">
                    <defs>
                        <clipPath id="puzzle-astro" clipPathUnits="objectBoundingBox">
                            <path d="M 0,0 H 0.9 V 0.4 C 0.8,0.4 0.8,0.6 0.9,0.6 V 0.9 H 0.6 C 0.6,1 0.4,1 0.4,0.9 H 0 Z" />
                        </clipPath>
                        <clipPath id="puzzle-command" clipPathUnits="objectBoundingBox">
                            <path d="M 0.1,0 H 1 V 0.9 H 0.6 C 0.6,0.8 0.4,0.8 0.4,0.9 H 0.1 V 0.6 C 0,0.6 0,0.4 0.1,0.4 Z" />
                        </clipPath>
                        <clipPath id="puzzle-protocol" clipPathUnits="objectBoundingBox">
                            <path d="M 0,0.1 H 0.4 C 0.4,0.2 0.6,0.2 0.6,0.1 H 0.9 V 0.4 C 1,0.4 1,0.6 0.9,0.6 V 1 H 0 Z" />
                        </clipPath>
                        <clipPath id="puzzle-evolution" clipPathUnits="objectBoundingBox">
                            <path d="M 0.1,0.1 H 0.4 C 0.4,0 0.6,0 0.6,0.1 H 1 V 1 H 0.1 V 0.6 C 0.2,0.6 0.2,0.4 0.1,0.4 Z" />
                        </clipPath>
                    </defs>
                </svg>


                {/* THE OVERLAPPING PUZZLE CONTAINER */}
                <div className="relative w-full aspect-square max-w-[800px] mx-auto my-0 md:my-12">
                    <div className={cn(
                        "absolute top-0 left-0 w-[55.5%] h-[55.5%] z-30 transition-all duration-1000",
                        isDormant && "animate-pulse"
                    )}>
                        <BentoBlock
                            position="top-left"
                            title="CÓDIGO DE IDENTIDAD"
                            accent="cyan"
                            clipPath="url(#puzzle-astro)"
                            pathData="M 0,0 H 0.9 V 0.4 C 0.8,0.4 0.8,0.6 0.9,0.6 V 0.9 H 0.6 C 0.6,1 0.4,1 0.4,0.9 H 0 Z"
                            onClick={() => { playSound('click'); onSelectFeature('IDENTITY_NEXUS'); }}
                        />
                    </div>
                    <div className={cn(
                        "absolute top-0 right-0 w-[55.5%] h-[55.5%] z-10 transition-all duration-1000",
                        isDormant && "grayscale opacity-30 blur-[1px] pointer-events-none"
                    )}>
                        <BentoBlock
                            position="top-right"
                            title="ORÁCULO"
                            accent="magenta"
                            clipPath="url(#puzzle-command)"
                            pathData="M 0.1,0 H 1 V 0.9 H 0.6 C 0.6,0.8 0.4,0.8 0.4,0.9 H 0.1 V 0.6 C 0,0.6 0,0.4 0.1,0.4 Z"
                            onClick={() => { playSound('click'); onSelectFeature('ORACLE_SOULS'); }}
                        />
                    </div>

                    <div className={cn(
                        "absolute bottom-0 left-0 w-[55.5%] h-[55.5%] z-20 transition-all duration-1000",
                        isDormant && "grayscale opacity-30 blur-[1px] pointer-events-none"
                    )}>
                        <BentoBlock
                            position="bottom-left"
                            title="PROTOCOLOS 21 Y 90"
                            accent="emerald"
                            clipPath="url(#puzzle-protocol)"
                            pathData="M 0,0.1 H 0.4 C 0.4,0.2 0.6,0.2 0.6,0.1 H 0.9 V 0.4 C 1,0.4 1,0.6 0.9,0.6 V 1 H 0 Z"
                            locked={!isPremium}
                            onClick={() => { playSound('click'); if (!isPremium) triggerUpgrade('protocol'); else onSelectFeature('PROTOCOL21'); }}
                        />
                    </div>
                    <div className={cn(
                        "absolute bottom-0 right-0 w-[55.5%] h-[55.5%] z-10 transition-all duration-1000",
                        isDormant && "grayscale opacity-30 blur-[1px] pointer-events-none"
                    )}>
                        <BentoBlock
                            position="bottom-right"
                            title="LABORATORIO ELEMENTAL"
                            accent="orange"
                            clipPath="url(#puzzle-evolution)"
                            pathData="M 0.1,0.1 H 0.4 C 0.4,0 0.6,0 0.6,0.1 H 1 V 1 H 0.1 V 0.6 C 0.2,0.6 0.2,0.4 0.1,0.4 Z"
                            locked={!isPremium}
                            onClick={() => { playSound('click'); if (!isPremium) triggerUpgrade('evolution'); else onSelectFeature('ELEMENTAL_LAB'); }}
                        />
                    </div>
                </div>

                <div className="flex justify-center w-full">
                    <IntentionWidget />
                </div>
            </main>

            {/* 4. INTERACTIVE FOCUS OVERLAY - MODAL LOGIC REMOVED FOR PROTOCOL/LAB */}
        </div>
    );
};
