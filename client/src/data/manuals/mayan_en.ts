import type { NahualData } from './mayan';

export const MAYAN_MANUAL_EN: {
    intro: { title: string; headerTitle1: string; headerTitle2: string; concept: string; content: string };
    mayanCross: { title: string; sectionTitle: string; sectionSubtitle: string; metaphor: string; positions: { id: string; title: string; description: string }[] };
    forces: { title: string; subtitle: string };
    nahuales: NahualData[];
    integration: { title: string; content: string; closing: string };
} = {
    intro: {
        title: "The Cholq'ij: The Loom of Time",
        headerTitle1: "The Code",
        headerTitle2: "of Time",
        concept: "You don't have a nahual, you walk with a force of nature",
        content: "The sacred calendar does not count linear time, but the evolution of biological and spiritual consciousness. Extracted from the ancient Mayan worldview (referencing the Book of Destiny), each Nawal is a pure intelligence. At birth, that energy imprints its vibratory frequency on the fabric of your psyche."
    },
    mayanCross: {
        title: "The Mayan Cross: The Structure of the Soul",
        sectionTitle: "The Mayan Cross",
        sectionSubtitle: "The biological and spiritual architecture of your soul",
        metaphor: "You are a tree: your feet are the roots (your past), your head is the crown (your destiny), your arms are the balance, and your heart is the trunk.",
        positions: [
            { id: 'center', title: 'Center (Heart)', description: 'Your pure essence, your birth Nawal. The trunk that sustains your life.' },
            { id: 'head', title: 'Destiny (Head)', description: 'The energy that guides your future and evolution. Where your branches grow.' },
            { id: 'feet', title: 'Conception (Feet)', description: 'The cosmic energy that begot you, your lineage and base strength.' },
            { id: 'right', title: 'Right Arm', description: 'Your active, rational, material side and earthly challenges.' },
            { id: 'left', title: 'Left Arm', description: 'Your magical, intuitive, receptive side and the spiritual force that assists you.' }
        ]
    },
    forces: {
        title: "The 20 Forces",
        subtitle: "The nahuales of creation"
    },
    nahuales: [
        {
            id: 'batz',
            kiche: "B'atz'",
            spanish: "The Thread / The Monkey",
            totem: "Monkey",
            meaning: "The thread of time that weaves history. It represents the beginning and the end, life and infinity. Symbolizes the umbilical cord that joins us to the Creator and to the Orion constellation.",
            characteristics: "They are creative, judicious, and planning people. They usually anticipate events and have a natural gift for arts, music, and community organization.",
            essence: "The energy of the beginning and absolute creativity. It is the weaver of destiny.",
            light: "Born artists and masters, defenders of their people, problem solvers, great sense of family, intelligent and persuasive.",
            shadow: "They can be very proud, extremely demanding of themselves and others, arrogant or ambitious.",
            mission: "Weave community and artistic life plans, and teach the guiding thread of love.",
            advice: "Take the thread of your life with awareness, for each thought and action is a knot you tie or untie in your own existence."
        },
        {
            id: 'e',
            kiche: "E",
            spanish: "The Path / The Tooth",
            totem: "Wildcat",
            meaning: "It is the path, destiny, travels, the guide, natural authority. Symbolizes the straight journey of life and history, the sacred path between earth and sky.",
            characteristics: "Travelers and leaders by nature. Understanding, very kind, and dreamers. They need space and freedom; monotony is stifling for them.",
            essence: "The energy of movement, the intermediary that clears physical and spiritual routes.",
            light: "They teach and guide. They are excellent diplomats, adaptable, supportive, seekers of cosmic truth.",
            shadow: "If they lose their center, they are unstable, manipulative, unfaithful to their path or can suffer misunderstanding and isolation.",
            mission: "Open paths of light and share the knowledge acquired on all their travels.",
            advice: "The path is made by walking; do not fear the summit, but never forget that the journey is more important than the destination itself."
        },
        {
            id: 'aj',
            kiche: "Aj",
            spanish: "The Cane / Authority",
            totem: "Armadillo",
            meaning: "The cane, the cornfield, the home, the family, the staff of command or authority (spiritual rod). The triumph and abundance of the group.",
            characteristics: "Protectors and tireless workers. They are the foundations of their family. They feel a deep love for nature, plants, and everything that germinates.",
            essence: "The energy of rooting, continuous rebirth, and the warmth of sweet home.",
            light: "Ethical people, studious, leaders of their lineage, guardians of the corn, responsible and generous.",
            shadow: "Too proud, destructive of their own sowing if they get depressed, or extremely variable and possessive.",
            mission: "Sow integrity and protect the sacred sense of life in family.",
            advice: "Ensure that the cane of your life is strong on the outside, but always compassionate and sweet on the inside."
        },
        {
            id: 'ix',
            kiche: "I'x",
            spanish: "The Jaguar / Magic",
            totem: "Jaguar",
            meaning: "The strength of Mother Earth, feline, feminine energy, and of the Mayan altar. Symbolizes the heart of the planet and the power of natural magic.",
            characteristics: "Mysterious, brave, and strategic. They possess a feline magnetism and high intuition. They capture the energies of places and people instantly.",
            essence: "The vital and protective power of the night and sacred places.",
            light: "Amazing guardians, healers with high magic, deep researchers, fierce defenders of their clan.",
            shadow: "If they vibrate low, they are vengeful, envious, angry or manipulate matter for selfish benefit.",
            mission: "Protect the cosmic altar of Mother Earth with stealth and purity of heart.",
            advice: "In the absolute silence of the jungle and of your own interior you will find your purest strength."
        },
        {
            id: 'tzikin',
            kiche: "Tz'ikin",
            spanish: "The Eagle / The Quetzal",
            totem: "Eagle",
            meaning: "The intermediary between the Creator Heart of Sky and humanity. Symbolizes fortune, love, balance, mercantile and spiritual abundance.",
            characteristics: "Independent, charismatic, outstanding businesspeople. They have a panoramic vision of life that allows them to see success where others do not.",
            essence: "The elevated vision and freedom of the wind. They attract good luck by inertia.",
            light: "Brilliant ideologues, creators of abundance, intuitive, with premonition gifts and very sociable.",
            shadow: "If they fall, they can become greedy, treacherous in love or business, wasteful and impatient.",
            mission: "Raise material awareness and bring freedom and independence to the spirit.",
            advice: "Fly as high as your wings allow, but remember that a bird never despises the branch that holds it: use your abundance to elevate others."
        },
        {
            id: 'ajmaq',
            kiche: "Ajmaq",
            spanish: "Forgiveness / Guilt",
            totem: "Bee",
            meaning: "Represents the grandparents and ancestors. It is the energy of curiosity, but also of hiding the intimate. Symbolizes forgiveness, light and darkness, sin and repentance.",
            characteristics: "Silent and analytical observers. Very sweet but withdrawn people at first. They know how to listen like no one else and see the invisible.",
            essence: "The deep force that travels through darkness to find absolution.",
            light: "Wise counselors, great doctors of the soul, psychic researchers, deeply peaceful and patient.",
            shadow: "Trapped by guilt, lies and vice if they do not forgive themselves and others. Tendency to hold grudges in silence.",
            mission: "Clear the ancestral path through forgiveness and teach the art of redemption.",
            advice: "True forgiveness is not giving your justification to the offender, it is simply opening the door of your own emotional prison."
        },
        {
            id: 'noj',
            kiche: "No'j",
            spanish: "Wisdom / Thought",
            totem: "Woodpecker",
            meaning: "The brain, knowledge, logic and cosmic ideas. Represents the power of the mind, universal memory and connection with the Great Spirit.",
            characteristics: "Logical, studious and intellectual. Very idealistic, always seeking perfection and order in all things. They carry a revolution in their head.",
            essence: "Tuning with the universal and terrestrial knowledge network.",
            light: "Just leaders and brilliant inventors. Their prudence and wisdom makes them elite counselors. Ideologues par excellence.",
            shadow: "If they disconnect from the heart, they are intellectual overbearing, proud, manipulative or neurotic due to overthinking.",
            mission: "Manifest virtuous thoughts and bring mental solutions for the progress of humanity.",
            advice: "A brilliant mind without human compassion is like a desert of perfect but dead crystals. Connect your reason with your chest."
        },
        {
            id: 'tijax',
            kiche: "Tijax",
            spanish: "The Flint / The Lightning",
            totem: "Swordfish",
            meaning: "The obsidian knife, double-edged. It is the force to cut evils and diseases. Represents the sharp, healing suffering and revealing pyramids.",
            characteristics: "Radical, protective and firm of character. People who do not tolerate detours. They suffer human pain and have hands that heal stagnant energy.",
            essence: "The purifying power of the lightning that cuts the illusion to reveal the truth.",
            light: "Excellent doctors (surgeons), inflexible social justice seekers, incorruptible protectors, mystics without fear.",
            shadow: "Cutting and aggressive, hurtful with words. They generate chronic conflict if they do not learn to manage their inner knife.",
            mission: "Extirpate that which poisons the life of the family and society, from the physical to the energetic.",
            advice: "Learn to brandish the sword of truth. Sometimes it is necessary to cut dry branches, but take care not to cut those you love by mistake."
        },
        {
            id: 'kawoq',
            kiche: "Kawoq",
            spanish: "The Storm / The Family",
            totem: "Turtle",
            meaning: "The human community, the woman as provider and consolidator of the group. It is the strong downpour that nourishes, but can also flood and devastate.",
            characteristics: "Maternal, patriarchal and expansive. They absorb others' pain. For them everything is about the group; solitude is not usually their favorite ally.",
            essence: "The impenetrable collective strength and cosmic nourishment that waters the entire family.",
            light: "Attract deep abundance, innate midwives and healers (community psychologists), defend their own vehemently.",
            shadow: "Chronic busybodies and meddlers, emotional manipulators. They can explode devastating everything like a hurricane if they repress their emotions.",
            mission: "Group the scattered, lead with love and establish compassionate order.",
            advice: "After the tempestuous bustle of being with others, find yourself. Dare to shine outside your collective shell."
        },
        {
            id: 'ajpu',
            kiche: "Ajpu",
            spanish: "The Sun / The Blowgunner",
            totem: "Lion",
            meaning: "It is the lord, the deity, the sun, the great warrior and walker of light who overcomes the trials of the underworld. Certainty and material or spiritual fulfillment.",
            characteristics: "Noble, brave, born hunters of opportunities and challenges. They possess inexhaustible energy and a strong ego. They overcome obstacles because they always trust.",
            essence: "The absolute brilliance of achieving realization after the last battle.",
            light: "Defending champions, spiritual visionaries, talented artists. Their physical and intellectual feats captivate everyone.",
            shadow: "If the ego dominates them, they are despots, verbally infallible egomaniacs but irresponsible in action. They can leave projects half-finished.",
            mission: "Bring the fire and interior divinity to the surface of men. Be spiritual victory made flesh.",
            advice: "Your greatest enemy is never the world; it is the inner tyrant. Overcome him, and your sun will give life permanently."
        },
        {
            id: 'imox',
            kiche: "Imox",
            spanish: "The Crocodile / The Sea",
            totem: "Crocodile",
            meaning: "Represents madness and the hidden/left side of the brain. They are the primal waters, the dense dreams, the interior mystic ocean.",
            characteristics: "Extremely sensitive, natural psychics, bohemian artists and creators. They capture what no one else captures. They are seas of undecipherable depth.",
            essence: "The cradle of the cosmos in its aquatic and illogical state, from where supreme intuition is born.",
            light: "Unique spiritual healers and interpreters. Their creative channels change paradigms. Deep receptors of the world's pain.",
            shadow: "Extreme mood instability, tendency to mental chaos (passing madness), depressions, paranoia and laziness.",
            mission: "Build bridges to the subtle dimensions and teach to navigate the waters of turbulent emotions.",
            advice: "No sailor became an expert in calm seas. Learn to dance with your shadows, but never yield the helm of your sanity to them."
        },
        {
            id: 'iq',
            kiche: "Iq'",
            spanish: "The Wind / The Gust",
            totem: "Hummingbird",
            meaning: "The breath of Death and of the Creator. It is the gust that cleanses stagnant energies, but also the anger and the subtle forces of the invisible spirit.",
            characteristics: "Pure, transparent as crystal, imaginative. They are usually very communicative but volatile. It is difficult for them to anchor; they live in constant transformation.",
            essence: "The breath of vital creation. Perpetual renewal and celestial oxygenation.",
            light: "Master communicators, mediating peacemakers, pure of intentions and endowed with divine inspiration.",
            shadow: "Hysterical in panic, unfaithful or unstable in love, devastating without purpose, they forget their promises.",
            mission: "Be the cold breath that drives away disease and the clear voice that communicates the spirit to matter.",
            advice: "Allow your breath to heal, but remember to light roots in the earth so as not to lose yourself flying in aimless gales."
        },
        {
            id: 'aqabal',
            kiche: "Aq'ab'al",
            spanish: "The Dawn / The Aurora",
            totem: "Macaw",
            meaning: "Light and darkness, the dual. The precise moment between the rising sun and sunset. It is the nocturnal mystery opening way to the new vital cycle.",
            characteristics: "Elegant, conservative and enigmatic. Great workers during hours of shadow. They can always see two sides of the coin.",
            essence: "The mystic window where everything dies to be reborn. The infinite hope of dawns.",
            light: "Peaceful, immensely objective counselors, light renovators and with high economic luck. Serious and loving at the same time.",
            shadow: "Prone to tragic melancholy, dangerous liars or chronic energy thieves if they stay in the dark.",
            mission: "Illuminate the dark concepts of men and separate falsehood from sacred truth.",
            advice: "You cannot tie time to the instant where light is born. Let the day shine, even if you miss the mystic depth of midnight."
        },
        {
            id: 'kat',
            kiche: "K'at",
            spanish: "The Net / The Spiderweb",
            totem: "Spider",
            meaning: "Represents the sacred fire of the net; what subtle catches and what imprisons. It is the union of human minds in the form of a wise swarm.",
            characteristics: "Organized to the millimeter, dynamic and impulsive in their actions. Great merchants who spread the net to natural success.",
            essence: "The architecture that weaves all material life and organizes societies.",
            light: "Born strategic leaders, masters of systematic abundance, honest in their social task, efficient caretakers.",
            shadow: "Fall prey to their own passions (chronic vices) or end up in legal/financial entanglements. Manipulators of their circle.",
            mission: "Unify human knowledge in an invisible net of unbreakable mutual help.",
            advice: "Your net should not be used to catch others nor to trap you in your fears; use it only to gather the fruits of your honorable effort."
        },
        {
            id: 'kan',
            kiche: "Kan",
            spanish: "The Serpent / The Feather",
            totem: "Feathered Serpent",
            meaning: "Represents Kukulcan, the feathered creator. The energy of the nervous system, the interior fire that rises, passionate magnetism and highest spirituality.",
            characteristics: "Intelligent, supreme wise men. Respected because they radiate respect. They have a mystic aristocratic bearing and never go unnoticed.",
            essence: "The upward torrent of power, the evolution of humanity that sheds skin to advance.",
            light: "High-reach influencers, relentless just defenders, alchemists of their own abundance and fire healers.",
            shadow: "If they vibrate poorly, they are biting injecting merciless verbal poisons. Vengeful, ELITIST, and dangerously selfish and controlling.",
            mission: "Balance and channel the interior fire energy to unify the mystic sky and raw earthly force.",
            advice: "Never hesitate to shed the skin of your dead ego. The more freely you undress, the purer the spark of your original magic circulates."
        },
        {
            id: 'kame',
            kiche: "Kame",
            spanish: "Death / Owl",
            totem: "Owl",
            meaning: "The symbol of dissolution, ultimate rest and supreme contact with divine ancestors. It is pure rebirth freed from duality.",
            characteristics: "Charismatic to gravity. Intuitive, silently protective. They possess a soft authority and incomparable magnetic patience.",
            essence: "The eternal transformation, the incorruptible cycle of permanent change where ancestors inhabit.",
            light: "Excellent doctors, past life psychologists, peaceful defenders of their community and carriers of the gift and shield against bad intentions or sorcery.",
            shadow: "Very fatalistic and destructive tendencies with themselves, rooted jealousy, deep depressions even seeking their symbolic death.",
            mission: "Guide those who fear the void, showing that behind the veil of destruction only infinite flourishing resides.",
            advice: "Die each night, to be born intact each morning. Do not drag to the next day the ghosts of past lives or circumstances."
        },
        {
            id: 'kej',
            kiche: "Kej",
            spanish: "The Deer / The Points",
            totem: "Deer",
            meaning: "Physical agility, deep forests, the four pillars of the earth. Silent strength of a spiritual leader. Represents manhood and firmness.",
            characteristics: "Proud and tireless observers. Hardened protectors of their family and nature. They have a docile character but can charge if they protect their honor.",
            essence: "The perfect natural balance, vitality embodied in the king of the forest.",
            light: "Enjoy healing physical ills and ceremonially guiding their village. Bold defensive and excellent socio-political strategists.",
            shadow: "Abusive or immoderately stubborn in the face of power. Occasionally emotional manipulators for their own benefit, destroyers of others' forests.",
            mission: "Be ambassadors of unshakeable balance that firmly connects all points of the earthly cosmos.",
            advice: "Remember that your beauty and mastery lie in the grace of your movements, and not in the violence of your antlers. Govern the forest with humility."
        },
        {
            id: 'qanil',
            kiche: "Q'anil",
            spanish: "The Seed / The Harvest",
            totem: "Rabbit",
            meaning: "The biological beginning, pure unconditional love, the entire creation contained in a germinal grain. The planetary energy of Venus; successful sowing and cosmic fertility.",
            characteristics: "Extraordinarily loving, understanding and with a subtle childish and wise treatment at the same time. Extremely creative and ingenious, they work hard but know how to enjoy the earth.",
            essence: "The pristine potential. All the tree's history already beats inside this tiny miracle.",
            light: "Immense attraction of love in all its forms. Prolific and prosperous, adaptable, harmonic in group discussions. Excellent pedagogues and farmers.",
            shadow: "Formidable enemies, extremely self-conscious in their sterile phase. Outbursts, toxic envies that block their own roots of life.",
            mission: "Plant divine ideas and sow love with care to see civilization turn green in infinite grace.",
            advice: "Do not fear giving away all your seeds to a desolate field. You are abundance itself and in your empty hands is your eternity assured."
        },
        {
            id: 'toj',
            kiche: "Toj",
            spanish: "The Offering / The Fire",
            totem: "Puma",
            meaning: "The leveling of social and cosmic justice through the sacrifice of one for the benefit of others (paying the debt). Represents the fire and the wise grandparents.",
            characteristics: "Possess an extremely active, dynamic and impatient nature. Very impulsive and direct. Their decisive character raises empires, and they always solve the urgency.",
            essence: "The mystic price and the purification of material karma of everything and everyone through the sacred rite.",
            light: "Imaginative creators who carry and cure others' responsibilities. Admirable honesty, loving and sincere to alleviate the oppressed's anguish.",
            shadow: "Very strong tendency to fall under illness if their life is selfish. Addicted to extreme emotions, irrational angry. They sabotage themselves hard if they don't give thanks.",
            mission: "Pay the universe the blessing of existence by lighting the Fire of Collective Gratitude without pauses.",
            advice: "Keep a visible fire in the room of your being. Giving thanks does not diminish you; on the contrary, it infinitely heals any hidden material karma of your blood."
        },
        {
            id: 'tzi',
            kiche: "Tz'i'",
            spanish: "The Dog / The Supreme Law",
            totem: "Dog",
            meaning: "The legal and ethical rod of the high physical and spiritual courts. Embodies canine fidelity, acute intelligence and absolute and relentless justice.",
            characteristics: "Balanced, tireless questioners. They seek truth in absolutely everything. They are reliable, friendly friends, natural analysts and with a stoic moral compass.",
            essence: "The loyal guardian who dictates and obeys exclusively the universal mandate of balanced love.",
            light: "Judges of admirable and compassionate nobility. Just lawyers, spiritual healers of impeccable trust who defend those whom no one else sees.",
            shadow: "Extremely tyrants and relentless dictators in the face of those who make a mistake, becoming vengeful and cruelly libertine in their daily life if they disconnect.",
            mission: "Establish on the earthly plane the impassive universal justice in such a way that it elevates actions communally.",
            advice: "Any law executed without love is only cruelty. Make yourself unbribable not through hardness and mortal anger; do it through the healing and humble force of deep love."
        }
    ],
    integration: {
        title: "Integration: Alchemical and Nawal Resonance",
        content: "Walking and interconnecting with your Nawal (your particular vibration in this multiverse) is not reading a curious information sheet. It is deliberately entering the interior laboratory in the sanctuary of our chest, patiently observing the luminous magic with which it bathes us, at the same time that we learn to dissolve soft, humble and alchemically those impulses that vibrate from the dark trap of the ego.",
        closing: "The Cholq'ij breathes. You are not the effect of a closed and conditioned sign; you are the glorious cause and alchemical expansion of it. Observe the mirror of the Mayan constellation in the insides of your soul... Maltiox, Good Journey of Blood and Stars!"
    }
};

