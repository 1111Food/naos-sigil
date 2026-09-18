const Astronomy = require('astronomy-engine');

const date = new Date('2026-09-15T12:00:00Z');
const time = Astronomy.MakeTime(date);

const obs0 = new Astronomy.Observer(0, 0, 0);

const eq = Astronomy.Equator(Astronomy.Body.Moon, time, obs0, true, false);

console.log("Equator Moon with Null Observer:", eq.vec);
