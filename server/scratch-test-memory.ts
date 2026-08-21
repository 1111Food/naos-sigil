import { SigilService } from './src/modules/sigil/service';
import { memoryService } from './src/modules/memory/MemoryService';

async function test() {
  const sigil = new SigilService();
  const userId = '2ff17f82-f81a-4d7f-acc9-e445ea9d2b0f';
  
  console.log("1. Sending significant message to trigger memory storage...");
  const msg1 = "He decidido que a partir de mañana, todos los días a las 5 am voy a correr 5 kilómetros para mejorar mi disciplina. Es una meta inquebrantable.";
  
  console.log("Sigil Response 1:");
  console.log(await sigil.processMessage(userId, msg1));
  
  console.log("\nWait 3 seconds for async storage...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("\n2. Checking stored memories directly...");
  const memories = await memoryService.listMemories(userId, 5);
  console.log(`Found ${memories.length} memories.`);
  for (const m of memories) {
      console.log(`- [${m.memory_type}] (Importancia: ${m.importance}): ${m.content}`);
  }
  
  console.log("\n3. Sending follow-up message to trigger RAG recall...");
  const msg2 = "¿A qué hora dije que iba a salir a hacer ejercicio según mi nueva meta?";
  const resp = await sigil.processMessage(userId, msg2);
  console.log("\nSigil Response 2:");
  console.log(resp);
}

test().catch(console.error).finally(() => process.exit(0));
