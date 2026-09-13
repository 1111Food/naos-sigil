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

// What about Canonical reduce? 
// Canonical purist: reduce(reduce(d) + reduce(m) + reduce(y))
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

function testDates() {
    const dates = [
        [1990, 1, 1],
        [2000, 2, 2],
        [1999, 9, 9], // 1999(28=1), 9, 9 -> 19 -> 1. Front: 1999+18 = 2017 -> 10 -> 1. Back: 9+9+28 = 46 -> 10 -> 1
        [1986, 11, 23], // 1986(24=6), 11(11), 23(5). 6+11+5 = 22. Front: 1986+11+23 = 2020 -> 4. Back: 23+11+24 = 58 -> 13 -> 4. Canonical: 22.
        [1948, 12, 11], // 1948(22), 12(3), 11(11). 22+3+11 = 36 -> 9. Front: 1948+23 = 1971 -> 18 -> 9. Back: 11+12+22 = 45 -> 9.
        [1984, 1, 28], // 1984(22), 1, 28(1). 22+1+1 = 24 -> 6. Front: 1984+29 = 2013 -> 6. Back: 28+1+22 = 51 -> 6.
        [2003, 11, 11], // 2003(5), 11, 11. 5+11+11 = 27 -> 9. Front: 2003+22 = 2025 -> 9. Back: 11+11+5 = 27 -> 9.
        [1988, 2, 11], // 1988(26=8), 2, 11. 8+2+11 = 21 -> 3.
        [1989, 4, 11], // 1989(27=9), 4, 11. 9+4+11 = 24 -> 6.
        [1990, 11, 22], // 1990(19=1), 11, 22. 1+11+22 = 34 -> 7.
        [1987, 8, 22], // 1987(25=7), 8, 22. 7+8+22 = 37 -> 1. 
        [1999, 11, 11], // 1999(28=1), 11, 11. 1+11+11 = 23 -> 5. Front: 1999+22 = 2021 -> 5. Back: 11+11+28=50 -> 5.
        [1975, 5, 23], // 1975(22), 5, 23(5). 22+5+5 = 32 -> 5. Front: 1975+28=2003->5.
        [1982, 10, 10], // 1982(20=2), 1(1), 1(1) = 4. 
        [1995, 5, 5], // 1995(24=6), 5, 5. 6+5+5=16 -> 7.
        [1985, 8, 25], // 1985(23=5), 8, 7. 5+8+7 = 20 -> 2. Front: 1985+33=2018 -> 11. Back: 25+8+23 = 56 -> 11. Can: 5+8+7=20->2.
        [1992, 11, 29], // 1992(21=3), 11, 29(11). 3+11+11 = 25 -> 7. Front: 1992+40=2032->7. Back: 29+11+21 = 61->7.
        [1986, 4, 15], // 1986(24=6), 4, 15(6) = 16->7.
        [2004, 3, 14], // 2004(6), 3, 14(5) = 14->5.
        [1998, 7, 16], // 1998(27=9), 7, 16(7) = 23->5.
        [1980, 12, 28], // 1980(18=9), 12(3), 28(1) = 13->4. Front: 1980+40=2020->4. Back: 28+12+18=58->13->4.
        [1997, 6, 21], // 1997(26=8), 6, 21(3) = 17->8.
        [1983, 3, 19], // 1983(21=3), 3, 19(1) = 7.
        [1994, 10, 12], // 1994(23=5), 1, 12(3) = 9.
        [2001, 1, 11], // 2001(3), 1, 11. 3+1+11 = 15->6.
        [1979, 11, 2], // 1979(26=8), 11, 2. 8+11+2 = 21->3.
        [1981, 2, 28], // 1981(19=1), 2, 28(1) = 4.
    ];

    console.log("YYYY-MM-DD | Front | Back | Canon | Diff? ");
    for (const [y, m, d] of dates) {
        const f = frontendLifePath(y, m, d);
        const b = backendLifePath(y, m, d);
        const c = canonicalLifePath(y, m, d);
        const diff = (f !== b || f !== c) ? '<-- DIFF' : '';
        console.log(`${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')} | ${f.toString().padStart(5, ' ')} | ${b.toString().padStart(4, ' ')} | ${c.toString().padStart(5, ' ')} | ${diff}`);
    }
}

testDates();
