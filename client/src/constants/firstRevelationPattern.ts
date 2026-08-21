export type SolarElement = 'Fire' | 'Earth' | 'Air' | 'Water';
export type LifePathNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export interface PatternResult {
    lifePath: LifePathNumber;
    solarSign: string;
    solarElement: SolarElement;
    primaryAxis: string;
    expression: string;
    pattern: string;
}

// Map Sun Signs to Elements
export const solarElementMap: Record<string, SolarElement> = {
    Aries: 'Fire',
    Taurus: 'Earth',
    Gemini: 'Air',
    Cancer: 'Water',
    Leo: 'Fire',
    Virgo: 'Earth',
    Libra: 'Air',
    Scorpio: 'Water',
    Sagittarius: 'Fire',
    Capricorn: 'Earth',
    Aquarius: 'Air',
    Pisces: 'Water',
    // Spanish mapping for robustness
    Aries_es: 'Fire',
    Tauro: 'Earth',
    Géminis: 'Air',
    Cáncer: 'Water',
    Leo_es: 'Fire',
    Virgo_es: 'Earth',
    Libra_es: 'Air',
    Escorpio: 'Water',
    Sagitario: 'Fire',
    Capricornio: 'Earth',
    Acuario: 'Air',
    Piscis: 'Water'
};

const normalizeSign = (sign: string): string => {
    const s = sign.toLowerCase().trim();
    if (s.includes('aries')) return 'Aries';
    if (s.includes('taur')) return 'Taurus';
    if (s.includes('gemin') || s.includes('gémin')) return 'Gemini';
    if (s.includes('cancer') || s.includes('cáncer')) return 'Cancer';
    if (s.includes('leo')) return 'Leo';
    if (s.includes('virg')) return 'Virgo';
    if (s.includes('libr')) return 'Libra';
    if (s.includes('scorp') || s.includes('escorp')) return 'Scorpio';
    if (s.includes('sagit') || s.includes('sagitt')) return 'Sagittarius';
    if (s.includes('capri')) return 'Capricorn';
    if (s.includes('aquar') || s.includes('acuar')) return 'Aquarius';
    if (s.includes('pisc')) return 'Pisces';
    return 'Aries'; // Fallback
}

export const getElementForSign = (sign: string): SolarElement => {
    return solarElementMap[normalizeSign(sign)] || 'Fire';
};

// Layer 1: Core Life Path Axis
export const lifePathAxes: Record<LifePathNumber, string> = {
    1: 'Independence ↔ Cooperation',
    2: 'Harmony ↔ Self-Assertion',
    3: 'Expression ↔ Focus',
    4: 'Structure ↔ Freedom',
    5: 'Freedom ↔ Commitment',
    6: 'Care ↔ Self-Preservation',
    7: 'Depth ↔ Exposure',
    8: 'Ambition ↔ Surrender',
    9: 'Service ↔ Boundaries',
    11: 'Intuition ↔ Grounding',
    22: 'Vision ↔ Execution',
    33: 'Service ↔ Self-Nurture'
};

