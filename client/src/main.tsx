import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProfileProvider } from './contexts/ProfileContext'
import { AuthProvider } from './contexts/AuthContext'
import { CoherenceProvider } from './context/CoherenceContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import { PerformanceProvider } from './context/PerformanceContext'

// Global Fetch Interceptor for 401 Graceful Degradation - TEMPORARILY DISABLED TO STOP REDIRECT LOOP
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <PerformanceProvider>
          <AuthProvider>
            <ProfileProvider>
              <CoherenceProvider>
                <App />
              </CoherenceProvider>
            </ProfileProvider>
          </AuthProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
