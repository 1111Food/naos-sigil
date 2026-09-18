const fs = require('fs');

let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');

if (!content.includes('import { endpoints, getAsyncAuthHeaders }')) {
    content = content.replace("import { supabase } from '../lib/supabase';", "import { supabase } from '../lib/supabase';\nimport { endpoints, getAsyncAuthHeaders } from '../lib/api';");
}

const searchBlock = `            // Delete camelCase keys spread from frontend to prevent PostgREST 400 errors
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
                
                // Clear all cached synthesis so Identity View recalculates
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('naos_identity_synthesis')) {
                        localStorage.removeItem(key);
                    }
                });
                return newProfile;
            }
            return undefined;`;

const replaceBlock = `            // Route update through secure backend API
            const headers = await getAsyncAuthHeaders('PUT');
            const response = await fetch(endpoints.profile, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('API Update failed with status: ' + response.status);
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
            return undefined;`;

content = content.replace(searchBlock, replaceBlock);

fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
