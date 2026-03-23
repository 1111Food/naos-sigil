import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface SubProfile {
    id: string;
    name: string;
    email?: string;
    nickname?: string;
    birthDate: string;
    birthTime: string;
    birthCity?: string;
    birthCountry?: string;
    birthPlace?: string;
    birthState?: string;
    location?: { name: string };
    astrology?: any;
    numerology?: any;
    fengShui?: any;
    mayan?: any;
    nawal_maya?: string;
    nawal_tono?: number;
    chinese_animal?: string;
    chinese_element?: string;
    chinese_birth_year?: number;
    sigil_url?: string;
}

export interface UserProfile {
    id: string; // Authenticated User UUID
    name: string;
    email?: string;
    nickname?: string;
    birthDate: string;
    birthTime: string;
    birthCity?: string;
    birthCountry?: string;
    birthPlace?: string;
    birthState?: string;
    location?: { name: string };
    astrology?: any;
    numerology?: any;
    fengShui?: any;
    mayan?: any;
    nawal_maya?: string;
    nawal_tono?: number;
    chinese_animal?: string;
    chinese_element?: string;
    chinese_birth_year?: number;
    sigil_url?: string;
    active_anchor?: string | null;
    anchor_expires_at?: string | null;
    protocols_completed?: number; // New Badge Field
    last_meditation?: { type: string; date: string } | null;
    dominant_intent?: 'fitness' | 'consciousness' | 'productivity' | 'creativity' | 'none';
    onboarding_completed?: boolean;
    subscription: {
        plan: 'FREE' | 'PREMIUM';
        features: string[];
    };
    plan_type?: 'free' | 'premium' | 'admin';
    naosIdentityCode?: any;
    active_sub_profile_id?: string;
    sub_profiles?: any[];
    consciousness_level?: string;
    consciousness_points?: number;
}

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    appReady: boolean;
    updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | undefined>;
    refreshProfile: () => Promise<UserProfile | null>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

/**
 * Utility to map Supabase snake_case profile data to our camelCase UserProfile interface.
 */
const mapProfileData = (data: any, userEmail?: string): UserProfile => {
    const rawEmail = data.email || data.profile_data?.email || userEmail || '';
    const isRoot = rawEmail?.toLowerCase() === 'luisalfredoherreramendez@gmail.com';

    return {
        ...data,
        ...(data.profile_data || {}),
        plan_type: isRoot ? 'admin' : (data.plan_type || data.profile_data?.plan_type || 'free'),
        name: data.full_name || data.name || data.profile_data?.name || 'Viajero',
        nickname: data.nickname || data.profile_data?.nickname || '',
        email: data.email,
        birthDate: data.birth_date,
        birthTime: data.birth_time,
        birthCity: data.birth_city,
        birthCountry: data.birth_country,
        // Ensure complex objects are handled
        astrology: data.astrology || data.natal_chart || undefined,
        numerology: data.numerology || undefined,
        mayan: data.mayan || undefined,
        onboarding_completed: data.onboarding_completed ?? false,
        fengShui: data.fengShui || undefined,
        naosIdentityCode: data.naos_identity_code || data.profile_data?.naos_identity_code || undefined
    };
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
        if (!user) {
            setProfile(null);
            setProfileLoading(false);
            return null;
        }

        if (!profile) setProfileLoading(true); // Solo bloquear la UI si de verdad no hay perfil aún.
        try {
            console.log("🛡️ SSoT: Fetching profile for authenticated user:", user.id);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.warn("🛡️ SSoT: Supabase fetch warning:", error.message);
            }

            const newProfile = data ? mapProfileData(data, user.email) : null;
            if (newProfile) {
                // Sincronizar memoria persistente para el WelcomeBackView
                localStorage.setItem('naos_active_user', JSON.stringify({
                    id: newProfile.id,
                    nickname: newProfile.nickname || newProfile.name || 'Viajero',
                    email: newProfile.email
                }));
            }
            setProfile(newProfile);
            return newProfile;
        } catch (err) {
            console.error("🛡️ SSoT: Critical fetch error", err);
            setProfile(null);
            return null;
        } finally {
            setProfileLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && user?.id && user.id !== profile?.id) {
            refreshProfile();
        } else if (!authLoading && !user) {
            setProfile(null);
            setProfileLoading(false);
        }
    }, [user?.id, authLoading, profile?.id, refreshProfile]);

    const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!user) return;

        try {
            console.log("Context: Updating Profile for User:", user.id);

            const payload: any = {
                id: user.id,
                updated_at: new Date().toISOString(),
                ...data
            };

            // Explicitly handle complex objects and field mapping
            if (data.name) payload.full_name = data.name;
            if ((data as any).birthDate) payload.birth_date = (data as any).birthDate;
            if ((data as any).birthTime) payload.birth_time = (data as any).birthTime;
            if ((data as any).birthCity) payload.birth_city = (data as any).birthCity;
            if (data.astrology) payload.astrology = data.astrology;
            if (data.numerology) payload.numerology = data.numerology;
            if (data.mayan) payload.mayan = data.mayan;
            if (data.fengShui) payload.fengShui = data.fengShui;
            if (data.onboarding_completed !== undefined) payload.onboarding_completed = data.onboarding_completed;

            // Delete camelCase keys spread from frontend to prevent PostgREST 400 errors
            delete payload.name;
            delete payload.birthDate;
            delete payload.birthTime;
            delete payload.birthCity;
            delete payload.birthCountry;
            delete payload.birthDepartment;

            const { data: updated, error } = await supabase
                .from('profiles')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;

            if (updated) {
                const newProfile = mapProfileData(updated, user.email);
                setProfile(newProfile);
                return newProfile;
            }
        } catch (err) {
            console.error("Context: Update failed", err);
            throw err;
        }
    }, [user]);

    // Auto-Calibración de Timezone para soporte global
    useEffect(() => {
        if (profile) {
            const currentOffset = new Date().getTimezoneOffset() / -60;
            const savedOffset = profile.astrology?.timezone_offset;

            if (savedOffset !== currentOffset) {
                console.log("🛡️ Calibrando Timezone Offset a:", currentOffset);
                updateProfile({
                    astrology: {
                        ...(profile.astrology || {}),
                        timezone_offset: currentOffset
                    }
                }).catch(err => console.error("Error calibrating timezone:", err));
            }
        }
    }, [profile, updateProfile]);

    // appReady = Auth is settled AND (either no user OR profile is settled)
    const appReady = !authLoading && (!user || !profileLoading);

    const contextValue = useMemo(() => ({
        profile,
        loading: authLoading || profileLoading,
        appReady,
        updateProfile,
        refreshProfile
    }), [profile, authLoading, profileLoading, appReady, updateProfile, refreshProfile]);

    return (
        <ProfileContext.Provider value={contextValue}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) throw new Error("useProfile must be used within ProfileProvider");
    return context;
};
