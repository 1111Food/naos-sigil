function getHistoricalUtcOffset(ianaTimezone, dateStr, timeStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    
    const format = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimezone,
        timeZoneName: 'longOffset',
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    
    let testDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    
    // Iteratively find the exact offset by applying the offset back to UTC.
    for (let i=0; i<3; i++) {
        const parts = format.formatToParts(testDate);
        const offsetPart = parts.find(p => p.type === 'timeZoneName');
        let val = offsetPart ? offsetPart.value.replace('GMT', '') : '';
        let offsetHours = 0;
        if (val) {
            const [signH, m] = val.split(':');
            const h = parseInt(signH, 10);
            const min = parseInt(m || '0', 10);
            offsetHours = h + (h >= 0 ? (min/60) : -(min/60));
        }
        
        // Target UTC time = local wall time - offset
        const expectedUtc = Date.UTC(year, month - 1, day, hour, minute) - (offsetHours * 3600000);
        
        if (testDate.getTime() === expectedUtc) {
            return offsetHours;
        }
        testDate = new Date(expectedUtc);
    }
    
    return -6; // Fallback
}

console.log('Guatemala 1990 (No DST):', getHistoricalUtcOffset('America/Guatemala', '1990-01-01', '12:00'));
console.log('NY Summer 1995 (DST -4):', getHistoricalUtcOffset('America/New_York', '1995-07-01', '12:00'));
console.log('NY Winter 1995 (STD -5):', getHistoricalUtcOffset('America/New_York', '1995-12-01', '12:00'));
