import { config } from './src/config/env';
import { createClient } from '@supabase/supabase-js';
// Using global fetch (Node 18+)

const supabase = createClient(config.SUPABASE_URL || '', config.SUPABASE_ANON_KEY || '');

async function testGemini() {
    console.log("💎 Testing Gemini API...");
    const apiKey = config.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("❌ Gemini API Key missing!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Respond with "PULSE_OK" if you can hear me.' }] }]
            })
        });
        const data: any = await res.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text?.includes('PULSE_OK')) {
            console.log("✅ Gemini Pulse: OK");
        } else {
            console.warn("⚠️ Gemini Response unexpected:", JSON.stringify(data).substring(0, 100));
        }
    } catch (e: any) {
        console.error("❌ Gemini Connection Failed:", e.message);
    }
}

async function testSupabase() {
    console.log("🔗 Testing Supabase Connection...");
    try {
        // Test Profiles
        const { data: profile, error: pErr } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        if (pErr) console.error("❌ Profiles Table Error:", pErr.message);
        else console.log("✅ Profiles Table: Reachable");

        // Test Interaction Logs
        const { data: logs, error: lErr } = await supabase.from('interaction_logs').select('id').limit(1).maybeSingle();
        if (lErr) console.error("❌ Interaction Logs Table Error:", lErr.message);
        else console.log("✅ Interaction Logs Table: Reachable");

        // Test Coherence Index (Known RLS issue)
        const { error: cErr } = await supabase.from('coherence_index').select('id').limit(1).maybeSingle();
        if (cErr) {
            if (cErr.code === '42501') console.error("⚠️ Coherence Index: RLS Policy Blocked (Expected for anon)");
            else console.error("❌ Coherence Index Table Error:", cErr.message);
        } else {
            console.log("✅ Coherence Index Table: Reachable");
        }
    } catch (e: any) {
        console.error("🔥 Supabase Critical Failure:", e.message);
    }
}

async function testAstrology() {
    console.log("🌌 Testing Astrology API Creds...");
    const userId = process.env.ASTROLOGY_API_USER_ID;
    const apiKey = process.env.ASTROLOGY_API_KEY;

    if (!userId || !apiKey) {
        console.warn("⚠️ Astrology API Creds missing in .env");
        return;
    }

    // Basic check using btoa as used in many astro services
    const auth = Buffer.from(`${userId}:${apiKey}`).toString('base64');
    try {
        const res = await fetch('https://json.astrologyapi.com/v1/planets', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ day: 1, month: 1, year: 2000, hour: 12, min: 0, lat: 0, lon: 0, tzone: 0 })
        });
        if (res.ok) console.log("✅ Astrology API: Authorized");
        else console.error(`❌ Astrology API: ${res.status} ${res.statusText}`);
    } catch (e: any) {
        console.error("❌ Astrology API Connection Failed:", e.message);
    }
}

async function main() {
    console.log("--- NAOS SYSTEM AUDIT ---");
    await testGemini();
    await testSupabase();
    await testAstrology();
    console.log("--- AUDIT COMPLETE ---");
}

main();
