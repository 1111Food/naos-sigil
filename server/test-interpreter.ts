import { DailyInterpreter } from './src/modules/daily/DailyInterpreter';
import { DailyContextOrchestrator } from './src/modules/daily/DailyContextOrchestrator';
import { DailyContextLayerA } from './src/modules/daily/types';

// Mocking the generation to avoid real Gemini calls during tests, 
// unless we want an integration test. We'll do a mock to test concurrency.
const originalInterpret = DailyInterpreter.interpret;

async function runInterpreterTests() {
    console.log("--- DailyInterpreter & Orchestrator Tests ---");
    let passed = 0, failed = 0;

    const test = async (name: string, fn: () => Promise<void>) => {
        try {
            await fn();
            console.log(`[PASS] ${name}`);
            passed++;
        } catch (e: any) {
            console.error(`[FAIL] ${name}: ${e.stack}`);
            failed++;
        }
    };

    const assertEqual = (a: any, b: any) => {
        if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    };

    let geminiCalls = 0;

    // Mock Gemini
    DailyInterpreter.interpret = async (layerA: DailyContextLayerA) => {
        geminiCalls++;
        await new Promise(resolve => setTimeout(resolve, 50)); // simulate delay
        return {
            interpretationStatus: 'ready',
            interpretationVersion: 'v1',
            localDate: layerA.localDate,
            language: layerA.language,
            primarySignal: { title: "Title", text: "Mocked interpretation for context.", signalIds: ["test_id_1"] },
            integratedPattern: { text: "Pattern text", signalIds: ["test_id_1", "test_id_2"], convergence: true },
            systems: {
                astrology: { text: "Astro", signalIds: ["test_id_1"] },
                numerology: { text: "Num", signalIds: ["test_id_2"] },
                maya: { text: "Maya", signalIds: ["test_id_1"] },
                chinese: { text: "Chinese", signalIds: ["test_id_1"] }
            },
            personalResonance: "Resonance",
            guidance: "Guidance",
            reflectionQuestion: "Question?",
            referencedSignalIds: ["test_id_1", "test_id_2"]
        };
    };

    // Since we mock Supabase, we need to mock it too.
    const { supabase } = require('./src/lib/supabase');
    const originalFrom = supabase.from;
    
    let dbPayload: any = null;
    let dbLookups = 0;

    supabase.from = (table: string) => ({
        select: () => ({
            eq: () => ({
                eq: () => ({
                    eq: () => ({
                        maybeSingle: async () => {
                            dbLookups++;
                            return { data: dbPayload ? { payload: dbPayload } : null };
                        }
                    })
                })
            })
        }),
        upsert: async (data: any) => {
            dbPayload = data.payload;
            return { error: null };
        }
    });

    const mockProfile = {
        profile_data: { birthDate: '1990-04-12', birthLat: 0, birthLng: 0 },
        astrology: {}, numerology: {}, mayan: {}, chinese_animal: 'Caballo', chinese_element: 'Metal'
    };

    await test('concurrency test - 10 simultaneous requests trigger exactly 1 Gemini call', async () => {
        geminiCalls = 0;
        dbPayload = null;

        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(DailyContextOrchestrator.getOrGenerate('user-dedup', mockProfile, -6, 'es'));
        }

        const results = await Promise.all(promises);
        
        assertEqual(geminiCalls, 1);
        assertEqual(results.length, 10);
        assertEqual(results[0].contextVersion, 'v2_daily_context');
    });

    await test('old payload invalidation (cache miss)', async () => {
        geminiCalls = 0;
        // Simulate old payload in DB
        dbPayload = { contextVersion: 'v1_old', interpretationVersion: 'v0' };
        
        // This should ignore the cache and call Gemini
        await DailyContextOrchestrator.getOrGenerate('user-old', mockProfile, -6, 'es');
        
        assertEqual(geminiCalls, 1);
        assertEqual(dbPayload.contextVersion, 'v2_daily_context'); // UPSERT replaced it
    });

    console.log(`Results: ${passed} passed, ${failed} failed.\n`);
    
    // Restore
    DailyInterpreter.interpret = originalInterpret;
    supabase.from = originalFrom;
}

runInterpreterTests();
