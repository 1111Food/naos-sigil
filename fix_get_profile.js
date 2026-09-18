const fs = require('fs');
let content = fs.readFileSync('server/src/modules/user/service.ts', 'utf8');

if (!content.includes('ArchetypeEngine')) {
    content = content.replace("import { supabase } from '../../lib/supabase';", "import { supabase } from '../../lib/supabase';\nimport { ArchetypeEngine } from './archetypeEngine';");
}

const search = `                return {
                    ...defaultProfile,
                    ...baseProfile,
                    ...data,
                    protocols_completed: data.protocols_completed || 0,
                    meditation_count: meditationCount
                } as UserProfile;`;

const replacement = `                const mergedProfile = {
                    ...defaultProfile,
                    ...baseProfile,
                    ...data,
                    protocols_completed: data.protocols_completed || 0,
                    meditation_count: meditationCount
                } as any;
                
                // Dynamically attach canonical archetype so frontend can read it without duplicating logic
                try {
                    const arch = ArchetypeEngine.calculate(mergedProfile);
                    if (arch) {
                        mergedProfile.canonical_archetype = arch;
                    }
                } catch(e) {}
                
                return mergedProfile as UserProfile;`;

content = content.replace(search, replacement);

fs.writeFileSync('server/src/modules/user/service.ts', content);
