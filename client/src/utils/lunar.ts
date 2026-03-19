import * as Astronomy from 'astronomy-engine';

export function getMoonPhase(date: Date = new Date()) {
    const time = Astronomy.MakeTime(date);
    const phase = Astronomy.MoonPhase(time);
    const age = Math.floor((phase / 360) * 28);

    const getBase = () => {
        if (phase < 1 || phase > 359) return { name: 'Luna Nueva', emoji: '🌑' };
        if (phase < 89) return { name: 'Luna Creciente', emoji: '🌙' };
        if (phase < 91) return { name: 'Cuarto Creciente', emoji: '🌓' };
        if (phase < 179) return { name: 'Gibosa Creciente', emoji: '🌔' };
        if (phase < 181) return { name: 'Luna Llena', emoji: '🌕' };
        if (phase < 269) return { name: 'Gibosa Menguante', emoji: '🌖' };
        if (phase < 271) return { name: 'Cuarto Menguante', emoji: '🌗' };
        return { name: 'Luna Menguante', emoji: '🌙' };
    };

    return { ...getBase(), age };
}
