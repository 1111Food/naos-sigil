const fs = require('fs');

let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');

// Fix duplicate imports
content = content.replace("import { endpoints, getAsyncAuthHeaders } from '../lib/api';\n", "");

const searchBegin = "const updateProfile = useCallback(async (data: Partial<UserProfile>) => {";
const searchEnd = "    }, [user]);";

const startIndex = content.indexOf(searchBegin);
const endIndex = content.indexOf(searchEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const originalBlock = content.substring(startIndex, endIndex + searchEnd.length);

    const newBlock = `    const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!user) return;

        try {
            console.log("Context: Updating Profile for User:", user.id);

            // DEMO BYPASS
            if (user.id === DEMO_USER_ID) {
                setProfile(prev => {
                    const baseProfile = prev || DEMO_PROFILE;
                    return { ...baseProfile, ...data } as UserProfile;
                });
                return undefined as any;
            }

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
            throw err;
        }
    }, [user]);`;

    content = content.replace(originalBlock, newBlock);
    fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
    console.log("Replaced updateProfile");
} else {
    console.log("Could not find block");
}
