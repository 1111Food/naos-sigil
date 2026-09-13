import { NumerologyMathV1 } from '../shared/NumerologyMathV1';

const sumDigits = (n: number) => n.toString().split('').reduce((a, d) => a + parseInt(d, 10), 0);

function backendReduce(num: number) {
    let n = num;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
        n = sumDigits(n);
    }
    return n;
}

function frontendReduce(n: number): number {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n < 10) return n;
    const sum = sumDigits(n);
    if (sum === 11 || sum === 22 || sum === 33) return sum;
    return frontendReduce(sum);
}

function backendLifePath(y: number, m: number, d: number) {
    return backendReduce(d + m + sumDigits(y));
}

function frontendLifePath(y: number, m: number, d: number) {
    return frontendReduce(d + m + y);
}

console.log("--- 1. DETERMINISTIC TESTS ---");

// Life Path
const lpTests = [
    { y: 1999, m: 9, d: 9, expected: 1, desc: 'normal single digit' },
    { y: 1999, m: 11, d: 2, expected: 11, desc: 'final 11 (1999+11+2=2012->5 wait, Front: 1999(28=10=1) Back: 1+11+2=14->5 Canon: 1999+11+2 = 2012 -> 5)' },
    // Let's use known ones
];

// Let's just write tests
const runTest = (name: string, act: any, exp: any) => {
    console.log(`${act === exp ? '✅' : '❌'} ${name} (Got ${act}, Exp ${exp})`);
};

runTest('LifePath 1900-1-9 (Master 11)', NumerologyMathV1.calculateLifePath(1900, 1, 9), 11);
runTest('LifePath 1900-1-11 (Master 4)', NumerologyMathV1.calculateLifePath(1900, 1, 11), 4);
runTest('LifePath 1986-11-23 (Master 4)', NumerologyMathV1.calculateLifePath(1986, 11, 23), 4);
runTest('Leap Day 2024-02-29', NumerologyMathV1.calculateLifePath(2024, 2, 29), 11);

// Pinnacles
const p = NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, '2020-01-01T00:00:00Z');
runTest('Current Pinnacle Index (30 yrs old, LifePath 3)', p.pinnacleIndex, 1);
const p_transition = NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, '2023-01-01T00:00:00Z');
runTest('Current Pinnacle Index Transition Day (33 yrs old)', p_transition.pinnacleIndex, 2);

console.log("\n--- 2. SHADOW COMPARISON (1950 - 2010) ---");

let total = 0;
let fDiff = 0;
let bDiff = 0;
let masters = { 11: 0, 22: 0, 33: 0 };
let lpDist: Record<number, number> = {};

for (let y = 1950; y <= 2010; y++) {
    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 28; d++) { // Simplify days for loop
            const f = frontendLifePath(y, m, d);
            const b = backendLifePath(y, m, d);
            const v1 = NumerologyMathV1.calculateLifePath(y, m, d);
            
            total++;
            if (f !== v1) fDiff++;
            if (b !== v1) bDiff++;
            
            if (v1 === 11) masters[11]++;
            if (v1 === 22) masters[22]++;
            if (v1 === 33) masters[33]++;
            
            lpDist[v1] = (lpDist[v1] || 0) + 1;
        }
    }
}

console.log(`Total Dates Tested: ${total}`);
console.log(`FRONTEND vs V1 Difference Rate: ${((fDiff / total)*100).toFixed(2)}%`);
console.log(`BACKEND vs V1 Difference Rate: ${((bDiff / total)*100).toFixed(2)}%`);
console.log(`Master Number Distribution: 11 (${((masters[11]/total)*100).toFixed(2)}%), 22 (${((masters[22]/total)*100).toFixed(2)}%), 33 (${((masters[33]/total)*100).toFixed(2)}%)`);
console.log(`Life Path Distribution (1-9, 11, 22, 33):`);
Object.keys(lpDist).sort((a,b) => parseInt(a)-parseInt(b)).forEach(k => {
    console.log(`  ${k}: ${((lpDist[parseInt(k)]/total)*100).toFixed(2)}%`);
});

