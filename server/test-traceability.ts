process.env.GEMINI_API_KEY = 'mock';
import { DailyInterpreter } from './src/modules/daily/DailyInterpreter';
import { DailyContextOrchestrator } from './src/modules/daily/DailyContextOrchestrator';
import { DailyContextBuilder } from './src/modules/daily/DailyContextBuilder';
import { SignalResolver } from './src/modules/daily/SignalResolver';
import { DailyContextLayerA, DailySignal } from './src/modules/daily/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mocking Supabase
const { supabase } = require('./src/lib/supabase');
const originalFrom = supabase.from;
let dbPayload: any = null;
supabase.from = (table: string) => ({
    select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({
        maybeSingle: async () => ({ data: dbPayload ? { payload: dbPayload } : null })
    })})})}),
    upsert: async (data: any) => { dbPayload = data.payload; return { error: null }; }
});

const mockLayerA: DailyContextLayerA = {
    contextVersion: 'v2_daily_context',
    localDate: '2026-09-12',
    currentTimezoneOffset: -6,
    language: 'es',
    identity: { natalAstro: {}, natalNum: {}, natalMaya: {}, natalChinese: { animal: 'C', element: 'M' } },
    astrology: { currentPositions: [], priorityAspects: [], allAspects: [] },
    numerology: { universalYear: 1, universalMonth: 1, universalDay: 1, personalYear: 1, personalMonth: 1, personalDay: 1 },
    maya: { dailyNahual: 'E', dailyTone: 1 },
    chinese: { currentYearAnimal: 'C', currentYearElement: 'M' },
    astronomicalEvents: [],
    personalContext: { coherenceState: 'MEDIUM' },
    provenance: [
        { id: 'astro.1', system: 'astrology', engine: '', method: '', granularity: 'transit', localDate: '', calculatedAt: '', deterministic: true, inputs: {} } as DailySignal,
        { id: 'num.1', system: 'numerology', engine: '', method: '', granularity: 'day', localDate: '', calculatedAt: '', deterministic: true, inputs: {} } as DailySignal,
        { id: 'maya.1', system: 'maya', engine: '', method: '', granularity: 'day', localDate: '', calculatedAt: '', deterministic: true, inputs: {} } as DailySignal,
        { id: 'chinese.1', system: 'chinese', engine: '', method: '', granularity: 'year', localDate: '', calculatedAt: '', deterministic: true, inputs: {} } as DailySignal
    ]
};

async function runTests() {
    console.log("--- Traceability & Hardening Tests ---");
    let passed = 0, failed = 0;

    const test = async (name: string, fn: () => Promise<void>) => {
        try { await fn(); console.log(`[PASS] ${name}`); passed++; } 
        catch (e: any) { console.error(`[FAIL] ${name}: ${e.stack}`); failed++; }
    };
    const assertEqual = (a: any, b: any) => { if (a !== b) throw new Error(`Expected ${b}, got ${a}`); };
    const assertTrue = (a: any) => { if (!a) throw new Error(`Expected true`); };

    // Hack into DailyInterpreter to mock genAI
    const originalGenerate = (GoogleGenerativeAI.prototype as any).getGenerativeModel;
    let mockResponses: any[] = [];
    let callCount = 0;
    
    (GoogleGenerativeAI.prototype as any).getGenerativeModel = () => ({
        generateContent: async () => {
            if (callCount >= mockResponses.length) throw new Error("Out of mocks");
            const response = mockResponses[callCount++];
            if (response instanceof Error) throw response;
            return { response: { text: () => JSON.stringify(response) } };
        }
    });

    const getValidMock = () => ({
        interpretationVersion: 'v1', localDate: '2026-09-12', language: 'es',
        primarySignal: { title: 'T', text: 'T', signalIds: ['astro.1'] },
        integratedPattern: { convergence: true, text: 'T', signalIds: ['astro.1', 'num.1'] },
        systems: {
            astrology: { text: 'A', signalIds: ['astro.1'] },
            numerology: { text: 'N', signalIds: ['num.1'] },
            maya: { text: 'M', signalIds: ['maya.1'] },
            chinese: { text: 'C', signalIds: ['chinese.1'] }
        },
        personalResonance: '', guidance: '', reflectionQuestion: ''
    });

    await test('INTEGRATED PATTERN: fails if convergence=true but only uses 1 system', async () => {
        callCount = 0;
        const invalidMock = getValidMock();
        // Uses 2 IDs but both are from astrology (assuming astro.2 exists)
        // Wait, mockLayerA only has astro.1 and num.1, maya.1, chinese.1
        // Let's add astro.2 to mockLayerA temporarily, or just use astro.1 twice
        invalidMock.integratedPattern.signalIds = ['astro.1', 'astro.1']; 
        
        mockResponses = [invalidMock, getValidMock()];
        
        const res = await DailyInterpreter.interpret(mockLayerA);
        assertEqual(callCount, 2); // Retried and succeeded on 2nd
        assertEqual(res.interpretationStatus, 'ready');
    });

    await test('ONE RETRY: first invalid, second valid -> calls=2, status=ready', async () => {
        callCount = 0;
        const invalidMock = getValidMock();
        invalidMock.systems.astrology.signalIds = ['hallucinated_id']; // Invalid
        
        mockResponses = [invalidMock, getValidMock()];
        
        const res = await DailyInterpreter.interpret(mockLayerA);
        assertEqual(callCount, 2);
        assertEqual(res.interpretationStatus, 'ready');
    });

    await test('DOUBLE FAILURE: two invalids -> status=unavailable (fallback)', async () => {
        callCount = 0;
        const invalidMock = getValidMock();
        invalidMock.systems.astrology.signalIds = ['num.1']; // Wrong system!
        
        mockResponses = [invalidMock, invalidMock]; // Both fail validation
        
        const res = await DailyInterpreter.interpret(mockLayerA);
        assertEqual(callCount, 2);
        assertEqual(res.interpretationStatus, 'unavailable');
        assertEqual(res.primarySignal.signalIds.length, 0);
    });

    await test('FALLBACK CACHE & LAYER A REUSE: Orchestrator reuses A but retries B', async () => {
        // Setup initial state: DB has Layer A but B is unavailable
        dbPayload = {
            contextVersion: 'v2_daily_context',
            interpretationVersion: 'v1',
            layerA: mockLayerA,
            interpretation: { interpretationStatus: 'unavailable' }
        };

        // Spy on DailyContextBuilder to ensure it's NOT called
        let layerABuilt = false;
        const originalBuild = DailyContextBuilder.build;
        DailyContextBuilder.build = async () => { layerABuilt = true; return mockLayerA; };

        callCount = 0;
        mockResponses = [getValidMock()]; // Next try succeeds!

        const finalPayload = await DailyContextOrchestrator.getOrGenerate('user1', {}, -6, 'es');
        
        assertEqual(layerABuilt, false); // Reused!
        assertEqual(finalPayload.interpretation.interpretationStatus, 'ready'); // Hit Gemini and worked
        assertEqual(callCount, 1);
        
        DailyContextBuilder.build = originalBuild;
    });

    await test('SIGNAL RESOLVER: Resolves IDs properly', async () => {
        const resolved = SignalResolver.resolve(['astro.1'], mockLayerA);
        assertEqual(resolved.length, 1);
        assertEqual(resolved[0].system, 'astrology');
    });

    console.log(`Results: ${passed} passed, ${failed} failed.\n`);
    (GoogleGenerativeAI.prototype as any).getGenerativeModel = originalGenerate;
}

runTests();
