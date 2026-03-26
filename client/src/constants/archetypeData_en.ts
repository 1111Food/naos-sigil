import type { ArchetypeInfo } from './archetypeData';

export const NAOS_ARCHETYPES_EN: ArchetypeInfo[] = [
    // IGNEOUS FREQUENCY (Fire)
    {
        id: 'fuego-1',
        nombre: "The Catalyst",
        frecuencia: "Igneous",
        elemento: 'fuego',
        rol: "Initiator",
        descripcion: "The primal spark that fractures inertia; awakens dormant fire and opens portals of profound transformation.",
        luces: ["Unstoppable initiative", "Courage before the unknown", "Leadership by inspiration"],
        sombras: ["Blind impulsivity", "Difficulty finishing tasks", "Outbursts of anger or impatience"],
        imagePath: "/assets/archetypes/arcano_fuego_1.webp"
    },
    {
        id: 'fuego-2',
        nombre: "The Forger",
        frecuencia: "Igneous",
        elemento: 'fuego',
        rol: "Constructor",
        descripcion: "Sculptor of the will; transmutes dense heat into sacred pillars, shaping reality with the persistence of red-hot metal.",
        luces: ["Extreme physical discipline", "Resilience under pressure", "Massive execution capacity"],
        sombras: ["Mental rigidity", "Inflexibility toward change", "Tendency to force situations"],
        imagePath: "/assets/archetypes/arcano_fuego_2.webp"
    },
    {
        id: 'fuego-3',
        nombre: "The Central Regent",
        frecuencia: "Igneous",
        elemento: 'fuego',
        rol: "Connector",
        descripcion: "A gravitational sun that leads from absolute presence; unifies scattered forces into a mandala of indivisible purpose.",
        luces: ["Personal magnetism", "Natural authority", "Ability to unite scattered visions"],
        sombras: ["Excessive pride", "Need to be the center", "Subtle authoritarianism"],
        imagePath: "/assets/archetypes/arcano_fuego_3.webp"
    },
    {
        id: 'fuego-4',
        nombre: "The Vector",
        frecuencia: "Igneous",
        elemento: 'fuego',
        rol: "Analyst",
        descripcion: "The arrow of light that pierces the veil of tomorrow; advances with the certainty of stardust toward sacred horizons.",
        luces: ["Laser-precision focus", "Expansion strategy", "Long-distance determination"],
        sombras: ["Tunnel vision", "Emotional coldness", "Obsession with the objective"],
        imagePath: "/assets/archetypes/arcano_fuego_4.webp"
    },

    // TELLURIC FREQUENCY (Earth)
    {
        id: 'tierra-1',
        nombre: "The Optimizer",
        frecuencia: "Telluric",
        elemento: 'tierra',
        rol: "Initiator",
        descripcion: "Subtle tuner of matter; listens to the heartbeat of systems and removes the dust of friction to reveal perfect geometry.",
        luces: ["Systemic efficiency", "Operational clarity", "Practical problem solving"],
        sombras: ["Paralyzing perfectionism", "Sharp criticism", "Fusing into technical detail"],
        imagePath: "/assets/archetypes/arcano_tierra_1.webp"
    },
    {
        id: 'tierra-2',
        nombre: "The Custodian",
        frecuencia: "Telluric",
        elemento: 'tierra',
        rol: "Constructor",
        descripcion: "Guardian of temples and memories; sustains the soul's architecture through the eons, anchoring divinity in stone.",
        luces: ["Structural vision", "Unmovable stability", "Mastery in life design"],
        sombras: ["Material attachments", "Fear of chaos", "Rigid over-structuring"],
        imagePath: "/assets/archetypes/arcano_tierra_2.webp"
    },
    {
        id: 'tierra-3',
        nombre: "The Anchor",
        frecuencia: "Telluric",
        elemento: 'tierra',
        rol: "Connector",
        descripcion: "The root that sustains the mountain; a sanctuary of calm in the tempest that offers an unbreakable refuge to those who orbit its center.",
        luces: ["Pillar of support", "Calm in chaos", "Nurturing presence"],
        sombras: ["Stubbornness", "Physical inertia", "Difficulty letting go of processes"],
        imagePath: "/assets/archetypes/arcano_tierra_3.webp"
    },
    {
        id: 'tierra-4',
        nombre: "The Architect",
        frecuencia: "Telluric",
        elemento: 'tierra',
        rol: "Analyst",
        descripcion: "Weaver of the visible; draws the blueprints of existence and materializes ethereal dreams into structures of rock and light.",
        luces: ["Unwavering loyalty", "Strategic patience", "Long-term resource management"],
        sombras: ["Fear of the future", "Extreme conservatism", "Resistance to change"],
        imagePath: "/assets/archetypes/arcano_tierra_4.webp"
    },

    // ETHEREAL FREQUENCY (Air)
    {
        id: 'aire-1',
        nombre: "The Paradigm Engineer",
        frecuencia: "Ethereal",
        elemento: 'aire',
        rol: "Initiator",
        descripcion: "The whisper that deconstructs dogma; an explorer who opens the cages of the mind and introduces fresh air into the soul's software.",
        luces: ["Disruptive thinking", "Radical innovation", "Fast mental clarity"],
        sombras: ["Emotional disconnection", "Intellectual arrogance", "Nervous restlessness"],
        imagePath: "/assets/archetypes/arcano_aire_1.webp"
    },
    {
        id: 'aire-2',
        nombre: "The Decoder",
        frecuencia: "Ethereal",
        elemento: 'aire',
        rol: "Constructor",
        descripcion: "Translator of stardust; a processor of truths that unravels the murmur of the cosmos to reveal eternal patterns.",
        luces: ["Information synthesis", "Impeccable logic", "Mastery of the word"],
        sombras: ["Intellectual over-analysis", "Communicative coldness", "Lost in theory"],
        imagePath: "/assets/archetypes/arcano_aire_2.webp"
    },
    {
        id: 'aire-3',
        nombre: "The Node",
        frecuencia: "Ethereal",
        elemento: 'aire',
        rol: "Connector",
        descripcion: "Weaver of human constellations; orchestrates sacred encounters and entwines invisible threads at the moment of maximum resonance.",
        luces: ["Intuitive networking", "Social synchronicity", "Flow facilitator"],
        sombras: ["Superficiality", "Dispersion", "Difficulty in deepening"],
        imagePath: "/assets/archetypes/arcano_aire_3.webp"
    },
    {
        id: 'aire-4',
        nombre: "The Observer",
        frecuencia: "Ethereal",
        elemento: 'aire',
        rol: "Analyst",
        descripcion: "A gaze that floats above the mist; soars over the labyrinth of illusion to contemplate the eternal currents of destiny.",
        luces: ["Absolute objectivity", "Futuristic vision", "Detached wisdom"],
        sombras: ["Social isolation", "Analysis paralysis", "Distant judgment"],
        imagePath: "/assets/archetypes/arcano_aire_4.webp"
    },

    // ABYSSAL FREQUENCY (Water)
    {
        id: 'agua-1',
        nombre: "The Transmuter",
        frecuencia: "Abyssal",
        elemento: 'agua',
        rol: "Initiator",
        descripcion: "Alchemist who dances in the abyss; descends to the darkest waters to emerge with the gold of wisdom and renewal.",
        luces: ["Emotional resilience", "Regenerative power", "Psychic fearlessness"],
        sombras: ["Obsession with crisis", "Dramatism", "Emotional manipulation"],
        imagePath: "/assets/archetypes/arcano_agua_1.webp"
    },
    {
        id: 'agua-2',
        nombre: "The Seismograph",
        frecuencia: "Abyssal",
        elemento: 'agua',
        rol: "Constructor",
        descripcion: "A lighthouse in the fog that feels the pulsation of the invisible ocean; decodes the echo of souls and unveils the truth that silence attempts to hide.",
        luces: ["Hyper-perception", "Instinctive wisdom", "Protection of groups"],
        sombras: ["Over-sensitivity", "Fear of invasion", "Defensive closing"],
        imagePath: "/assets/archetypes/arcano_agua_2.webp"
    },
    {
        id: 'agua-3',
        nombre: "The Mirror",
        frecuencia: "Abyssal",
        elemento: 'agua',
        rol: "Connector",
        descripcion: "A pool of crystal clear water that returns to the traveler a sharp image of their greatness and of the shadows they must still embrace.",
        luces: ["Deep empathy", "Healing transparency", "Compassionate presence"],
        sombras: ["Loss of identity", "Affective mirage", "Burden of others' problems"],
        imagePath: "/assets/archetypes/arcano_agua_3.webp"
    },
    {
        id: 'agua-4',
        nombre: "The Navigator",
        frecuencia: "Abyssal",
        elemento: 'agua',
        rol: "Analyst",
        descripcion: "The helmsman of the dream world; moves gracefully through the seas of the unconscious, mapping the depths of the soul.",
        luces: ["Mastery of dreams", "Technical intuition", "Deep wisdom"],
        sombras: ["Evasion of reality", "Mental confusion", "Psychic isolation"],
        imagePath: "/assets/archetypes/arcano_agua_4.webp"
    },
];
