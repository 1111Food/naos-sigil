const Astronomy = require('astronomy-engine');

const date = new Date('2026-09-15T12:00:00Z');
const time = Astronomy.MakeTime(date);

const obs1 = new Astronomy.Observer(14.6349, -90.5069, 0);
const obs2 = new Astronomy.Observer(35.6762, 139.6503, 0);

const eq1 = Astronomy.Equator(Astronomy.Body.Moon, time, obs1, true, false);
const eq2 = Astronomy.Equator(Astronomy.Body.Moon, time, obs2, true, false);

console.log("Equator Moon 1 (topocentric=false):", eq1.vec);
console.log("Equator Moon 2 (topocentric=false):", eq2.vec);

const eq3 = Astronomy.Equator(Astronomy.Body.Moon, time, obs1, true, true);
const eq4 = Astronomy.Equator(Astronomy.Body.Moon, time, obs2, true, true);

console.log("Equator Moon 1 (topocentric=true):", eq3.vec);
console.log("Equator Moon 2 (topocentric=true):", eq4.vec);
