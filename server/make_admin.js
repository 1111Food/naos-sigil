const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

async function makeAdmin() {
    const email = 'luisalfredoherreramendez@gmail.com';
    console.log(`Setting plan_type to "admin" for ${email}...`);

    const { data, error } = await supabase
        .from('profiles')
        .update({ plan_type: 'admin' })
        .eq('email', email)
        .select();

    if (error) {
        console.error("Error updating profile:", error);
    } else {
        console.log("Profile updated successfully:", data);
        if (data && data.length > 0) {
            console.log(`✅ ${email} is now an Admin.`);
        } else {
            console.log(`⚠️ No profile found for ${email}. Make sure the user is registered.`);
        }
    }
}

makeAdmin();
