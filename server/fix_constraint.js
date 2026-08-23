
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env'});
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
    const { error } = await db.rpc('exec_sql', { query: \
        ALTER TABLE protocols DROP CONSTRAINT IF EXISTS protocols_status_check;
        ALTER TABLE protocols ADD CONSTRAINT protocols_status_check CHECK (status IN ('active', 'completed', 'archived', 'evolved', 'abandoned'));
    \});
    console.log(error);
})();

