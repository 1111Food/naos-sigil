
const { NaosCompilerService } = require('./dist/modules/user/naosCompiler.service');
const { UserService } = require('./dist/modules/user/service');
const { config } = require('./dist/config/env');

async function test() {
    console.log("🧪 Testing NaosCompilerService (REAL PROFILE FLOW)...");
    const userId = "test-id-real"; // Non-existent user to test fallback safety
    try {
        const synthesis = await NaosCompilerService.compile(userId, true);
        console.log("✅ Synthesis successful:", JSON.stringify(synthesis, null, 2));
    } catch (e) {
        console.error("❌ Synthesis failed:", e);
    }
}

test();
