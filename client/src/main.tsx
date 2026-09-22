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


if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('✨ NAOS Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.error('🔥 NAOS Service Worker registration failed:', error);
    });
  });
}

// Global Fetch Interceptor for 401 Graceful Degradation - TEMPORARILY DISABLED TO STOP REDIRECT LOOP
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  return originalFetch(...args);
};

// NORMAL APP RENDER
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <PerformanceProvider>
            <AuthProvider>
              <ProfileProvider>
                <LanguageProvider>
                  <CoherenceProvider>
                    <App />
                  </CoherenceProvider>
                </LanguageProvider>
              </ProfileProvider>
            </AuthProvider>
          </PerformanceProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)
