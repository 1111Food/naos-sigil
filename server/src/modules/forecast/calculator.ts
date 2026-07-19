import { ChineseAstrology } from '../../utils/chineseAstrology';
import { MayanCalculator } from '../../modules/maya/calculator';

export class ForecastCalculator {
    /**
     * Calculates the deterministic mathematical cycles (Numerology, Chinese, Mayan)
     * for the next 12 months starting from a given date.
     */
    static get12MonthCycles(birthDateStr: string, startDate: Date = new Date()) {
        const [bYear, bMonth, bDay] = birthDateStr.split('-').map(Number);
        
        // Base numerology (Life Path)
        const reduceToSingleDigit = (num: number) => {
            while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
                num = String(num).split('').map(Number).reduce((a, b) => a + b, 0);
            }
            return num;
        };

        const cycles = [];
        let currentYear = startDate.getFullYear();
        let currentMonth = startDate.getMonth(); // 0-11

        for (let i = 0; i < 12; i++) {
            const targetDate = new Date(currentYear, currentMonth, 1);
            const y = targetDate.getFullYear();
            const m = targetDate.getMonth() + 1; // 1-12

            // 1. Personal Year (Birth Day + Birth Month + Current Year)
            let personalYear = reduceToSingleDigit(reduceToSingleDigit(bDay) + reduceToSingleDigit(bMonth) + reduceToSingleDigit(y));
            
            // 2. Personal Month (Personal Year + Current Calendar Month)
            let personalMonth = reduceToSingleDigit(personalYear + m);

            // 3. Chinese Year Animal & Element for that month
            const midMonthStr = `${y}-${String(m).padStart(2, '0')}-15`;
            const chinese = ChineseAstrology.calculate(midMonthStr);

            // 4. Mayan Nawal for the 15th of that month (mid-month average)
            const mayan = MayanCalculator.calculate(midMonthStr);

            cycles.push({
                month_name_en: targetDate.toLocaleString('en-US', { month: 'long' }),
                month_name_es: targetDate.toLocaleString('es-ES', { month: 'long' }),
                year: y,
                month_number: m,
                numerology: {
                    personal_year: personalYear,
                    personal_month: personalMonth
                },
                chinese: {
                    year_animal: chinese.animal,
                    year_element: chinese.element
                },
                mayan_mid_month: {
                    nawal: mayan.kicheName,
                    tone: mayan.tone
                }
            });

            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
        }

        return cycles;
    }

    static getPinnacles(birthDateStr: string, targetDate: Date = new Date()) {
        const [bYear, bMonth, bDay] = birthDateStr.split('-').map(Number);
        const reduce = (num: number) => {
            while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
                num = String(num).split('').map(Number).reduce((a, b) => a + b, 0);
            }
            return num;
        };

        const rDay = reduce(bDay);
        const rMonth = reduce(bMonth);
        const rYear = reduce(bYear);
        const lifePath = reduce(rDay + rMonth + rYear);
        
        let lifePathSingle = lifePath;
        while (lifePathSingle > 9) {
            lifePathSingle = String(lifePathSingle).split('').map(Number).reduce((a, b) => a + b, 0);
        }

        const pin1 = reduce(rMonth + rDay);
        const pin2 = reduce(rDay + rYear);
        const pin3 = reduce(pin1 + pin2);
        const pin4 = reduce(rMonth + rYear);

        const age1End = 36 - lifePathSingle;
        const age2End = age1End + 9;
        const age3End = age2End + 9;

        const currentAge = targetDate.getFullYear() - bYear;

        let currentPinnacle = 1;
        let pinnacleValue = pin1;
        if (currentAge > age3End) {
            currentPinnacle = 4;
            pinnacleValue = pin4;
        } else if (currentAge > age2End) {
            currentPinnacle = 3;
            pinnacleValue = pin3;
        } else if (currentAge > age1End) {
            currentPinnacle = 2;
            pinnacleValue = pin2;
        }

        return {
            currentAge,
            pinnacleIndex: currentPinnacle,
            pinnacleValue,
            allPinnacles: [
                { index: 1, value: pin1, startAge: 0, endAge: age1End },
                { index: 2, value: pin2, startAge: age1End + 1, endAge: age2End },
                { index: 3, value: pin3, startAge: age2End + 1, endAge: age3End },
                { index: 4, value: pin4, startAge: age3End + 1, endAge: 99 }
            ]
        };
    }
}
