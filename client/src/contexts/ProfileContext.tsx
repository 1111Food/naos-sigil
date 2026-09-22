import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getAsyncAuthHeaders, API_BASE_URL, endpoints } from '../lib/api';
import { supabase } from '../lib/supabase';

import { useAuth } from './AuthContext';
import { AstrologyEngine } from '../lib/astrologyEngine';
import { NumerologyEngine } from '../lib/numerologyEngine';
import { MayanEngine } from '../lib/mayanEngine';
import { calculateChineseZodiac } from '../utils/chineseMapper';
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
    masterName?: string;
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
    first_revelation_seen?: boolean;
    subscription: {
        plan: 'FREE' | 'PREMIUM';
        features: string[];
    };
    plan_type?: 'free' | 'premium' | 'admin';
    naosIdentityCode?: any;
    active_sub_profile_id?: string;
    canonical_archetype?: any;
    sub_profiles?: any[];
    consciousness_level?: string;
    consciousness_points?: number;
}

export type ProfileGuardState = 
  | 'AUTH_LOADING'
  | 'PROFILE_LOADING'
  | 'PROFILE_UPDATING'
  | 'PROFILE_READY_COMPLETE'
  | 'PROFILE_READY_INCOMPLETE'
  | 'PROFILE_ERROR';

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    appReady: boolean;
    profileUpdating: boolean;
    profileError: Error | null;
    guardState: ProfileGuardState;
    updateProfile: (data: Partial<UserProfile>) => Promise<UserProfile | undefined>;
    refreshProfile: () => Promise<UserProfile | null>;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

/**
 * Utility to compute cosmic profile attributes (astrology, numerology, mayan, chinese) on the fly
 */
export const buildSubprofileCosmicData = (sub: any) => {
    if (!sub || !sub.birthDate) return sub;

    let astrology, numerology, mayan, chinese;

    try {
        const cleanTime = sub.birthTime ? sub.birthTime.substring(0, 5) : '12:00';
        const birthDateTime = new Date(`${sub.birthDate}T${cleanTime}:00`);
        
        try {
            astrology = sub.astrology || AstrologyEngine.calculateNatalChart(birthDateTime, 14.6349, -90.5069);
        } catch (e) {
            console.error("Error building astrology:", e);
        }

        try {
            const { lifePathNumber, pinaculo } = sub.numerology || NumerologyEngine.calculateFullChart(sub.birthDate);
            const nameNumber = NumerologyEngine.calculateNameNumerology(sub.name || '');
            numerology = sub.numerology || { lifePathNumber, pinaculo, nameNumber };
        } catch (e) {
            console.error("Error building numerology:", e);
        }

        try {
            mayan = sub.mayan || MayanEngine.calculateNawal(sub.birthDate);
        } catch (e) {
            console.error("Error building mayan:", e);
        }

        try {
            chinese = calculateChineseZodiac(birthDateTime.toISOString());
        } catch (e) {
            console.error("Error building chinese:", e);
        }

        return {
            ...sub,
            ...(astrology && { astrology }),
            ...(numerology && { numerology }),
            ...(mayan && { mayan }),
            nawal_maya: (mayan ? `${mayan.tone} ${mayan.kicheName}` : sub.nawal_maya),
            chinese_animal: (chinese ? chinese.animal : sub.chinese_animal),
            chinese_element: (chinese ? chinese.element : sub.chinese_element),
        };
    } catch (e) {
        console.error("Error in buildSubprofileCosmicData initialization:", e);
        return sub;
    }
};

/**
 * Utility to map Supabase snake_case profile data to our camelCase UserProfile interface.
 */
