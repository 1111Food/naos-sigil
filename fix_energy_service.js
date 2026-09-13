const fs = require('fs');
let content = fs.readFileSync('server/src/modules/energy/service.ts', 'utf8');

const oldFunc = /static async getCurrentEnergy\(userId: string, lang: string = 'es'\) \{([\s\S]*?)\n    \}/g;

const newFunc = static async getCurrentEnergy(userId: string, lang: string = 'es') {
        const today = new Date().toISOString().split('T')[0];

        // 1. Check Database Persistence
        const { data: snapshot } = await supabase
            .from('user_energy_snapshots')
            .select('payload')
            .eq('user_id', userId)
            .eq('snapshot_date', today)
            .eq('language', lang)
            .maybeSingle();

        if (snapshot && snapshot.payload) {
            console.log(\⚡ EnergyService: Returning persistent energy for \\);
            return snapshot.payload;
        }

        console.log(\🚀 EnergyService: Generating new energy for \\);
        
        // 2. Fetch Profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            throw new Error('Profile not found');
        }

        // 3. Coherence: Fetch Macro Context
        const { data: macro } = await supabase
            .from('user_lifelines')
            .select('current_cycle')
            .eq('user_id', userId)
            .eq('language', lang)
            .maybeSingle();

        // 4. Coherence: Fetch Meso Context
        const { data: meso } = await supabase
            .from('user_time_maps')
            .select('months')
            .eq('user_id', userId)
            .eq('language', lang)
            .maybeSingle();

        const currentMonthData = (meso && Array.isArray(meso.months) && meso.months.length > 0) ? meso.months[0] : null;

        // 5. Generate AI
        const energyData = await EnergyEngine.generate({
            profile,
            currentDate: today,
            lang,
            macroContext: macro ? macro.current_cycle : null,
            mesoContext: currentMonthData
        });

        // 6. Save Persistence
        try {
            await supabase
                .from('user_energy_snapshots')
                .upsert({
                    user_id: userId,
                    snapshot_date: today,
                    language: lang,
                    payload: energyData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, snapshot_date, language' });
        } catch (dbErr) {
            console.warn("⚠️ EnergyService DB save warning:", dbErr);
        }

        return energyData;
    };

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('server/src/modules/energy/service.ts', content, 'utf8');
