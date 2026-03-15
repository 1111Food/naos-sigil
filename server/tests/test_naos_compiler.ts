
import { NaosCompilerService } from '../src/modules/user/naosCompiler.service';
import { UserService } from '../src/modules/user/service';
import { config } from '../src/config/env';

async function test() {
    const userId = "09a2bc5f-7945-420b-8ebf-af19b648080a";
    console.log("🧪 Testing NAOS Compiler for user:", userId);

    try {
        const synthesis = await NaosCompilerService.compile(userId, true);
        console.log("✅ Synthesis Result:", JSON.stringify(synthesis, null, 2));
    } catch (e) {
        console.error("🔥 Synthesis Failed:", e);
    }
}

test();
