const sumDigits = (n) => n.toString().split('').reduce((a, d) => a + parseInt(d), 0);

function backendReduce(num) {
    let n = num;
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
        n = sumDigits(n);
    }
    return n;
}

function frontendReduce(n) {
    if (n === 11 || n === 22 || n === 33) return n;
    if (n < 10) return n;
    const sum = sumDigits(n);
    if (sum === 11 || sum === 22 || sum === 33) return sum;
    return frontendReduce(sum);
}

function backendLifePath(y, m, d) {
    return backendReduce(d + m + sumDigits(y));
}

function frontendLifePath(y, m, d) {
    return frontendReduce(d + m + y);
}

function canonicalReduce(n) {
    if (n === 11 || n === 22 || n === 33) return n;
    let s = sumDigits(n);
    while (s > 9 && s !== 11 && s !== 22 && s !== 33) {
        s = sumDigits(s);
    }
    return s;
}

function canonicalLifePath(y, m, d) {
    return canonicalReduce(canonicalReduce(y) + canonicalReduce(m) + canonicalReduce(d));
}


let diffs = 0;
for (let y = 1900; y <= 2050; y++) {
    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 31; d++) {
            const f = frontendLifePath(y, m, d);
            const b = backendLifePath(y, m, d);
            const c = canonicalLifePath(y, m, d);
            if (f !== b || f !== c || b !== c) {
                console.log(`${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')} | Front: ${f.toString().padStart(2, ' ')} | Back: ${b.toString().padStart(2, ' ')} | Canon: ${c.toString().padStart(2, ' ')}`);
                diffs++;
                if (diffs > 20) process.exit(0);
            }
        }
    }
}
