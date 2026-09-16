export interface ChineseCycleResult {
    effectiveChineseCycleYear: number;
    animal: string;
    element: string;
}

export class ChineseMathV1 {
    public static readonly METHODOLOGY_ID = 'CHINESE_LI_CHUN_FIXED_FEB4_V1';

    public static readonly ANIMALS = [
        "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
        "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"
    ];

    public static readonly ELEMENTS = [
        "Metal", "Agua", "Madera", "Fuego", "Tierra"
    ];

    /**
     * Calculates the effective Chinese Cycle Year based on NAOS V1 policy:
     * Fixed February 4 local date boundary.
     * Note: This does not represent the astronomical Li Chun exact instant.
     */
    public static calculate(dateString: string): ChineseCycleResult {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();

        let effectiveChineseCycleYear = year;
        
        // Fixed Feb 4 boundary logic
        if (month < 2 || (month === 2 && day < 4)) {
            effectiveChineseCycleYear = year - 1;
        }

        // Animal calculation
        // Modulo math starting from 1900 (Year of the Metal Rat)
        const diff = effectiveChineseCycleYear - 1900;
        const animalIdx = ((diff % 12) + 12) % 12;
        const animal = this.ANIMALS[animalIdx];

        // Element calculation
        // 0-1: Metal, 2-3: Agua, 4-5: Madera, 6-7: Fuego, 8-9: Tierra
        const elementIdx = ((effectiveChineseCycleYear % 10) + 10) % 10;
        const element = this.ELEMENTS[Math.floor(elementIdx / 2)];

        return {
            effectiveChineseCycleYear,
            animal,
            element
        };
    }
}
