import { TarotReading } from '../../types';

export class TarotService {
    private static majorArcana = [
        { name: "The Fool", meaning: "New beginnings, spontaneity, faith in the universe.", isPositive: true },
        { name: "The Magician", meaning: "Manifestation, resourcefulness, power, inspired action.", isPositive: true },
        { name: "The High Priestess", meaning: "Intuition, sacred knowledge, divine feminine, the unconscious mind.", isPositive: true },
        { name: "The Empress", meaning: "Femininity, beauty, nature, nurturing, abundance.", isPositive: true },
        { name: "The Emperor", meaning: "Authority, establishment, structure, a father figure.", isPositive: true },
        { name: "The Hierophant", meaning: "Spiritual wisdom, religious beliefs, conformity, tradition, institutions.", isPositive: true },
        { name: "The Lovers", meaning: "Love, harmony, relationships, values alignment, choices.", isPositive: true },
        { name: "The Chariot", meaning: "Control, willpower, success, action, determination.", isPositive: true },
        { name: "Strength", meaning: "Strength, courage, persuasion, influence, compassion.", isPositive: true },
        { name: "The Hermit", meaning: "Retirada estratégica. Aislamiento táctico para la auto-observación y la maduración de la psique. Búsqueda de coherencia interna lejos de la interferencia estática del entorno social.", isPositive: null }, // Neutral/Maybe
        { name: "Wheel of Fortune", meaning: "Good luck, karma, life cycles, destiny, a turning point.", isPositive: true },
        { name: "Justice", meaning: "Justice, fairness, truth, cause and effect, law.", isPositive: null },
        { name: "The Hanged Man", meaning: "Pause, surrender, letting go, new perspectives.", isPositive: null },
        { name: "Death", meaning: "Endings, change, transformation, transition.", isPositive: null }, // Transformation (Maybe/No depending on context)
        { name: "Temperance", meaning: "Balance, moderation, patience, purpose.", isPositive: true },
        { name: "The Devil", meaning: "Shadow self, attachment, addiction, restriction, sexuality.", isPositive: false },
        { name: "The Tower", meaning: "Sudden change, upheaval, chaos, revelation, awakening.", isPositive: false },
        { name: "The Star", meaning: "Hope, faith, purpose, renewal, spirituality.", isPositive: true },
        { name: "The Moon", meaning: "Illusion, fear, anxiety, subconscious, intuition.", isPositive: false },
        { name: "The Sun", meaning: "Positivity, fun, warmth, success, vitality.", isPositive: true },
        { name: "Judgement", meaning: "Judgement, rebirth, inner calling, absolution.", isPositive: true },
        { name: "The World", meaning: "Completion, integration, accomplishment, travel.", isPositive: true }
    ];

    private static naosArchetypes = [
        { name: "El Arquitecto", meaning: "Visión sistémica y diseño de estructuras de largo plazo.", isPositive: true },
        { name: "El Estratega", meaning: "Optimización de recursos y planificación de rutas críticas.", isPositive: true },
        { name: "El Custodio", meaning: "Protección de valores esenciales y mantenimiento de la integridad.", isPositive: true },
        { name: "El Alquimista", meaning: "Transformación de crisis en oportunidades y transmutación de energía.", isPositive: true },
        { name: "El Comandante", meaning: "Liderazgo pragmático y ejecución de acciones decisivas.", isPositive: true },
        { name: "El Orador", meaning: "Influencia a través del lenguaje y expansión de redes de impacto.", isPositive: true },
        { name: "El Visionario", meaning: "Detección de tendencias futuras y exploración de límites.", isPositive: true },
        { name: "El Embajador", meaning: "Diplomacia estratégica y resolución de tensiones externas.", isPositive: true },
        { name: "El Analista", meaning: "Procesamiento de datos complejos y búsqueda de eficiencia.", isPositive: true },
        { name: "El Mediador", meaning: "Equilibrio de fuerzas opuestas y búsqueda de consenso táctico.", isPositive: true },
        { name: "El Explorador", meaning: "Búsqueda de nuevos territorios y aprendizaje acelerado.", isPositive: true },
        { name: "El Guía", meaning: "Acompañamiento en procesos de evolución y transferencia de sabiduría.", isPositive: true },
        { name: "El Innovador", meaning: "Ruptura de paradigmas y hacking de sistemas establecidos.", isPositive: true },
        { name: "El Guardián", meaning: "Vigilancia de fronteras y preservación de la seguridad.", isPositive: true },
        { name: "El Maestro", meaning: "Dominio técnico y excelencia en la ejecución operativa.", isPositive: true },
        { name: "El Mentor", meaning: "Desarrollo de potencial humano y guía estratégica personalizada.", isPositive: true }
    ];

    static drawCelta(): any {
        const deck = [...this.majorArcana].sort(() => Math.random() - 0.5);
        const positions = [
            "Presente", "Obstáculo", "Meta", "Pasado",
            "Futuro", "Inconsciente", "Poder", "Entorno",
            "Esperanzas", "Resultado"
        ];

        return positions.map((pos, i) => ({
            position: pos,
            card: deck[i].name,
            meaning: deck[i].meaning
        }));
    }

    static drawYesNo(): TarotReading {
        const index = Math.floor(Math.random() * this.majorArcana.length);
        const card = this.majorArcana[index];

        let answer: 'YES' | 'NO' | 'MAYBE' = 'MAYBE';
        if (card.isPositive === true) answer = 'YES';
        if (card.isPositive === false) answer = 'NO';

        return {
            card: card.name,
            arcana: 'MAJOR',
            answer,
            meaning: card.meaning
        };
    }
}
