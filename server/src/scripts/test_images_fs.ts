import fs from 'fs';
async function test() {
    const urls = [
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/arquetipo-0.jpg%20%28El%20Arquitecto%29.jpg',
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/arquetipo-0.jpg%20%28El%20Estratega%29.jpg',
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/tarot-back.jpg'
    ];
    let out = "";
    for (const url of urls) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            out += `URL: ${url} -> STATUS: ${res.status}\n`;
        } catch (e) {
            out += `URL: ${url} -> ERROR\n`;
        }
    }
    fs.writeFileSync('out_images_clean3.txt', out, 'utf-8');
}
test();
