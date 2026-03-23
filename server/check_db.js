const fs = require('fs');
const path = require('path');
const envFile = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
const url = envFile.match(/SUPABASE_URL=(.*)/)[1].trim();
const keyMatch = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/) || envFile.match(/SUPABASE_ANON_KEY=(.*)/);
const key = keyMatch[1].trim();

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function check() {
    const { data } = await supabase.from('profiles').select('id, email, plan_type, profile_data').eq('email', 'luisalfredoherreramendez@gmail.com');
    console.log(JSON.stringify(data, null, 2));
}
check();
