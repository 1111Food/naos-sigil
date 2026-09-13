require('dotenv').config({ path: 'server/.env' });
const { EnergyEngine } = require('./server/src/modules/energy/engine');

async function test() {
    try {
        const payload = {
            profile: { full_name: 'Test', birth_date: '1990-01-01', birth_time: '12:00' },
            currentDate: '2026-09-11',
            lang: 'es',
            macroContext: null,
            mesoContext: null
        };
        const res = await EnergyEngine.generate(payload);
        console.log(res);
    } catch (e) {
        console.error("CRASHED:", e);
    }
}
test();
