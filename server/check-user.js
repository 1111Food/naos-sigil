const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
    // We don't know the user's ID, but we can query recent users or find Larissa's partner
    const { data, error } = await supabase
        .from('synastry_history')
        .select('user_id, partner_name')
        .eq('partner_name', 'Larissa')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const userId = data[0].user_id;
        console.log("Found User ID:", userId);
        
        const { data: profileData } = await supabase
            .from('profiles')
            .select('profile_data')
            .eq('id', userId)
            .single();
            
        console.log("User Profile Data:", JSON.stringify(profileData, null, 2));
    } else {
        console.log("Could not find a synastry record for Larissa.");
    }
}

checkUser();
