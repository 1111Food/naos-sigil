import { supabase } from './lib/supabase';

async function test() {
    console.log("Inspecting schema...");

    // 1. Get rituals_history columns
    const { data: cols, error: colsErr } = await supabase
        .from('rituals_history')
        .select('*')
        .limit(1);

    console.log("\n--- rituals_history Columns ---");
    if (colsErr) {
        console.error("❌ rituals_history list failed:", colsErr.code, colsErr.message);
    } else {
        console.log("✅ rituals_history exists. Found record:", cols);
    }

    // 2. Try mock insertion into rituals_history to test RLS/Constraints
    console.log("\n--- Testing mock insert into rituals_history ---");
    const { data: ins, error: insErr } = await supabase
        .from('rituals_history')
        .insert([{
            user_id: '4f970c17-fd96-4e2a-b417-9j31e8a4daa9', // Mock UUID format or use a real user id if known
            intention: 'Test Intention',
            cards: [{ id: 1, name: 'El Loco' }],
            engine: 'ARCANOS',
            summary: 'Test summary'
        }])
        .select();

    if (insErr) {
        console.error("❌ Insert failed:", insErr.code, insErr.message);
    } else {
        console.log("✅ Insert successful:", ins);
        // Clean up
        if (ins && ins[0]?.id) {
            await supabase.from('rituals_history').delete().eq('id', ins[0].id);
        }
    }
}

test();
