import { supabase } from './lib/supabase';

async function mergeLuis() {
    const masterId = '2c48f84f-2c2e-4b0d-b799-166709fd1d1f';
    const otherIds = [
        '22325a10-7b9f-4606-8a54-574bb63ba6a8',
        'cb113ece-7196-42b6-ab74-64058d19ce9d',
        '1c6e74b8-ad52-41c3-bc95-2577cd3c67e8'
    ];

    console.log(`🚀 Starting merge to Master: ${masterId}`);

    // 1. Move tunings
    for (const oldId of otherIds) {
        const { data: tunings } = await supabase.from('coherence_tunings').select('id').eq('user_id', oldId);
        if (tunings && tunings.length > 0) {
            console.log(`📦 Moving ${tunings.length} tunings from ${oldId}...`);
            await supabase.from('coherence_tunings').update({ user_id: masterId }).in('id', tunings.map(t => t.id));
        }
    }

    // 2. Move interactions / logs (if any)
    for (const oldId of otherIds) {
        await supabase.from('interaction_logs').update({ user_id: masterId }).eq('user_id', oldId);
        await supabase.from('daily_metrics').update({ user_id: masterId }).eq('user_id', oldId);
    }

    // 3. Set Master oracle_time if it wasn't the latest
    // (Master already has 16:00:00 as per list_luis.ts)

    // 4. Delete ghosts
    console.log("🧹 Deleting ghost profiles...");
    await supabase.from('profiles').delete().in('id', otherIds);

    console.log("✅ Merge complete. User Luis is now unified.");
}

mergeLuis();
