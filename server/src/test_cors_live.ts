import fs from 'fs';
async function test() {
    try {
        const res = await fetch('https://naos-backend.onrender.com/api/chat', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://naos-sigil.vercel.app',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
        });
        
        const headers: Record<string, string> = {};
        res.headers.forEach((val, key) => { headers[key] = val; });
        
        fs.writeFileSync('cors_test_live.json', JSON.stringify({
            status: res.status,
            headers
        }, null, 2), 'utf-8');
        console.log("CORS live response testing done.");
    } catch (e: any) {
        fs.writeFileSync('cors_test_live.json', JSON.stringify({ error: e.message }, null, 2), 'utf-8');
    }
}
test();
