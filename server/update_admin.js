const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase.from('profiles').update({plan_type: 'admin'}).eq('email', 'luisalfredoherreramendez@gmail.com').select();
    if (error) console.error(error);
    else console.log('Updated user to admin:', data);
}
run();
