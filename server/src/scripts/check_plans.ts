import { supabase } from './lib/supabase';

async function checkProfiles() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Profiles columns:", Object.keys(data[0] || {}));
        
        // Count distinct plan_types
        const { data: plans } = await supabase.from('profiles').select('plan_type');
        const planCounts = (plans || []).reduce((acc: any, p: any) => {
            acc[p.plan_type] = (acc[p.plan_type] || 0) + 1;
            return acc;
        }, {});
        console.log("Plan distributions:", planCounts);
    }
    process.exit(0);
}

checkProfiles();
