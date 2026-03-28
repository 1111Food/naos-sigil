import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function audit() {
  const tables = ['profiles', 'coherence_tunings', 'tarot_readings', 'rituals_history'];
  for (const table of tables) {
    console.log(`--- ${table.toUpperCase()} ---`);
    const { data: cols, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
       console.log(`Error auditing ${table}:`, error.message);
    } else {
       console.log(`Columns for ${table}:`, Object.keys(cols[0] || {}));
    }
  }
}

audit();
