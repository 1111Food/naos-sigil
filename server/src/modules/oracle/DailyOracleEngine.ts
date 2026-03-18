const NAHUALES = [
    "Imox", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluk", "Ok",
    "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ajaw"
];

export const NAHUAL_COMPATIBILITY: { [key: string]: string[] } = {
    Imox: ["Muluk", "Ok", "Eb"],
    Ik: ["Akbal", "Ben", "Ix"],
    Akbal: ["Ik", "Kan", "Cimi"],
    Kan: ["Akbal", "Chicchan", "Lamat"],
    Chicchan: ["Kan", "Cimi", "Manik"],
    Cimi: ["Akbal", "Chicchan", "Manik"],
    Manik: ["Chicchan", "Cimi", "Lamat"],
    Lamat: ["Kan", "Manik", "Muluk"],
    Muluk: ["Imox", "Lamat", "Ok"],
    Ok: ["Imox", "Muluk", "Chuen"],
    Chuen: ["Ok", "Eb", "Ben"],
    Eb: ["Imox", "Chuen", "Ben"],
    Ben: ["Ik", "Chuen", "Eb"],
    Ix: ["Ik", "Men", "Cib"],
    Men: ["Ix", "Cib", "Caban"],
    Cib: ["Ix", "Men", "Etznab"],
    Caban: ["Men", "Etznab", "Cauac"],
    Etznab: ["Cib", "Caban", "Cauac"],
    Cauac: ["Caban", "Etznab", "Ajaw"],
    Ajaw: ["Cauac", "Imox", "Ik"]
};

export class DailyOracleEngine {

