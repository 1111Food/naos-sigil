const fs = require('fs');

let content = fs.readFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', 'utf8');

// 1. Inject UserService import if not there
if (!content.includes("import { UserService }")) {
    content = content.replace("import { config } from '../../config/env';", "import { config } from '../../config/env';\nimport { UserService } from '../user/service';");
}

// 2. Change generateTransmission to use UserService and return archetype
content = content.replace(
    /const { data: userProfile } = await supabase[\s\S]*?if \(\!userProfile\) throw new Error\("User not found"\);/g,
    `const userProfile = await UserService.getProfile(userId);
        if (!userProfile) throw new Error("User not found");`
);

content = content.replace(
    /const name = userProfile\.nickname \|\| userProfile\.full_name \|\| 'Arquitecto';\s*const arch = userProfile\.profile_data\?\.archetype \|\| \(isEn \? 'Architect' : 'Arquitecto'\);/g,
    `const name = userProfile.nickname || userProfile.name || 'Arquitecto';
        const arch = userProfile.canonical_archetype?.nombre || (isEn ? 'Architect' : 'Arquitecto');`
);

content = content.replace(
    /static async generateTransmission.*?Promise<string> \{/g,
    `static async generateTransmission(userId: string, moment: TransmissionMoment, lang: 'es' | 'en' = 'es'): Promise<{text: string, arch: string}> {`
);

content = content.replace(
    /return text;\s*\}/g,
    `return { text, arch };\n    }`
);

// 3. Update trySendTransmission to use the object and insert traceability fields
content = content.replace(
    /const transmissionText = await this\.generateTransmission\(userId, moment, lang\);/g,
    `const { text: transmissionText, arch: archetypeUsed } = await this.generateTransmission(userId, moment, lang);`
);

content = content.replace(
    /transmission: transmissionText,\s*was_sent: true,\s*sent_at: new Date\(\)\.toISOString\(\)\s*\}, \{ onConflict: 'user_id,date,moment' \}\);/g,
    `transmission: transmissionText,
                was_sent: true,
                sent_at: new Date().toISOString(),
                archetype_used: archetypeUsed,
                delivery_channel: 'telegram',
                scheduler_runtime_version: 'v3',
                canonical_daily_context_version: 'v2_daily_context'
            }, { onConflict: 'user_id,date,moment' });`
);

fs.writeFileSync('server/src/modules/sigil/ConsciousnessEngine.ts', content);
console.log("Updated ConsciousnessEngine via regex");
