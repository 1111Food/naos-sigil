export interface PositionInterpretation {
    archetype: string;
    blocks: string[];
}

export const PINNACLE_POSITIONS_EN: Record<string, { title: string, context: string }> = {
    A: { title: "Karma (Month)", context: "this position marks your pending task and the action you come to balance. As Karma, this frequency indicates 'how' you must act in the world to heal your lineage." },
    B: { title: "Personality (Day)", context: "this is your social mask and the first impression you leave. As Personality, this vibration tints the way the world initially perceives you." },
    C: { title: "Past Lives (Year)", context: "represents the dormant wisdom and talents you bring from previous incarnations. Here, the number acts as a tool you have already mastered." },
    D: { title: "Essence", context: "is your divine core, who you are when you are alone. As Essence, this frequency defines your true nature without masks." },
    E: { title: "Divine Gift", context: "is a special talent granted to support you. This vibration acts as a positive 'wildcard' that is activated when you trust in life." },
    F: { title: "Destiny", context: "marks the inevitable north of your soul. As Destiny, this frequency pushes you toward the purpose for which you incarnated." },
    G: { title: "Life Mission", context: "is your central purpose. Here the vibration becomes the 'what for' you are here and the contribution you come to deliver." },
    H: { title: "Realization", context: "represents the maximum achievement of your spirit. As Realization, this frequency is the peak of your personal mountain and your fulfillment." },
    I: { title: "Subconscious", context: "reveals hidden desires and internal drivers. This vibration moves you from the shadows of your psyche." },
    J: { title: "Unconscious", context: "are your automatic reactions to stress. This frequency is your oldest memory acting on autopilot." },
    P: { title: "Immediate Shadow", context: "is your first big block. Here, the vibration acts as the obstacle that seems to stop you as soon as you try to move forward." },
    O: { title: "Negative Unconscious", context: "are inherited repetitive patterns. This frequency points to the emotional knot you must untie from your personal history." },
    Q: { title: "Inherited Inferior Self", context: "are ancestral burdens from your lineage. This vibration is the weight of the family past that you come to transmute." },
    R: { title: "Conscious Inferior Self", context: "are the defects you already know about yourself. Here, the vibration shows you the mirror of what is difficult for you to transform." },
    S: { title: "Latent Inferior Self", context: "is the final challenge, the 'hidden enemy'. This frequency is only revealed when you have mastered the previous levels." },
    N: { title: "Expression Code (Name)", context: "reveals your expressive purpose on this plane. As Destiny of the Name, this frequency is the sonorous tool your soul chose to manifest its mission in the world" }
};

