import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

async function run() {
    console.log("🚀 Testing insert on rituals_history...");
    // Grab any existing profile user Id to avoid crashing on foreign keys
    const { data: users } = await supabase.from('profiles').select('id').limit(1);
    
    if (!users || users.length === 0) {
        console.error("❌ No users found to test with.");
        return;
    }

    const userId = users[0].id;
    console.log(`👤 Using User ID: ${userId}`);

    const mockRitual = {
        user_id: userId,
        intention: 'Test Intention de Auditoría',
        cards: [{ id: 1, name: 'The Magician' }],
        engine: 'ARCANOS',
        summary: 'Test summary description de la lectura de tarot auditada.'
    };

    const { data, error } = await supabase
        .from('rituals_history')
        .insert([mockRitual])
        .select();

    if (error) {
        console.error("❌ INSERT ERROR:", error);
    } else {
        console.log("✅ SUCCESS:", data);
        
        console.log("♻️ Cleaning up test insert...");
        await supabase.from('rituals_history').delete().eq('id', data[0].id);
        console.log("✅ Cleanup done.");
    }
}

run().catch(console.error);
