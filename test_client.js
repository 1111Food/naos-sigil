const { MayaMathV1 } = require('./server/dist/modules/maya/MayaMathV1');
function clientCalc(dateString) {
    const CORRELATION_DATE = new Date('2000-01-01T12:00:00Z');
    const inputDate = new Date(dateString + 'T12:00:00Z');
    const diffTime = inputDate.getTime() - CORRELATION_DATE.getTime();
    const rawDiffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffDays = rawDiffDays - 49;
    let tone = ((8 + diffDays) % 13 + 13) % 13;
    if (tone === 0) tone = 13;
    let nawalIdx = ((0 + diffDays) % 20 + 20) % 20;
    const NAWALES = ["B'atz'", "E", "Aj", "I'x", "Tz'ikin", "Ajmaq", "No'j", "Tijax", "Kawoq", "Ajpu", "Imox", "Iq'", "Aq'ab'al", "K'at", "Kan", "Kame", "Kej", "Q'anil", "Toj", "Tz'i'"];
    return { name: NAWALES[nawalIdx], tone };
}

let mismatches = 0;
let count = 0;

function pad(n) { return n < 10 ? '0'+n : ''+n; }

for (let year = 1900; year <= 2050; year += 1) {
    const dateStr = `${year}-01-15`;
    const mathResult = MayaMathV1.calculate({ localDate: dateStr });
    const clientResult = clientCalc(dateStr);
    count++;
    if (mathResult.canonicalNawalKey !== clientResult.name || mathResult.tone !== clientResult.tone) {
        mismatches++;
        console.log('Mismatch:', dateStr, mathResult, clientResult);
    }
}
for (let month = 1; month <= 12; month++) {
    const dateStr = `2024-${pad(month)}-28`;
    const mathResult = MayaMathV1.calculate({ localDate: dateStr });
    const clientResult = clientCalc(dateStr);
    count++;
    if (mathResult.canonicalNawalKey !== clientResult.name || mathResult.tone !== clientResult.tone) {
        mismatches++;
    }
}
const dateStr = '2012-12-21';
const mathResult = MayaMathV1.calculate({ localDate: dateStr });
const clientResult = clientCalc(dateStr);
count++;
if (mathResult.canonicalNawalKey !== clientResult.name || mathResult.tone !== clientResult.tone) {
    mismatches++;
}

console.log('CLIENT_CANONICAL_PARITY_TEST_COUNT:', count);
console.log('CLIENT_CANONICAL_PARITY_MISMATCHES:', mismatches);