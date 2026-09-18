import fs from 'fs';

let content = fs.readFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', 'utf8');

const searchSupabase = `        // 1. Fetch user data (basic + astrology + metrics)
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('id, full_name, nickname, profile_data, astrology, language')
            .eq('id', userId)
            .single();
            
        if (!userProfile) throw new Error("User not found");
        
        const isEn = lang === 'en';
        const name = userProfile.nickname || userProfile.full_name || 'Arquitecto';
        const arch = userProfile.profile_data?.archetype || (isEn ? 'Architect' : 'Arquitecto');`;

const replaceSupabase = `        // 1. Fetch user data (using UserService for canonical archetype)
        const { UserService } = require('../user/service');
        const userProfile = await UserService.getProfile(userId);
            
        if (!userProfile) throw new Error("User not found");
        
        const isEn = lang === 'en';
        const name = userProfile.nickname || userProfile.name || 'Arquitecto';
        const arch = userProfile.canonical_archetype?.nombre || (isEn ? 'Architect' : 'Arquitecto');`;

content = content.replace(searchSupabase, replaceSupabase);
content = content.replace("import { config } from '../../config/env';", "import { config } from '../../config/env';\nimport { UserService } from '../user/service';");

fs.writeFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', content);
console.log("Updated ConsciousnessEngine to use canonical archetype");
