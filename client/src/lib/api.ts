const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost 
    ? '' 
    : 'https://naos-backend.onrender.com');


import { supabase } from './supabase';

export const getAuthHeaders = (): Record<string, string> => {
    // Get Supabase token from localStorage (standard location for supabase-js)
    const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (supabaseKey) {
        try {
            const authData = JSON.parse(localStorage.getItem(supabaseKey) || '{}');
            if (authData?.access_token) {
                headers['Authorization'] = `Bearer ${authData.access_token}`;
            }
        } catch (e) {
            console.error("Error parsing auth token", e);
        }
    }
    return headers;
};

/**
 * Tactical Async Token Extraction
 * Ensures we have the latest session before critical calls
 */
export const getAsyncAuthHeaders = async (): Promise<Record<string, string>> => {
    let { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
        try {
            const base64Url = session.access_token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            const buffer = 30; // 30 segundos de margen
            if (payload.exp - buffer < Date.now() / 1000) {
                console.log("🔄 API: Token por expirar, refrescando sesión...");
                const { data } = await supabase.auth.refreshSession();
                if (data.session) session = data.session;
            }
        } catch (e) {
            console.error("Error validando expiración del token:", e);
        }
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log("🔑 API: Token inyectado dinámicamente.");
    } else {
        console.warn("⚠️ API: Intentando petición sin sesión activa.");
    }

    return headers;
};

export const endpoints = {
    chat: `${API_BASE_URL}/api/chat`,
    energy: `${API_BASE_URL}/api/energy`,
    profile: `${API_BASE_URL}/api/profile`,
    subscription: `${API_BASE_URL}/api/subscription`,
    upgrade: `${API_BASE_URL}/api/subscription/upgrade`,
    tarot: `${API_BASE_URL}/api/tarot`,
    astrology: `${API_BASE_URL}/api/astrology`,
    coherence: `${API_BASE_URL}/api/coherence`,
    coherenceStatus: `${API_BASE_URL}/api/coherence/status`,
    coherenceAction: `${API_BASE_URL}/api/coherence/action`,
    coherenceRank: `${API_BASE_URL}/api/coherence/rank`,
    synastry: `${API_BASE_URL}/api/synastry/analyze`,
    synastryHistory: `${API_BASE_URL}/api/synastry/history`,
    ranking: `${API_BASE_URL}/api/ranking`
};
