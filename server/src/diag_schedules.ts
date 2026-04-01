
import { supabase } from './lib/supabase';

async function verify() {
    const { data: profiles, error } = await supabase.from('profiles').select('id, email, oracle_time, protocol21_data, coherence_tunings');
    if (error) { console.error('DB ERROR:', error); return; }
    
    // Filter locally to find Luis
    const luis = profiles?.filter(p => 
        (p.email && p.email.includes('luisalfredo')) || 
        p.oracle_time === '17:05' || 
        p.oracle_time === '11:05' || 
        p.oracle_time === '12:00' ||
        (p.coherence_tunings && p.coherence_tunings.length > 0)
    );
    
    console.log('Matches:', luis?.length);
    if (luis && luis.length > 0) {
        const p = luis[0];
        console.log('--- USER CONFIG IN DB ---');
        console.log('Email:', p.email);
        console.log('ID:', p.id);
        console.log('Oracle Time:', p.oracle_time);
        console.log('Protocol21 Data:', p.protocol21_data);
        console.log('Sintonias Activas:', p.coherence_tunings?.length || 0);
        console.log(JSON.stringify(p.coherence_tunings, null, 2));
    }
}
verify();

