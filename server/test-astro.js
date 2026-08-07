const { AstrologyEngine } = require('./src/modules/astrology/engine');

try {
    const invalidDate = new Date(NaN);
    console.log("Invalid Date:", invalidDate);
    const chart = AstrologyEngine.calculateNatalChart(invalidDate, 14.6, -90.5);
    console.log("Chart:", chart);
} catch (e) {
    console.error("ERROR THROWN:", e.message);
}
