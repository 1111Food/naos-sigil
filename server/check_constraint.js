
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env'});
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
    const user_id = '00000000-0000-0000-0000-000000000000';
    const { data: users } = await db.auth.admin.listUsers({perPage: 1});
    const uid = users.users[0].id;
    const { data: i } = await db.from('protocols').insert({user_id: uid, title: 'test', purpose: 'test', status: 'active'}).select().single();
    const { data: updated, error } = await db.from('protocols').update({status: 'completed'}).eq('id', i.id).select('*').single();
    console.log('Update Result completed:', updated, 'Error:', error);
    await db.from('protocols').delete().eq('id', i.id);
})();

