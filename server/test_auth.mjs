import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avaikhukgugvcocwedsz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2YWlraHVrZ3VndmNvY3dlZHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTEyNTIsImV4cCI6MjA4MzcyNzI1Mn0.hslPEVgg-gkk3ByYvZGEwFf7B3kdwhwXQipr1D_8ruo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPost() {
    console.log("Logging in...");
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'luisalfredoherreramendez@gmail.com',
        // Assuming we can't test this script without pw, testing anonymous instead:
    });

    if(authErr) {
       console.log("Trying anon login...");
       const { data: anonData } = await supabase.auth.signInAnonymously();
       
       console.log("Anon login OK. Token:", anonData?.session?.access_token?.substring(0, 20) + "...");
       
       const res = await fetch('http://localhost:3001/api/user/profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${anonData?.session?.access_token}`
            },
            body: JSON.stringify({
                name: "Test Sub Profile",
                birthDate: "1990-01-01",
                birthTime: "12:00",
                birthCity: "Guatemala",
                birthDepartment: "Guatemala",
                birthCountry: "Guatemala"
            })
       });

       console.log("Status:", res.status);
       const text = await res.text();
       console.log("Response:", text);
    }
}

testPost();
