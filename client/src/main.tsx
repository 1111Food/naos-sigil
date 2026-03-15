import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProfileProvider } from './contexts/ProfileContext'
import { AuthProvider } from './contexts/AuthContext'
import { CoherenceProvider } from './context/CoherenceContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'

// Global Fetch Interceptor for 401 Graceful Degradation - TEMPORARILY DISABLED TO STOP REDIRECT LOOP
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  /*
  const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
  const response = await originalFetch(...args);
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('naos:401-unauthorized', { detail: { url } }));
  }
  return response;
  */
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <CoherenceProvider>
              <App />
            </CoherenceProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
