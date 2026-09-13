import { NumerologyProfile } from '../../types';
import { NumerologyMathV1 } from './NumerologyMathV1';

export class NumerologyService {
    static calculateProfile(birthDateISO: string, name: string): NumerologyProfile {
        const date = new Date(birthDateISO);
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();

        const lifePath = NumerologyMathV1.calculateLifePath(year, month, day);

        // Simple Pythagorean reductions for name
        const destiny = this.getNameNumber(name);
        const soulUrge = this.getNameNumber(name, true); // Only vowels

        const [p1, p2, p3, p4] = NumerologyMathV1.calculatePinnacles(year, month, day);

        // Validation log
        // console.log(`Numerology: ${day}/${month}/${year} -> LifePath ${lifePath}, Pin1 ${p1}, Pin2 ${p2}`);

        // Tantric / Cotidiana Pinaculo Logic
        // A = Karma (Month)
        // B = Personal (Day)
        // C = Past Life (Year reduced)

        const A = this.reduceNumber(month);
        const B = this.reduceNumber(day);
        const C = this.reduceNumber(this.sumDigits(year));

        // D = Personality (Sum of A+B+C reduced)
        const D = this.reduceNumber(A + B + C);

        // Upper Triangle (Essence/Gifts)
        const E = this.reduceNumber(A + B);
        const F = this.reduceNumber(B + C);
        const G = this.reduceNumber(E + F);
        const H = this.reduceNumber(month + year); // Realization

        // Lower Triangle (Shadows/Challenges) - Calculated FIRST to derive I/J
        const K = Math.abs(A - B);
        const L = Math.abs(B - C);
        const M = Math.abs(K - L);
        const N = Math.abs(A - C);

        // Middle Bridges (Corrected Logic for Cotidiana)
        // I = Subconscious = A (Karma) + K (Chal 1)
        const I = this.reduceNumber(A + K);
        // J = Unconscious = H (Realization) + D (Personality)
        const J = this.reduceNumber(H + D);

        // Shadows Mapping
        const P = K; // Shadow 1
        const O = L; // Shadow 2
        const Q = M; // Main Shadow
        const R = N; // Legacy Shadow
        const S = this.reduceNumber(P + O + Q + R); // Deep Latent

        return {
            lifePathNumber: lifePath,
            destinyNumber: destiny,
            soulUrgeNumber: soulUrge,
            pinnacles: [p1, p2, p3, p4],
            tantric: {
                karma: A,
                soul: B,
                gift: parseInt(year.toString().slice(-2)),
                destiny: year,
                path: lifePath,
            },
            pinaculo: {
                // Top
                a: A, b: B, c: C, d: D,
                e: E, f: F, g: G, h: H,

                // Bridge
                i: I, j: J,

                // Challengers (Standard)
                k: K, l: L, m: M, n: N,

                // Bottom (Shadows)
                p: P, o: O, q: Q, r: R, s: S
            }
        };
    }

    private static sumDigits(num: number): number {
        return num.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }

    private static reduceNumber(num: number): number {
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            num = this.sumDigits(num);
        }
        return num;
    }

    private static getNameNumber(name: string, vowelsOnly = false): number {
        const charMap: Record<string, number> = {
            a: 1, j: 1, s: 1,
            b: 2, k: 2, t: 2,
            c: 3, l: 3, u: 3,
            d: 4, m: 4, v: 4,
            e: 5, n: 5, w: 5,
            f: 6, o: 6, x: 6,
            g: 7, p: 7, y: 7,
            h: 8, q: 8, z: 8,
            i: 9, r: 9
        };

        const vowels = ['a', 'e', 'i', 'o', 'u'];
        let sum = 0;

        name.toLowerCase().replace(/\s/g, '').split('').forEach(char => {
            if (vowelsOnly && !vowels.includes(char)) return;
            sum += charMap[char] || 0;
        });

        return this.reduceNumber(sum);
    }

    /**
     * Calculates the Universal and Personal daily numerology for a given local date.
     * Respects NAOS master number policy (11, 22, 33) in all reductions.
     * 
     * @param localDateStr YYYY-MM-DD
     * @param birthDay number
     * @param birthMonth number
     */
    static calculateDailyNumerology(localDateStr: string, birthDay: number, birthMonth: number) {
        const [yearStr, monthStr, dayStr] = localDateStr.split('-');
        const currentYear = parseInt(yearStr);
        const currentMonth = parseInt(monthStr);
        const currentDay = parseInt(dayStr);

        const uni = NumerologyMathV1.calculateUniversalCycles(currentYear, currentMonth, currentDay);
        const per = NumerologyMathV1.calculatePersonalCycles(birthMonth, birthDay, currentYear, currentMonth, currentDay);

        return {
            ...uni,
            ...per
        };
    }
}

