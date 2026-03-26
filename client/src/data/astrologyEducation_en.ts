// client/src/data/astrologyEducation_en.ts

export interface EducationSection {
    id: string;
    title: string;
    level: 'INTRO' | 'INTERMEDIATE' | 'PREMIUM';
    content: string;
    metaphor: string;
}

export const ASTRO_EDUCATION_EN: Record<string, EducationSection> = {
    'intro': {
        id: 'intro',
        title: 'What is a Natal Chart?',
        level: 'INTRO',
        content: 'Your Natal Chart is a photograph of the sky at the exact moment of your birth. It is a map of your psyche and a script for your life.',
        metaphor: 'It is the Inner Treasure Map.'
    },
    'triad': {
        id: 'triad',
        title: 'The Sacred Triad',
        level: 'INTRO',
        content: 'To understand your chart, we join three elements: Planet (energy), Sign (style), and House (scenario).',
        metaphor: 'Actor + Costume + Scenario = Your Reality.'
    }
};

export const PLANET_DESCRIPTIONS_EN: Record<string, { intro: string; character: string }> = {
    Sun: {
        intro: "The center of your inner solar system.",
        character: "The King - Your conscious identity and vital purpose."
    },
    Moon: {
        intro: "Your emotional tides and intimate refuge.",
        character: "The Internal Mother - Your needs for security and affection."
    },
    Mercury: {
        intro: "The bridge between the inner and outer world.",
        character: "The Messenger - Your way of thinking, learning, and communicating."
    },
    Venus: {
        intro: "What you value and how you seek harmony.",
        character: "The Lover - Your way of attracting, loving, and valuing."
    },
    Mars: {
        intro: "Your capacity for conquest and defense.",
        character: "The Warrior - Your engine of action and willpower."
    },
    Jupiter: {
        intro: "Your search for meaning and expansion.",
        character: "The Teacher - Your capacity to trust and grow."
    },
    Saturn: {
        intro: "Your limits that become mastery.",
        character: "The Architect - Your responsibility and internal authority."
    },
    Uranus: {
        intro: "Your need to break what is obsolete.",
        character: "The Revolutionary - Your genius and unique freedom."
    },
    Neptune: {
        intro: "Your connection with the mystical totality.",
        character: "The Mystic - Your inspiration, dreams, and compassion."
    },
    Pluto: {
        intro: "Your power to die and be reborn.",
        character: "The Alchemist - Your resilience and transformative power."
    }
};

export const HOUSE_DESCRIPTIONS_EN: Record<number, string> = {
    1: "Your entrance to the world, your initial impact, and personality.",
    2: "Your resources, talents, and what you value materially.",
    3: "Your communication, everyday intellect, and close environment.",
    4: "Your roots, home, family, and private world.",
    5: "Your creative expression, romances, children, and play.",
    6: "Your routine, health, daily work, and service.",
    7: "Your relationship bonds, partners, and the mirror of the other.",
    8: "Your deep transformations, taboos, and shared resources.",
    9: "Your philosophy, long travels, faith, and distant horizons.",
    10: "Your vocation, social status, and professional peak.",
    11: "Your friends, social groups, and collective projects.",
    12: "Your unconscious, dreams, and ego dissolution."
};

export const SIGN_DESCRIPTIONS_EN: Record<string, { gift: string; shadow: string }> = {
    Aries: { gift: "Gift of absolute beginnings and courage", shadow: "Childish impatience and tantrums" },
    Taurus: { gift: "Serene perseverance and strength to build", shadow: "Fear of letting go and blind stubbornness" },
    Gemini: { gift: "Agile intelligence and brilliant versatility", shadow: "Nerviosism and flight to avoid commitment" },
    Cancer: { gift: "Empathetic radar and infinite capacity to nourish", shadow: "Painful refuge and subtle manipulation" },
    Leo: { gift: "Radiant heart and authentic creative leadership", shadow: "Blindness of pride and toxic need for attention" },
    Virgo: { gift: "Real service, healthy efficiency, and vital order", shadow: "Paralyzing perfectionism and hurtful criticism" },
    Libra: { gift: "Empathetic diplomacy and master gift of balance", shadow: "Agonizing indecision and panic terror of confronting" },
    Scorpio: { gift: "Alchemical resilience and indestructible love", shadow: "Poison of jealousy, paranoia, and hidden control" },
    Sagittarius: { gift: "Visionary fire, optimism, and rhythmic truth", shadow: "Empty rebellion and reckless extremism" },
    Capricorn: { gift: "Stoic strength, discipline, and incorruptible integrity", shadow: "Icy resignation and high-wall ambition" },
    Aquarius: { gift: "Altruistic genius and selfless humanitarianism", shadow: "Intellectual superiority and individual disconnection" },
    Pisces: { gift: "Cosmic mystical empathy and sacred forgiveness", shadow: "Addictive evasion and total lack of grounding" }
};
