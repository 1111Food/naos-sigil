import { NAWALES, TONES } from './constants';

export class MayanCalculator {
    static calculate(dateString: string, lang: 'es' | 'en' = 'es') {
        const [year, month, day] = dateString.split('-').map(Number);
        let y = year;
        let m = month;

        if (m < 3) {
            y -= 1;
            m += 12;
        }

        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);

        const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
        const tzolkinDays = Math.floor(jd - 584283);

        const nawalIdx = ((tzolkinDays + 9) % 20 + 20) % 20;
        const tone = ((tzolkinDays + 3) % 13 + 13) % 13 + 1;

        const nawalData = NAWALES[nawalIdx];
        const toneData = TONES[lang][tone - 1];

        return {
            kicheName: nawalData.name,
            meaning: nawalData.meaning[lang],
            tone: tone,
            toneName: toneData,
            description: nawalData.description[lang],
            glyphUrl: `/nawales/${nawalData.name.toLowerCase().replace(/'/g, "")}.svg`
        };
    }
}
