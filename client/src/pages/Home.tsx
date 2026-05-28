
import React, { useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { TempleAura } from '../remotion/TempleAura';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnergy } from '../hooks/useEnergy';
import { cn } from '../lib/utils';
import { useCoherence } from '../hooks/useCoherence';
import { useProfile } from '../hooks/useProfile';
import { usePerformance } from '../context/PerformanceContext';
import { supabase } from '../lib/supabase';
import { IntentionWidget } from '../components/IntentionWidget';
import { Carousel3D } from '../components/Carousel3D';
import { useSound } from '../hooks/useSound';
import { useUpgrade } from '../contexts/UpgradeContext';
import { LegalView } from '../components/LegalView';
import { WelcomeExplainer } from '../components/WelcomeExplainer';
import { useTranslation } from '../i18n';

interface HomeProps {
    onSelectFeature: (feature: any, payload?: any) => void;
    activeFeature?: string;
}

export const Home: React.FC<HomeProps> = ({ onSelectFeature }) => {
    const { score, volatility } = useCoherence();
    const { profile } = useProfile();
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
    const [showWelcome, setShowWelcome] = React.useState(false);

    React.useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_identity');
        setIsDormant(!hasSeen);
        
        const hasSeenWelcome = localStorage.getItem('has_seen_welcome_carousel');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
        }
    }, []);

    const handleCloseWelcome = () => {
        localStorage.setItem('has_seen_welcome_carousel', 'true');
        setShowWelcome(false);
    };

    const { playSound } = useSound();
    // Focused block state removed for Protocol/Lab as they now navigate directly.

    const isBunkerMode = volatility?.system_recommendation === 'TRIGGER_TRIAGE_MODE';

    // Realtime & Fetch Logic
    React.useEffect(() => {
        if (!profile?.id) return undefined;

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

        const timeout = setTimeout(() => {
            // Delay cleanup to avoid WebSocket 'closed before established' warning in Dev Mode
            supabase.removeChannel(channel);
        }, 200);

        return () => {
            clearTimeout(timeout);
            // Use a slight delay for cleanup to avoid WebSocket 'closed before established' in rapid re-renders
            setTimeout(() => {
                supabase.removeChannel(channel);
            }, 300);
        };
    }, [profile?.id]);

    const playerProps = React.useMemo(() => ({ score }), [score]);
    const playerStyle = React.useMemo(() => ({ width: '100%', height: '100%', objectFit: 'cover' as const, filter: isBunkerMode ? 'hue-rotate(320deg) saturate(0.8)' : 'none' }), [isBunkerMode]);
    
    // ⚖️ Legal States
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    const [legalType, setLegalType] = useState<'terms' | 'privacy' | 'disclaimer'>('terms');

    const handleLegalOpen = (type: 'terms' | 'privacy' | 'disclaimer') => {
        setLegalType(type);
        setIsLegalOpen(true);
    };

    const { t } = useTranslation();

    return (
        <div className={`relative min-h-screen w-full flex flex-col items-center justify-start font-sans text-white transition-colors duration-1000 ${isBunkerMode ? 'bg-red-950/20' : 'bg-transparent'}`}>
            
            {/* 00. LEFTSIDE: PROGRESSION BAR */}
            {/* Removed Iniciado flag as requested */}

            {/* 01. BACKGROUND ENGINE */}
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

            {/* Removed SIGIL LAYER to clean up the UI */}
            <div className="pt-8" />

            {/* 3. BENTO GRID (THE PIECES) */}
            <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-24 flex-1 flex flex-col justify-center gap-12">

                {/* 3. 3D CAROUSEL CONTAINER */}
                <div className="relative w-full flex items-center justify-center my-0 md:my-12">
                    <Carousel3D
                        isDormant={isDormant}
                        isPremium={isPremium}
                        onSelectFeature={onSelectFeature}
                        triggerUpgrade={triggerUpgrade}
                        playSound={playSound}
                    />
                </div>

                <div className="flex justify-center w-full">
                    <IntentionWidget />
                </div>

                {/* ⚖️ Legal Footer */}
                <div className="flex justify-center gap-4 text-white/30 text-[8px] tracking-widest uppercase font-sans font-medium mt-6 mb-2 z-50">
                    <button onClick={() => handleLegalOpen('terms')} className="hover:text-cyan-400 transition-colors">Términos</button>
                    <span>•</span>
                    <button onClick={() => handleLegalOpen('privacy')} className="hover:text-cyan-400 transition-colors">Privacidad</button>
                    <span>•</span>
                    <button onClick={() => handleLegalOpen('disclaimer')} className="hover:text-cyan-400 transition-colors">Disclaimer</button>
                </div>
            </main>

            <LegalView 
                isOpen={isLegalOpen} 
                onClose={() => setIsLegalOpen(false)} 
                type={legalType} 
            />

            <AnimatePresence>
                {showWelcome && <WelcomeExplainer onClose={handleCloseWelcome} />}
            </AnimatePresence>
        </div>
    );
};
