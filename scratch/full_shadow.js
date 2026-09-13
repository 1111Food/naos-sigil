const sumDigits = (n) => n.toString().split('').reduce((a, d) => a + parseInt(d, 10), 0);

function backendLifePath(y, m, d) {
    let n = d + m + sumDigits(y);
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
        n = sumDigits(n);
    }
    return n;
}

function frontendLifePath(y, m, d) {
    let n = d + m + y;
    if (n === 11 || n === 22 || n === 33) return n;
    while (n > 9) {
        n = sumDigits(n);
        if (n === 11 || n === 22 || n === 33) return n;
    }
    return n;
}

let expectedDates = 0;
let actualDates = 0;
let fDiff = 0;
let bDiff = 0;

let masterCounts = { 11: 0, 22: 0, 33: 0 };
let allCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 11: 0, 22: 0, 33: 0 };

const start = new Date(Date.UTC(1900, 0, 1));
const end = new Date(Date.UTC(2025, 11, 31)); // Full NAOS range approx
const dayMs = 24 * 60 * 60 * 1000;
const expectedTotal = Math.round((end - start) / dayMs) + 1;

for (let t = start.getTime(); t <= end.getTime(); t += dayMs) {
    const dt = new Date(t);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();

    const f = frontendLifePath(y, m, d);
    const b = backendLifePath(y, m, d);
    const v1 = f; // V1 is frontend

    if (f !== v1) fDiff++;
    if (b !== v1) bDiff++;

    allCounts[v1]++;
    if (v1 === 11) masterCounts[11]++;
    if (v1 === 22) masterCounts[22]++;
    if (v1 === 33) masterCounts[33]++;

    actualDates++;
}

console.log(`SHADOW_START_DATE: ${start.toISOString().split('T')[0]}`);
console.log(`SHADOW_END_DATE: ${end.toISOString().split('T')[0]}`);
console.log(`EXPECTED_VALID_DATES: ${expectedTotal}`);
console.log(`ACTUAL_TESTED_DATES: ${actualDates}`);

console.log(`\nFRONTEND_V1_DIFFERENCE_COUNT: ${fDiff}`);
console.log(`FRONTEND_V1_DIFFERENCE_RATE: ${((fDiff / actualDates)*100).toFixed(4)}%`);
console.log(`BACKEND_V1_DIFFERENCE_COUNT: ${bDiff}`);
console.log(`BACKEND_V1_DIFFERENCE_RATE: ${((bDiff / actualDates)*100).toFixed(4)}%`);

console.log(`\nMASTER_COUNTS: 11: ${masterCounts[11]}, 22: ${masterCounts[22]}, 33: ${masterCounts[33]}`);
console.log(`MASTER_PERCENTAGES: 11: ${((masterCounts[11]/actualDates)*100).toFixed(4)}%, 22: ${((masterCounts[22]/actualDates)*100).toFixed(4)}%, 33: ${((masterCounts[33]/actualDates)*100).toFixed(4)}%`);

console.log("\nALL COUNTS:");
for (let k in allCounts) {
    console.log(`  ${k}: ${allCounts[k]} (${((allCounts[k]/actualDates)*100).toFixed(4)}%)`);
}
