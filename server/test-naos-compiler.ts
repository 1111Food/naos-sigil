
import { NaosCompilerService } from './src/modules/user/naosCompiler.service';

async function test() {
    const userId = "77777777-7777-7777-7777-777777777777"; // Use the test user
    console.log("🧪 Testing NaosCompilerService for user:", userId);
    try {
        const result = await NaosCompilerService.compile(userId, true);
        console.log("✅ Synthesis Keys:", Object.keys(result));
        console.log("✅ Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

test();
