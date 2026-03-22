import { buildApp } from './src/app';

async function run() {
    console.log("🚀 Starting Inject Test...");
    const app = await buildApp();
    const res = await app.inject({
        method: 'POST',
        url: '/api/chat',
        headers: {
            'X-Test': 'true' // bypass auth if possible, or just hit to see response type
        },
        payload: { message: "Hola" }
    });

    console.log("\n--- TEST RESPONSE ---");
    console.log("STATUS:", res.statusCode);
    console.log("HEADERS:", JSON.stringify(res.headers, null, 2));
    console.log("BODY:", res.body);
    process.exit(0);
}

run().catch(e => {
    console.error("🔥 Test Crash:", e);
    process.exit(1);
});