    // Prompt 1: Numerología
    public static reduceNumber(num: number): number {
        let n = num;
        while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
            n = n.toString().split('').reduce((a, b) => a + Number(b), 0);
        }
        return n;
    }

    public static getNumerology(date: Date) {
        // Usa UTC para evitar desfases de calendario en el servidor
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;
        const year = date.getUTCFullYear();

        const dayNumber = day; // día calendario reduces? Prompt says "= día calendario (1-31)"
        
        // Suma de dígitos de día, mes y año independientes
        const sumDigits = (n: number) => n.toString().split('').reduce((a, b) => a + Number(b), 0);
        const total = sumDigits(day) + sumDigits(month) + sumDigits(year);
        const universal = this.reduceNumber(total);

        return { dayNumber, universal };
    }

    // Prompt 2: Tzolkin (Calendario Maya)
    public static calculateTzolkin(targetDate: Date) {
        // Base fija: 21 de diciembre de 2012 = 4 Ajaw
        const baseDate = new Date("2012-12-21T00:00:00Z");
        
        // Crear copias solo con año, mes, día en UTC a las 00:00 para evitar que horas / minutos afecten el conteo de días
        const d1 = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
        const d2 = Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate());

        const diffTime = d1 - d2;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Calcular Tono (Base 4)
        // 4 + diffDays % 13.
        let tone = (4 + diffDays) % 13;
        if (tone <= 0) tone += 13;

        // Calcular Nahual (Base 20, 21-12-2012 era Ajaw, el índice 19 de la lista 0-indexed)
        // Ajaw es el último en la lista (índice 19).
        // let index = (19 + diffDays) % 20;
        let index = (19 + diffDays) % 20;
        if (index < 0) index += 20;

        const nahual = NAHUALES[index];

        return { tone, nahual };
    }

    // Prompt 3: Animal Chino
    public static getChineseAnimal(year: number): string {
        const chineseAnimals = [
            "Mono", "Gallo", "Perro", "Cerdo", "Rata", "Buey", 
            "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra"
        ];
        return chineseAnimals[year % 12];
    }

    // Prompt 4: Signo Solar Zodiacal
    public static getZodiacSign(date: Date): string {
        const day = date.getUTCDate();
        const month = date.getUTCMonth() + 1;

        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Tauro";
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Géminis";
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cáncer";
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpio";
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitario";
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricornio";
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Acuario";
        return "Piscis";
    }

    // Prompt 5: Sistema de Interacción Básico (Scores)
    public static calculateBasicInteraction(userPillars: any, dayPillars: any) {
        let resonanceScore = 0;
        let frictionScore = 0;
        let activationScore = 0;

        // --- 1. Numerología ---
        const userNum = userPillars.numerology?.lifePathNumber || 0;
        const dayNum = dayPillars.numerology.dayNumber;
        const universalNum = dayPillars.numerology.universal;

        if (userNum === dayNum || userNum === universalNum) {
            resonanceScore++;
        }

        if (Math.abs(userNum - dayNum) >= 4) {
            frictionScore++;
        }

        const sumDay = userNum + dayNum;
        if ([9, 11, 22].includes(sumDay)) {
            activationScore++;
        }

        // --- 2. Nahual ---
        const userNahual = userPillars.mayan?.nawal;
        const dayNahual = dayPillars.mayan.nahual;

        if (userNahual === dayNahual) {
            resonanceScore++;
        }

        if (userNahual && dayNahual) {
            if (NAHUAL_COMPATIBILITY[userNahual]?.includes(dayNahual)) {
                activationScore++;
            } else if (userNahual !== dayNahual) {
                frictionScore++;
            }
        }

        // --- 3. Astrología (Elementos) ---
        const getElement = (sign: string) => {
            const map: { [key: string]: string } = {
                Aries: "Fire", Leo: "Fire", Sagitario: "Fire",
                Tauro: "Earth", Virgo: "Earth", Capricornio: "Earth",
                Géminis: "Air", Libra: "Air", Acuario: "Air",
                Cáncer: "Water", Escorpio: "Water", Piscis: "Water"
            };
            return map[sign];
        };

        const userElem = userPillars.astrology?.element; // pre-computed dominant or sun element?
        const dayElem = getElement(dayPillars.astrology.sign);

        if (userElem && dayElem) {
            if (userElem === dayElem) {
                resonanceScore++;
            }

            const activeCombos = [["Fire", "Air"], ["Water", "Earth"]];
            const isActive = activeCombos.some(combo => combo.includes(userElem) && combo.includes(dayElem));
            if (isActive) {
                activationScore++;
            }

            const frictionCombos = [["Fire", "Water"], ["Air", "Earth"]];
            const isFriction = frictionCombos.some(combo => combo.includes(userElem) && combo.includes(dayElem));
            if (isFriction) {
                frictionScore++;
            }
        }

        return { resonanceScore, frictionScore, activationScore };
    }

    public static getDayPillars(date: Date) {
        const numerology = this.getNumerology(date);
        const mayan = this.calculateTzolkin(date);
        const chineseAnimal = this.getChineseAnimal(date.getUTCFullYear());
        const sign = this.getZodiacSign(date);

        return {
            numerology,
            mayan,
            chinese: { animal: chineseAnimal },
            astrology: { sign }
        };
    }

    // Prompt 10: Sistema de Scoring Avanzado (Pesos)
    public static calculateAdvancedInteraction(userPillars: any, dayPillars: any) {
        // --- 1. NUMEROLOGÍA (Peso 0.35) ---
        let numRes = 0; let numFric = 0; let numAct = 0;
        const userNum = userPillars.numerology?.lifePathNumber || 1;
        const dayNum = dayPillars.numerology.dayNumber;
        const universalNum = dayPillars.numerology.universal;

        if (userNum === dayNum) numRes += 0.7;
        if (userNum === universalNum) numRes += 0.5;

        if (Math.abs(userNum - dayNum) >= 5) numFric += 0.6;
        if (Math.abs(userNum - universalNum) >= 5) numFric += 0.4;

        if ([9, 11, 22, 33].includes(userNum + dayNum)) numAct += 0.6;
        if ([9, 11, 22, 33].includes(userNum + universalNum)) numAct += 0.4;

        // Normalizar cada sub-score a 1 max
        numRes = Math.min(1, numRes);
        numFric = Math.min(1, numFric);
        numAct = Math.min(1, numAct);

        // --- 2. NAHUAL (Peso 0.40) ---
        let nahualRes = 0; let nahualFric = 0; let nahualAct = 0;
        const userNahual = userPillars.mayan?.nawal;
        const dayNahual = dayPillars.mayan.nahual;

        if (userNahual === dayNahual) {
            nahualRes = 1;
        }
        
        if (userNahual && dayNahual) {
            if (NAHUAL_COMPATIBILITY[userNahual]?.includes(dayNahual)) {
                nahualAct = 0.8;
            } else if (userNahual !== dayNahual) {
                nahualFric = 0.7;
            }
        }

        // --- 3. ASTROLOGÍA (Peso 0.25) ---
        let astroRes = 0; let astroFric = 0; let astroAct = 0;
        const userElem = userPillars.astrology?.element;
        const dayElem = this.getElementFromSign(dayPillars.astrology.sign);

        if (userElem && dayElem) {
            if (userElem === dayElem) astroRes = 1;

            const activeCombos = [["Fire", "Air"], ["Water", "Earth"]];
            const isActive = activeCombos.some(combo => combo.includes(userElem) && combo.includes(dayElem));
            if (isActive) astroAct = 0.8;

            const frictionCombos = [["Fire", "Water"], ["Air", "Earth"]];
            const isFriction = frictionCombos.some(combo => combo.includes(userElem) && combo.includes(dayElem));
            if (isFriction) astroFric = 0.7;
        }

        // --- 4. SCORE FINAL CON PESOS ---
        const resonanceScore = (numRes * 0.35) + (nahualRes * 0.40) + (astroRes * 0.25);
        const frictionScore = (numFric * 0.35) + (nahualFric * 0.40) + (astroFric * 0.25);
        const activationScore = (numAct * 0.35) + (nahualAct * 0.40) + (astroAct * 0.25);

        return {
            resonanceScore: Math.min(resonanceScore, 1),
            frictionScore: Math.min(frictionScore, 1),
            activationScore: Math.min(activationScore, 1)
        };
    }

    private static getElementFromSign(sign: string): string {
        const map: { [key: string]: string } = {
            Aries: "Fire", Leo: "Fire", Sagitario: "Fire",
            Tauro: "Earth", Virgo: "Earth", Capricornio: "Earth",
            Géminis: "Air", Libra: "Air", Acuario: "Air",
            Cáncer: "Water", Escorpio: "Water", Piscis: "Water"
        };
        return map[sign] || "Unknown";
    }

    // Prompt 12: Coherencia Global
    public static calculateCoherenceLevel(discipline: number, energy: number, clarity: number) {
        const coherence = (discipline + energy + clarity) / 3;
        const level = coherence / 100; // 0 a 1

        let state = "MEDIUM";
        if (level >= 0.75) state = "HIGH";
        if (level < 0.45) state = "LOW";

        return { level, state };
    }

    // Prompt 13 & 14: Modificador Adaptativo y Perfil de Tono
    public static getAdaptiveProfile(scores: { resonanceScore: number, frictionScore: number, activationScore: number }, coherenceState: string) {
        let { resonanceScore, frictionScore, activationScore } = scores;
        let toneProfile = "BALANCED";

        if (coherenceState === "HIGH") {
            activationScore = Math.min(1, activationScore + 0.15); // Se busca expansión
            frictionScore = Math.min(1, frictionScore * 1.2); // Reducir tolerancia a fricción = pesa más el riesgo
            toneProfile = "CHALLENGE";
        } else if (coherenceState === "LOW") {
            resonanceScore = Math.min(1, resonanceScore + 0.2); // Más guía / suavidad
            frictionScore = Math.max(0, frictionScore * 0.8); // Suavizar avisos de fricción
            toneProfile = "GUIDE";
        }

        return {
            adjustedScores: { resonanceScore, frictionScore, activationScore },
            toneProfile
        };
    }
}
