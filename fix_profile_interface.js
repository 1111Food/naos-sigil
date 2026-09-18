const fs = require('fs');
let content = fs.readFileSync('client/src/contexts/ProfileContext.tsx', 'utf8');
if (!content.includes('canonical_archetype')) {
    content = content.replace('active_sub_profile_id?: string;', 'active_sub_profile_id?: string;\n    canonical_archetype?: any;');
    fs.writeFileSync('client/src/contexts/ProfileContext.tsx', content);
}
