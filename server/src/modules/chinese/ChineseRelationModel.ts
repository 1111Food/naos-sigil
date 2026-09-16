export interface ChineseTemporalRelationFeatures {
    sameAnimal: boolean;
    sameElement: boolean;
    forwardAnimalOffset: number; // 0-11
    effectiveYearDifference: number;
}

export class ChineseRelationModel {
    public static readonly ANIMALS = [
        "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
        "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"
    ];

    public static calculateFeatures(
        natalAnimal: string, 
        natalElement: string, 
        natalEffectiveYear: number,
        annualAnimal: string, 
        annualElement: string, 
        annualEffectiveYear: number
    ): ChineseTemporalRelationFeatures {
        
        const sameAnimal = natalAnimal === annualAnimal;
        const sameElement = natalElement === annualElement;
        const effectiveYearDifference = annualEffectiveYear - natalEffectiveYear;
        
        const natalIdx = this.ANIMALS.indexOf(natalAnimal);
        const annualIdx = this.ANIMALS.indexOf(annualAnimal);
        
        // Offset going forward in time from natal to annual
        const forwardAnimalOffset = ((annualIdx - natalIdx) % 12 + 12) % 12;

        return {
            sameAnimal,
            sameElement,
            forwardAnimalOffset,
            effectiveYearDifference
        };
    }
}
