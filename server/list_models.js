const https = require('https');
const { config } = require('./dist/config/env.js');

const apiKey = config.GEMINI_API_KEY || config.GOOGLE_API_KEY;

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const models = JSON.parse(data).models;
    if (models) {
      console.log(models.filter(m => m.supportedGenerationMethods.includes('generateContent')).map(m => m.name));
    } else {
      console.log(data);
    }
  });
}).on('error', err => console.log('Error: ', err.message));