export interface CrossWisdom {
    light: string;
    shadow: string;
    curiousFact: string;
}

export const getMayaCrossWisdomEn = (position: 'destiny' | 'conception' | 'leftArm' | 'rightArm', nawalName: string): CrossWisdom => {
    // Look for the Nahual data to extract its base essence
    const nawalData = MAYAN_MANUAL_EN.nahuales.find(n => n.id === nawalName || n.kiche === nawalName);

    // Generic fallback if not found
    if (!nawalData) return {
        light: "Brings a mysterious force to this area of your life.",
        shadow: "Challenges you to overcome the fear of the unknown.",
        curiousFact: "In Mesoamerican tradition, this position is a hidden key of your lineage."
    };

    switch (position) {
        case 'destiny': // Head
            return {
                light: `As your Destiny (Head), the energy of ${nawalName} magnetizes your future toward evolution. ${nawalData.light}`,
                shadow: `The greatest obstacle to reaching your vital summit will be your own ego. In this position, you can become: ${nawalData.shadow.toLowerCase()}`,
                curiousFact: `According to the Book of Destiny, this is the energy that "pulls" you from above; it is the spiritual adult you are gradually becoming throughout your 13 great biological cycles.`
            };
        case 'conception': // Feet
            return {
                light: `As your Conception (Feet), ${nawalName} is the ancestral force in your roots. ${nawalData.characteristics}`,
                shadow: `Your inherited family karmas (what you must heal from your tree) vibrate here. Take care not to repeat this pattern: ${nawalData.shadow.toLowerCase()}`,
                curiousFact: `This was precisely the energy that dominated the universe during the cosmic month in which you were conceived in the mother's womb, thus setting the spiritual foundation of your physical body.`
            };
        case 'leftArm': // Magical/Past Arm
            return {
                light: `Your Left Arm (Magical/Past) is guarded by ${nawalName}. Here lies your deep intuition and the subtle tools you bring to this incarnation. ${nawalData.essence}`,
                shadow: `Your hidden weakness when you trust magic too much without grounding it in concrete actions can be reflected in being ${nawalData.shadow.toLowerCase()}`,
                curiousFact: `The left arm is the receiving side of the heart. The Mayan grandmothers assure that this is the energy of your spiritual guides who whisper answers to you through your intuition or "hunches".`
            };
        case 'rightArm': // Material/Challenge Arm
            return {
                light: `Your Right Arm (Material) vibrates under ${nawalName}. It is your sword and shield on this plane. Use this force in the physical world to: ${nawalData.mission.toLowerCase()}`,
                shadow: `The greatest clashes you will have in your work or social environment will occur if this energy is unbalanced, showing you as someone ${nawalData.shadow.toLowerCase()}`,
                curiousFact: `The right arm is the arm of service and external action. It is the energy you use unconsciously to solve practical day-to-day problems, such as physical repairs or mediation of earthly conflicts.`
            };
    }
};
