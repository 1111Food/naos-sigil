const fs = require('fs');
const path = require('path');
const envFile = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
const url = envFile.match(/SUPABASE_URL=(.*)/)[1].trim();
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || envFile.match(/SUPABASE_ANON_KEY=(.*)/);
const key = keyMatch[1].trim();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function promote() {
    const { data, error } = await supabase.from('profiles').update({ plan_type: 'admin' }).eq('email', 'luisalfredoherreramendez@gmail.com').select();
    if (error) console.error("Error:", error);
    else console.log("Success! Profile updated to:", data);
}
promote();
