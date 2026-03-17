import fs from 'fs';
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWlraHVrZ3VndmNvY3dlZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTEyNTIsImV4cCI6MjA4MzcyNzI1Mn0.hslPEVgg-gkk3ByYvZGEwFf7B3kdwhwXQipr1D_8ruo";
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
