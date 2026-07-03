import { supabase } from './src/lib/supabase';

async function check() {
    const { data, error } = await supabase.from('profiles').select('email, plan_type').eq('email', 'lahm@lahm.com');
    console.log("Data for lahm@lahm.com:", data);
}
check();
