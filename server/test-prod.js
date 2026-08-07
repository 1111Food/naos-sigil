const fetch = require('node-fetch') || globalThis.fetch;

async function testPing() {
    try {
        const res = await fetch("https://naos-backend.onrender.com/api/synastry/ping");
        const text = await res.text();
        console.log("PING STATUS:", res.status);
        console.log("PING RESPONSE:", text);
    } catch (e) {
        console.error("PING ERROR:", e.message);
    }
}

async function testAnalyze() {
    try {
        const res = await fetch("https://naos-backend.onrender.com/api/synastry/analyze", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userProfile: {
                    id: '12345678-1234-1234-1234-123456789012',
                    name: "Test",
                    birthDate: "1990-01-01",
                    birthTime: "12:00",
                    birthCity: "Guatemala",
                    birthCountry: "Guatemala"
                },
                partnerData: {
                    name: "Test Partner",
                    birthDate: "1995-05-05",
                    birthCity: "Guatemala",
                    birthCountry: "Guatemala"
                },
                relationshipType: "ROMANTIC",
                language: "es"
            })
        });
        const text = await res.text();
        console.log("ANALYZE STATUS:", res.status);
        console.log("ANALYZE RESPONSE:", text.substring(0, 300));
    } catch (e) {
        console.error("ANALYZE ERROR:", e.message);
    }
}

async function run() {
    await testPing();
    await testAnalyze();
}

run();
