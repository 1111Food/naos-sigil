const Astronomy = require('astronomy-engine');

const date = new Date('2026-09-15T12:00:00Z');
const time = Astronomy.MakeTime(date);

const geoVec = Astronomy.GeoVector(Astronomy.Body.Moon, time, true);
console.log("GeoVector Moon:", geoVec);
