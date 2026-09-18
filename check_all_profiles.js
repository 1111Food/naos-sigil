const fs = require('fs');

const envFile = fs.readFileSync('server/.env', 'utf8');
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SERVICE_ROLE_KEY = line.split('=')[1].trim();
});

const queryDb = async () => {
    const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,profile_data,astrology,numerology,mayan`;
    const res = await fetch(url, {
        headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
    });
    const profiles = await res.json();
    console.log(JSON.stringify(profiles, null, 2));
}

queryDb();
