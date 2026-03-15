
import { GroupSynastryEngine } from './src/modules/synastry/GroupSynastryEngine';

const mockTeam = [
    { name: 'Member 1', birthDate: '1990-01-01', pillars: { astrology: { elements: { fire: 3, earth: 2, air: 2, water: 3 } } } },
    { name: 'Member 2', birthDate: '1992-05-15', pillars: { astrology: { elements: { fire: 1, earth: 5, air: 2, water: 2 } } } },
    { name: 'Member 3', birthDate: '1985-11-20', pillars: { astrology: { elements: { fire: 4, earth: 1, air: 3, water: 2 } } } }
];

const mesh = GroupSynastryEngine.calculateElementalMesh(mockTeam);
console.log('--- ELEMENTAL MESH VERIFICATION ---');
console.log('Fire:', mesh.fire, '% (Expected ~26%)');
console.log('Earth:', mesh.earth, '% (Expected ~26%)');
console.log('Air:', mesh.air, '% (Expected ~23%)');
console.log('Water:', mesh.water, '% (Expected ~23%)');
console.log('Harmony Score:', mesh.score);
console.log('Voids:', mesh.voids);

if (mesh.fire > 0 && mesh.earth > 0 && mesh.air > 0 && mesh.water > 0) {
    console.log('✅ SUCCESS: Scores are non-zero.');
} else {
    console.log('❌ FAILURE: Scores are still zero or too low.');
}
