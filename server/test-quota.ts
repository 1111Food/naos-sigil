
import { config } from './src/config/env';
import fetch from 'node-fetch';

async function testKey() {
    const apiKey = config.GOOGLE_API_KEY;
    console.log(`Testing Key: ${apiKey?.substring(0, 10)}...`);

    const TARGET_MODEL = "gemini-2.0-flash";
    const API_VERSION = "v1beta";
    const GENERATE_URL = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${TARGET_MODEL}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ role: "user", parts: [{ text: "Hola, responde con una sola palabra: OK" }] }]
    };

    try {
        const response = await fetch(GENERATE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error testing key:", e);
    }
}

testKey();