export const PINNACLE_INTERPRETATIONS_EN: Record<number, PositionInterpretation> = {
    1: {
        archetype: "The Initiator / The Magician",
        blocks: [
            "Essentially independent, original, creative, and self-directed. They possess a spark of innovation that pushes them to open paths where others only see walls. They are natural leaders who value their autonomy above all, carrying the 'I Am' energy with unwavering determination.",
            "This vibration usually develops from a childhood where the individual felt the need to fend for themselves prematurely, perhaps in the face of absent or excessively dominant authority figures. They grew up with the psychic imperative to forge their own identity so as not to be absorbed by the environment.",
            "Their challenge lies in the propensity for selfish isolation or arrogance toward those who do not follow their rhythm. The shadow of 1 is the paralyzing fear of failure, which can manifest as a defensive tyranny or an inability to collaborate, believing that asking for help is a surrender of their power."
        ]
    },
    2: {
        archetype: "The Collaborator / The Great Mother",
        blocks: [
            "Essentially diplomatic, sensitive, intuitive, and mediating. They possess a unique capacity to perceive underground emotional currents and harmonize conflicts. They are the glue that joins communities, valuing connection and balance as fundamental pillars of their existence.",
            "This vibration often arises in environments where the child acted as a mediator in their caregivers' couple conflicts or where harmony depended on their capacity for adaptation. They developed a hypersensitive emotional antenna to detect mood changes in the environment before they occurred.",
            "Others perceive them as beings of great warmth, but their shadow lies in emotional dependence and the fear of rejection. The challenge of 2 is to avoid victimhood or passive-aggressive manipulation, learning to set healthy boundaries without feeling that others' disapproval nullifies their own value."
        ]
    },
    3: {
        archetype: "The Communicator / The Divine Child",
        blocks: [
            "Essentially expressive, sociable, creative, and optimistic. They possess the gift of words and the art of beautifying reality. They are the heralds of joy and inspiration, with a mind that jumps between brilliant ideas and a vital need to share their inner world with others.",
            "This vibration usually originates in a childhood where self-expression was the main way to get attention or where, on the contrary, there was a lack of spaces to be heard. The individual learned that pleasing through wit or art was their most valuable bargaining chip.",
            "Their challenge lies in dispersion and superficiality. The shadow of 3 is the use of the social mask to hide a deep inner void. They can fall into gossip, extreme vanity, or lack of commitment, fleeing from painful introspection through incessant social hyperactivity."
        ]
    },
    4: {
        archetype: "The Builder / The Architect",
        blocks: [
            "Essentially methodical, disciplined, reliable, and pragmatic. They possess an exceptional capacity to give shape to ideas and build lasting structures. They are the rock of stability in any system, valuing order, effort, and loyalty over immediate gratification.",
            "This vibration is commonly gestated in homes with rigid rules or situations of deprivation that forced the child to seek security in the tangible. They grew up needing control of the material environment as a way to calm deep anxiety about uncertainty or chaos.",
            "Others perceive them as unshakeable beings, but their challenge is mental rigidity. The shadow of 4 is the stubbornness that leads them to close themselves off to new perspectives for fear of change. They can become tyrannical with detail or emotional misers, suffocated by their own internal rulebook."
        ]
    },
    5: {
        archetype: "The Traveler / The Freedom Seeker",
        blocks: [
            "Essentially versatile, adventurous, magnetic, and curious. They possess an intrinsic need to experience life through all the senses. They are the catalysts of change, driving evolution through the breaking of old structures and the unceasing search for new horizons.",
            "This vibration usually develops as a response to a childhood perceived as suffocating or routine. The individual learned that the only way to preserve their essence was constant movement, developing a psychic phobia of commitment that felt like a cage or a limitation of their expansion.",
            "Their challenge lies in impulsivity and lack of roots. The shadow of 5 is systematic evasion through excesses or erratic changes. The fear of emotional depth leads them to jump from one experience to another, leaving behind a trail of unfinished projects and relationships for fear of being 'caught'."
        ]
    },
    6: {
        archetype: "The Protector / The Healer",
        blocks: [
            "Essentially responsible, loving, idealistic, and protective. They possess a natural instinct for family and community care. They are the guardians of domestic harmony and social justice, valuing beauty and selfless service as life's highest purpose.",
            "This vibration is nurtured in childhoods where the child assumed adult responsibilities (parentification) or where love was conditioned on their utility as a caregiver. They grew up believing their value depends on how much they can 'save' or 'fix' the lives of those they love.",
            "Others see them as pillars of support, but their shadow is intrusiveness and codependency. The challenge of 6 is to release the perfectionism demanded of others and learn that martyr sacrifice does not buy love. They must guard against the bitterness that arises when the environment does not meet their high ideals of 'loving perfection'."
        ]
    },
    7: {
        archetype: "The Sage / The Mystic",
        blocks: [
            "Essentially analytical, detailed, intuitive, and selective. They possess a photographic mind and an inexhaustible intellectual curiosity. They are the great thinkers and scholars, seeking to decipher life's enigmas. Nothing escapes their power of observation and their search for perfection.",
            "This vibration usually develops because since childhood they perceived situations of indecision or fragility in their authority figures. They grew up needing to ensure that everything follows an order and a regulation, putting 'duty' above 'desire' to maintain psychic control over the environment.",
            "Others perceive them as beings of outstanding intelligence and maturity, reserved and enigmatic. Their challenge lies in that their excessive vision of 'cons' prevents them from making decisions, paralyzing them through analysis. The shadow of 7 is icy isolation and skepticism that disconnects them from their own humanity."
        ]
    },
    8: {
        archetype: "The Warrior / The Alchemist of Power",
        blocks: [
            "Essentially ambitious, authoritative, efficient, and visionary. They possess an innate capacity to handle power, money, and resources on a large scale. They are the great executors of material destiny, understanding the laws of cause and effect with a pragmatic clarity that inspires respect.",
            "This vibration is usually forged in environments of intense competition or in the presence of a very dominant father/mother who imposed an implacable standard of success. The individual learned that power and status are the only guarantee of security and respect in a world perceived as a constant struggle.",
            "Their challenge lies in tyranny and excessive ambition. The shadow of 8 is the loss of scrupulosity in the pursuit of success, making the end the only justification for the means. They must avoid self-destruction by stress or the loneliness generated by seeing others only as resources for their goals."
        ]
    },
    9: {
        archetype: "The Humanitarian / The Wise Elder",
        blocks: [
            "Essentially compassionate, universalist, idealistic, and detached. They possess a transpersonal awareness that leads them to worry about collective well-being. They are the heralds of cycle-closing wisdom, valuing tolerance and forgiveness as the final tools of soul evolution.",
            "This vibration usually appears in childhoods where the individual felt like 'the elder of the home' or where they experienced early losses that forced them to understand impermanence. They learned to develop a global vision so as not to be crushed by immediate emotional dramas.",
            "Others see them as beings of great light and guidance, but their shadow is existential bitterness. The challenge of 9 is to let go of the role of world savior so as not to neglect their own life. The fear of detachment can manifest as mental confusion or deep sadness when seeing human imperfection."
        ]
    },
    11: {
        archetype: "The Messenger of Light / The Visionary",
        blocks: [
            "Essentially inspiring, intuitive, idealistic, and charismatic. They possess a psychic sensitivity that allows them to act as channels for higher truths. They are the visionaries of the New Age, carrying an electrical energy that shakes the consciousness of those around them.",
            "This vibration is activated in those who from childhood felt 'different' or 'out of place', perceiving realities that adults ignored. The individual grew up with constant nervous tension, trying to reconcile their visionary world with the density of ordinary reality.",
            "Their challenge is emotional instability and fanaticism. The shadow of 11 is nervous imbalance from excess psychic stimuli. They can fall into spiritual elitism or paralysis for fear of their own power, taking refuge in a mystical fantasy to not face the responsibility of their message."
        ]
    },
    22: {
        archetype: "The Master Universal Builder",
        blocks: [
            "Essentially powerful, pragmatic, altruistic, and visionary. They possess the mastery necessary to materialize large projects that benefit humanity. They are the architects of global systems, combining the mysticism of 11 with the solid structure of 4 on a massive scale.",
            "This vibration usually arises from heavy family legacies or childhoods marked by the demand for greatness. The individual learned that they could not afford to be 'ordinary', carrying the imperative to leave a physical and systemic mark that lasts beyond their own life.",
            "Their challenge lies in crushing internal pressure and ill-channeled material ambition. The shadow of 22 is falling into pure power greed or collapse from exhaustion. In attempting to carry the world on their shoulders, they can become cold, calculating, and distant from basic human needs."
        ]
    },
    33: {
        archetype: "The Master of Universal Love",
        blocks: [
            "Essentially compassionate, self-sacrificing, healing, and protective. They possess the highest vibration of loving service, acting as beacons of unconditional light. They are the masters of the heart, whose mere presence generates a space of forgiveness and deep healing for the collective.",
            "This vibration, extremely rare and demanding, usually activates after experiences of great pain that forced the soul to choose between blind resentment or total redemption. The individual learned that love is the only real force capable of transmuting the shadow of the world.",
            "Their challenge is extreme hypersensitivity to others' suffering. The shadow of 33 is self-immolation and the martyr complex. They can be suffocated by the environment's demand for help, falling into deep melancholy or mystical evasion if they do not manage to anchor their immense love in a solid earthly discipline."
        ]
    }
};
