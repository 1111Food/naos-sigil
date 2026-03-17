import fs from 'fs';
async function test() {
    let out = "";
    for (let i = 0; i < 10; i++) {
        try {
            const res = await fetch('https://naos-backend.onrender.com/api/chat', {
                method: 'OPTIONS',
                headers: {
                    'Origin': 'https://naos-sigil.vercel.app',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type,Authorization'
                }
            });
            out += `Attempt ${i+1}: STATUS ${res.status}\n`;
            if (res.status === 204 || res.status === 200) {
                out += "SUCCESS\n";
                break;
            }
        } catch (e: any) {
            out += `Attempt ${i+1}: FAILED (${e.message})\n`;
        }
        await new Promise(r => setTimeout(r, 5000));
    }
    fs.writeFileSync('cors_test_live_loop.json', JSON.stringify({ log: out }, null, 2), 'utf-8');
}
test();
