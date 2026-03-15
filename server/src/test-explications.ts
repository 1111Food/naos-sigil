import { SynastryEngine } from './modules/synastry/SynastryEngine';
import { SynastryController } from './modules/synastry/synastry.controller';

const mockUser = { id: 'test', astrology: { elements: { fire: 1, air: 1, earth: 1, water: 1 }, planets: [] }, numerology: { lifePathNumber: 7 } };
const mockPillars = { astrology: { elements: { fire: 1, air: 1, earth: 1, water: 1 }, planets: [] }, numerology: { lifePathNumber: 9 }, mayan: { nawal: 'Imox' }, chinese: { animal: 'Rata', element: 'Agua' } };

// @ts-ignore
const report = SynastryEngine.calculate(mockUser, mockPillars, 'ROMANTIC');

console.log("=== THE RESULT ===");
console.log(JSON.stringify(report, null, 2));

console.log("=== KEYS ===");
console.log(Object.keys(report));
