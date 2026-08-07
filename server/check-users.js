const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, profile_data')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error:", error);
        return;
    }
    
    data.forEach(u => {
        console.log(`User ${u.id}: birthDate = ${u.profile_data?.birthDate}, birthTime = ${u.profile_data?.birthTime}`);
    });
}

checkUsers();
