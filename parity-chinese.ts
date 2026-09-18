import { calculateChineseZodiac } from './client/src/utils/chineseMapper';
import { ChineseMathV1 } from './server/src/modules/chinese/ChineseMathV1';

const years = [];
for (let y = 1900; y <= 2050; y += 1) { // 151 years
    years.push(y);
}
// Include pre-1900 to ensure safety coverage
years.push(1860, 1864, 1899);

const boundaries = ['01-01', '02-03', '02-04', '02-05', '06-01', '12-31'];

let mismatchCount = 0;
let testCount = 0;

for (const year of years) {
    for (const b of boundaries) {
        // Skip invalid leap day checks outside leap years if we used 02-29
        const dateStr = `${year}-${b}T00:00:00Z`;
        const serverResult = ChineseMathV1.calculate(dateStr);
        const clientResultEs = calculateChineseZodiac(dateStr, 'es');
        
        testCount++;
        
        if (serverResult.animal !== clientResultEs.animal || 
            serverResult.element !== clientResultEs.element || 
            serverResult.effectiveChineseCycleYear !== clientResultEs.birthYear) {
            
            console.error(`Mismatch for ${dateStr}:`);
            console.error('Server:', serverResult);
            console.error('Client:', clientResultEs);
            mismatchCount++;
        }
    }
}

console.log(`CLIENT_CHINESE_PARITY_TEST_COUNT: ${testCount}`);
console.log(`CLIENT_CHINESE_PARITY_MISMATCHES: ${mismatchCount}`);

if (mismatchCount > 0) {
    process.exit(1);
}
