
import { NaosCompilerService } from './src/modules/user/naosCompiler.service';
import { UserService } from './src/modules/user/service';

async function runTest() {
    console.log("🧪 TESTING NAOS COMPILER CONSOLIDATION...");

    // Mock user profile with specific birth date
    const mockUser = {
        id: 'test-user-id',
        name: 'Luis Test',
        birthDate: '1985-05-20',
        birthTime: '15:30',
        coordinates: { lat: 14.6, lng: -90.5 },
        utcOffset: -6
    };

    try {
        // Accessing private method for testing consolidation
        const bible = await (NaosCompilerService as any).consolidateBible(mockUser);
        console.log("✅ BIBLE CONSOLIDATED:", JSON.stringify(bible, null, 2));

        if (bible.astrology && bible.astrology.sun !== 'Unknown') {
            console.log("✅ Astrology calculated correctly with birthDate.");
        } else {
            console.error("❌ Astrology failed calculation.");
        }

        if (bible.numerology && bible.numerology.lifePath !== 0) {
            console.log("✅ Numerology calculated correctly.");
        }

        console.log("\n🧪 TESTING USER SERVICE SCOPING...");
        // Ensure getProfile doesn't crash
        try {
            await UserService.getProfile('00000000-0000-0000-0000-000000000000');
            console.log("✅ UserService.getProfile executed without ReferenceError.");
        } catch (e: any) {
            console.error("❌ UserService Error:", e.message);
        }

    } catch (e: any) {
        console.error("🔥 TEST CRASHED:", e.message);
    }
}

runTest();
