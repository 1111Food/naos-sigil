import { config } from './config/env';

async function rawTest() {
    console.log("📡 LISTANDO MODELOS...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${config.GOOGLE_API_KEY}`;


    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("--- MODELOS DISPONIBLES ---");
            data.models.forEach((m: any) => console.log(`- ${m.name}`));
            console.log("✅ FIN DE LISTA");
        } else {
            console.log("--- RESPUESTA ERROR ---");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e: any) {
        console.error("❌ ERROR:", e.message);
    }
}

rawTest();
