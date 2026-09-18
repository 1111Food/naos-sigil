import fs from 'fs';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || "REDACTED";
const URL = "https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/list/tarot-assets";

async function list() {
    try {
        const res = await fetch(URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prefix: "", limit: 100, offset: 0 })
        });
        const data = await res.json();
        fs.writeFileSync('bucket_files.json', JSON.stringify(data, null, 2), 'utf-8');
        console.log("Success");
    } catch (e) {
        console.error("List failed:", e);
    }
}
list();
