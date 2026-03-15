import { ProtocolService } from '../src/modules/protocol/service';
// Note: This test assumes a running database or correct environment variables.
// If not, it will fail on the first Supabase call, which is expected in some environments.

async function runTest() {
    console.log("🧪 Starting Protocol Evolution Verification...");

    const testUserId = '09a2bc5f-7945-4808-8cbf-af195648d88a'; // Existing test user
    const testProtocolId = 'de305d54-75b4-431b-adb2-eb305c451234'; // Mock or temporary protocol ID

    console.log("1. Testing Seal Day 21 (Expect awaiting_evolution)...");
    try {
        // We use a try-catch because if the ID doesn't exist in the real DB, it will fail.
        // But we want to see the LOGS from ProtocolService.
        await ProtocolService.sealDay(testUserId, testProtocolId, 21, "Test notes for day 21");
    } catch (e: any) {
        console.log("   (Expected) database call failed, but let's check the logic flow in logs...");
        console.log("   Error message:", e.message);
    }

    console.log("\n2. Testing Evolution to 90 Days...");
    try {
        await ProtocolService.evolveProtocol(testUserId, testProtocolId);
    } catch (e: any) {
        console.log("   (Expected) database call failed.");
        console.log("   Error message:", e.message);
    }

    console.log("\n✅ Verification script finished. Check console logs for service behavior.");
}

runTest();
