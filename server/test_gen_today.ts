import * as dotenv from 'dotenv'; dotenv.config();
import { EnergyService } from './src/modules/energy/service';
async function test() {
    try {
        const userId = '2c48f84f-2c2e-4b0d-b799-166709fd1d1f';
        const energy = await EnergyService.getCurrentEnergy(userId, 'es');
        console.log("SUCCESS");
    } catch (e: any) {
        console.error("FAIL:", e.message);
    }
}
test();
