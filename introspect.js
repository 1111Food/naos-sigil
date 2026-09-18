const fs = require('fs');
const https = require('https');

const envFile = fs.readFileSync('server/.env', 'utf8');
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_SERVICE_ROLE_KEY = line.split('=')[1].trim();
});

const url = `${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_ROLE_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const def = json.definitions['sigil_daily_transmissions'];
        console.log(JSON.stringify(def, null, 2));
    });
}).on('error', err => console.error(err));
