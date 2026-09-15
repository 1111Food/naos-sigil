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

            // --- MULTI-PROFILE LAUNCH FREEZE ---
            // The active_sub_profile_id overlay has been disabled to prevent context leakage.
            // The account owner is the only effective subject.

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
