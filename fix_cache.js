const fs = require('fs');
let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');

const searchUpdateProfile = `        const updatedProfile = await UserService.updateProfile(user.id, data);
        setProfile(updatedProfile);`;

const replaceUpdateProfile = `        const updatedProfile = await UserService.updateProfile(user.id, data);
        setProfile(updatedProfile);
        
        // Clear all cached synthesis so Identity View recalculates
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('naos_identity_synthesis')) {
                localStorage.removeItem(key);
            }
        });`;

content = content.replace(searchUpdateProfile, replaceUpdateProfile);
fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
