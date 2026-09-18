const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data, error } = await supabase.from('sigil_daily_transmissions').select('*').limit(1);
    console.log("Error:", error);
    console.log("Data:", data);
}
check();
