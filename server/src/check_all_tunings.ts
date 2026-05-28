import { supabase } from './lib/supabase';
async function run() {
    const userIds = [
        '22325a10-7b9f-4606-8a54-574bb63ba6a8',
        'cb113ece-7196-42b6-ab74-64058d19ce9d',
        '2c48f84f-2c2e-4b0d-b799-166709fd1d1f',
        '1c6e74b8-ad52-41c3-bc95-2577cd3c67e8'
    ];
    const { data: tunings, error } = await supabase.from('coherence_tunings').select('*').in('user_id', userIds);
    console.log(JSON.stringify(tunings, null, 2));
}
run();
