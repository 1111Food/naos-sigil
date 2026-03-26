import * as Astronomy from 'astronomy-engine';

export function getMoonPhase(date: any = new Date()) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return { name: 'moon_new', emoji: '🌑', age: 0 };
    }
    const time = Astronomy.MakeTime(d);
    const phase = Astronomy.MoonPhase(time);
    const age = Math.floor((phase / 360) * 28);

    const getBase = () => {
        if (phase < 1 || phase > 359) return { name: 'moon_new', emoji: '🌑' };
        if (phase < 89) return { name: 'moon_waxing_crescent', emoji: '🌙' };
        if (phase < 91) return { name: 'moon_first_quarter', emoji: '🌓' };
        if (phase < 179) return { name: 'moon_waxing_gibbous', emoji: '🌔' };
        if (phase < 181) return { name: 'moon_full', emoji: '🌕' };
        if (phase < 269) return { name: 'moon_waning_gibbous', emoji: '🌖' };
        if (phase < 271) return { name: 'moon_last_quarter', emoji: '🌗' };
        return { name: 'moon_waning_crescent', emoji: '🌙' };
    };

    return { ...getBase(), age };
}
