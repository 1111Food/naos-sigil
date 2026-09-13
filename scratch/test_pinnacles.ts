import { NumerologyMathV1 } from '../shared/NumerologyMathV1';

const runTest = (name: string, act: any, exp: any) => {
    console.log(`${act === exp ? '✅' : '❌'} ${name} (Got ${act}, Exp ${exp})`);
};

// Date math helper for UTC
const d = (str: string) => str;

// LifePath 3 -> p1EndAge = 36 - 3 = 33.
// Birth: 1990-01-01
// P1 ends at age 33 -> 1990 + 33 = 2023.
// Transition day = 2023-01-01

runTest('Day Before Transition', NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, d('2022-12-31T00:00:00Z')).pinnacleIndex, 1);
runTest('Exact Transition Day', NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, d('2023-01-01T00:00:00Z')).pinnacleIndex, 2);
runTest('Day After Transition', NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, d('2023-01-02T00:00:00Z')).pinnacleIndex, 2);
runTest('P2 to P3 Transition', NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, d('2032-01-01T00:00:00Z')).pinnacleIndex, 3);
runTest('P3 to P4 Transition', NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, d('2041-01-01T00:00:00Z')).pinnacleIndex, 4);

// Master Number Life Path: 11 -> reduces to 2 for duration -> 36 - 2 = 34
// Birth: 1900-01-09 -> LifePath 11.
runTest('LifePath 11 Duration (Age 33, before trans)', NumerologyMathV1.getCurrentPinnacle(1900, 1, 9, d('1933-01-09T00:00:00Z')).pinnacleIndex, 1);
runTest('LifePath 11 Duration (Age 34, exact trans)', NumerologyMathV1.getCurrentPinnacle(1900, 1, 9, d('1934-01-09T00:00:00Z')).pinnacleIndex, 2);

// Master Number Life Path: 22 -> reduces to 4 for duration -> 36 - 4 = 32
// Birth: 1900-01-11 -> LifePath 4 (Wait, 1900+1+11 = 1912 -> 13 -> 4. So it's not 22 in Frontend formula).
// Let's find a real 22 LifePath in V1 formula.
// 2000-02-18 -> 2000 + 2 + 18 = 2020 -> 4.
// 1999-11-20 -> 1999 + 11 + 20 = 2030 -> 5.
// 1985-11-15 -> 1985 + 11 + 15 = 2011 -> 4.
// Let's use canonical 1984-01-29 -> 1984 + 1 + 29 = 2014 -> 7.
// How about 1980-01-22 -> 1980 + 1 + 22 = 2003 -> 5.
// Let's brute force a 22: x = 22. 
console.log('Done.');
