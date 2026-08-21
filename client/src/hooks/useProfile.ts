import { useProfile as useRealProfile } from '../contexts/ProfileContext';
import type { UserProfile } from '../contexts/ProfileContext';
import { useDemo } from '../contexts/DemoContext';
import { DEMO_PROFILE } from '../constants/demoProfile';

export const useProfile = () => {
    // Only intercept if we have the DemoContext. To avoid crashing if DemoContext is missing (e.g. outside provider), we can gracefully degrade.
    let isDemoActive = false;
    try {
        const demoCtx = useDemo();
        isDemoActive = demoCtx.isDemoActive;
    } catch(e) {
        // Not inside DemoProvider
    }

    const realProfileContext = useRealProfile();

    if (isDemoActive) {
        return {
            profile: DEMO_PROFILE,
            appReady: true,
            loading: false,
            refreshProfile: async () => {},
            updateProfile: async () => { console.warn("Demo mode: updateProfile blocked"); }
        };
    }

    return realProfileContext;
};

export type { UserProfile };
