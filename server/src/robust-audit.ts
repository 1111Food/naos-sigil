import { supabase } from './lib/supabase';

async function robustAudit() {
    console.log("🔍 Robust Schema Audit starting...");
    
    // Attempt to insert a dummy record with a non-existent column to see the error,
    // or use a better way to check columns.
    // In Supabase/PostgREST, we can sometimes use OPTIONS or just check a specific row if it exists.
    
    // Let's try to get ALL rows to be sure.
    const { data, error } = await supabase.from('coherence_tunings').select('*');
    if (error) {
        console.error("❌ Error fetching from coherence_tunings:", error.message);
    } else {
        console.log("✅ coherence_tunings rows found:", data.length);
        if (data.length > 0) {
            console.log("📜 Columns found:", Object.keys(data[0]));
        } else {
            console.log("⚠️ Table is empty. Attempting to reveal columns via specific select of known columns...");
            const { error: e2 } = await supabase.from('coherence_tunings').select('telegram_enabled').limit(1);
            if (e2) console.log("❌ telegram_enabled column MISSING or UNAVAILABLE:", e2.message);
            else console.log("✅ telegram_enabled column EXISTS.");

            const { error: e3 } = await supabase.from('coherence_tunings').select('is_active').limit(1);
            if (e3) console.log("❌ is_active column MISSING:", e3.message);
            else console.log("✅ is_active column EXISTS.");
        }
    }
    process.exit(0);
}

robustAudit();
