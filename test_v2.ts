import { ArchetypeEngine, ElementId } from './server/src/modules/user/archetypeEngine';

const runTest = (name: string, profile: any, expectedDisplay: ElementId, expectedReason: string, expectedSecondary: ElementId | null) => {
    const result = ArchetypeEngine.calculate(profile, 'es');
    const v2 = (result as any).assignment_v2;
    const pass = v2.displayElement === expectedDisplay && 
                 v2.assignmentReason === expectedReason && 
                 v2.secondaryElement === expectedSecondary;
    
    console.log(`${pass ? '✅ PASS' : '❌ FAIL'} | ${name}`);
    if (!pass) {
        console.log(`   Expected: display=${expectedDisplay} reason=${expectedReason} sec=${expectedSecondary}`);
        console.log(`   Got     : display=${v2.displayElement} reason=${v2.assignmentReason} sec=${v2.secondaryElement}`);
        console.log(`   Scores  :`, v2.elementScores);
    }
};

console.log("--- ARCHETYPE V2 DETERMINISM TESTS ---");
runTest('Single Winner', { astrology: { sunSign: 'Aries', moonSign: 'Leo' }, mayan: { color: 'Amarillo' } }, 'fuego', 'SINGLE_WINNER', 'tierra');
runTest('Missing Color', { astrology: { sunSign: 'Tauro', moonSign: 'Virgo' }, mayan: {} }, 'tierra', 'SINGLE_WINNER', null);
runTest('Tie (Legacy Fuego)', { astrology: { sunSign: 'Aries' }, mayan: { color: 'Negro' } }, 'fuego', 'CO_DOMINANT_LEGACY_CORE_DISPLAY', null);
runTest('Tie (Legacy Tierra)', { astrology: { sunSign: 'Tauro' }, mayan: { color: 'Rojo' } }, 'tierra', 'CO_DOMINANT_LEGACY_CORE_DISPLAY', null);