// Layer 2: Elemental Modifiers for Expression
const baseExpressions: Record<LifePathNumber, Record<SolarElement, string>> = {
    1: {
        Fire: 'Independence may become a fiery drive for leadership, but cooperation requires softening your flames.',
        Earth: 'Independence shows up as building your own structures, while cooperation tests your rigid boundaries.',
        Air: 'Independence means the freedom of original thought; cooperation demands translating ideas for others.',
        Water: 'Independence feels like protecting your emotional core; cooperation means risking vulnerability.'
    },
    2: {
        Fire: 'Harmony clashes with your natural fiery assertiveness, creating tension between peace and action.',
        Earth: 'Harmony means material and physical stability, while self-assertion feels like a risk to your security.',
        Air: 'Harmony is sought through diplomacy and logic, making emotional self-assertion a complex puzzle.',
        Water: 'Harmony means deep emotional merging, but self-assertion requires honoring your own separate boundaries.'
    },
    3: {
        Fire: 'Expression bursts outward as creative passion, but maintaining focus requires burning slow and steady.',
        Earth: 'Expression seeks tangible, practical forms. Focus is natural until perfectionism halts your creativity.',
        Air: 'Expression flows as endless ideas and words. Focus is the hardest task when the mental wind blows everywhere.',
        Water: 'Expression is deeply emotional and artistic. Focus requires riding the waves of your changing moods.'
    },
    4: {
        Fire: 'Structure feels like a cage to your fiery spirit, yet it is the only container strong enough for your vision.',
        Earth: 'Structure is your natural habitat, but total freedom can feel terrifyingly ungrounded and chaotic.',
        Air: 'Structure organizes your scattered thoughts, but too much routine suffocates your need for mental freedom.',
        Water: 'Structure provides a safe emotional container, yet your watery nature inherently seeks boundless freedom.'
    },
    5: {
        Fire: 'Freedom may become a restless need for constant expansion, making long-term commitment feel like a trap.',
        Earth: 'Freedom may become resistance to feeling physically constrained, while commitment tests your material security.',
        Air: 'Freedom is an absolute mental necessity, making any intellectual or social commitment feel like a contract.',
        Water: 'Freedom means exploring emotional depths without anchors, making stable commitment feel intimidating.'
    },
    6: {
        Fire: 'Care is expressed through passionate protection, but you often forget to preserve your own burning energy.',
        Earth: 'Care means providing absolute material stability, often at the cost of your own physical exhaustion.',
        Air: 'Care is offering brilliant advice and social support, sometimes neglecting your own mental preservation.',
        Water: 'Care means absorbing the emotional weight of others, making self-preservation a daily emotional challenge.'
    },
    7: {
        Fire: 'Depth requires solitary spiritual quests, but your fiery nature eventually demands explosive external exposure.',
        Earth: 'Depth means rigorous, silent mastery of skills, making public exposure feel uncomfortably unpolished.',
        Air: 'Depth is a constant intellectual investigation, but exposing your unfiltered thoughts feels dangerously vulnerable.',
        Water: 'Depth is diving into the subconscious ocean, while surface-level exposure feels fake and draining.'
    },
    8: {
        Fire: 'Ambition is a burning crusade for power, making the spiritual concept of surrender feel like defeat.',
        Earth: 'Ambition focuses on building massive, tangible wealth, while surrender requires trusting the invisible.',
        Air: 'Ambition means strategic, intellectual dominance, but surrender requires dropping the mental chess game.',
        Water: 'Ambition is fueled by emotional intensity, making the art of surrender a profound emotional release.'
    },
    9: {
        Fire: 'Service is a passionate, fiery crusade for humanity, but setting boundaries requires saying no to the flame.',
        Earth: 'Service means practical, heavy lifting for the world, making personal boundaries feel like neglecting duty.',
        Air: 'Service is teaching and sharing universal ideas, but boundaries are needed to stop intellectual drain.',
        Water: 'Service is boundless empathy for all suffering, making emotional boundaries your ultimate life lesson.'
    },
    11: {
        Fire: 'Intuition comes as lightning-fast, fiery revelations, but grounding them into reality takes immense patience.',
        Earth: 'Intuition flows surprisingly well into physical crafts, yet the heavy earth makes spiritual flight difficult.',
        Air: 'Intuition is translated into complex, brilliant theories, but grounding means getting out of your own head.',
        Water: 'Intuition is profoundly psychic and emotional, making grounding in the harsh physical world overwhelming.'
    },
    22: {
        Fire: 'Vision is massive and dynamic, but the slow, methodical execution requires tempering your impatient fire.',
        Earth: 'Vision meets masterful, practical execution naturally, but the risk is losing the magic in the mundane details.',
        Air: 'Vision is architecturally brilliant in theory, but the heavy lifting of execution bores your fast-moving mind.',
        Water: 'Vision is divinely inspired, but execution requires navigating through deep, paralyzing emotional waters.'
    },
    33: {
        Fire: 'Service to others burns with radical love, but self-nurture is often forgotten until the burnout hits.',
        Earth: 'Service is providing rock-solid foundations for everyone, making your own self-nurture feel terribly selfish.',
        Air: 'Service means uplifting the collective consciousness, but your own mind needs quiet nurture to stay sane.',
        Water: 'Service is the ultimate emotional sacrifice, making self-nurture a matter of absolute spiritual survival.'
    }
};

const synthesizePattern = (axis: string, expression: string): string => {
    // We just return the expression directly, as the prompt requested the UI to show the axis, then the expression.
    return expression;
};

export const patternComposer = (lifePath: LifePathNumber, solarSign: string): PatternResult => {
    const element = getElementForSign(solarSign);
    const primaryAxis = lifePathAxes[lifePath] || lifePathAxes[1];
    
    // Safely get expression, fallback to LP 1 Fire if somehow invalid
    const lpExpressions = baseExpressions[lifePath] || baseExpressions[1];
    const expression = lpExpressions[element] || lpExpressions['Fire'];
    
    return {
        lifePath,
        solarSign: normalizeSign(solarSign),
        solarElement: element,
        primaryAxis,
        expression,
        pattern: synthesizePattern(primaryAxis, expression)
    };
};
