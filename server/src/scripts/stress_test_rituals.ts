
import fetch from 'node-fetch';

const TOKEN = 'YOUR_TEST_TOKEN'; // User needs to provide this or run in env with token
const API_BASE = 'http://localhost:3001/api/tarot';
const CONCURRENT_USERS = 20;

async function simulateRitual(id: number) {
    console.log(`[User ${id}] Starting ritual save...`);
    const start = Date.now();
    try {
        const response = await fetch(`${API_BASE}/save`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intention: `Stress Test Intention ${id} - ${new Date().toISOString()}`,
                cards: [{ id: 1, name: 'The Fool' }],
                engine: 'ARCANOS',
                summary: 'Stress test summary'
            })
        });
        const duration = Date.now() - start;
        console.log(`[User ${id}] Result: ${response.status} (${duration}ms)`);
        return response.ok;
    } catch (e) {
        console.error(`[User ${id}] Failed:`, e);
        return false;
    }
}

async function runStressTest() {
    console.log(`🚀 Starting stress test for ${CONCURRENT_USERS} concurrent saves...`);
    const promises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        promises.push(simulateRitual(i));
    }
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r).length;
    console.log(`\n🏁 Test Complete: ${successCount}/${CONCURRENT_USERS} successful.`);
}

runStressTest();
