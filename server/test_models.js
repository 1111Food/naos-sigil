const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env', 'utf8');
const key = envContent.split('\n').find(l => l.startsWith('GOOGLE_API_KEY=')).split('=')[1].trim();

https.get(https://generativelanguage.googleapis.com/v1beta/models?key=\, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        if (json.error) {
            console.error("ERROR:", json.error.message);
        } else {
            const models = json.models.map(m => m.name);
            console.log("TOTAL MODELS:", models.length);
            console.log("Includes gemini-1.5-flash?", models.includes('models/gemini-1.5-flash'));
            console.log("Includes gemini-2.0-flash?", models.includes('models/gemini-2.0-flash'));
            console.log("Includes gemini-2.5-flash?", models.includes('models/gemini-2.5-flash'));
            
            const standardModels = models.filter(m => m.startsWith('models/gemini') && !m.includes('preview') && !m.includes('exp'));
            console.log("Standard Models:", standardModels.slice(0, 10));
        }
    });
});
