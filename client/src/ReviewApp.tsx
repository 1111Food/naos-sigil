import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { PerformanceProvider } from './context/PerformanceContext';
import { LanguageProvider } from './i18n';
import { CoherenceProvider } from './context/CoherenceContext';
import { DemoProvider } from './contexts/DemoContext';
import { DEMO_PROFILE } from './constants/demoProfile';
import { buildSubprofileCosmicData, UserProfile, ProfileContext } from './contexts/ProfileContext';
import { AuthContext } from './contexts/AuthContext';
import { LandingScreen } from './components/LandingScreen';
import { Home as TempleDashboard } from './pages/Home';
import { IdentityAltar } from './components/IdentityAltar';
import { ChatInterface as SigilRoom } from './components/ChatInterface';
import { TimeMap as TimeMapView } from './components/TimeMap/TimeMap';
import { Tarot as OracleInterface } from './pages/Tarot';
import { OracleSoulsView as SynastryHub } from './pages/OracleSoulsView';
import { OnboardingInitiation as FirstRevelation } from './components/OnboardingInitiation';
import { UpgradeModal as PremiumModal } from './components/UpgradeModal';
import { Sanctuary } from './pages/Sanctuary';
import { GuardianProvider } from './contexts/GuardianContext';
import { UpgradeProvider } from './contexts/UpgradeContext';
import { WisdomProvider } from './contexts/WisdomContext';
import { AtmosphereEngine } from './components/AtmosphereEngine';
import { EtherBackground } from './components/EtherBackground';
import { NaosVibrationEngine } from './components/NaosVibrationEngine';
import { Guardian } from './components/Guardian';

// --- MOCKED CONTEXTS FOR REVIEW MODE ---

const ReviewProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<UserProfile>(() => buildSubprofileCosmicData(DEMO_PROFILE));
    
    // Mock update profile to just update memory
    const updateProfile = async (data: Partial<UserProfile>) => {
        setProfile(prev => ({ ...prev, ...data }) as UserProfile);
        return { ...profile, ...data } as UserProfile;
    };

    const value = {
        profile,
        loading: false,
        appReady: true,
        updateProfile,
        refreshProfile: async () => profile
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

const ReviewAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value = {
        // We use a strictly invalid UUID for Supabase to guarantee rejection if it ever leaks
        user: { id: 'review-mode-anonymous-id', email: 'review@naosos.app' } as any,
        session: null,
        loading: false,
        signInAnonymously: async () => ({ data: {}, error: null }),
        signInWithPassword: async () => ({ data: {}, error: null }),
        signUp: async () => ({ data: {}, error: null }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ data: {}, error: null }),
        updatePassword: async () => ({ data: {}, error: null }),
        isRecoveringPassword: false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


// --- ROUTING & VIEWS ---

const ReviewIndex = () => {
    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans z-50 relative">
            <div className="max-w-2xl mx-auto mt-12">
                <img src="/logo-naos.png" alt="NAOS" className="w-32 mb-8 opacity-80" />
                <h1 className="text-2xl font-serif tracking-widest text-amber-500/80 mb-2 uppercase">Product Review</h1>
                <p className="text-white/40 mb-12 text-sm tracking-wider">Explore the architecture of the temple.</p>
                
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a href="/review/full" className="p-4 border border-cyan-900/50 bg-cyan-900/10 rounded-lg hover:bg-cyan-900/30 hover:border-cyan-500/50 transition-all text-cyan-400 text-sm tracking-widest uppercase flex items-center justify-between">
                            <span>Full Experience</span>
                            <span className="text-cyan-500/50">→</span>
                        </a>
                        <a href="/review/manifest.json" target="_blank" className="p-4 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-white/60 hover:text-white text-sm tracking-widest uppercase flex items-center justify-between">
                            <span>Manifest JSON</span>
                            <span className="text-white/30">↗</span>
                        </a>
                    </div>
                    
                    <div className="h-px bg-white/10 my-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                            { path: 'landing', label: 'Landing' },
                            { path: 'revelation', label: 'First Revelation' },
                            { path: 'temple', label: 'Temple' },
                            { path: 'identity', label: 'Identity' },
                            { path: 'sigil', label: 'Sigil' },
                            { path: 'timemap', label: 'Time Map' },
                            { path: 'synastry', label: 'Synastry' },
                            { path: 'sanctuary', label: 'Sanctuary' },
                            { path: 'oracle', label: 'Oracle' },
                            { path: 'premium', label: 'Premium' }
                        ].map(route => (
                            <a 
                                key={route.path}
                                href={`/review/${route.path}`} 
                                className="p-3 border border-white/5 bg-transparent rounded hover:bg-white/5 hover:border-white/20 transition-all text-white/50 hover:text-amber-100 text-xs tracking-[0.2em] uppercase flex items-center gap-3"
                            >
                                <span className="w-1 h-1 rounded-full bg-amber-500/30" />
                                {route.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReviewFullExperience = () => {
    // A mini-state machine to emulate the full journey
    const steps = ['landing', 'revelation', 'temple', 'identity', 'sigil', 'timemap', 'premium'];
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const handleNext = () => setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1));
    const handlePrev = () => setCurrentStepIndex(i => Math.max(0, i - 1));
    const handleRestart = () => setCurrentStepIndex(0);
    const handleResetDemo = () => {
        window.location.reload();
    };

    const currentStep = steps[currentStepIndex];

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* View Layer */}
            <div className="w-full h-full relative z-10">
                {currentStep === 'landing' && <LandingScreen onEnter={handleNext} onTemporaryAccess={handleNext} onEnterDemo={handleNext} />}
                {currentStep === 'revelation' && <FirstRevelation onComplete={handleNext} />}
                {currentStep === 'temple' && <TempleDashboard onSelectFeature={() => {}} />}
                {currentStep === 'identity' && <IdentityAltar onClose={handleNext} onNavigate={() => {}} profile={buildSubprofileCosmicData(DEMO_PROFILE)} />}
                {currentStep === 'sigil' && <SigilRoom onNavigate={() => {}} />}
                {currentStep === 'timemap' && <div className="p-8 pt-24"><TimeMapView /></div>}
                {currentStep === 'premium' && <PremiumModal isOpen={true} onClose={handlePrev} feature="sigil" />}
            </div>

            {/* Navigation Overlay */}
            <div className="fixed bottom-0 left-0 w-full p-4 flex items-center justify-between z-[9999] bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                    <button onClick={handlePrev} disabled={currentStepIndex === 0} className="px-3 py-1.5 bg-black/50 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 disabled:opacity-30 backdrop-blur-md rounded transition-colors">Prev</button>
                    <button onClick={handleNext} disabled={currentStepIndex === steps.length - 1} className="px-3 py-1.5 bg-black/50 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 disabled:opacity-30 backdrop-blur-md rounded transition-colors">Next</button>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <button onClick={handleRestart} className="hidden sm:block px-3 py-1.5 bg-black/50 border border-amber-500/30 text-amber-500/70 text-[10px] uppercase tracking-widest hover:text-amber-400 hover:bg-amber-500/10 backdrop-blur-md rounded transition-colors">Restart Experience</button>
                    <button onClick={handleResetDemo} className="hidden sm:block px-3 py-1.5 bg-black/50 border border-red-500/30 text-red-500/70 text-[10px] uppercase tracking-widest hover:text-red-400 hover:bg-red-500/10 backdrop-blur-md rounded transition-colors">Reset Demo</button>
                    <a href="/review" className="px-3 py-1.5 bg-black/50 border border-white/10 text-white/50 text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 backdrop-blur-md rounded transition-colors">Exit Review</a>
                </div>
            </div>
        </div>
    );
};

