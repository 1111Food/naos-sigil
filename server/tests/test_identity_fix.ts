
import { NaosCompilerService } from '../src/modules/user/naosCompiler.service';

async function verifyFix() {
    const testUserId = '77777777-7777-7777-7777-777777777777';
    console.log(`🧪 Starting Identity Nexus Synthesis Fix Verification for User: ${testUserId}...`);

    try {
        const synthesis = await NaosCompilerService.compile(testUserId, true);
        console.log("✅ Synthesis Generated Successfully:");
        console.log(JSON.stringify(synthesis, null, 2));

        const isValid = Object.values(synthesis).every(v => v && v.length > 20 && !v.includes("..."));
        if (isValid) {
            console.log("✨ ALL FIELDS VALID AND NON-FALLBACK.");
        } else {
            console.warn("⚠️ SOME FIELDS MAY BE FALLBACKS. Check debug_naos.log");
        }
    } catch (e: any) {
        console.error("❌ Verification Failed:", e.message);
    }
}

verifyFix();
