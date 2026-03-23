require('dotenv').config({ path: 'c:/Users/l_her/naos-platform/server/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testInsert() {
  try {
    console.log("Testing upsert with fields...");
    const payload = {
        id: '00000000-0000-0000-0000-000000000000',
        full_name: 'Test Setup User Full',
        email: 'test_setup@example.com',
        birth_date: '1990-01-01',
        birth_time: '12:00:00',
        birth_city: 'Guatemala',
        birth_country: 'GT',
        astrology: { sun: 'Aries' },
        numerology: { lifePathNumber: 7 },
        mayan: { tone: 1, kicheName: 'Imox' },
        nawal_maya: '1 Imox',
        chinese_animal: 'Horse',
        chinese_element: 'Metal',
        chinese_birth_year: 1990,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
    };
    
    // Try listing columns via select statement or just attempt upsert
    const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });
        
    if (error) {
        console.error("❌ Array error response:", error);
    } else {
        console.log("✅ Upsert successful layout synced.");
    }
  } catch (e) {
      console.error("❌ Crash:", e);
  }
}

testInsert();
