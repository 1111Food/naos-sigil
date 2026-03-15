import { NAWALES, TONES } from './constants';

export class MayanCalculator {


    static calculate(dateString: string) {
        // Obtenemos Y, M, D directamente del string para evitar cualquier mutación de zona horaria o bisiestos en JS Date.
        const [year, month, day] = dateString.split('-').map(Number);

        let y = year;
        let m = month;

        // Ajuste para el algoritmo de Día Juliano (los meses enero y febrero se cuentan como 13 y 14 del año anterior)
        if (m < 3) {
            y -= 1;
            m += 12;
        }

        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);

        // Cálculo del Día Juliano a las 12:00 UT
        const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

        // Correlación GMT (Goodman-Martínez-Thompson) 584283
        const tzolkinDays = Math.floor(jd - 584283);

        // En GMT 584283, tzolkinDays = 0 equivale al Nahual Ajpu (índice 9 en NAWALES).
        const nawalIdx = ((tzolkinDays + 9) % 20 + 20) % 20;

        // Para el tono: tzolkinDays = 0 equivale al Tono 4.
        const tone = ((tzolkinDays + 3) % 13 + 13) % 13 + 1;

        const nawalData = NAWALES[nawalIdx];
        const toneData = TONES[tone - 1];

        return {
            kicheName: nawalData.name,
            meaning: nawalData.meaning,
            tone: tone,
            toneName: toneData,
            description: nawalData.description,
            // SVG path construction
            glyphUrl: `/nawales/${nawalData.name.toLowerCase().replace(/'/g, "")}.svg`
        };
    }
}
