import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://avaikhukgugvcocwedsz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
    console.error("No SUPABASE_ANON_KEY in env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    const { data, error } = await supabase.storage.from('tarot-assets').list();
    if (error) {
        console.error("Error listing:", error); return;
    }
    const filtered = data
        .map(f => f.name)
        .filter(n => n.includes('9') || n.includes('6') || n.toLowerCase().includes('erm') || n.toLowerCase().includes('amor'));

    console.log("Matching tarot files:\n", filtered.join('\n'));
}

main();
