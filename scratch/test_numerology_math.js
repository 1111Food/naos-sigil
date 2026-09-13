"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NumerologyMathV1_1 = require("../shared/NumerologyMathV1");
var sumDigits = function (n) { return n.toString().split('').reduce(function (a, d) { return a + parseInt(d, 10); }, 0); };
function backendReduce(num) {
    var n = num;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
        n = sumDigits(n);
    }
    return n;
}
function frontendReduce(n) {
    if (n === 11 || n === 22 || n === 33)
        return n;
    if (n < 10)
        return n;
    var sum = sumDigits(n);
    if (sum === 11 || sum === 22 || sum === 33)
        return sum;
    return frontendReduce(sum);
}
function backendLifePath(y, m, d) {
    return backendReduce(d + m + sumDigits(y));
}
function frontendLifePath(y, m, d) {
    return frontendReduce(d + m + y);
}
console.log("--- 1. DETERMINISTIC TESTS ---");
// Life Path
var lpTests = [
    { y: 1999, m: 9, d: 9, expected: 1, desc: 'normal single digit' },
    { y: 1999, m: 11, d: 2, expected: 11, desc: 'final 11 (1999+11+2=2012->5 wait, Front: 1999(28=10=1) Back: 1+11+2=14->5 Canon: 1999+11+2 = 2012 -> 5)' },
    // Let's use known ones
];
// Let's just write tests
var runTest = function (name, act, exp) {
    console.log("".concat(act === exp ? '✅' : '❌', " ").concat(name, " (Got ").concat(act, ", Exp ").concat(exp, ")"));
};
runTest('LifePath 1900-1-9 (Master 11)', NumerologyMathV1_1.NumerologyMathV1.calculateLifePath(1900, 1, 9), 11);
runTest('LifePath 1900-1-11 (Master 4)', NumerologyMathV1_1.NumerologyMathV1.calculateLifePath(1900, 1, 11), 4);
runTest('LifePath 1986-11-23 (Master 4)', NumerologyMathV1_1.NumerologyMathV1.calculateLifePath(1986, 11, 23), 4);
runTest('Leap Day 2024-02-29', NumerologyMathV1_1.NumerologyMathV1.calculateLifePath(2024, 2, 29), 11);
// Pinnacles
var p = NumerologyMathV1_1.NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, '2020-01-01T00:00:00Z');
runTest('Current Pinnacle Index (30 yrs old, LifePath 3)', p.pinnacleIndex, 1);
var p_transition = NumerologyMathV1_1.NumerologyMathV1.getCurrentPinnacle(1990, 1, 1, '2023-01-01T00:00:00Z');
runTest('Current Pinnacle Index Transition Day (33 yrs old)', p_transition.pinnacleIndex, 2);
console.log("\n--- 2. SHADOW COMPARISON (1950 - 2010) ---");
var total = 0;
var fDiff = 0;
var bDiff = 0;
var masters = { 11: 0, 22: 0, 33: 0 };
var lpDist = {};
for (var y = 1950; y <= 2010; y++) {
    for (var m = 1; m <= 12; m++) {
        for (var d = 1; d <= 28; d++) { // Simplify days for loop
            var f = frontendLifePath(y, m, d);
            var b = backendLifePath(y, m, d);
            var v1 = NumerologyMathV1_1.NumerologyMathV1.calculateLifePath(y, m, d);
            total++;
            if (f !== v1)
                fDiff++;
            if (b !== v1)
                bDiff++;
            if (v1 === 11)
                masters[11]++;
            if (v1 === 22)
                masters[22]++;
            if (v1 === 33)
                masters[33]++;
            lpDist[v1] = (lpDist[v1] || 0) + 1;
        }
    }
}
console.log("Total Dates Tested: ".concat(total));
console.log("FRONTEND vs V1 Difference Rate: ".concat(((fDiff / total) * 100).toFixed(2), "%"));
console.log("BACKEND vs V1 Difference Rate: ".concat(((bDiff / total) * 100).toFixed(2), "%"));
console.log("Master Number Distribution: 11 (".concat(((masters[11] / total) * 100).toFixed(2), "%), 22 (").concat(((masters[22] / total) * 100).toFixed(2), "%), 33 (").concat(((masters[33] / total) * 100).toFixed(2), "%)"));
console.log("Life Path Distribution (1-9, 11, 22, 33):");
Object.keys(lpDist).sort(function (a, b) { return parseInt(a) - parseInt(b); }).forEach(function (k) {
    console.log("  ".concat(k, ": ").concat(((lpDist[parseInt(k)] / total) * 100).toFixed(2), "%"));
});
