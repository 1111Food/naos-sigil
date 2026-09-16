import { ChineseMathV1 } from '../modules/chinese/ChineseMathV1';

export interface ChineseAstrologyResult {
    animal: string;
    element: string;
    birthYear: number;
    description: string;
}

export class ChineseAstrology {
    // Brief interpretations based on Animal + Element
    private static readonly INTERPRETATIONS: Record<string, string> = {
        "Madera": "Energía de crecimiento, expansión y vitalidad. Buscas la renovación constante y tienes una visión humanista del mundo.",
        "Fuego": "Pasión, iluminación y dinamismo. Tu espíritu es audaz, decisivo y capaz de inspirar a otros con tu luz interior.",
        "Tierra": "Estabilidad, nutrición y realismo. Eres el pilar que sostiene, con una sabiduría práctica y una gran lealtad.",
        "Metal": "Claridad, rectitud y resistencia. Tu voluntad es firme, valoras la estructura y posees una integridad inquebrantable.",
        "Agua": "Fluidez, intuición y profundidad. Navegas por las emociones con sabiduría, adaptándote a los cambios con gracia sagrada."
    };

    /**
     * Calculates the Chinese Zodiac sign based on birth date (Compatibility Facade)
     * Note: Traditional Chinese New Year starts between Jan 21 and Feb 20.
     * For simplified NAOS logic, we use a fixed approximation (Feb 4 - Lichun).
     */
    static calculate(birthDateISO: string): ChineseAstrologyResult {
        const result = ChineseMathV1.calculate(birthDateISO);

        return {
            animal: result.animal,
            element: result.element,
            birthYear: result.effectiveChineseCycleYear,
            description: `Bajo el signo del ${result.animal} de ${result.element}. ${this.INTERPRETATIONS[result.element]}`
        };
    }
}
