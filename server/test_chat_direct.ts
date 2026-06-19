import { SigilService } from './src/modules/sigil/service';

const sigilService = new SigilService();

async function runTest() {
    try {
        console.log("Testing with a random non-existent user...");
        const res = await sigilService.processMessage("11111111-1111-1111-1111-111111111111", "hola", new Date().toISOString(), null, "maestro", false, null, "es", { region: "global" });
        console.log("Success:", res);
    } catch (e) {
        console.error("Crash:", e);
    }
}
runTest();
