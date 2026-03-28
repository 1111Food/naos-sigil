import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
  console.log('--- COHERENCE_TUNINGS SCHEMA ---');
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'coherence_tunings' });
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: cols, error: err2 } = await supabase.from('coherence_tunings').select('*').limit(1);
    if (err2) {
      console.error('Error fetching columns:', err2);
    } else if (cols && cols.length >= 0) {
      console.log('Columns found via select:', Object.keys(cols[0] || {}));
    }
  } else {
    console.log('Columns found via RPC:', data);
  }
}

check();
