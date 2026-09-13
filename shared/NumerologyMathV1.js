"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumerologyMathV1 = void 0;
class NumerologyMathV1 {
    static VERSION = "naos_numerology_math_v1";
    /**
     * Central deterministic reduction function.
     * @param value The number to reduce
     * @param options { preserveMasters: true } to stop at 11, 22, 33.
     */
    static reduceNumber(value, options = { preserveMasters: true }) {
        if (value === 0)
            return 0;
        let n = value;
        while (n > 9) {
            if (options.preserveMasters && (n === 11 || n === 22 || n === 33)) {
                return n;
            }
            n = n.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
        }
        return n;
    }
    /**
     * Extracts master metadata for any numerology result.
     * A master number (11, 22, 33) is treated as a single semantic entity.
     * Its reduced base provides the semantic lineage but does not add a double vote.
     */
    static getMasterMetadata(num) {
        const isMaster = (num === 11 || num === 22 || num === 33);
        const reducedBase = isMaster ? this.reduceNumber(num, { preserveMasters: false }) : num;
        return {
            number: num,
            reducedBase,
            isMaster
        };
    }
    /**
     * Calculates the canonical Life Path number for NAOS V1.
     * Formula: reduce(day + month + year)
     * Named explicitly as NAOS_LIFE_PATH_V1_CONVENTION.
     */
    static calculateLifePath(year, month, day) {
        return this.reduceNumber(day + month + year, { preserveMasters: true });
    }
    /**
     * Calculates the 4 Pinnacles.
     * P1 = Month + Day
     * P2 = Day + Year
     * P3 = P1 + P2
     * P4 = Month + Year
     * Uses Master-Preserving reduce for all steps.
     */
    static calculatePinnacles(year, month, day) {
        // Reductions are done on the final sum for each pinnacle
        // according to traditional mapping where the operands themselves are reduced?
        // Let's use the explicit NAOS rule: "Todas deben usar el contrato de reducción V1 correspondiente."
        const rMonth = this.reduceNumber(month, { preserveMasters: true });
        const rDay = this.reduceNumber(day, { preserveMasters: true });
        const rYear = this.reduceNumber(year, { preserveMasters: true });
        const p1 = this.reduceNumber(rMonth + rDay, { preserveMasters: true });
        const p2 = this.reduceNumber(rDay + rYear, { preserveMasters: true });
        const p3 = this.reduceNumber(p1 + p2, { preserveMasters: true });
        const p4 = this.reduceNumber(rMonth + rYear, { preserveMasters: true });
        return [p1, p2, p3, p4];
    }
    /**
     * Determines current pinnacle based on age.
     * Transition uses explicit dates (birthday), not age rounding.
     * Duration formula: 36 - reducedLifePathForDuration
     */
    static getCurrentPinnacle(birthYear, birthMonth, birthDay, currentDateStr) {
        const lifePath = this.calculateLifePath(birthYear, birthMonth, birthDay);
        // "donde únicamente para duración: 11->2, 22->4, 33->6"
        const reducedLifePathForDuration = this.reduceNumber(lifePath, { preserveMasters: false });
        const p1EndAge = 36 - reducedLifePathForDuration;
        const pinnacles = this.calculatePinnacles(birthYear, birthMonth, birthDay);
        // Exact Date Math
        const birthDate = new Date(Date.UTC(birthYear, birthMonth - 1, birthDay));
        const current = new Date(currentDateStr);
        // Ensure UTC for comparison to prevent timezone shifts
        // Boundaries (Birthdays)
        const p1EndDate = new Date(Date.UTC(birthYear + p1EndAge, birthMonth - 1, birthDay));
        const p2EndDate = new Date(Date.UTC(birthYear + p1EndAge + 9, birthMonth - 1, birthDay));
        const p3EndDate = new Date(Date.UTC(birthYear + p1EndAge + 18, birthMonth - 1, birthDay));
        let index = 1;
        let pNum = pinnacles[0];
        let startD = birthDate;
        let endD = p1EndDate;
        let startA = 0;
        let endA = p1EndAge;
        if (current >= p3EndDate) {
            index = 4;
            pNum = pinnacles[3];
            startD = p3EndDate;
            endD = null;
            startA = p1EndAge + 18;
            endA = null;
        }
        else if (current >= p2EndDate) {
            index = 3;
            pNum = pinnacles[2];
            startD = p2EndDate;
            endD = p3EndDate;
            startA = p1EndAge + 9;
            endA = p1EndAge + 18;
        }
        else if (current >= p1EndDate) {
            index = 2;
            pNum = pinnacles[1];
            startD = p1EndDate;
            endD = p2EndDate;
            startA = p1EndAge;
            endA = p1EndAge + 9;
        }
        return {
            pinnacleIndex: index,
            pinnacleNumber: pNum,
            metadata: this.getMasterMetadata(pNum),
            startDate: startD.toISOString(),
            endDate: endD ? endD.toISOString() : null,
            startAge: startA,
            endAge: endA,
            temporalRole: 'MACRO_BACKGROUND'
        };
    }
    /**
     * Cycles Math: Universal & Personal
     */
    static calculateUniversalCycles(currentYear, currentMonth, currentDay) {
        const uy = this.reduceNumber(currentYear, { preserveMasters: true });
        const um = this.reduceNumber(uy + currentMonth, { preserveMasters: true });
        const ud = this.reduceNumber(um + currentDay, { preserveMasters: true });
        return {
            universalYear: uy,
            universalMonth: um,
            universalDay: ud
        };
    }
    static calculatePersonalCycles(birthMonth, birthDay, currentYear, currentMonth, currentDay) {
        const uy = this.reduceNumber(currentYear, { preserveMasters: true });
        const rBirthDay = this.reduceNumber(birthDay, { preserveMasters: true });
        const rBirthMonth = this.reduceNumber(birthMonth, { preserveMasters: true });
        const py = this.reduceNumber(rBirthDay + rBirthMonth + uy, { preserveMasters: true });
        const pm = this.reduceNumber(py + currentMonth, { preserveMasters: true });
        const pd = this.reduceNumber(pm + currentDay, { preserveMasters: true });
        return {
            personalYear: py,
            personalMonth: pm,
            personalDay: pd
        };
    }
}
exports.NumerologyMathV1 = NumerologyMathV1;
