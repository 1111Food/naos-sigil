require('dotenv').config();
const { SigilService } = require('./server/dist/modules/sigil/service');
const { supabase } = require('./server/dist/lib/supabase');

async function test() {
    const s = new SigilService();
    // get an arbitrary profile ID
    const { data } = await supabase.from('profiles').select('id, language').limit(1).single();
    if (!data) return console.log('no user');
    
    const uid = data.id;
    const lang = data.language || 'es';
    
    console.log('--- TEST: Qué eres? ---');
    console.log(await s.processMessage(uid, '¿Qué eres?', undefined, undefined, 'maestro', false, undefined, lang));
    
    console.log('\n--- TEST: Qué sabes de mí? ---');
    console.log(await s.processMessage(uid, '¿Qué sabes de mí?', undefined, undefined, 'maestro', false, undefined, lang));
    
    console.log('\n--- TEST: ¿En qué te diferencias de un chatbot normal? ---');
    console.log(await s.processMessage(uid, '¿En qué te diferencias de un chatbot normal?', undefined, undefined, 'maestro', false, undefined, lang));
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
