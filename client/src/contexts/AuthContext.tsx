import React, { createContext, useContext, useEffect, useState } from 'react';
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
                console.log("🔐 NAOS AUTH: Sesión activa detectada para:", session.user.id);
            } else {
                console.log("🔓 NAOS AUTH: Sesión cerrada o inexistente.");
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

    const signInAnonymously = async () => {
        return await supabase.auth.signInAnonymously();
    };

    const signInWithPassword = async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async (email: string, password: string) => {
        return await supabase.auth.signUp({ email, password });
    };

    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    const resetPasswordForEmail = async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });
    };

    const updatePassword = async (password: string) => {
        const res = await supabase.auth.updateUser({ password });
        if (!res.error) {
            setIsRecoveringPassword(false);
        }
        return res;
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInAnonymously, signInWithPassword, signUp, signOut, resetPasswordForEmail, updatePassword, isRecoveringPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
