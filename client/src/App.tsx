import { useState, useEffect } from 'react';
import { ArrowLeft, LogOut, MapPin } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { LandingScreen } from './components/LandingScreen';
import { WelcomeBackView } from './pages/WelcomeBackView';
import { OnboardingForm } from './components/OnboardingForm';
import { Home } from './pages/Home';
import { SacredDock } from './components/SacredDock';
import { EvolutionView } from './pages/EvolutionView';
import { ManualsView } from './pages/ManualsView';
import { OracleSoulsView } from './pages/OracleSoulsView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { EtherBackground } from './components/EtherBackground';
import { IdentityAltar } from './components/IdentityAltar';
import { Guardian } from './components/Guardian';
import { GuardianProvider } from './contexts/GuardianContext';
import { OnboardingInitiation } from './components/OnboardingInitiation';

import { StatusBadge } from './components/StatusBadge';
import { DevPlanToggle } from './components/DevPlanToggle';
import { NaosVibrationEngine } from './components/NaosVibrationEngine';
import { AtmosphereEngine } from './components/AtmosphereEngine';
import { useEnergy } from './hooks/useEnergy';
import { useProfile } from './hooks/useProfile';
import { useAuth } from './contexts/AuthContext';
import { useSubscription } from './hooks/useSubscription';
import { Sanctuary } from './pages/Sanctuary';
import { AnimatePresence } from 'framer-motion';
import { TempleLoading } from './components/TempleLoading';
import { getMoonPhase } from './utils/lunar';

import { RankingView } from './pages/RankingView';
import { Protocol21 } from './pages/Protocol21';
import { ElementalLaboratoryView } from './pages/ElementalLaboratoryView';
import { Tarot } from './pages/Tarot';
import { IdentityNexus } from './pages/IdentityNexus';
import { DecisionEngine } from './pages/DecisionEngine';
import { MissionYear } from './pages/MissionYear';
import { WisdomProvider, useWisdom } from './contexts/WisdomContext';
import { WisdomOverlay } from './components/WisdomOverlay';

// Global Wisdom Wrapper to access context safely
// --- TYPES (v9.12) ---
type ViewState = 'LANDING' | 'ONBOARDING' | 'TEMPLE' | 'SYNASTRY' | 'CHAT' | 'LOGIN' | 'SANCTUARY' | 'WELCOME_BACK' | 'RANKING' | 'PROFILE' | 'EVOLUTION' | 'MANUALS' | 'TAROT' | 'PROTOCOL21' | 'ELEMENTAL_LAB' | 'ASTRO' | 'NUMERO' | 'FENGSHUI' | 'MAYA' | 'TRANSITS' | 'ORIENTAL' | 'INTENTION' | 'ENERGY_CODE' | 'ORACLE_SOULS' | 'IDENTITY_NEXUS' | 'DECISION_ENGINE' | 'MISSION_YEAR';

// Global Wisdom Wrapper to access context safely
const WisdomManager = () => {
  const { wisdom, closeWisdom } = useWisdom();
  if (!WisdomOverlay) return null; // Safety check
  return (
    <WisdomOverlay
      isOpen={wisdom.isOpen}
      onClose={closeWisdom}
      title={wisdom.title}
      description={wisdom.description}
      accentColor={wisdom.accentColor}
    />
  );
};



