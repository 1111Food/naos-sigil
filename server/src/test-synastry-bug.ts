import { FastifyRequest, FastifyReply } from 'fastify';
import { SynastryController } from './modules/synastry/synastry.controller';

const req = {
    user_id: '12345678-1234-1234-1234-123456789012',
    body: {
        language: 'es',
        userProfile: null, // Null profile to trigger the bug!
        partnerData: {
            name: 'Test Partner',
            birthDate: '1995-05-05',
            birthCity: 'Guatemala',
            birthCountry: 'Guatemala'
        },
        relationshipType: 'ROMANTIC'
    }
} as any;

const res = {
    status: (code: number) => {
        console.log(`STATUS: ${code}`);
        return res;
    },
    send: (data: any) => {
        console.log(`RESPONSE:`, data);
        return res;
    }
} as any;

async function run() {
    try {
        await SynastryController.analyze(req, res);
    } catch (err) {
        console.error("Test failed:", err);
    }
}

run();
