import { NaosCompilerService } from '../src/modules/user/naosCompiler.service';

async function test() {
    console.log("🧪 Testing Archetype Logic...");
    const profile = {
        name: "Test Builder",
        birthDate: "1990-05-15",
        birthTime: "12:00",
        coordinates: { lat: 14.6, lng: -90.5 }
    };

    try {
        // We use consolidateBible as a private method through any-cast for testing
        const result = await (NaosCompilerService as any).consolidateBible(profile);
        console.log("\n✅ Result calculated:");
        console.log(`Arcano: ${result.archetype?.nombre}`);
        console.log(`Frecuencia: ${result.archetype?.frecuencia}`);
        console.log(`Rol: ${result.archetype?.rol}`);
        
        console.log("\n📊 Breakdown (Desglose):");
        console.log(JSON.stringify(result.archetype?.desglose, null, 2));

        if (result.archetype?.desglose?.contribuciones?.astrologia?.length > 0) {
            console.log("\n🔥 Setup SUCCESS: Point tracking is operational.");
        } else {
            console.log("\n❌ Setup FAIL: Point tracking empty.");
        }

    } catch (err) {
        console.error("❌ Test crashed:", err);
    }
}

test();
