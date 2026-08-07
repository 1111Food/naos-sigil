const fetch = require('node-fetch') || globalThis.fetch;
const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyAEQ3XD_Eis6Slg_dr4YzlTQVoJ25OXud4'; // Using the key from their .env
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello, this is a test." }] }]
    })
}).then(res => res.json()).then(data => {
    console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
