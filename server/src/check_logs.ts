import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const check = async () => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name')
            .ilike('full_name', '%Luis Alfredo%')
            .maybeSingle();

        if (!profile) {
            console.log("No profile found for Luis Alfredo");
            process.exit(1);
        }

        console.log(`Found profile: ${profile.id} - ${profile.full_name}`);

        const { data: logs } = await supabase
            .from('interaction_logs')
            .select('created_at, user_message, sigil_response')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(10);

        console.log(JSON.stringify(logs, null, 2));
    } catch (e) {
        console.error("Error checking logs:", e);
    }
};

check();