function App() {
  const { energy } = useEnergy();
  const { user, signOut, signInAnonymously } = useAuth();
  const { profile, appReady: profileReady, refreshProfile } = useProfile();
  const { status, upgrade } = useSubscription();

  const [activeView, setActiveView] = useState<ViewState>('LANDING');
  const [activeRitual, setActiveRitual] = useState<{ type: 'BREATH' | 'MEDITATION', techId: string } | undefined>(undefined);
  const [viewPayload, setViewPayload] = useState<any>(null);
  const [welcomeUser, setWelcomeUser] = useState<{ id: string, nickname: string } | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [headerOpacity] = useState(1);

  // 1. INITIALIZATION & PERSISTENCE CHECK
  useEffect(() => {
    const init = async () => {
      // Check Local Persistence first
      const savedUser = localStorage.getItem('naos_active_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.nickname) {
            console.log("🏺 Memoria del Templo encontrada:", parsed.nickname);
            setWelcomeUser(parsed);
            setActiveView('WELCOME_BACK');
            setStorageReady(true);
            return;
          }
        } catch (e) {
          console.warn("Storage corrupted, clearing.");
          localStorage.removeItem('naos_active_user');
        }
      }
      setStorageReady(true);
    };
    init();
  }, []);

  const isAppFullyReady = storageReady && profileReady;

  // 2. SYNC VIEW WITH AUTH
  useEffect(() => {
    if (!isAppFullyReady) return;
    
    // Only auto-redirect to TEMPLE if we are currently at LANDING 
    // and have a confirmed session + profile.
    if (activeView === 'LANDING' && user && profile?.onboarding_completed) {
      setActiveView('TEMPLE');
    }
  }, [user, profile?.onboarding_completed, isAppFullyReady, activeView]);

  // 3. SOFT GUARD: Profile Completion
  useEffect(() => {
    if (!isAppFullyReady) return;

    // Conditions: Authenticated, but missing vital data
    const isProfileIncomplete = user && profile && (!profile.name || !profile.birthDate);

    if (isProfileIncomplete && !['ONBOARDING', 'LOGIN', 'LANDING'].includes(activeView)) {
      console.log("🛡️ App Guard: Profile incomplete. Redirecting to Onboarding.");
      setActiveView('ONBOARDING');
    }
  }, [user, profile, isAppFullyReady, activeView]);


  // --- HANDLERS ---

  const handleWelcomeContinue = async () => {
    if (!welcomeUser) return;
    console.log("🔓 Abriendo Templo para:", welcomeUser.nickname);
    // Force profile refresh to ensure context is hot (even if session existed)
    await refreshProfile();
    setActiveView('TEMPLE');
  };

  const handleWelcomeReset = async () => {
    console.log("🧹 Olvidando viajero...");
    localStorage.removeItem('naos_active_user');
    setWelcomeUser(null);
    await signOut();
    setActiveView('LANDING'); // Redirigir al inicio limpio
  };

  /* Global 401 Graceful Degradation Handler - TEMPORARILY DISABLED
  useEffect(() => {
    const handle401 = async (e: Event) => {
      const event = e as CustomEvent<{url?: string}>;
      const url = event.detail?.url || '';
      
      const isCritical = url.includes('/api/auth') || url.includes('/api/profile') || url.includes('/api/onboarding');
      
      console.log(`🛡️ Interceptor: 401 Detectado en ${url}. Crítico: ${isCritical}`);
      
      if (!isCritical) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
         setUnauthorizedToast(true);
         await signOut();

         setTimeout(() => {
           setUnauthorizedToast(false);
           const savedUser = localStorage.getItem('naos_active_user');
           setActiveView(savedUser ? 'WELCOME_BACK' : 'LANDING');
         }, 3500);
      }
    };

    window.addEventListener('naos:401-unauthorized', handle401);
    return () => window.removeEventListener('naos:401-unauthorized', handle401);
  }, [signOut]);
  */

  const handleLogout = async () => {
    try {
      console.log("🔓 App: Abandonando el Templo...");
      await signOut();
      if (welcomeUser) {
        setActiveView('WELCOME_BACK');
      } else {
        setActiveView('LANDING'); // Or Login?
      }
    } catch (e) {
      console.error("Error signing out", e);
    }
  };

  const handleOnboardingComplete = (data: any) => {
    console.log(`App: Ritual Completed for ${data.name}. Entering Temple.`);
    refreshProfile();
    setActiveView('TEMPLE');
  };


  const navigateWithRitual = (view: ViewState, payload?: any) => {
    if (payload?.type && (payload.type === 'BREATH' || payload.type === 'MEDITATION')) {
      setActiveRitual({ type: payload.type, techId: payload.techId });
    }
    setViewPayload(payload);
    setActiveView(view);
  };


  const handleEnterTemplo = async () => {
    try {
      console.log("🚀 App: Iniciando ritual de acceso desde el Umbral...");
      const { error } = await signInAnonymously();
      if (error) throw error;

      // Una vez logueado, verificamos si ya existe perfil
      const freshProfile = await refreshProfile();
      if (freshProfile && freshProfile.onboarding_completed) {
        setActiveView('TEMPLE');
      } else {
        setActiveView('ONBOARDING');
      }
    } catch (err) {
      console.error("Portal Error:", err);
      alert("La red estelar está inestable. Intenta de nuevo.");
    }
  };

  // --- RENDER CONTENT ---
  const renderContent = () => {
    // Loading State (Global SSoT)
    if (!isAppFullyReady) {
      return <TempleLoading variant="fullscreen" />;
    }

    if (activeView === 'WELCOME_BACK' && welcomeUser) {
      return (
        <WelcomeBackView
          nickname={welcomeUser.nickname}
          onContinue={handleWelcomeContinue}
          onReset={handleWelcomeReset}
        />
      );
    }

    // View Routing
    switch (activeView) {
      case 'LANDING':
        return (
          <div className="relative w-full h-full">
            <LandingScreen
              onEnter={handleEnterTemplo}
              onTemporaryAccess={handleEnterTemplo}
            />
          </div>
        );
      case 'ONBOARDING':
        return <OnboardingForm onComplete={handleOnboardingComplete} />;
      case 'TEMPLE':
        return (
          <>
            <Home onSelectFeature={navigateWithRitual} />
            {profile && !profile.onboarding_completed && (
              <OnboardingInitiation onComplete={refreshProfile} />
            )}
          </>
        );

      case 'RANKING':
        return <RankingView onBack={() => setActiveView('TEMPLE')} onNavigate={setActiveView} />;

      case 'TAROT':
        return <Tarot onBack={() => setActiveView('TEMPLE')} />;
      case 'CHAT':
        return <ChatInterface />;
      case 'SANCTUARY':
        return <Sanctuary onBack={() => setActiveView('TEMPLE')} initialRitual={activeRitual} />;
      case 'PROFILE':
        return (
          <IdentityAltar
            profile={profile}
            onEdit={() => setActiveView('ONBOARDING')}
            onNavigate={navigateWithRitual}
          />
        );
      case 'IDENTITY_NEXUS':
        return <IdentityNexus onNavigate={setActiveView} onBack={() => setActiveView('TEMPLE')} />;
      case 'DECISION_ENGINE':
        return <DecisionEngine onBack={() => setActiveView('TEMPLE')} />;
      case 'MISSION_YEAR':
        return <MissionYear onBack={() => setActiveView('TEMPLE')} />;
      case 'PROTOCOL21':
        return <Protocol21 onBack={() => setActiveView('TEMPLE')} />;
      case 'ELEMENTAL_LAB':
        return <ElementalLaboratoryView onBack={() => setActiveView('TEMPLE')} onNavigate={navigateWithRitual} />;
      case 'EVOLUTION':
        return <EvolutionView onBack={() => setActiveView('TEMPLE')} />;
      case 'MANUALS':
        return <ManualsView onBack={() => setActiveView('TEMPLE')} initialManual={viewPayload?.initialManual} />;
      case 'ORACLE_SOULS':
        return <OracleSoulsView onBack={() => setActiveView('TEMPLE')} onNavigate={setActiveView} />;
      case 'SYNASTRY':
        return <OracleSoulsView onBack={() => setActiveView('TEMPLE')} onNavigate={setActiveView} />;
      default:
        return <Home onSelectFeature={(feat) => setActiveView(feat as ViewState)} activeFeature={activeView} />;
    }
  };

  // --- MAIN LAYOUT ---
  return (
    <GuardianProvider>
      <WisdomProvider>
        <div className="min-h-screen text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
          <AtmosphereEngine />
          <EtherBackground />
          <NaosVibrationEngine />
          <Guardian view={activeView} onOpenChat={() => setActiveView('CHAT')} />
          <DevPlanToggle />

          <div className="relative z-10 min-h-screen flex flex-col animate-in fade-in duration-1000">
            {/* ... header and main content ... */}
            {/* Adding WisdomManager here at the end of the root layout */}
            <WisdomManager />

            {/* HEADER (Conditional) */}
            {activeView !== 'LANDING' && activeView !== 'WELCOME_BACK' && activeView !== 'ORACLE_SOULS' && activeView !== 'IDENTITY_NEXUS' && activeView !== 'PROFILE' && (
              <header
                className="fixed top-0 left-0 right-0 pt-[calc(1rem+env(safe-area-inset-top))] px-4 md:px-6 pb-4 flex flex-col md:flex-row justify-between items-center w-full z-50 pointer-events-none transition-opacity duration-300 pointer-events-auto"
                style={{ opacity: headerOpacity }}
              >
                {/* TOP ROW: LOGO & PROFILE (Mobile) / LOGO (Desktop) */}
                <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4 mb-3 md:mb-0">
                  <div className="flex items-center gap-3">
                    {activeView !== 'TEMPLE' ? (
                      <button
                        onClick={() => setActiveView('TEMPLE')}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    )}
                    <img
                      src="/logo-naos.png?v=2"
                      alt="NAOS"
                      className="h-6 md:h-8 w-auto opacity-90 select-none pointer-events-none"
                    />
                  </div>

                  {/* USER PROFILE BUTTON (Mobile specific toggle/position) */}
                  <div className="md:hidden">
                    <button
                        onClick={() => setActiveView('ONBOARDING')}
                        className="p-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                            {profile?.name?.charAt(0) || 'U'}
                        </div>
                    </button>
                  </div>
                </div>

                {/* USER PROFILE BUTTON (Desktop View) */}
                <div className="hidden md:flex flex-1 justify-center">
                    <button
                        onClick={() => setActiveView('ONBOARDING')}
                        className="p-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                        title="Perfil de Arquitecto"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            {profile?.name?.charAt(0) || 'U'}
                        </div>
                    </button>
                </div>

                {/* RIGHT/BOTTOM ROW: LUNAR PHASE & TOOLS */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-6">
                  <StatusBadge plan={status?.plan || 'FREE'} className="hidden md:flex" />
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-0">
                    <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-white/30 font-medium whitespace-nowrap">Fase Lunar</span>
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/60">
                      {getMoonPhase().name} {getMoonPhase().emoji}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <PWAInstallButton />
                    {status?.plan === 'FREE' && (
                      <button onClick={() => upgrade()} className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 hover:text-amber-500 transition-colors">
                        Ascender
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                      title="Cerrar Sesión"
                    >
                      <LogOut size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </header>
            )}

            {/* MAIN CONTENT WRAPPER */}
            <main className={`flex-1 w-full max-w-6xl mx-auto transition-all duration-1000 ${activeView !== 'WELCOME_BACK' ? 'p-4 md:p-10 md:pl-32 pb-40 md:pb-10 pt-24 pb-safe' : ''}`}>

              {activeView === 'WELCOME_BACK' ? (
                // Full screen for Welcome
                <AnimatePresence mode="wait">
                  {renderContent()}
                </AnimatePresence>
              ) : (
                renderContent()
              )}

            </main>

            {/* DOCK */}
            {activeView !== 'LANDING' && activeView !== 'LOGIN' && activeView !== 'WELCOME_BACK' && (
              <SacredDock activeView={activeView} onNavigate={setActiveView} onLogout={handleLogout} />
            )}

            {/* FOOTER */}
            {activeView !== 'LANDING' && activeView !== 'ONBOARDING' && activeView !== 'CHAT' && activeView !== 'WELCOME_BACK' && (
              <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-40 pointer-events-none md:pl-40 pb-24 md:pb-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8 text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/40 pointer-events-auto bg-black/40 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none py-3 px-6 rounded-full border border-white/5 md:border-0 shadow-2xl md:shadow-none">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-500/80 font-medium">
                      {profile?.astrology?.planets?.find((p: any) => p.name === 'Sun')?.sign || 'Viajero'}
                    </span>
                    <div className="w-px h-2 bg-white/10" />
                    <span className="text-blue-400/80 font-bold">
                      Elemento: Agua
                    </span>
                  </div>
                  <div className="hidden md:block w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-2 max-w-[280px] md:max-w-md overflow-hidden">
                    <span className="text-emerald-400/70 flex-shrink-0">Feng Shui:</span>
                    <span className="italic truncate opacity-90" title={energy?.guidance}>
                      {energy?.guidance || 'Armonizando tu templo personal...'}
                    </span>
                  </div>
                  <div className="hidden md:block w-px h-3 bg-white/10" />
                  <div className="flex items-center gap-2 opacity-60">
                    <MapPin className="w-2.5 h-2.5 text-rose-400/50" />
                    <span>Guatemala, GT</span>
                  </div>
                </div>
              </footer>
            )}

            {/* NOTIFICACIONES Y DEGRADACIÓN */}

          </div>
        </div>
      </WisdomProvider>
    </GuardianProvider>
  );
}

// Final Export
export default App;
