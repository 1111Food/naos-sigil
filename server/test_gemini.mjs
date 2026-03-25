import fetch from 'node-fetch';

const apiKey = 'AIzaSyCXwyuNgxyhdfls-A1Lxh8ds70Rptdk6Tg';
const TARGET_MODEL = 'gemini-2.0-flash';
const API_VERSION = 'v1beta';
const GENERATE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${TARGET_MODEL}:generateContent?key=${apiKey}`;

const payload = {
    system_instruction: { parts: [{ text: 'Eres Sigil.' }] },
    contents: [{ role: 'user', parts: [{ text: 'Hola' }] }],
};

async function run() {
    try {
        const response = await fetch(GENERATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        console.log('STATUS CODE:', response.status);
        const data = await response.json();
        console.log('RESPONSE DATA:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('FETCH ERROR:', e);
    }
}
run();
