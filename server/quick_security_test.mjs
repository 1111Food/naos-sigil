import fetch from 'node-fetch';

const apiKey = 'AIzaSyAEQ3XD_Fis6Slg_dr4YziTQVoJ25OXud4';
const GENERATE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function test() {
    console.log("Testing API Key:", apiKey.substring(0, 10) + "...");
    try {
        const response = await fetch(GENERATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: 'Hola' }] }]
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
test();
