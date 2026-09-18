import { ChineseRelationModel } from './server/src/modules/chinese/ChineseRelationModel';

const rel = ChineseRelationModel.calculateFeatures('Caballo', 'Fuego', 1990, 'Caballo', 'Fuego', 1990);
console.log(rel);
if (rel.sameAnimal && rel.sameElement && rel.forwardAnimalOffset === 0 && rel.effectiveYearDifference === 0) {
    console.log('CHINESE_SELF_RELATION_TEST = PASS');
} else {
    console.error('FAIL');
    process.exit(1);
}
