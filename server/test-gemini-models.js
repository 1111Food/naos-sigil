const fetch = require('node-fetch') || globalThis.fetch;
const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyAEQ3XD_Eis6Slg_dr4YzlTQVoJ25OXud4'; // Using the key from their .env
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log(data.models.map(m => m.name));
        } else {
            console.log(JSON.stringify(data, null, 2));
        }
    })
    .catch(console.error);