const mapProfileData = (data: any, userEmail?: string): UserProfile => {
    const rawEmail = data.email || data.profile_data?.email || userEmail || '';
    const isRoot = rawEmail?.toLowerCase().includes('luisalfredoherreramendez');
    const rootName = data.full_name || data.name || data.profile_data?.name || 'Luis Alfredo Herrera Mendez';

    const masterProfile: UserProfile = {
        ...data,
        ...(data.profile_data || {}),
        plan_type: isRoot ? 'admin' : (data.plan_type || data.profile_data?.plan_type || 'free'),
        masterName: rootName,
        name: rootName,
        nickname: data.nickname || data.profile_data?.nickname || '',
        email: data.email || userEmail,
        birthDate: data.birthDate || data.birth_date,
        birthTime: data.birthTime || data.birth_time,
        birthCity: data.birthCity || data.birth_city || data.birth_location,
        birthCountry: data.birthCountry || data.birth_country,
        // Ensure complex objects are handled
        astrology: data.astrology || data.natal_chart || undefined,
        numerology: data.numerology || undefined,
        mayan: data.mayan || undefined,
        onboarding_completed: data.onboarding_completed ?? false,
        fengShui: data.fengShui || undefined,
        naosIdentityCode: data.naosIdentityCode || data.naos_identity_code || data.profile_data?.naos_identity_code || undefined,
        canonical_archetype: data.canonical_archetype || undefined
    };

    // --- MULTI-PROFILE LAUNCH FREEZE ---
    // The active_sub_profile_id overlay has been disabled to prevent context leakage.
    // The account owner is the only effective subject.

    return masterProfile;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileUpdating, setProfileUpdating] = useState(false);
    const [profileError, setProfileError] = useState<Error | null>(null);

    const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
        if (!user) {
            setProfile(null);
            setProfileLoading(false);
            return null;
        }

        if (!profile) setProfileLoading(true);

        try {
            // console.log("🛡️ SSoT: Fetching profile for authenticated user:", user.id);
            const headers = await getAsyncAuthHeaders('GET');
            const response = await fetch(endpoints.profile, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error('Profile API failed with status: ' + response.status + ' ' + text);
            }

            const data = await response.json();
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
            setProfileError(err as Error);
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
        setProfileUpdating(true);
        setProfileError(null);

        try {
            console.log("Context: Updating Profile for User:", user.id);

            // Route update through secure backend API
            const headers = await getAsyncAuthHeaders('PUT');
            const response = await fetch(endpoints.profile, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error('API Update failed with status: ' + response.status + ' ' + text);
            }
            
            const updatedProfile = await response.json();
            
            if (updatedProfile) {
                setProfile(updatedProfile);
                
                // Clear all cached synthesis so Identity View recalculates
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('naos_identity_synthesis')) {
                        localStorage.removeItem(key);
                    }
                });
                return updatedProfile;
            }
        } catch (err) {
            console.error("Context: Update failed", err);
            setProfileError(err as Error);
            throw err;
        } finally {
            setProfileUpdating(false);
        }
    }, [user]);

    // Auto-Calibración de Timezone para soporte global
        useEffect(() => {
        if (profile && profile.onboarding_completed) {
            const currentOffset = new Date().getTimezoneOffset() / -60;
            const currentIana = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const savedOffset = profile.astrology?.timezone_offset;
            const savedIana = profile.profile_data?.timezone_iana;

            if (savedOffset !== currentOffset || savedIana !== currentIana) {
                console.log("🌌 Calibrando Timezone a:", currentIana, "offset:", currentOffset);
                updateProfile({
                    astrology: {
                        ...(profile.astrology || {}),
                        timezone_offset: currentOffset
                    },
                    profile_data: {
                        ...(profile.profile_data || {}),
                        timezone_iana: currentIana
                    }
                }).catch(err => console.error("Error calibrating timezone:", err));
            }
        }
    }, [profile, updateProfile]);

    // appReady = Auth is settled AND (either no user OR profile is settled)
    const appReady = !authLoading && (!user || !profileLoading);

    const guardState = useMemo<ProfileGuardState>(() => {
        if (authLoading) return 'AUTH_LOADING';
        if (!user) return 'PROFILE_READY_COMPLETE';
        if (profileLoading) return 'PROFILE_LOADING';
        if (profileUpdating) return 'PROFILE_UPDATING';
        if (profileError) return 'PROFILE_ERROR';
        if (!profile?.name || !profile?.birthDate) return 'PROFILE_READY_INCOMPLETE';
        return 'PROFILE_READY_COMPLETE';
    }, [authLoading, user, profileLoading, profileUpdating, profileError, profile]);

    const contextValue = useMemo(() => ({
        profile,
        loading: authLoading || profileLoading,
        appReady,
        profileUpdating,
        profileError,
        guardState,
        updateProfile,
        refreshProfile
    }), [profile, authLoading, profileLoading, appReady, profileUpdating, profileError, guardState, updateProfile, refreshProfile]);

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
