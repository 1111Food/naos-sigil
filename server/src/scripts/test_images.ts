async function test() {
    const urls = [
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/arcano-back.jpg',
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/back.jpg',
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/El%20Arquitecto.jpg',
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/arquetipo-0.jpg',
        'https://avaikhukgugvcocwedsz.supabase.co/storage/v1/object/public/tarot-assets/arcano-0.jpg'
    ];
    for (const url of urls) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`URL: ${url} -> STATUS: ${res.status}`);
        } catch (e) {
            console.log(`URL: ${url} -> ERROR`);
        }
    }
}
test();
