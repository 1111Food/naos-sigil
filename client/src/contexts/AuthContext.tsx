import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInAnonymously: () => Promise<{ data: any, error: any }>;
    signInWithPassword: (email: string, password: string) => Promise<{ data: any, error: any }>;
    signUp: (email: string, password: string) => Promise<{ data: any, error: any }>;
    signOut: () => Promise<{ error: any }>;
    resetPasswordForEmail: (email: string) => Promise<{ data: any, error: any }>;
    updatePassword: (password: string) => Promise<{ data: any, error: any }>;
    isRecoveringPassword: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

    useEffect(() => {
        // 1. Obtener sesión inicial
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        initAuth();

        // 2. Escuchar cambios de estado
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            if (session?.user) {
                // console.log("🔐 NAOS AUTH: Sesión activa detectada para:", session.user.id);
            } else {
                // console.log("🔓 NAOS AUTH: Sesión cerrada o inexistente.");
            }

            if (_event === 'PASSWORD_RECOVERY') {
                console.log("🔑 NAOS AUTH: Flujo de recuperación de llave iniciado.");
                setIsRecoveringPassword(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInAnonymously = useCallback(async () => {
        return await supabase.auth.signInAnonymously();
    }, []);

    const signInWithPassword = useCallback(async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        return await supabase.auth.signUp({ email, password });
    }, []);

    const signOut = useCallback(async () => {
        return await supabase.auth.signOut();
    }, []);

    const resetPasswordForEmail = useCallback(async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });
    }, []);

    const updatePassword = useCallback(async (password: string) => {
        const res = await supabase.auth.updateUser({ password });
        if (!res.error) {
            setIsRecoveringPassword(false);
        }
        return res;
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, signInAnonymously, signInWithPassword, signUp, signOut, resetPasswordForEmail, updatePassword, isRecoveringPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

import { useDemo } from './DemoContext';
import { DEMO_USER_ID } from '../constants/demoProfile';

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    let isDemoActive = false;
    try {
        const demoCtx = useDemo();
        isDemoActive = demoCtx.isDemoActive;
    } catch(e) {}

    if (isDemoActive) {
        return {
            user: { id: DEMO_USER_ID, email: 'demo@naosos.app' } as User,
            session: { access_token: 'demo-token', user: { id: DEMO_USER_ID } } as Session,
            loading: false,
            signInAnonymously: async () => ({ data: {}, error: null }),
            signInWithPassword: async () => ({ data: {}, error: null }),
            signUp: async () => ({ data: {}, error: null }),
            signOut: async () => { 
                // Permite salir de la demo haciendo clean de la sesión local
                const { setDemoActive } = useDemo();
                setDemoActive(false);
                return { error: null };
            },
            resetPasswordForEmail: async () => ({ data: {}, error: null }),
            updatePassword: async () => ({ data: {}, error: null }),
            isRecoveringPassword: false
        };
    }

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
