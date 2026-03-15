import { supabase } from './src/lib/supabase';
import { config } from './src/config/env';

async function deepAudit() {
    console.log("--- DEEP SYSTEM AUDIT ---");

    // 1. Database Schema Check
    const tables = [
        'profiles',
        'interaction_logs',
        'coherence_index',
        'coherence_history',
        'intentions',
        'rituals',
        'meditation_sessions'
    ];

    for (const table of tables) {
        console.log(`\nChecking Table: ${table}`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`  ❌ Error ${error.code}: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`  ✅ Reachable. Columns: ${Object.keys(data[0]).join(', ')}`);
        } else {
            console.log(`  ℹ️ Reachable but empty.`);
        }
    }

    // 2. Astrology API Check
    console.log("\n--- ASTROLOGY API DEBUG ---");
    console.log(`User ID: ${config.ASTROLOGY_API_USER_ID ? 'DETECTED (' + config.ASTROLOGY_API_USER_ID.substring(0, 3) + '...)' : 'MISSING'}`);
    console.log(`API Key: ${config.ASTROLOGY_API_KEY ? 'DETECTED' : 'MISSING'}`);
    console.log(`Endpoint: ${config.ASTROLOGY_API_ENDPOINT}`);

    // Test a simple GET or POST to Astrology API
    const auth = Buffer.from(`${config.ASTROLOGY_API_USER_ID}:${config.ASTROLOGY_API_KEY}`).toString('base64');
    try {
        const res = await fetch(`${config.ASTROLOGY_API_ENDPOINT}/planets`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ day: 1, month: 1, year: 2024, hour: 0, min: 0, lat: 0, lon: 0, tzone: 0 })
        });
        const astroData = await res.json();
        console.log(`Astro Status: ${res.status}`);
        if (!res.ok) console.log(`Astro Error: ${JSON.stringify(astroData)}`);
        else console.log(`Astro Planets: ${astroData.map((p: any) => p.name).join(', ')}`);
    } catch (e: any) {
        console.error(`Astro Fetch Crash: ${e.message}`);
    }

    // 3. Sigil / Gemini Check
    console.log("\n--- SIGIL / GEMINI DEBUG ---");
    const apiKey = config.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Say "NAOS_ONLINE"' }] }]
            })
        });
        const data: any = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log(`Gemini Status: ${res.status}`);
        console.log(`Gemini Response: ${text?.trim()}`);
    } catch (e: any) {
        console.error(`Gemini Crash: ${e.message}`);
    }
}

deepAudit();
