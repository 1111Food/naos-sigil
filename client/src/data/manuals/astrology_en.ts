import { HOUSES_LIB_EN, PLANETS_LIB_EN, SIGNS_LIB_EN } from '../astrologyLibrary_en';
import type { AstroSection, PlanetDescription, SignDescription, HouseDescription } from './astrology';

export const ASTROLOGY_MANUAL_EN = {
    headerTitle1: "The Theater",
    headerTitle2: "of the Sky",
    navLibrary: "Library",
    navTitle: "The Theater of Life",
    actPlanets: "The Actors",
    actSigns: "The Wardrobe",
    actHouses: "The Scenarios",
    intro: {
        title: "The Theater of the Sky",
        concept: "Your Birth Chart is the Script of your Interior Theater",
        sections: [
            {
                id: 'intro',
                title: 'What is a Birth Chart?',
                level: 'INTRO',
                content: 'Your Birth Chart is a photograph of the sky at the exact instant of your birth. It is a map of your psyche and a script for your life.',
                metaphor: 'It is the Map of the Interior Treasure.'
            },
            {
                id: 'triad',
                title: 'The Sacred Triad',
                level: 'INTRO',
                content: 'To understand your chart, we unite three elements: Planet (energy), Sign (style), and House (scenario).',
                metaphor: 'Actor + Costume + Stage = Your Reality.'
            }
        ] as AstroSection[]
    },
    planets: {
        Sun: {
            intro: PLANETS_LIB_EN.Sun.mission,
            character: PLANETS_LIB_EN.Sun.archetype,
            keywords: PLANETS_LIB_EN.Sun.keywords,
            light: PLANETS_LIB_EN.Sun.potential,
            shadow: PLANETS_LIB_EN.Sun.shadow,
            advice: PLANETS_LIB_EN.Sun.question,
            essence: PLANETS_LIB_EN.Sun.essence
        },
        Moon: {
            intro: PLANETS_LIB_EN.Moon.mission,
            character: PLANETS_LIB_EN.Moon.archetype,
            keywords: PLANETS_LIB_EN.Moon.keywords,
            light: PLANETS_LIB_EN.Moon.potential,
            shadow: PLANETS_LIB_EN.Moon.shadow,
            advice: PLANETS_LIB_EN.Moon.question,
            essence: PLANETS_LIB_EN.Moon.essence
        },
        Mercury: {
            intro: PLANETS_LIB_EN.Mercury.mission,
            character: PLANETS_LIB_EN.Mercury.archetype,
            keywords: PLANETS_LIB_EN.Mercury.keywords,
            light: PLANETS_LIB_EN.Mercury.potential,
            shadow: PLANETS_LIB_EN.Mercury.shadow,
            advice: PLANETS_LIB_EN.Mercury.question,
            essence: PLANETS_LIB_EN.Mercury.essence
        },
        Venus: {
            intro: PLANETS_LIB_EN.Venus.mission,
            character: PLANETS_LIB_EN.Venus.archetype,
            keywords: PLANETS_LIB_EN.Venus.keywords,
            light: PLANETS_LIB_EN.Venus.potential,
            shadow: PLANETS_LIB_EN.Venus.shadow,
            advice: PLANETS_LIB_EN.Venus.question,
            essence: PLANETS_LIB_EN.Venus.essence
        },
        Mars: {
            intro: PLANETS_LIB_EN.Mars.mission,
            character: PLANETS_LIB_EN.Mars.archetype,
            keywords: PLANETS_LIB_EN.Mars.keywords,
            light: PLANETS_LIB_EN.Mars.potential,
            shadow: PLANETS_LIB_EN.Mars.shadow,
            advice: PLANETS_LIB_EN.Mars.question,
            essence: PLANETS_LIB_EN.Mars.essence
        },
        Jupiter: {
            intro: PLANETS_LIB_EN.Jupiter.mission,
            character: PLANETS_LIB_EN.Jupiter.archetype,
            keywords: PLANETS_LIB_EN.Jupiter.keywords,
            light: PLANETS_LIB_EN.Jupiter.potential,
            shadow: PLANETS_LIB_EN.Jupiter.shadow,
            advice: PLANETS_LIB_EN.Jupiter.question,
            essence: PLANETS_LIB_EN.Jupiter.essence
        },
        Saturn: {
            intro: PLANETS_LIB_EN.Saturn.mission,
            character: PLANETS_LIB_EN.Saturn.archetype,
            keywords: PLANETS_LIB_EN.Saturn.keywords,
            light: PLANETS_LIB_EN.Saturn.potential,
            shadow: PLANETS_LIB_EN.Saturn.shadow,
            advice: PLANETS_LIB_EN.Saturn.question,
            essence: PLANETS_LIB_EN.Saturn.essence
        },
        Uranus: {
            intro: PLANETS_LIB_EN.Uranus.mission,
            character: PLANETS_LIB_EN.Uranus.archetype,
            keywords: PLANETS_LIB_EN.Uranus.keywords,
            light: PLANETS_LIB_EN.Uranus.potential,
            shadow: PLANETS_LIB_EN.Uranus.shadow,
            advice: PLANETS_LIB_EN.Uranus.question,
            essence: PLANETS_LIB_EN.Uranus.essence
        },
        Neptune: {
            intro: PLANETS_LIB_EN.Neptune.mission,
            character: PLANETS_LIB_EN.Neptune.archetype,
            keywords: PLANETS_LIB_EN.Neptune.keywords,
            light: PLANETS_LIB_EN.Neptune.potential,
            shadow: PLANETS_LIB_EN.Neptune.shadow,
            advice: PLANETS_LIB_EN.Neptune.question,
            essence: PLANETS_LIB_EN.Neptune.essence
        },
        Pluto: {
            intro: PLANETS_LIB_EN.Pluto.mission,
            character: PLANETS_LIB_EN.Pluto.archetype,
            keywords: PLANETS_LIB_EN.Pluto.keywords,
            light: PLANETS_LIB_EN.Pluto.potential,
            shadow: PLANETS_LIB_EN.Pluto.shadow,
            advice: PLANETS_LIB_EN.Pluto.question,
            essence: PLANETS_LIB_EN.Pluto.essence
        }
    } as Record<string, PlanetDescription>,
    signs: {
        Aries: {
            gift: "Heroic Initiative",
            element: "Fire",
            modality: "Cardinal",
            ruler: "Mars",
            essence: SIGNS_LIB_EN.Aries.essence,
            light: SIGNS_LIB_EN.Aries.gift,
            shadow: SIGNS_LIB_EN.Aries.trap,
            advice: "Learn that sustaining a flame is as important as lighting it."
        },
        Taurus: {
            gift: "Stable Perseverance",
            element: "Earth",
            modality: "Fixed",
            ruler: "Venus",
            essence: SIGNS_LIB_EN.Taurus.essence,
            light: SIGNS_LIB_EN.Taurus.gift,
            shadow: SIGNS_LIB_EN.Taurus.trap,
            advice: "Detachment does not take away your value; it teaches you that your true treasure is yourself."
        },
        Gemini: {
            gift: "Versatile Curiosity",
            element: "Air",
            modality: "Mutable",
            ruler: "Mercury",
            essence: SIGNS_LIB_EN.Gemini.essence,
            light: SIGNS_LIB_EN.Gemini.gift,
            shadow: SIGNS_LIB_EN.Gemini.trap,
            advice: "Choose a direction and go deep; knowing a little of everything is sometimes truly knowing nothing."
        },
        Cancer: {
            gift: "Protective Empathy",
            element: "Water",
            modality: "Cardinal",
            ruler: "Moon",
            essence: SIGNS_LIB_EN.Cancer.essence,
            light: SIGNS_LIB_EN.Cancer.gift,
            shadow: SIGNS_LIB_EN.Cancer.trap,
            advice: "To forgive is to stop living in the emotional memory of pain."
        },
        Leo: {
            gift: "Radiant Heart",
            element: "Fire",
            modality: "Fixed",
            ruler: "Sun",
            essence: SIGNS_LIB_EN.Leo.essence,
            light: SIGNS_LIB_EN.Leo.gift,
            shadow: SIGNS_LIB_EN.Leo.trap,
            advice: "The true king does not need constant applause to know he wears a crown."
        },
        Virgo: {
            gift: "Humble Service",
            element: "Earth",
            modality: "Mutable",
            ruler: "Mercury",
            essence: SIGNS_LIB_EN.Virgo.essence,
            light: SIGNS_LIB_EN.Virgo.gift,
            shadow: SIGNS_LIB_EN.Virgo.trap,
            advice: "Perfection is the enemy of the good. Love the imperfect process of existence."
        },
        Libra: {
            gift: "Harmonic Cooperation",
            element: "Air",
            modality: "Cardinal",
            ruler: "Venus",
            essence: SIGNS_LIB_EN.Libra.essence,
            light: SIGNS_LIB_EN.Libra.gift,
            shadow: SIGNS_LIB_EN.Libra.trap,
            advice: "An honest conflict is a thousand times healthier than a false and complacent peace."
        },
        Scorpio: {
            gift: "Deep Transmutation",
            element: "Water",
            modality: "Fixed",
            ruler: "Pluto / Mars",
            essence: SIGNS_LIB_EN.Scorpio.essence,
            light: SIGNS_LIB_EN.Scorpio.gift,
            shadow: SIGNS_LIB_EN.Scorpio.trap,
            advice: "Letting go of control doesn't make you weak; it makes you invincible before the flow of the cosmos."
        },
        Sagittarius: {
            gift: "Inspirational Vision",
            element: "Fire",
            modality: "Mutable",
            ruler: "Jupiter",
            essence: SIGNS_LIB_EN.Sagittarius.essence,
            light: SIGNS_LIB_EN.Sagittarius.gift,
            shadow: SIGNS_LIB_EN.Sagittarius.trap,
            advice: "Truth has many faces; be careful not to turn your truth into the only dogma."
        },
        Capricorn: {
            gift: "Master Integrity",
            element: "Earth",
            modality: "Cardinal",
            ruler: "Saturn",
            essence: SIGNS_LIB_EN.Capricorn.essence,
            light: SIGNS_LIB_EN.Capricorn.gift,
            shadow: SIGNS_LIB_EN.Capricorn.trap,
            advice: "Material success without emotional joy is the loneliest mountain in the world."
        },
        Aquarius: {
            gift: "Fraternal Innovation",
            element: "Air",
            modality: "Fixed",
            ruler: "Uranus / Saturn",
            essence: SIGNS_LIB_EN.Aquarius.essence,
            light: SIGNS_LIB_EN.Aquarius.gift,
            shadow: SIGNS_LIB_EN.Aquarius.trap,
            advice: "You love humanity in theory, remember to love complex human individuals in practice."
        },
        Pisces: {
            gift: "Unconditional Love",
            element: "Water",
            modality: "Mutable",
            ruler: "Neptune / Jupiter",
            essence: SIGNS_LIB_EN.Pisces.essence,
            light: SIGNS_LIB_EN.Pisces.gift,
            shadow: SIGNS_LIB_EN.Pisces.trap,
            advice: "You need anchors in physical reality so that your ocean does not drown you."
        }
    } as Record<string, SignDescription>,
    houses: {
        1: {
            summary: HOUSES_LIB_EN[1].scenario,
            theme: HOUSES_LIB_EN[1].title,
            signs: HOUSES_LIB_EN[1].challenge,
            manifestation: HOUSES_LIB_EN[1].manifestation,
            essence: HOUSES_LIB_EN[1].essence,
            shadow: HOUSES_LIB_EN[1].shadow
        },
        2: {
            summary: HOUSES_LIB_EN[2].scenario,
            theme: HOUSES_LIB_EN[2].title,
            signs: HOUSES_LIB_EN[2].challenge,
            manifestation: HOUSES_LIB_EN[2].manifestation,
            essence: HOUSES_LIB_EN[2].essence,
            shadow: HOUSES_LIB_EN[2].shadow
        },
        3: {
            summary: HOUSES_LIB_EN[3].scenario,
            theme: HOUSES_LIB_EN[3].title,
            signs: HOUSES_LIB_EN[3].challenge,
            manifestation: HOUSES_LIB_EN[3].manifestation,
            essence: HOUSES_LIB_EN[3].essence,
            shadow: HOUSES_LIB_EN[3].shadow
        },
        4: {
            summary: HOUSES_LIB_EN[4].scenario,
            theme: HOUSES_LIB_EN[4].title,
            signs: HOUSES_LIB_EN[4].challenge,
            manifestation: HOUSES_LIB_EN[4].manifestation,
            essence: HOUSES_LIB_EN[4].essence,
            shadow: HOUSES_LIB_EN[4].shadow
        },
        5: {
            summary: HOUSES_LIB_EN[5].scenario,
            theme: HOUSES_LIB_EN[5].title,
            signs: HOUSES_LIB_EN[5].challenge,
            manifestation: HOUSES_LIB_EN[5].manifestation,
            essence: HOUSES_LIB_EN[5].essence,
            shadow: HOUSES_LIB_EN[5].shadow
        },
        6: {
            summary: HOUSES_LIB_EN[6].scenario,
            theme: HOUSES_LIB_EN[6].title,
            signs: HOUSES_LIB_EN[6].challenge,
            manifestation: HOUSES_LIB_EN[6].manifestation,
            essence: HOUSES_LIB_EN[6].essence,
            shadow: HOUSES_LIB_EN[6].shadow
        },
        7: {
            summary: HOUSES_LIB_EN[7].scenario,
            theme: HOUSES_LIB_EN[7].title,
            signs: HOUSES_LIB_EN[7].challenge,
            manifestation: HOUSES_LIB_EN[7].manifestation,
            essence: HOUSES_LIB_EN[7].essence,
            shadow: HOUSES_LIB_EN[7].shadow
        },
        8: {
            summary: HOUSES_LIB_EN[8].scenario,
            theme: HOUSES_LIB_EN[8].title,
            signs: HOUSES_LIB_EN[8].challenge,
            manifestation: HOUSES_LIB_EN[8].manifestation,
            essence: HOUSES_LIB_EN[8].essence,
            shadow: HOUSES_LIB_EN[8].shadow
        },
        9: {
            summary: HOUSES_LIB_EN[9].scenario,
            theme: HOUSES_LIB_EN[9].title,
            signs: HOUSES_LIB_EN[9].challenge,
            manifestation: HOUSES_LIB_EN[9].manifestation,
            essence: HOUSES_LIB_EN[9].essence,
            shadow: HOUSES_LIB_EN[9].shadow
        },
        10: {
            summary: HOUSES_LIB_EN[10].scenario,
            theme: HOUSES_LIB_EN[10].title,
            signs: HOUSES_LIB_EN[10].challenge,
            manifestation: HOUSES_LIB_EN[10].manifestation,
            essence: HOUSES_LIB_EN[10].essence,
            shadow: HOUSES_LIB_EN[10].shadow
        },
        11: {
            summary: HOUSES_LIB_EN[11].scenario,
            theme: HOUSES_LIB_EN[11].title,
            signs: HOUSES_LIB_EN[11].challenge,
            manifestation: HOUSES_LIB_EN[11].manifestation,
            essence: HOUSES_LIB_EN[11].essence,
            shadow: HOUSES_LIB_EN[11].shadow
        },
        12: {
            summary: HOUSES_LIB_EN[12].scenario,
            theme: HOUSES_LIB_EN[12].title,
            signs: HOUSES_LIB_EN[12].challenge,
            manifestation: HOUSES_LIB_EN[12].manifestation,
            essence: HOUSES_LIB_EN[12].essence,
            shadow: HOUSES_LIB_EN[12].shadow
        }
    } as Record<number, HouseDescription>,
    integration: {
        title: "Integration: The Theater of Life",
        content: "Understanding your Birth Chart is not about memorizing data, it is about learning to direct the characters that inhabit you.",
        closing: "You are the director of your own cosmos."
    }
};
