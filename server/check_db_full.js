const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); // use service role

async function check() {
    console.log("=== SIGIL DAILY TRANSMISSIONS (Last 5) ===");
    const { data: trans, error: e1 } = await supabase.from('sigil_daily_transmissions').select('*').order('created_at', { ascending: false }).limit(5);
    console.log(e1 ? e1 : JSON.stringify(trans, null, 2));

    console.log("\n=== COHERENCE TUNINGS ===");
    const { data: tunings, error: e2 } = await supabase.from('coherence_tunings').select('*');
    console.log(e2 ? e2 : JSON.stringify(tunings, null, 2));

    console.log("\n=== USERS (ADMINS) ===");
    const { data: users, error: e3 } = await supabase.from('profiles').select('id, email, full_name, nickname, role');
    console.log(e3 ? e3 : JSON.stringify(users.filter(u => u.role === 'admin' || u.role === 'OWNER'), null, 2));

    console.log("\n=== FOUNDER ID ===");
    console.log(users?.find(u => u.email === 'l_herrera@me.com' || u.email.includes('luis')));
}
check();
