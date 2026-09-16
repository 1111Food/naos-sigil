export type MayaMethodologyId = 'MAYA_GMT_584283_MIDNIGHT_V1';

export interface MayaDateInput {
    localDate: string; // YYYY-MM-DD
}

export interface MayaAtomicSignal {
    nawalIndex: number; // 0-19 (0 = B'atz')
    canonicalNawalKey: string;
    tone: number; // 1-13
    cholQijCycleIndex: number; // 1-260 (Anchor: 1 = 1 Imox)
}

export const CANONICAL_NAWALES = [
    "B'atz'", "E", "Aj", "I'x", "Tz'ikin", "Ajmaq", "No'j", "Tijax", "Kawoq", "Ajpu",
    "Imox", "Iq'", "Aq'ab'al", "K'at", "Kan", "Kame", "Kej", "Q'anil", "Toj", "Tz'i'"
];

export class MayaMathV1 {
    static readonly METHODOLOGY_ID: MayaMethodologyId = 'MAYA_GMT_584283_MIDNIGHT_V1';
    static readonly CORRELATION = 584283;

    /**
     * Calculates pure integer Julian Day Number (JDN).
     * Fixes the -1524.5 off-by-one decimal issue in the legacy algorithm to align exactly 
     * with standard JDN at noon, which aligns local string dates to the correct Maya day.
     */
    static getJDN(year: number, month: number, day: number): number {
        let y = year;
        let m = month;
        if (m < 3) {
            y -= 1;
            m += 12;
        }
        const a = Math.floor(y / 100);
        const b = 2 - a + Math.floor(a / 4);
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
    }

    static calculate(input: MayaDateInput): MayaAtomicSignal {
        const [yyyy, mm, dd] = input.localDate.split('-').map(Number);
        const jd = this.getJDN(yyyy, mm, dd);
        const tzolkinDays = jd - this.CORRELATION;

        const nawalIndex = ((tzolkinDays + 9) % 20 + 20) % 20;
        const tone = ((tzolkinDays + 3) % 13 + 13) % 13 + 1;

        // Coordinate 1 = 1 Imox. tzolkinDays=101 corresponds to 1 Imox in this math.
        const cholQijCycleIndex = ((tzolkinDays - 101) % 260 + 260) % 260 + 1;

        return {
            nawalIndex,
            canonicalNawalKey: CANONICAL_NAWALES[nawalIndex],
            tone,
            cholQijCycleIndex
        };
    }
}
