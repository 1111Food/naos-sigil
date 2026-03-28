import { supabase } from './lib/supabase';

async function audit() {
    console.log("🔍 Detailed Schema Audit for coherence_tunings...");
    
    // Check coherence_tunings columns
    const { data: tuning, error: tErr } = await supabase.from('coherence_tunings').select('*').limit(1);
    if (tErr) {
        console.error("❌ coherence_tunings audit failed:", tErr.message);
    } else {
        const columns = tuning.length > 0 ? Object.keys(tuning[0]) : [];
        console.log("📜 coherence_tunings columns:", columns);
        if (columns.length === 0) {
            console.log("⚠️ Table might be empty. Fetching schema via RPC if possible or attempting a dummy insert to reveal columns...");
        }
    }

    // Check interaction_logs as well just in case
    const { data: logs, error: lErr } = await supabase.from('interaction_logs').select('*').limit(1);
    if (!lErr && logs.length > 0) {
        console.log("📜 interaction_logs columns:", Object.keys(logs[0]));
    }

    process.exit(0);
}

audit();
