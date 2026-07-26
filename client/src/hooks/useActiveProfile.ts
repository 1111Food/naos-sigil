import { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import type { UserProfile } from '../contexts/ProfileContext';

/**
 * Hook centralizado para acceder al perfil activo del usuario.
 * Sincroniza automáticamente los sub-perfiles (como Vania) con la vista activa.
 */
export function useActiveProfile() {
    const { profile, updateProfile, loading } = useProfile();
    const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Prioridad 1: Si hay perfil en contexto, evaluar si hay un sub-perfil activo
        if (profile) {
            let currentActive: UserProfile = profile;

            if (profile.active_sub_profile_id && Array.isArray(profile.sub_profiles)) {
                const selectedSub = profile.sub_profiles.find((sp: any) => sp.id === profile.active_sub_profile_id);
                if (selectedSub) {
                    currentActive = {
                        ...profile,
                        ...selectedSub,
                        id: profile.id, // Keep master user UUID for backend auth
                        sub_id: selectedSub.id,
                        name: selectedSub.name || selectedSub.full_name || profile.name,
                        birthDate: selectedSub.birthDate || selectedSub.birth_date || profile.birthDate,
                        birthTime: selectedSub.birthTime || selectedSub.birth_time || profile.birthTime,
                        birthCity: selectedSub.birthCity || selectedSub.birth_city || profile.birthCity,
                        birthCountry: selectedSub.birthCountry || selectedSub.birth_country || profile.birthCountry,
                        astrology: selectedSub.astrology || profile.astrology,
                        numerology: selectedSub.numerology || profile.numerology,
                        mayan: selectedSub.mayan || profile.mayan,
                        chinese_animal: selectedSub.chinese_animal || profile.chinese_animal,
                        chinese_element: selectedSub.chinese_element || profile.chinese_element,
                    };
                }
            }

            setActiveProfile(currentActive);
            setIsReady(true);
            return;
        }

        // Prioridad 2: Cargar de localStorage si no hay contexto
        const activeId = localStorage.getItem('naos_active_profile_id');
        const localProfile = localStorage.getItem('user_profile');

        if ((activeId === 'temp' || activeId === 'new-profile') && localProfile) {
            try {
                const parsed = JSON.parse(localProfile);
                updateProfile(parsed).then(() => {
                    setActiveProfile(parsed);
                    setIsReady(true);
                }).catch((e) => {
                    console.error('❌ useActiveProfile: Error syncing profile:', e);
                    setActiveProfile(parsed);
                    setIsReady(true);
                });
            } catch (e) {
                console.error('❌ useActiveProfile: Error parsing user_profile:', e);
                setIsReady(true);
            }
        } else {
            setIsReady(true);
        }
    }, [profile, updateProfile]);

    return {
        profile: activeProfile,
        loading: loading || !isReady
    };
}
