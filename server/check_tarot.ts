import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://avaikhukgugvcocwedsz.supabase.co', process.env.VITE_SUPABASE_ANON_KEY!);

async function run() {
    const { data, error } = await supabase.storage.from('tarot-assets').list();
    if (error) { console.error(error); return; }
    const matches = data.filter(f => f.name.includes('9') || f.name.includes('6') || f.name.includes('rmita') || f.name.includes('amo'));
    console.log("FILES:", matches.map(f => f.name).join(' | '));
}
run();
