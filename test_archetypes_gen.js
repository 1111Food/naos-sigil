const fs = require('fs');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('server/.env', 'utf8');
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SERVICE_ROLE_KEY = line.split('=')[1].trim();
});

const tsCode = `
import { ArchetypeEngine } from './server/src/modules/user/archetypeEngine';

async function run() {
    const res = await fetch('${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,profile_data,astrology,numerology,mayan,chinese', {
        headers: {
            'apikey': '${SUPABASE_SERVICE_ROLE_KEY}',
            'Authorization': 'Bearer ${SUPABASE_SERVICE_ROLE_KEY}'
        }
    });
    const profiles = await res.json();
    for (const p of profiles) {
        if (!p.astrology) continue;
        const result = ArchetypeEngine.calculate(p);
        console.log(\`User: \${p.full_name} (\${p.id})\`);
        console.log(\`  Archetype: \${result.nombre}\`);
        if (result.assignment_v2) {
            console.log(\`  Reason: \${result.assignment_v2.assignmentReason}\`);
            console.log(\`  Scores: \${JSON.stringify(result.assignment_v2.elementScores)}\`);
            console.log(\`  Primary: \${result.assignment_v2.primaryElement}, Secondary: \${result.assignment_v2.secondaryElement}\`);
            console.log(\`  Co-dominant: \${result.assignment_v2.coDominantElements}\`);
            console.log(\`  Display: \${result.assignment_v2.displayElement}\`);
        }
        console.log('---');
    }
}
run();
`;

fs.writeFileSync('test_archetypes.ts', tsCode);
