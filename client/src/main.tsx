import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { ProfileProvider } from './contexts/ProfileContext'
import { AuthProvider } from './contexts/AuthContext'
import { CoherenceProvider } from './context/CoherenceContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { PerformanceProvider } from './context/PerformanceContext'
import { LanguageProvider } from './i18n';
import { queryClient } from './lib/queryClient';
import { DemoProvider } from './contexts/DemoContext';

import ReviewApp from './ReviewApp.tsx';

// --- SERVICE WORKER KILL SWITCH (FORCED UNREGISTRATION) ---
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      console.warn("🛡️ NAOS: Unregistering stale Service Worker:", registration);
      registration.unregister();
    }
  });
}

// Global Fetch Interceptor for 401 Graceful Degradation - TEMPORARILY DISABLED TO STOP REDIRECT LOOP
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  return originalFetch(...args);
};

// --- NAOS REVIEW MODE INTERCEPTOR ---
const isReviewModePath = window.location.pathname.startsWith('/review');

async function checkReviewMode() {
  if (import.meta.env.VITE_DEMO_MODE === 'true' || import.meta.env.VITE_REVIEW_MODE === 'true') {
    // Check global dynamic kill switch from server
    try {
      // Usar la ruta del endpoint que acabamos de crear (manejando posible falta de host local/prod)
      const res = await originalFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/system/demo-mode`);
      const data = await res.json();
      return data.enabled === true;
    } catch (e) {
      console.warn("NAOS Review Mode check failed:", e);
      return false; // Fail secure
    }
  }
  return false;
}

if (isReviewModePath) {
  checkReviewMode().then((isEnabled) => {
    if (isEnabled) {
      console.log("Y>? NAOS REVIEW MODE IS ACTIVE");
      createRoot(document.getElementById('root')!).render(
        <StrictMode>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <ReviewApp />
            </ErrorBoundary>
          </QueryClientProvider>
        </StrictMode>,
      );
    } else {
      console.error("⛔ NAOS REVIEW MODE IS DISABLED BY ARCHITECT (KILL SWITCH ACTIVE)");
      document.body.innerHTML = "<div style='background: black; color: red; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: monospace; text-align: center; padding: 2rem;'><h1>403 FORBIDDEN</h1><p>NAOS Review Mode is currently locked.<br/>Please ask the Architect to disable the Kill Switch.</p></div>";
    }
  });
} else {
  // NORMAL APP RENDER
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ThemeProvider>
            <PerformanceProvider>
              <DemoProvider>
                <AuthProvider>
                  <ProfileProvider>
                    <LanguageProvider>
                      <CoherenceProvider>
                        <App />
                      </CoherenceProvider>
                    </LanguageProvider>
                  </ProfileProvider>
                </AuthProvider>
              </DemoProvider>
            </PerformanceProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>,
  )
}