export const ReviewApp = () => {
    const path = window.location.pathname;

    // SEO NOINDEX INJECTION
    useEffect(() => {
        let meta = document.querySelector('meta[name="robots"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'robots');
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', 'noindex, nofollow');
    }, []);

    // Manifest JSON Endpoint (Dynamic Interception)
    if (path === '/review/manifest.json') {
        const manifest = {
            "screens": [
                { "id": "landing", "url": "/review/landing", "name": "Landing", "description": "NAOS entry experience" },
                { "id": "revelation", "url": "/review/revelation", "name": "First Revelation", "description": "Initial cosmic data reveal" },
                { "id": "temple", "url": "/review/temple", "name": "Temple", "description": "Main hub dashboard" },
                { "id": "identity", "url": "/review/identity", "name": "Identity Altar", "description": "Deep profile exploration" },
                { "id": "sigil", "url": "/review/sigil", "name": "Sigil", "description": "AI conversational agent" },
                { "id": "timemap", "url": "/review/timemap", "name": "Time Map", "description": "Cosmic transit visualization" },
                { "id": "synastry", "url": "/review/synastry", "name": "Synastry", "description": "Relationship compatibility" },
                { "id": "sanctuary", "url": "/review/sanctuary", "name": "Sanctuary", "description": "Meditation and breathing rituals" },
                { "id": "oracle", "url": "/review/oracle", "name": "Oracle", "description": "Tarot and I-Ching readings" },
                { "id": "premium", "url": "/review/premium", "name": "Premium", "description": "Subscription upsell modal" }
            ]
        };
        // We render it as a simple pre tag, but a real JSON endpoint would be better via Vite/server.
        // For a SPA, doing a raw document write is the closest to returning raw JSON if we can't configure the server easily.
        document.documentElement.innerHTML = `<pre style="word-wrap: break-word; white-space: pre-wrap;">${JSON.stringify(manifest, null, 2)}</pre>`;
        return null;
    }

    // Simple Router
    const route = path.replace('/review', '') || '/';
    
    let content = <ReviewIndex />;
    
    if (route === '/full') content = <ReviewFullExperience />;
    else if (route === '/landing') content = <LandingScreen onEnter={() => {}} onTemporaryAccess={() => {}} onEnterDemo={() => {}} />;
    else if (route === '/revelation') content = <FirstRevelation onComplete={() => {}} />;
    else if (route === '/temple') content = <TempleDashboard onSelectFeature={() => {}} />;
    else if (route === '/identity') content = <IdentityAltar onClose={() => {}} onNavigate={() => {}} profile={buildSubprofileCosmicData(DEMO_PROFILE)} />;
    else if (route === '/sigil') content = <SigilRoom onNavigate={() => {}} />;
    else if (route === '/timemap') content = <div className="p-8 pt-24"><TimeMapView /></div>;
    else if (route === '/synastry') content = <SynastryHub onBack={() => {}} onNavigate={() => {}} />;
    else if (route === '/sanctuary') content = <Sanctuary onBack={() => {}} />;
    else if (route === '/oracle') content = <OracleInterface onBack={() => {}} />;
    else if (route === '/premium') content = <PremiumModal isOpen={true} onClose={() => {}} feature="sigil" />;

    return (
        <LanguageProvider>
            <ThemeProvider>
                <PerformanceProvider>
                    <DemoProvider>
                        <ReviewAuthProvider>
                            <ReviewProfileProvider>
                                <CoherenceProvider>
                                    <GuardianProvider>
                                        <UpgradeProvider>
                                            <WisdomProvider>
                                                <div className="w-full h-screen bg-black overflow-hidden naos-review-mode relative text-foreground font-sans selection:bg-primary/30">
                                                    {/* Backgrounds */}
                                                    <AtmosphereEngine />
                                                    <EtherBackground />
                                                    <NaosVibrationEngine />
                                                    <Guardian view={route.replace('/', '').toUpperCase() as any} onOpenChat={() => {}} />

                                                    {/* Global Review Banner */}
                                                    <div className="fixed top-0 right-0 m-4 px-2 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-500 text-[9px] uppercase tracking-[0.3em] rounded backdrop-blur-md z-[9999] pointer-events-none font-bold">
                                                        Review Mode
                                                    </div>
                                                    
                                                    {/* Main view content */}
                                                    <div className="relative z-10 w-full h-full">
                                                        {content}
                                                    </div>
                                                </div>
                                            </WisdomProvider>
                                        </UpgradeProvider>
                                    </GuardianProvider>
                                </CoherenceProvider>
                            </ReviewProfileProvider>
                        </ReviewAuthProvider>
                    </DemoProvider>
                </PerformanceProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
};

export default ReviewApp;
