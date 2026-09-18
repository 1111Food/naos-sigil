const fs = require('fs');
let content = fs.readFileSync('server/src/modules/user/service.ts', 'utf8');

const s1 = `        if (Object.keys(data).length > 0) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', userId);`;

const r1 = `        // Invalidate Identity Compiler cache when profile changes
        payload.naos_identity_code = null;
        if (payload.profile_data) {
            payload.profile_data.naos_identity_code = null;
        }

        if (Object.keys(data).length > 0) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', userId);`;

content = content.replace(s1, r1);
fs.writeFileSync('server/src/modules/user/service.ts', content);
