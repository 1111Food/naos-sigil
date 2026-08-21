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
