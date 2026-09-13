const sumDigits = (n) => n.toString().split('').reduce((a, d) => a + parseInt(d, 10), 0);

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

console.log(`Backend 11-11-2009: ${backendLifePath(2009, 11, 11)}`);
console.log(`Frontend 11-11-2009: ${frontendLifePath(2009, 11, 11)}`);
console.log(`Canonical 11-11-2009: ${canonicalLifePath(2009, 11, 11)}`);

