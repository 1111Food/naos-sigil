import { supabase } from '../lib/supabase';

async function main() {
    console.log("Listing files in tarot-assets bucket...");
    const { data, error } = await supabase.storage.from('tarot-assets').list();
    if (error) {
        console.error("❌ Error listing assets:", error);
    } else {
        console.log("✅ Assets Found:", JSON.stringify(data.map(f => f.name), null, 2));
    }
}

main();
