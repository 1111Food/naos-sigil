import { supabase } from './lib/supabase';
import fs from 'fs';

async function verifyColumns() {
    console.log("🔍 Checking columns on 'profiles' table...");
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error("🔥 Error reading profiles:", error);
        return;
    }

    if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        fs.writeFileSync('c:\\Users\\l_her\\naos-platform\\server\\columns_check.json', JSON.stringify({ columns }, null, 2));
        console.log("✅ Written to columns_check.json");
    } else {
        console.log("⚠️ No rows found in 'profiles' to fetch columns.");
    }
}

verifyColumns();
