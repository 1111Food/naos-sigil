const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function checkColumns() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Profile data:", data);
        if (data && data.length > 0) {
            console.log("=== KEYS ===");
            console.log(Object.keys(data[0]).sort().join('\n'));
            console.log("============");
        } else {
            console.log("No rows returned from profiles to check keys.");
        }
    }
}

checkColumns();
