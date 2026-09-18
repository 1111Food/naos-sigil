const fs = require('fs');

let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');

const search = `            const { data: updated, error } = await supabase
                .from('profiles')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;`;

const replacement = `            const { getAsyncAuthHeaders, API_BASE_URL } = require('../lib/api');
            const headers = await getAsyncAuthHeaders('PUT');
            const response = await fetch(\`\${API_BASE_URL || ''}/api/profile\`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to update profile');
            }

            const updated = await response.json();`;

content = content.replace(search, replacement);

fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
