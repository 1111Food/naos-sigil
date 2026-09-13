import { supabase } from './src/lib/supabase'; async function run() { const { data, error } = await supabase.from('user_time_maps').select('*').limit(1); console.log(error || data); } run();
