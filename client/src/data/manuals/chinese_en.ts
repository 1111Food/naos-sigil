import type { ChineseAnimalData, ElementData } from './chinese';

export const CHINESE_MANUAL_EN = {
    intro: {
        title: "The River of Time",
        headerTitle1: "The Internal",
        headerTitle2: "Ecology",
        sources: "Sources: Ludovica Squirru / Chinese Horoscope",
        concept: "The Chinese Horoscope is your Internal Climate and Movement Style",
        content: "Time is not a straight line, it is a spiral. The sexagenary cycle combines 12 animals with 5 elements to create the rhythm of evolution.",
        yinyang: "Yang is action and light; Yin is reflection and receptivity. Everything has a rhythm, and learning to flow with it is the secret of peace.",
        legend: "The Jade Emperor summoned a race to decide the guardians. Each energy arrived in its own way: the Rat with cunning, the Ox with unshakeable effort."
    },
    animalsSectionTitle: "The 12 Guardians",
    animalsSectionSubtitle: "Archetypes of movement",
    labels: {
        essence: "The Essence:",
        light: "In Light (Gifts):",
        shadow: "In Shadow (Challenges):",
        advice: "Taoist Advice:",
        curiousFact: "Curious Fact:"
    },
    elements: [
        { id: 'wood', name: 'Wood', quality: 'Growth, expansion, ethics, and vision for the future.' },
        { id: 'fire', name: 'Fire', quality: 'Passion, dynamism, clarity, and social vitality.' },
        { id: 'earth', name: 'Earth', quality: 'Stability, nourishment, practical sense, and center.' },
        { id: 'metal', name: 'Metal', quality: 'Structure, ambition, resistance, and righteousness.' },
        { id: 'water', name: 'Water', quality: 'Fluidity, deep wisdom, and smooth communication.' }
    ] as ElementData[],
    animals: [
        {
            id: 'rata',
            chinese: 'Zi',
            name: 'Rat',
            archetype: 'The Cunning Conqueror',
            essence: 'Tireless curiosity and the ability to find resources.',
            light: 'Diplomacy, charm, intelligent saving, and sharpness.',
            shadow: 'Manipulation, anxiety through accumulation or criticism.',
            lifestyle: 'Strategist at work; protects its nest in love.',
            advice: 'True abundance is not having much, but knowing that you lack nothing.',
            curiousFact: 'The Rat won the horoscope race by jumping off the Ox\'s back at the last second. It is the master of perfect timing.'
        },
        {
            id: 'buey',
            chinese: 'Chou',
            name: 'Ox',
            archetype: 'The Silent Builder',
            essence: 'The perseverance that moves mountains through rhythmic effort.',
            light: 'Loyalty, infinite patience, reliability, and method.',
            shadow: 'Absolute stubbornness, emotional difficulty, or resentment.',
            lifestyle: 'Values tradition; builds relationships for life.',
            advice: 'Bamboo is strong because it knows how to bend; not all strength is rigidity.',
            curiousFact: 'The Ox is the only animal that can work without rest under the heaviest rain. Represents the power of absolute patience.'
        },
        {
            id: 'tigre',
            chinese: 'Yin',
            name: 'Tiger',
            archetype: 'The Passionate Rebel',
            essence: 'The courage to live under its own rules and emotional intensity.',
            light: 'Magnetism, bravery in the face of injustice, generosity.',
            shadow: 'Destructive impulsiveness, wounded ego, or need for attention.',
            lifestyle: 'Lives in extremes; loves with fire and works in bursts.',
            advice: 'Your strength does not need to be demonstrated by shouting; real power is serene.',
            curiousFact: 'In ancient times, it was believed that the Tiger protected children from bad luck and fires. Its mere presence purifies the home.'
        },
        {
            id: 'conejo',
            chinese: 'Mao',
            name: 'Rabbit',
            archetype: 'The Sensitive Diplomat',
            essence: 'The search for peace, aesthetics, and inner well-being.',
            light: 'Refinement, intuition, prudence, and comfort.',
            shadow: 'Escapism, fear of conflict, or passive manipulation.',
            lifestyle: 'Seeks beautiful environments; tender and in need of security.',
            advice: 'Peace is not the absence of noise, it is the quiet center in the storm.',
            curiousFact: 'The Rabbit is considered the sign of longevity. It is said to dwell on the Moon, pounding the elixir of immortality.'
        },
        {
            id: 'dragon',
            chinese: 'Chen',
            name: 'Dragon',
            archetype: 'The Imperial Dreamer',
            essence: 'The will to manifest the extraordinary and the divine legacy.',
            light: 'Overflowing creativity, vitality, and magnanimous heart.',
            shadow: 'Arrogance, intolerance, or frustration with reality.',
            lifestyle: 'Needs a great cause; theatrical, passionate, and demanding.',
            advice: 'To fly with the clouds, you must first learn to walk on the earth.',
            curiousFact: 'Unlike Western dragons, the Chinese dragon is a creature of water and air that brings rain for crops.'
        },
        {
            id: 'serpiente',
            chinese: 'Si',
            name: 'Snake',
            archetype: 'The Deep Mystic',
            essence: 'Introspection that transmutes experience into wisdom.',
            light: 'Elegance, insight, self-control, and intuition.',
            shadow: 'Mistrust, cold possessiveness, or excessive mystery.',
            lifestyle: 'Selective; always prefers quality over quantity.',
            advice: 'Having many answers is not wisdom; wisdom is knowing when to keep silent.',
            curiousFact: 'The Snake is called "the little dragon". It is the guardian of hidden wisdom and the underground treasures of the soul.'
        },
        {
            id: 'caballo',
            chinese: 'Wu',
            name: 'Horse',
            archetype: 'The Free Spirit',
            essence: 'Emotional autonomy and the need for physical movement.',
            light: 'Enthusiasm, independence, mental agility.',
            shadow: 'Selfishness, inconstancy, or fear of committing.',
            lifestyle: 'Always on the move; needs freedom before returning to the nest.',
            advice: 'Real freedom is not running away, it is not being tied to your desires.',
            curiousFact: 'The Horse represents the sun and quick success. In Taoism, it is said to be capable of "chasing the sun" to the end of the world.'
        },
        {
            id: 'cabra',
            chinese: 'Wei',
            name: 'Goat',
            archetype: 'The Compassionate Artist',
            essence: 'Connection with artistic sensitivity and group harmony.',
            light: 'Empathy, gentle creativity, kindness.',
            shadow: 'Emotional dependence, complaining, or lack of self-discipline.',
            lifestyle: 'Soul of the home; needs to feel needed and surrounded by affection.',
            advice: 'Your softness is your strength; water wears away the hardest rock.',
            curiousFact: 'The Goat is the most artistic sign. A home blessed by a Goat will never lack harmony and spiritual refuge.'
        },
        {
            id: 'mono',
            chinese: 'Shen',
            name: 'Monkey',
            archetype: 'The Unstoppable Innovator',
            essence: 'The joy of discovering how things work and ingenuity.',
            light: 'Versatility, healing humor, mental speed.',
            shadow: 'Deceit, superficiality, or using intelligence to hurt.',
            lifestyle: 'Eternal apprentice; fun but hard to catch.',
            advice: 'Use your mind to serve the heart, and not the other way around.',
            curiousFact: 'The Monkey accidentally invented wine in Chinese mythology by storing fruits in a tree. It is the alchemist of chance.'
        },
        {
            id: 'gallo',
            chinese: 'You',
            name: 'Rooster',
            archetype: 'The Radiant Administrator',
            essence: 'Precision, clarity of vision, and the alert of the new day.',
            light: 'Courage, impeccable organization, honesty.',
            shadow: 'Vanity, biting criticism, or neurotic perfectionism.',
            lifestyle: 'Loves order and recognition; protective and dedicated.',
            advice: 'The sun rises without making a noise; let your actions speak for you.',
            curiousFact: 'The Rooster is the only animal that can drive away ghosts with its crowing at dawn. It is the guardian of sunlight.'
        },
        {
            id: 'perro',
            chinese: 'Xu',
            name: 'Dog',
            archetype: 'The Defender of Justice',
            essence: 'Protecting the truth and ensuring no one is forgotten.',
            light: 'Integrity, loyalty, sense of duty, and generosity.',
            shadow: 'Pessimism, paranoiac mistrust, or stubbornness.',
            lifestyle: 'Gives everything for their loved ones; unconditional.',
            advice: 'Trust in your own goodness before seeking errors in the world.',
            curiousFact: 'The Dog is the guardian of the temple gates. Represents loyalty that transcends even physical death.'
        },
        {
            id: 'cerdo',
            chinese: 'Hai',
            name: 'Pig',
            archetype: 'The Sage of Enjoyment',
            essence: 'The value of sensory pleasure, peace of mind, and honesty.',
            light: 'Nobility, large heart, willpower, and epicureanism.',
            shadow: 'Excessive indulgence, naivety, or carrying others\' problems.',
            lifestyle: 'Tender and stable partner; values banquets and laughter.',
            advice: 'Simplicity is the maximum sophistication; being happy is wisdom.',
            curiousFact: 'The Pig represents the culmination of the cycle and the arrival of abundance. It is the sign of natural honesty.'
        }
    ] as ChineseAnimalData[],
    integration: {
        title: "Integration: The Internal Zoo",
        content: "Although you were born under one guardian, the 12 animals dwell within you. The goal is to orchestrate this zoo according to the climate of the Tao.",
        closing: "May the flow of Water bring you wisdom, and the solidity of Earth grant you peace. Maltiox!"
    }
};
