// REFERENCES: Liz Greene (Psychological), Steven Forrest (Evolutionary), Stephen Arroyo (Energetic Exchange), Robert Hand (Houses).
// v8.7: Depth Engine - Narrative Paragraphs for Bibliographic Interpretations

export const PLANETS_LIB_EN: Record<string, {
    name: string;
    archetype: string;
    mission: string;
    potential: string;
    shadow: string;
    question: string;
    essence: string;
    keywords: string;
    profile: string;
    love: string;
    career: string;
    positives: string[];
    negatives: string[];
}> = {
    Sun: {
        name: "Sun",
        archetype: "The King / Identity",
        mission: "To radiate unique essence and vital purpose.",
        potential: "Vitality, authenticity, conscious leadership, and warmth.",
        shadow: "Egocentrism, arrogance, or constant need for external validation.",
        question: "Who are you really when no one is watching?",
        essence: "It is the radiant core that grants purpose. Like the physical sun, it doesn't seek to shine; it simply does so by its own nature.",
        keywords: "Essence, Ego, Vitality, Purpose.",
        profile: "The Sun represents your central identity, the divine spark that makes you unique and unrepeatable. Its sign and house reveal where and how you seek to express your most authentic essence. A well-integrated Sun gives us self-confident, generous, and vital people. An unworked Sun expresses itself as a defensive ego, a need for protagonism, or a loss of purpose.",
        love: "In love, the Sun seeks to be seen, admired, and celebrated in its singularity. It does not tolerate relationships where it has to dim itself. It needs a partner who inspires it to be more itself, not less. Its gift in the bond is warmth, generosity, and a loyalty that shines like the king of stars.",
        career: "The Sun guides toward vocations where the person can lead, create, and leave a personal mark. Any role that allows them to shine with their own talents is solar ground: leadership, art, politics, show business, or innovation.",
        positives: ["Vitality and powerful presence", "Authenticity and self-knowledge", "Natural and charismatic leadership", "Genuine generosity and warmth", "Clarity of purpose and direction"],
        negatives: ["Egocentrism and the need to be the center", "Arrogance when the ego is not integrated", "Inflexibility toward others' viewpoints", "Dependence on external validation", "Difficulty sharing the spotlight"]
    },
    Moon: {
        name: "Moon",
        archetype: "The Internal Mother / The Refuge",
        mission: "To process emotions and seek internal security.",
        potential: "Emotional intelligence, care, nurturing, and belonging.",
        shadow: "Emotional dependence, whims, hypersensitivity, or refuge in the past.",
        question: "What does your inner child need to feel safe today?",
        essence: "The memory of the soul and the intimate refuge. It is the emotional tide that connects us with our roots and deepest needs.",
        keywords: "Emotions, Instinct, Memory, Refuge.",
        profile: "The Moon reveals your deepest emotional needs, your inner world, your instinctive fears, and how you nurture yourself. Its sign and house show where you seek comfort and how you behave when guards are down. An integrated Moon offers rich emotional intelligence; an unworked one, reactivity and emotional immaturity.",
        love: "The Moon in love defines what your heart needs to feel safe in a relationship. It shows your emotional patterns inherited from childhood and how you react intuitively to intimacy. Its sign reveals the language of love that nurtures you most.",
        career: "The Moon professionally indicates the environments where you feel emotionally safe to create and contribute. It favors vocations of care, nutrition, memory, home, and emotional art. It also shows your natural cycles of productivity.",
        positives: ["Deep emotional intelligence", "Natural empathy and intuition", "Ability to genuinely care and nurture", "Connection with natural rhythms and cyclicity", "Rich creativity and imagination"],
        negatives: ["Emotional reactivity and hypersensitivity", "Attachment to the past and the comfort zone", "Emotional dependence and need for constant validation", "Variable mood that destabilizes relationships", "Unconscious patterns inherited from childhood"]
    },
    Mercury: {
        name: "Mercury",
        archetype: "The Messenger / The Translator",
        mission: "To perceive, reason, and communicate reality.",
        potential: "Curiosity, mental agility, eloquence, and constant learning.",
        shadow: "Nervousness, dispersion, superficiality, or use of words to deceive.",
        question: "Are you listening to understand or just to respond?",
        essence: "The bridge between worlds. It translates experience into language and desires into ideas, allowing constant exchange.",
        keywords: "Mind, Communication, Learning, Logic.",
        profile: "Mercury reveals how you think, learn, and communicate. Its sign shows the mental style: a Mercury in Aries thinks fast and direct; in Scorpio, it investigates the deep layers of everything. Its house indicates the area where you apply your intelligence most naturally.",
        love: "In love, Mercury dictates how you communicate with your partner, how you process conflicts, and what conversations nurture you. Good compatibility between Mercuries is fundamental for friendship within the romantic relationship.",
        career: "Mercury professionally favors everything related to communication, writing, analysis, negotiation, technology, and learning. Its position indicates how we shine intellectually at work.",
        positives: ["Mental and intellectual agility", "Eloquence and communication skills", "Curiosity and love for learning", "Adaptability and cognitive versatility", "Analytical and logical capacity"],
        negatives: ["Tendency toward nervousness and mental anxiety", "Superficiality that avoids deepening", "Use of words to manipulate or evade", "Excessive thinking that paralyzes action", "Dispersion among too many interests"]
    },
    Venus: {
        name: "Venus",
        archetype: "The Lover / The Magnet",
        mission: "To value, attract, and create harmony in bonds.",
        potential: "Capacity for enjoyment, aesthetic sense, diplomacy, and self-love.",
        shadow: "Vanity, excessive compliance, fear of conflict, or materialism.",
        question: "What is it that you truly value and how do you allow yourself to receive it?",
        essence: "The law of attraction and the sense of value. It teaches us what gives us pleasure and how to harmonize our inner beauty with the other.",
        keywords: "Love, Value, Beauty, Harmony, Resources.",
        profile: "Venus reveals your values, your aesthetic sense, and how you love and want to be loved. Its sign shows your attraction style and what type of people and experiences generate genuine pleasure for you. Its house indicates the life scenario where you seek beauty, harmony, and connection.",
        love: "Venus IS the planet of love. Its position in the chart is fundamental to understanding each person's love language. It defines what attracts, what it values in a partner, and how it expresses its affection. An integrated Venus creates beautiful relationships; an unworked one creates dependencies or affective emptiness.",
        career: "Venus professionally favors arts, music, design, fashion, diplomacy, HR, finance (especially investments), and any activity related to beauty, pleasure, and human relations.",
        positives: ["Natural charm and magnetism", "Highly developed aesthetic sense", "Ability to create harmony in bonds", "Self-love that radiates outward", "Gift for the refined pleasures of life"],
        negatives: ["Superficiality and love for appearances", "Compliance that avoids conflict at all costs", "Vanity and excessive self-indulgence", "Affective dependence and fear of loneliness", "Materialism as a substitute for real love"]
    },
    Mars: {
        name: "Mars",
        archetype: "The Warrior / The Engine",
        mission: "To affirm the will and act with determination.",
        potential: "Courage, initiative, healthy sexuality, and conquest capacity.",
        shadow: "Aggressiveness, impatience, destructive impulsiveness, or repressed anger.",
        question: "What cause is worth fighting for today?",
        essence: "The engine of action. It is the primary impulse that allows us to separate from our origin to conquer our own territory.",
        keywords: "Action, Desire, Aggressiveness, Courage.",
        profile: "Mars reveals how to act, how to fight, and how to desire. Its sign shows the style of action and personal affirmation; its house indicates the life area where you apply the most energy and where conflicts are most frequent. An integrated Mars is energy directed toward purpose; unintegrated, it is scattered aggressiveness.",
        love: "In love, Mars defines the level and style of passion, sexuality, and how conflict is handled as a couple. An active Mars creates adventure and fire; poorly aspected, it can generate dominance or frustrating passivity.",
        career: "Mars favors vocations that require initiative, competition, physical courage, or a warrior mindset: military, athletes, entrepreneurs, surgeons, trial lawyers, firefighters, and front-line engineers.",
        positives: ["Powerful physical energy and vitality", "Courage to face challenges directly", "Initiative and capacity for immediate action", "Sexual passion and genuine desire", "Leadership from action, not from speech"],
        negatives: ["Chronic aggressiveness and impatience", "Impulsiveness that generates serious errors", "Tendency toward conflict and confrontation", "Repressed anger that explodes destructively", "Competitiveness that destroys collaboration"]
    },
    Jupiter: {
        name: "Jupiter",
        archetype: "The Guide / The Explorer",
        mission: "To expand horizons and find meaning in life.",
        potential: "Optimism, abundance, wisdom, and trust in life.",
        shadow: "Overconfidence, fanaticism, exaggeration, or lack of limits.",
        question: "Where does your faith guide you when the path darkens?",
        essence: "The principle of expansion and meaning. It invites us to look beyond the obvious and to trust in the benevolence of the cosmos.",
        keywords: "Expansion, Wisdom, Faith, Abundance, Luck.",
        profile: "Jupiter indicates where you have natural luck and where your soul seeks to grow and expand. Its sign reveals the life philosophy and the style of seeking meaning; its house, the area where abundance flows most easily when there is openness and generosity.",
        love: "In love, Jupiter brings generosity, optimism, and the ability to see the partner as a teacher. It favors relationships that expand awareness and the horizons of both. Its shadow is excess and the tendency to promise more than it can deliver.",
        career: "Jupiter professionally indicates the fields where success and abundance flow most naturally: teaching, philosophy, travel, law, publishing, spirituality, and any international or high social impact profession.",
        positives: ["Genuine optimism and faith in life", "Ability to see potential in everything", "Natural generosity and magnanimity", "Philosophical and cultural intelligence", "Luck that grows with gratitude and openness"],
        negatives: ["Overconfidence leading to carelessness", "Promises it cannot keep", "Tendency toward excess in food, spending, or speech", "Religious or philosophical fanaticism", "Ego inflation disguised as expansion"]
    },
    Saturn: {
        name: "Saturn",
        archetype: "The Taskmaster / The Architect",
        mission: "To structure, set limits, and build solid realities.",
        potential: "Maturity, responsibility, discipline, and inner mastery.",
        shadow: "Rigidity, pessimism, fear of failure, or emotional coldness.",
        question: "What area of your life do you finally need to take charge of?",
        essence: "The architect of time. Its limits are not prisons, but the necessary walls so that our inner cathedral does not collapse.",
        keywords: "Limit, Structure, Time, Responsibility, Karma.",
        profile: "Saturn indicates the area of greatest effort and maturation needed in this life. Its sign and house point to where we carry a load of karmic responsibility that, once accepted, becomes the foundation of our greatest mastery. The Saturn return (at ages 29 and 58) marks moments of profound transformation.",
        love: "In love, Saturn creates serious, committed, and long-term relationships. However, it can generate emotional coldness, fear of vulnerability, or relationship patterns inherited from deficient authority figures. Its integration leads to mature and real love.",
        career: "Saturn indicates the vocational area where success arrives slowly but is deeply solid and lasting. It favors professions where discipline, structure, and earned authority are valued: science, architecture, law, politics, and management.",
        positives: ["Unparalleled discipline and perseverance", "Ability to build lasting structures", "Sense of responsibility and maturity", "Authority earned through ethics and merit", "Deep mastery in one's area of work"],
        negatives: ["Rigidity and resistance to change and spontaneity", "Pessimism and severe self-criticism", "Fear of failure that paralyzes action", "Emotional coldness disguised as strength", "Excessive burden of self-imposed responsibility"]
    },
    Uranus: {
        name: "Uranus",
        archetype: "The Revolutionary / The Lightning Bolt",
        mission: "To break obsolete structures and awaken original genius.",
        potential: "Innovation, freedom, future vision, and healing detachment.",
        shadow: "Rebellion without a cause, chronic instability, or radical coldness.",
        question: "What truth are you resisting for fear of being different?",
        essence: "The spark of sudden change. It awakens individual consciousness through the lightning bolt of intuition and the break with the known.",
        keywords: "Revolution, Originality, Detachment, Genius.",
        profile: "Uranus indicates the area of life where you seek freedom and where the break with the established is inevitable. It is the generational planet that marks the revolutions of each era. Personally, its sign and house reveal where you need to detach from conditioning to discover your unique genius.",
        love: "In love, Uranus needs freedom and abhors routine and possessiveness. It can generate unusual, non-conventional relationships or sudden changes in bonds. Its greatest gift is friendship within love; its shadow, instability and excessive detachment.",
        career: "Uranus favors cutting-edge vocations: technology, astronomy, programming, activism, experimental design, frontier science, and social innovation. It feels trapped in conventional jobs with a rigid structure.",
        positives: ["Unique genius and inventiveness", "Freedom of thought and originality", "Ability to revolutionize obsolete systems", "Healthy detachment from the material and conventional", "Highly developed future vision"],
        negatives: ["Instability and abrupt changes without notice", "Emotional coldness that distances loved ones", "Rebellion without a cause as an identity mechanism", "Inability to commit long-term", "Intellectual superiority that isolates"]
    },
    Neptune: {
        name: "Neptune",
        archetype: "The Mystic / The Dreamer",
        mission: "To dissolve ego boundaries to connect with the totality.",
        potential: "Infinite compassion, artistic inspiration, intuition, and spirituality.",
        shadow: "Evasion, confusion, victimization, or addictions.",
        question: "In what dream have you lost yourself and which one do you need to wake up from?",
        essence: "The ocean of unity. It reminds us that we are not separate and that the purest beauty is born from surrendering to the mystery.",
        keywords: "Mysticism, Illusion, Compassion, Dissolution, Art.",
        profile: "Neptune indicates where you seek transcendence, art, and ego dissolution. It is a generational planet that shapes the ideals of an era. Personally, its house reveals the area where you tend to idealize or where boundaries become fuzzy and it is easy to get lost.",
        love: "In love, Neptune creates connections of almost mystical depth. But it can also generate dangerous idealization: a love that sees what it wants to see and not the real person. Its integration leads to true unconditional love; unintegrated, to disappointment and dependency.",
        career: "Neptune favors the arts (music, film, dance, photography), spirituality, oceanography, holistic medicine, transpersonal psychology, and humanitarian work. It needs a transcendent purpose to stay motivated.",
        positives: ["Deep creativity and artistic inspiration", "Compassion and empathy without borders", "Genuine spiritual and mystical connection", "Intuition that transcends ordinary logic", "Ability to see the sacred in the everyday"],
        negatives: ["Evasion of reality through escapism", "Tendency toward victimization and martyr roles", "Susceptibility to addictions and dependencies", "Chronic confusion about limits and responsibilities", "Idealization leading to disappointment"]
    },
    Pluto: {
        name: "Pluto",
        archetype: "The Alchemist / Guardian of Shadows",
        mission: "To transform crisis into power through death and rebirth.",
        potential: "Extreme resilience, deep truth, healing, and empowerment.",
        shadow: "Control, manipulation, obsession, or fear of one's own shadow.",
        question: "What part of you needs to die so you can be reborn?",
        essence: "The power of transmutation. It digs deep to destroy what no longer serves and reveal the diamond of personal power.",
        keywords: "Transformation, Power, Rebirth, Shadow.",
        profile: "Pluto indicates where the greatest transformations occur in your life. It is the planet of symbolic death-rebirth: the body does not die, but the version of oneself that no longer serves. Its house reveals the area where you experience deep crises that, when crossed with awareness, become your greatest source of personal power.",
        love: "In love, Pluto creates karmic bonds that deeply transform both people. Plutonic relationships are intense and never superficial. Their shadow is power struggles and obsessive jealousy. Integrated, it leads to love as alchemy and mutual transformation.",
        career: "Pluto favors vocations that work with power and deep transformation: psychoanalysis, surgery, research, international finance, crisis management, and any field that involves symbolic dying and rebirthing.",
        positives: ["Resilience and ability to rise from the ashes", "Access to the depths of the unconscious", "Transformative intensity and focus", "Ability to detect hidden truth", "Personal power of regeneration and renewal"],
        negatives: ["Obsession and control as a security mechanism", "Manipulation from power not yet integrated", "Deep fear of loss and loss of control", "Tendency to destroy what it loves to test it", "Extreme difficulty letting go and forgiving"]
    },
    Chiron: {
        name: "Chiron",
        archetype: "The Wounded Healer",
        mission: "To integrate deepest pain to convert it into medicine for others.",
        potential: "Sacred empathy, teaching from vulnerability, and acceptance.",
        shadow: "Constant feeling of insufficiency or bitterness over the wound.",
        question: "How can you use your pain to light others' path?",
        essence: "The key between personal pain and universal healing. It teaches us that our fragility is our greatest strength.",
        keywords: "Wound, Healing, Vulnerability, Empathy.",
        profile: "Chiron indicates the deepest and most irresolvable wound of the soul: that which never heals completely, but which upon being integrated becomes the greatest gift. Its house and sign reveal the area of greatest sensitivity and the type of pain that comes to be transformed into wisdom and service.",
        love: "In love, Chiron activates the oldest wounds: fear of abandonment, of not being enough, or of being hurt again. Chironic relationships hurt because they reveal what needs to heal. Integrated, love becomes a space for mutual and profound healing.",
        career: "Chiron guides toward healing vocations: medicine, therapy, counseling, teaching from lived experience, and spiritual work. The best facilitator of Chiron is one who has walked their own hell and can accompany the other with genuine compassion.",
        positives: ["Deep empathy born of one's own pain", "Wisdom about the human condition", "Ability to heal others from authentic vulnerability", "Enormous compassion for those who suffer", "Gift for teaching what was hardest to learn"],
        negatives: ["Wound that generates chronic insufficiency complex", "Hypersensitivity in the Chironic area", "Difficulty receiving the healing offered to others", "Bitterness when the wound is not honored", "Identity built around the role of victim"]
    },
    NorthNode: {
        name: "North Node",
        archetype: "Evolutionary Compass / Soul's Destiny",
        mission: "To move from known comfort toward evolutionary purpose.",
        potential: "Deliberate growth and alignment with the soul's vocation.",
        shadow: "Stagnation in repetitive habits and fear of the new.",
        question: "What are you willing to let go of to become who you came to be?",
        essence: "The point of future growth. It indicates the direction the soul must take to fulfill its promise in this life.",
        keywords: "Destiny, Evolution, Purpose, Future.",
        profile: "The North Node (Rahu) points to the soul's evolutionary direction in this incarnation. Moving toward its energy is uncomfortable because it is the least familiar; but it is exactly what the soul came to develop. Its sign and house reveal the new territories to be explored.",
        love: "In love, the North Node invites connection with people and relational dynamics that take you out of your comfort zone and push you to your next version. Relationships aligned with the North Node are transformative, though initially disruptive.",
        career: "Vocationally, the North Node indicates the field of action where the soul comes to contribute and grow in this life. Working from its energy may feel strange at first, but it generates the deepest sense of purpose and fulfillment.",
        positives: ["Clarity about the soul's evolutionary direction", "Incentive to exit the comfort zone", "Alignment with the true purpose of this life", "Deliberate and meaningful growth", "Synchronicities increase when moving toward it"],
        negatives: ["Discomfort before the new and unknown", "Tendency to fall back into South Node patterns", "Unconscious resistance to necessary growth", "Fear of the direction the soul needs to take", "Procrastination of purpose for comfort in the known"]
    }
};

export const SIGNS_LIB_EN: Record<string, {
    name: string;
    style: string;
    essence: string;
    gift: string;
    trap: string;
    mantra: string;
    profile: string;
    love: string;
    career: string;
    positives: string[];
    negatives: string[];
}> = {
    Aries: {
        name: "Aries",
        style: "with a discharge of pure, direct, and courageous energy.",
        essence: "The unconditionality of the inner child. Aries does not calculate, it simply *is*. Its archetype is the innocent warrior who launches into life without memory of past failures.",
        gift: "Your Radiant Light: You have the gift of absolute beginnings. Your frankness disarms the world's lies, and your innate courage allows you to sweep through obstacles with unwavering sincerity. You bring the miracle of the spontaneous.",
        trap: "Your Magical Shadows: Childhood impatience. When the world does not surrender at your feet at the exact moment, you can explode in destructive tantrums. Your lesson is to remember that listening to the other does not put out your own fire.",
        mantra: "I Am, I Act",
        profile: "Aries is the first sign of the zodiac and carries the energy of pure origin. Its ruler Mars endows it with a vitality that few can match. Whoever has strong positions in Aries carries an inner engine that hardly turns off. They are the pioneers, those who do not ask permission to start, those who inject urgency and life where others hesitate. Their greatest evolution occurs when they learn that value includes patience.",
        love: "In love, Aries is intense, passionate, and direct: if they like you, you'll know. They don't play at mystery because they don't know how. They seek conquest and the thrill of the first moment. Their challenge is to stay committed when the novelty fades. They need a partner who gives them space, who doesn't exhaust them with continuous security demands, but who also doesn't let themselves be completely dominated.",
        career: "Aries thrives in environments where initiative and speed are valued: entrepreneurship, elite sports, surgery, military leadership, sales, and any competitive field. They are the best at launching projects, though they need to delegate the maintenance phase. Their Martian energy makes them ideal for roles where they must act before thinking.",
        positives: ["Unparalleled courage and decision", "Overflowing energy and initiative", "Refreshing honesty and frankness", "Ability to act under pressure", "Pioneering and avant-garde spirit"],
        negatives: ["Extreme impatience before obstacles", "Impulsiveness that generates conflict", "Difficulty listening to the other", "Aggressiveness when frustrated", "Abandons projects before finishing them"]
    },
    Taurus: {
        name: "Taurus",
        style: "with pause, sensuality, and a constant search for stability.",
        essence: "The infinite patience of fertile earth. It is the relentless builder of tangible certainties; it lives through the five senses anchored in the pure reality of the present.",
        gift: "Your Radiant Light: You possess the serene strength to transform chaos into permanent beauty. Your stubbornness, when it turns into loyalty, is invincible. You are the peaceful anchor in the middle of the storm, manifesting supreme patience.",
        trap: "Your Magical Shadows: The fear of letting go. You stay too long in what is safe (spaces, situations, ideas), clinging with obstinacy when life demands that it flow. You have to forgive faster.",
        mantra: "I Have, I Value",
        profile: "Taurus is the energy of earth in its most sensual and persistent manifestation. Governed by Venus, this sign seeks to build a world of beauty, quality, and permanence. People with prominent Taurus are reliable, patient, and possess a highly developed aesthetic sense. Their strength lies in constancy: where others give up, Taurus continues. Their greatest learning is to release attachment when life asks for renewal.",
        love: "In love, Taurus is loyal, sensual, and deeply devoted. They don't fall easy, but when they do, it's forever. They express their love through physical presence, contact, material details, and stability. Their greatest challenge is rigidity: they can become possessive or resist change within the relationship. They need emotional security and detest destabilizing surprises.",
        career: "Taurus shines in careers that combine art, money, and materiality: banking, gastronomy, interior design, fashion, jewelry, agriculture, and any visual art. Their discipline and perseverance make them excellent in any field that requires the long term. They can build empires if they learn to adapt to market changes.",
        positives: ["Unmovable loyalty and constancy", "Refined aesthetic and artistic sense", "Patience and determination for the long term", "Skill to create stability and security", "Deep connection with life's pleasures"],
        negatives: ["Stubbornness and resistance to change", "Possessiveness in relationships", "Materialism as a security mechanism", "Slowness in urgent decisions", "Sustained resentment when feeling betrayed"]
    },
    Gemini: {
        name: "Gemini",
        style: "with playful curiosity, versatility, and a mind that flies between options.",
        essence: "The flicker of a brilliant mind that doesn't sleep. Gemini is divine duality: it is the infinite questioning child playing among the spheres of thought, tirelessly seeking to connect worlds.",
        gift: "Your Radiant Light: You are verbal electricity. Your agile intelligence demystifies the weight of drama with fresh humor. You have the magical gift of unfolding and understanding both sides of a truth at the speed of light.",
        trap: "Your Magical Shadows: Disconnected nervousness and constant flight, which is sometimes just disguised escapism or deep difficulty committing to a single decision, for fear of missing everything else.",
        mantra: "I Think, I Communicate",
        profile: "Gemini is the sign of duality, communication, and perpetual mental movement. Mercury grants them an agile mind that jumps from idea to idea with astonishing ease. People with prominent Gemini are verbally brilliant, curious, and incredibly adaptable. They live on two tracks at once and rarely get bored. Their greatest challenge is to deepen rather than limit themselves to touching the surface of everything.",
        love: "In love, Gemini needs an intellectual partner who stimulates them constantly. Boredom is their number one enemy. They are charming, playful, and very communicative, but can seem cold or evasive when the conversation becomes emotionally intense. They need mental space and hate feeling trapped in predictable routines.",
        career: "Gemini thrives in fields that require communication, adaptability, and speed: journalism, marketing, advertising, teaching, translation, social networks, sales, and technology. They are the best conversationalist of the zodiac and can seduce with words in any professional context. Their challenge is constancy.",
        positives: ["Exceptional mental and intellectual agility", "Skill to communicate with anyone", "Natural adaptability and versatility", "Intelligent and entertaining humor", "Curiosity that generates constant learning"],
        negatives: ["Inconsistency and lack of commitment", "Superficiality as a first response", "Chronic nervousness and mental anxiety", "Difficulty making definitive decisions", "Tendency toward verbal manipulation"]
    },
    Cancer: {
        name: "Cancer",
        style: "with protective tenderness, emotional memory, and much visceral intuition.",
        essence: "The depth of oceans ruled by the Moon. Mystical sensitivity wrapped in a protective shell. Behind their laughter are psychic memories of all their past lives.",
        gift: "Your Radiant Light: An infallible radar for reading the human soul before it utters a word. Your capacity to provide emotional nutrition and a sense of belonging to those you love transforms cold spaces into true sanctuaries.",
        trap: "Your Magical Shadows: You sail too much into the past and sometimes make your pain a refuge with claws of manipulation. Gloomy mood attacks you unexpectedly; learn to let go of defenses to be happy today.",
        mantra: "I Feel, I Protect",
        profile: "Cancer, ruled by the Moon, is the sign most deeply connected with the emotional world, family, and memory. Their sensitivity is their greatest gift and, at the same time, their most vulnerable terrain. People with prominent Cancer absorb their environment's emotional state like sponges and possess an almost psychic intuition about others' needs. Their mission is to create refuge: for themselves and for those they love.",
        love: "In love, Cancer is the most devoted and nurturing companion of the zodiac when they feel safe. They love with a depth that few can match. However, their fear of abandonment can become suffocating. They need a partner who demonstrates their commitment constantly and who has the patience to cross their emotional tides without fleeing.",
        career: "Cancer flourishes in environments that allow them to care, nurture, or create: psychology, nursing, social work, gastronomy, design of intimate spaces, and any profession linked to home, history, or memory. They can also shine in art when using it to express their inner world. They need an emotionally safe work environment.",
        positives: ["Deep emotional and intuitive intelligence", "Capacity to create refuge and belonging", "Absolute loyalty and devotion in the inner circle", "Highly developed imagination and creativity", "Emotional memory that honors history"],
        negatives: ["Extreme sensitivity to criticism", "Tendency toward defensive withdrawal and hermeticism", "Subtle emotional manipulation when threatened", "Attachment to the past that prevents progress", "Variable mood that destabilizes the environment"]
    },
    Leo: {
        name: "Leo",
        style: "with magnetic generosity, dramatic creativity, and a need for shine.",
        essence: "An immense heart like a radiant Sun, pulsing dignity, summer warmth, and magnanimous power. As a true inner monarch, they did not come to the world to please, but to reign through a colossal and loyal love.",
        gift: "Your Radiant Light: You sow courage wherever you walk. You have the incredible gift of making everyone feel like your royal court. If you are aligned, you use your great dramatic influence to illuminate others instead of overshadowing them.",
        trap: "Your Magical Shadows: The tragic blindness of pride, and your deep wound before any form of contempt. To protect yourself, you end up surrounding yourself with frivolous subjects dictating at whim, leaving the true heart howling for external validation.",
        mantra: "I Shine, I Express",
        profile: "Leo, ruled by the Sun, is the sign of self-expression, leadership, and creativity. Whoever has prominent Leo in their chart carries a natural presence that lights up the room. They are generous, loyal, and possess a charisma that attracts effortlessly. Their mission is to learn to shine from authenticity and not from the need for external approval. When Leo works on their ego, they become the most inspiring leader of the zodiac.",
        love: "In love, Leo is passionate, dramatic, and tremendously loyal. They love with all their heart and expect the same devotion in return. They need to feel admired and celebrated by their partner; without that recognition, the flame goes out. Their greatest challenge is learning that love is not a performance, but a real and vulnerable presence.",
        career: "Leo shines on any stage where they can be seen: acting, artistic direction, inspirational teaching, leadership at any level, politics, entertainment, and entrepreneurship with vision. They need to feel that their work has impact and that their contribution is recognized. They do not serve well in the shade.",
        positives: ["Natural charisma and magnetism", "Generosity and greatness of heart", "Vibrant creativity and self-expression", "Fierce loyalty to those they love", "Capacity to inspire and lead from joy"],
        negatives: ["Pride that prevents asking for forgiveness or help", "Excessive need for admiration and validation", "Dramatization when feeling ignored", "Inability to share the spotlight", "Authoritarianism disguised as leadership"]
    },
    Virgo: {
        name: "Virgo",
        style: "with detail, discernment, and a restless search for functional improvement.",
        essence: "The unquestionable purity of practical purpose. They are not literal virgins, but psychically incorruptible beings, obsessed with distilling the useless until revealing the most perfect and silent efficiency.",
        gift: "Your Radiant Light: The sharp alchemy of intellect applied to real service. You order impeccably where the world sows confusion, you heal from a meticulous humility, and you demonstrate pure love through irreproachable acts of service.",
        trap: "Your Magical Shadows: The gloomy labyrinth of paralyzing perfectionism and hurtful criticism (both of others and oneself). You hide in the micro-detail to not face the vast forest of your own and indomitable emotions.",
        mantra: "I Analyze, I Serve",
        profile: "Virgo, ruled by Mercury, is the sign of analysis, service, and continuous improvement. Whoever has prominent Virgo possesses an extraordinarily detailed mind capable of seeing what others overlook. They are hardworking, meticulous, and deeply devoted to function and care. Their evolutionary path is in learning to love imperfection: their own and the world's.",
        love: "In love, Virgo demonstrates their affection through acts of service: organizing, caring, anticipating needs. They are not the most emotionally expressive, but their devotion is genuine and profound. Their challenge is to stop analyzing the relationship and simply allow themselves to feel it. They need a partner who appreciates their details and doesn't make them feel judged.",
        career: "Virgo excels in medicine, nutrition, pharmacy, accounting, editing, data analysis, craftsmanship, and any field that demands precision and method. They are the natural expert: the one who checks three times before delivering. Their work ethic is legendary and their attention to detail is a professional superpower.",
        positives: ["Analytical and detail-oriented intelligence", "Impeccable work ethic", "Genuine love expressed in service", "Skill to optimize systems and processes", "Highly developed discernment and judgment"],
        negatives: ["Paralyzing perfectionism", "Self-criticism and criticism of others", "Hypochondria and excessive worry", "Difficulty letting go of control", "Apparent coldness hiding hypersensitivity"]
    },
    Libra: {
        name: "Libra",
        style: "with elegance, diplomacy, and a look always set on the other.",
        essence: "The ethereal scale perpetually oscillating toward aesthetic and intellectual perfection. They are in love with conceptual harmony. Their intellect is sharp but wrapped in the immense beauty and tactics of Venus.",
        gift: "Your Radiant Light: No one synthesizes opposing sides of a conflict better than you, because you intuitively see peace. You have a natural magnetism to smooth humanity's drama with compassionate, civilized diplomacy and pure aesthetics.",
        trap: "Your Magical Shadows: An extreme panic to confront that condemns them to an agonizing indecision. Your constant effort to please and artificially seduce blurs your own inner truth suffocated in scales never quiet.",
        mantra: "I Balance, I Relate",
        profile: "Libra, ruled by Venus, is the sign of harmony, justice, and the art of relationship. Whoever has prominent Libra possesses a natural charm that opens all doors and a very refined aesthetic sense. They live oriented toward 'us' and are the best mediators of the zodiac. Their profound evolution resides in learning to make decisions without needing everyone's consensus.",
        love: "In love, Libra is the great romantic of the zodiac. They love the ritual of conquest, the elegance of the bond, and the construction of an emotional and intellectual partnership. Their challenge is indecision and the tendency to please rather than show who they really are. They need a partner who inspires them to be more direct with their desires.",
        career: "Libra shines in law, diplomacy, international relations, art, design, fashion, conflict mediation, advertising, and any field where aesthetics and human treatment are essential. They work better in a team or partnership than alone.",
        positives: ["Unique diplomacy and mediation capacity", "Highly developed aesthetic and artistic sense", "Natural charm and sociability", "Sense of justice and equity", "Skill to see all points of view"],
        negatives: ["Chronic indecision before options", "Compliance that erases own identity", "Evasion of conflict at any cost", "Dependence on environment's approval", "Superficiality as a first social response"]
    },
    Scorpio: {
        name: "Scorpio",
        style: "with deep intensity, mystery, and an unshakeable will.",
        essence: "A psychic power capable of killing or resurrecting. It is raw intensity disguised under a cold mask of control. With a deeply passionate heart, it penetrates the world like a surgeon of the soul incapable of mediocrity.",
        gift: "Your Radiant Light: You have crossed hells and radiate extreme resilience. You offer the deepest transmutation to those you know, loving in an infinite and indestructible way, also possessing an iron will capable of taming continents and achieving purpose.",
        trap: "Your Magical Shadows: Your internal poisons— corrosive jealousy, the calculation of invisible paranoias, and a compulsion to dominate everything from the rear so as not to yield a drop of emotional control in a helpless way.",
        mantra: "I Desire, I Transform",
        profile: "Scorpio, ruled by Pluto and Mars, is the sign of transformation, mystery, and psychic power. People with prominent Scorpio feel everything with an intensity that others rarely understand. They are natural investigators of the human soul: they detect lies miles away and do not tolerate superficiality. Their evolutionary path is alchemy: converting pain into power and poison into medicine.",
        love: "In love, Scorpio does not know the middle ground: they love with a depth that can be transformative or destructive. They are the most intense and loyal lover of the zodiac when they trust, but the most dangerous when they feel betrayed. They need a partner capable of sustaining their intensity without fleeing, and who understands that their zeal is not weakness but love in its most primitive form.",
        career: "Scorpio thrives in psychology, therapy, research, criminology, medicine, occultism, deep finance (mergers, inheritances), surgery, and any field that requires going to the bottom of things. Their capacity for concentration and their intuition make them excellent strategists and diagnosticians in any discipline.",
        positives: ["Resilience and ability to rise from the ashes", "Extraordinary intuition and psychic perception", "Absolute loyalty when trusting", "Unique strength of will and determination", "Capacity for profound and permanent transformation"],
        negatives: ["Corrosive jealousy and possessiveness", "Mistrust and paranoia as a defense mechanism", "Thirst for revenge when feeling betrayed", "Subtle manipulation from emotional control", "Difficulty letting go and forgiving"]
    },
    Sagittarius: {
        name: "Sagittarius",
        style: "with contagious optimism, mental adventure, and a search for truth.",
        essence: "The indomitable and luminous arrow ascending to the galaxy. An unshakeable philosophical seeker who runs desperately toward truth and meaning. Their inner hope is their great driving force.",
        gift: "Your Radiant Light: Expansive optimism, unshakeable nobility, and a frankness almost reckless but liberating. Your fire inspires, encourages, and injects the masses and friends with the visionary miracle to understand the inexplicable of cosmic life.",
        trap: "Your Magical Shadows: Fleeing with blindness and vacuous rebellion, escaping from the dense details of living to fall into reckless irresponsibility or extremist philosophical brusqueness, assuming a false absolute possession of real morality.",
        mantra: "I Understand, I Expand",
        profile: "Sagittarius, ruled by Jupiter, is the sign of the traveler, the philosopher, and the eternal seeker of meaning. People with prominent Sagittarius need freedom, expansion, and the constant feeling that they are growing. They are natural optimists who spread their enthusiasm for life. Their greatest learning is that responsibility is not at odds with adventure: going far and also fulfilling what is near.",
        love: "In love, Sagittarius is passionate, fun, and enormously generous with their experiences and visions. However, their fear of definitive commitment can create instability in relationships. They need a partner who shares their love for adventure and who respects their fundamental need for horizon. Cohabitation is their greatest challenge.",
        career: "Sagittarius shines in philosophy, law, university teaching, travel, tourism, publishing, media, outdoor sports, and any field with international impact. They are the eternal student who one day becomes a teacher.",
        positives: ["Tremendously contagious optimism and faith in life", "Love for knowledge and growth", "Generosity and nobility of spirit", "Direct honesty though sometimes brutally sincere", "Ability to see the big picture and global sense"],
        negatives: ["Irresponsibility toward concrete commitments", "Verbal brusqueness that hurts unintentionally", "Overconfidence leading to calculation errors", "Philosophical dogmatism disguised as broad-mindedness", "Flight from difficulty and tedium"]
    },
    Capricorn: {
        name: "Capricorn",
        style: "with pragmatism, structure, and a look set on long-term success.",
        essence: "The cosmic sentinel, tireless conqueror of the abyss and the mountain of aspirations. An old soul loaded with stoic ambitions wrapped in the deep practical wisdom of their own solitary and Saturnine reflective silences.",
        gift: "Your Radiant Light: Formidable discipline and absolute incorruptible integrity at the peak of success and a wonderfully intelligent dry humor. You were born an old soul to materialize unbeatable projects and serve yourself as an unmovable cornerstone for your extended family.",
        trap: "Your Magical Shadows: Resigning melancholically to duty and punishing any hint of frivolity without compassion. In the process, you build titanic walls isolating the heart in icy and ambitious pragmatic calculations emptied of the breath of soft spirituality.",
        mantra: "I Achieve, I Build",
        profile: "Capricorn, ruled by Saturn, is the sign of achievement, structure, and maturity earned with effort. People with prominent Capricorn age like fine wine: life has an ascending sense for them. They are long-term strategists who build empires brick by brick. Their evolutionary path is to learn to enjoy the way without waiting to reach the top to feel they are worthy.",
        love: "In love, Capricorn is serious, responsible, and deeply loyal. They don't fall in love easily or frivolously, but when they do, it's with the intention of building something true and lasting. Their challenge is to allow themselves to be vulnerable and show themselves emotionally to their partner. They need a love that also has ambition and long-term vision.",
        career: "Capricorn is the archetype of the professional of excellence. They shine in finance, engineering, law, politics, medicine, administration, architecture, and any field that rewards merit and constancy. They are the founder, the CEO, the craftsman who masters their trade after years of silent dedication.",
        positives: ["Unique long-term discipline and ambition", "Very solid integrity and sense of duty", "Ability to build lasting structures", "Dry humor and practical intelligence", "Maturity and wisdom that grows with years"],
        negatives: ["Emotional coldness as a protection mechanism", "Obsession with status and public image", "Difficulty enjoying without feeling they 'deserve it'", "Pessimism and restricted view of the future", "Excessive work as an emotional evasion"]
    },
    Aquarius: {
        name: "Aquarius",
        style: "with disruptive originality, detachment, and a focus on the common good.",
        essence: "The out-of-step humanitarian wizard living secretly three hundred years ahead of this dimension. They operate an erratic blue beam capable of tearing down all norms in a fleeting instant in honor of progress and genuine well-being.",
        gift: "Your Radiant Light: Selfless innovation and absolute lack of earthly prejudice, you have the rebellion of the altruistic and universal genius through sharp intellects, allowing the environment to free itself from useless old labels.",
        trap: "Your Magical Shadows: Falling tragically in love with the distant human race while despising and disconnecting in frivolous, dogmatic rebellions untouchable by an intellectual superiority paralyzing to the pain of the few individual loves you have half a meter away.",
        mantra: "I Know, I Innovate",
        profile: "Aquarius, ruled by Uranus and Saturn, is the sign of collective genius, innovation, and freedom. People with prominent Aquarius think in radical original ways and feel a deep impulse to improve the world. They are visionaries who see the future before anyone else. Their greatest evolution consists in learning to love concrete individuals with the same passion with which they love abstract humanity.",
        love: "In love, Aquarius is friend first and lover second. They need an intellectual connection before anything else. They are loyal but detest possessiveness and emotional dramas. They need a partner who is their equal, who gives them space, and who shares their vision of the world. Their challenge is to allow themselves emotional intimacy without feeling it as a loss of autonomy.",
        career: "Aquarius shines in technology, programming, physics, astronomy, social activism, NGOs, systems design, business innovation, and any field that seeks disruptive solutions to collective problems. They are the inventor, the ethical hacker, the visionary scientist.",
        positives: ["Visionary and radically original intelligence", "Genuine and selfless humanitarianism", "Capacity to innovate where others stagnate", "Healthy detachment and respect for others' freedom", "Systems thinking for the common good"],
        negatives: ["Emotional coldness that distances loved ones", "Dogmatic rebellion disguised as progressivism", "Distance from individual love for love of the collective", "Intellectual superiority that isolates", "Instability and sudden changes without notice"]
    },
    Pisces: {
        name: "Pisces",
        style: "with universal compassion, daydreaming, and a sensitivity without borders.",
        essence: "The universal immanent mystic capable of swimming all the multidimensional dreams from a single drop to pure existence. Knowing by heart the eleven previous karmic lessons that forged their vulnerability as extreme beauty and abstract hyper-sensory.",
        gift: "Your Radiant Light: You have a cosmic mystic ocean of empathy and sacrifice. Hypnotic artistic capacity that allows you to dive as a limitless psychic and flow diluting dense resentments that redems all evil from tired souls by force of pure extreme love.",
        trap: "Your Magical Shadows: Suicidal refusal to anchor on ground; living dragged in melancolic dissolutive daydreaming self-deceptions that divert through addictive evasions to a tragic and constant passive spiral, forgetting your material responsibilities.",
        mantra: "I Believe, I Flow",
        profile: "Pisces, ruled by Neptune and Jupiter, is the last sign of the zodiac and carries the accumulated wisdom of all previous ones. People with prominent Pisces have a limitless sensitivity and a natural connection with the collective unconscious. They are artists, mystics, healers, and dreamers. Their greatest learning is to keep one foot in the material world without losing their connection to the invisible world.",
        love: "In love, Pisces loves with an oceanic depth. They are the most compassionate and dedicated lover of the zodiac, capable of dissolving their own self into the other's. Their greatest challenge is to not lose themselves in the relationship and to learn to receive as much as they give. They need a partner who anchors them to reality with tenderness and who doesn't take advantage of their limitless dedication.",
        career: "Pisces shines in art, music, dance, film, photography, spirituality, holistic medicine, transpersonal psychology, oceanography, and work with vulnerable communities. Any field that allows them to use their compassion or creativity as a healing tool is their natural territory.",
        positives: ["Empathy and compassion without borders", "Artistic creativity and poetic vision", "Deep intuition and psychic sensitivity", "Ability to forgive and transcend pain", "Natural and deep spiritual connection"],
        negatives: ["Evasion of reality through escapism", "Tendency toward passive victimization", "Susceptibility to addictions and dependencies", "Naivety that exposes them to manipulation", "Difficulty establishing clear boundaries"]
    }
};

export const HOUSES_LIB_EN: Record<number, {
    title: string;
    scenario: string;
    challenge: string;
    essence: string;
    manifestation: string;
    shadow: string;
    profile: string;
    love: string;
    career: string;
    positives: string[];
    negatives: string[];
}> = {
    1: {
        title: "The Identity Stage",
        scenario: "the dawn of consciousness, your mask to the world, and your first impression.",
        challenge: "To learn to project your authentic essence with courage and clarity.",
        essence: "The entry point into physical incarnation. It is the energy others perceive from you before you speak.",
        manifestation: "Physical appearance, initial vitality, way of starting any project or relationship.",
        shadow: "Extreme egocentrism or total lack of awareness about impact on others.",
        profile: "House 1 is the Ascendant: the gateway to the world and the energy with which you present yourself to life. The sign that rules it colors your appearance, your temperament, and the first impact you produce on others. It is not who you are in depth, but how you instinctively show yourself.",
        love: "In relationships, House 1 defines the energy you project at the start of any bond. People with a lot of energy in the 1st are magnetic and impactful, but must learn to listen and yield space to the other so that love can flourish beyond the first impression.",
        career: "Professionally, House 1 speaks of roles where presence and personal initiative are fundamental. Entrepreneurship, front-facing roles, visible leadership, and any career where personal image is part of success.",
        positives: ["Magnetic and impactful presence", "Initiative and startup capacity", "Clear projection of personal identity", "Strong vitality and vital drive", "Authenticity in the first impression"],
        negatives: ["Egocentrism and inability to see the other", "Impulsiveness without prior reflection", "Chronic impatience in long processes", "Mask that hides real vulnerability", "Difficulty sustaining what starts"]
    },
    2: {
        title: "The Resource Stage",
        scenario: "your values, talents, and possessions; what gives you security.",
        challenge: "To cultivate a self-worth that does not depend on the external.",
        essence: "The materialization of desire on earth. It represents what we consider 'own' and our security base.",
        manifestation: "Own income, money management, latent talents, and physical self-esteem.",
        shadow: "Obsessive material attachment or deep insecurity compensated with possessions.",
        profile: "House 2 rules the relationship with the material world, own resources, and self-esteem. It shows how you build security in your life: through what you possess, what you value, and how you manage yours. A planet here deeply shapes your relationship with money and self-worth.",
        love: "In love, House 2 speaks of what you value in a partner and how the bond affects your sense of security and self-esteem. Planets in this house can indicate that you seek material stability in relationships or that self-love deeply conditions your capacity to love.",
        career: "Professionally, House 2 indicates own talents that can become a source of income. It also points out the financial style: whether there is a tendency to earn, accumulate, or spend. It favors vocations where personal resources are the main asset.",
        positives: ["Intelligent management of own resources", "Solid and well-defined values", "Concrete talents that generate income", "Ability to create material security", "Well-rooted sense of self-worth"],
        negatives: ["Excessive attachment to the material as a substitute for security", "Chronic economic insecurity", "Self-esteem that fluctuates with bank balance", "Possessiveness in relationships", "Difficulty sharing or letting go of resources"]
    },
    3: {
        title: "The Communication Stage",
        scenario: "your close environment, learning, and how you process information.",
        challenge: "To develop a flexible mind and the capacity to understand diverse perspectives.",
        essence: "The immediate exchange of information. It is the intellectual bridge that connects us with what is within our reach.",
        manifestation: "Siblings, neighbors, short trips, primary studies, and daily communication style.",
        shadow: "Intellectual superficiality, gossip, or constant mental dispersion.",
        profile: "House 3 rules the daily mind, communication, the immediate environment, and first learnings. It shows how you think, how you speak, and how you relate to the nearest world: siblings, neighbors, basic studies. A planet here intensifies mental and communicative activity.",
        love: "In love, House 3 speaks of the importance of communication within the bond. If there are planets here, conversation, shared humor, and intellectual stimulation are fundamental to keeping romantic interest alive. Love is also expressed through words and messages.",
        career: "Professionally, House 3 favors everything related to communication: writing, teaching, media, marketing, translation, and any trade that involves constant exchange of information. It also indicates the ability to learn quickly and adapt to new environments.",
        positives: ["Outstanding mental and verbal agility", "Permanent intellectual curiosity", "Adaptability in changing environments", "Skill to connect with the close environment", "Ability to learn quickly"],
        negatives: ["Mental dispersion and lack of depth", "Tendency toward gossip and superficial information", "Nervousness and cognitive restlessness", "Difficulty concentrating on a single thing", "Siblings or close environment as a source of conflict"]
    },
    4: {
        title: "The Home Stage",
        scenario: "your roots, family, and your private world; the foundation of your life.",
        challenge: "To create an internal refuge of peace and heal the family heritage.",
        essence: "The Imum Coeli (IC). It is the emotional womb and the base from which our entire vital tree grows.",
        manifestation: "The physical home, private life, relationship with ancestral roots, and emotional security.",
        shadow: "Childish dependence on the past or defensive emotional seclusion.",
        profile: "House 4 is the IC (Imum Coeli), the deepest point of the chart. It rules family roots, home, private life, and emotional heritage. What occurs in this house defines the psychological base from which we operate: the firm ground or unstable soil on which we build life.",
        love: "In love, House 4 speaks of intimate life as a couple: cohabitation, the shared home, and origin family patterns that replicate in relationships. Planets here indicate that love is deeply interwoven with the search for roots, belonging, and security.",
        career: "Professionally, House 4 can indicate vocations from home or related to it: real estate, archaeology, family psychology, restoration, cooking, or any area that connects with roots, history, and the land.",
        positives: ["Deep connection with roots and family", "Ability to create nurturing and safe homes", "Highly developed emotional intuition", "Deep loyalty and sense of belonging", "Inner strength that comes from roots"],
        negatives: ["Unresolved family wounds that condition the present", "Difficulty becoming independent emotionally and physically", "Tendency to take refuge in the past", "Dependence on the home as the only source of security", "Emotional seclusion when the outside world threatens"]
    },
    5: {
        title: "The Creativity Stage",
        scenario: "romance, play, art, and joyful self-expression.",
        challenge: "To dare to shine with your own voice and celebrate the joy of being alive.",
        essence: "The creative flame of the heart. It is the stage where we seek to be special and loved for our singularity.",
        manifestation: "Children (own or creative), fun, romances, hobbies, and artistic expression.",
        shadow: "Pathological need for attention or excessive drama to feel alive.",
        profile: "House 5 rules creativity, play, romance, and self-expression. It is the house of the Sun, of the joy of existing. Planets here intensify the need to create, to love, and to shine. It is also the house of biological and creative children, and of all the ways in which we leave a personal mark on the world.",
        love: "In love, House 5 is the space of romance: adventure, courtship, passion, play. Whoever has planets here seeks relationships that make them feel alive and special. Love for this house is a work of art: dramatic, intense, and creative.",
        career: "Professionally, House 5 favors art, show business, child education, design, play, sports, and any vocation that allows self-expression and leaves a unique creative mark on the world.",
        positives: ["Genuine and overflowing creativity", "Ability to enjoy and celebrate life", "Charisma and magnetism in love and art", "Generosity and warmth in bonds", "Talent for play and improvisation"],
        negatives: ["Excessive need for attention and validation", "Romance that flees from real commitment", "Drama and theatricality as a presence mechanism", "Excessive risk in games and gambling", "Difficulty for the ordinary and routine"]
    },
    6: {
        title: "The Routine Stage",
        scenario: "daily work, service, physical health, and daily habits.",
        challenge: "To integrate body and mind through order and humble service.",
        essence: "The refinement of the human instrument. It is the ritualization of daily life to maintain balance.",
        manifestation: "Daily health, diet, subordinate work environment, and service to others.",
        shadow: "Hypochondria, neurotic perfecting, or purposeless servitude.",
        profile: "House 6 rules health, habits, daily routine, and service. It is the stage where mind and body learn to function in harmony. Planets here indicate an intense relationship with the world of daily work, physical health, and discipline. It is the office of the zodiac.",
        love: "In love, House 6 can indicate relationships that are born in work environments or that have a strong practical and mutual service dimension. Whoever has a lot of energy here expresses love through daily acts: preparing food, organizing, caring for the other's health.",
        career: "Professionally, House 6 is the area of daily work, colleagues, bosses, and subordinates. It favors vocations of service, health, nutrition, order, and analysis: medicine, dietetics, social work, administration, and high-precision craftsmanship.",
        positives: ["Exceptional discipline and work ethic", "Attention to details that guarantees quality", "Genuine care for health and the body", "Capacity for service and support to others", "Methods and routines that create real results"],
        negatives: ["Perfeccionism that paralyzes action", "Hypochondria and excessive worry about health", "Servilism without limits or own purpose", "Constant criticism of the work environment", "Difficulty delegating and trusting others"]
    },
    7: {
        title: "The Bond Stage",
        scenario: "the partner, partners, and the mirror that others return to us.",
        challenge: "To learn that real balance is born from respect for individuality.",
        essence: "The meeting with the 'Thou'. It represents what we project outside ourselves and seek to integrate through bonds.",
        manifestation: "Marriage, legal partnerships, declared enemies, and any face-to-face relationship.",
        shadow: "Loss of identity in the other or dependence on external approval.",
        profile: "House 7 rules marriage, partnerships, and all peer-to-peer bonds. It is the mirror: it shows what we project onto the other and what we seek outside ourselves. The Descendant sign reveals the type of partner we attract and the deepest relational patterns.",
        love: "In love, House 7 is the epicenter. It shows what we seek in a partner, what type of bond we create, and what the repeating relational patterns are. Planets here intensify the importance of relationships in life: identity is largely built through the other.",
        career: "Professionally, House 7 speaks of partnerships, clients, and peer-to-peer work relations. It favors vocations where direct treatment with other people is key: mediation, counseling, negotiation, public relations, and law.",
        positives: ["Ability to create bonds of real depth", "Capacity to negotiate and find agreements", "Vision of the other as teacher and mirror", "Balance and justice in relationships", "Magnetism that attracts meaningful relationships"],
        negatives: ["Excessive dependence on the partner to feel complete", "Loss of identity in bonds", "Projection of own shadows onto the other", "Relationships that turn into power battles", "Fear of loneliness leading to toxic relationships"]
    },
    8: {
        title: "The Fusion Stage",
        scenario: "deep crises, transformative sexuality, and the hidden.",
        challenge: "To let go of control and allow the old to die so power can emerge.",
        essence: "The house of transmutation. Where the energies of two people merge to create something new and more powerful.",
        manifestation: "Existential crises, inheritances, others' money, deep therapy processes, and sacred sexuality.",
        shadow: "Destructive power struggles, hidden obsessions, or fear of abandonment.",
        profile: "House 8 rules transformation, symbolic death, deep sexuality, inheritances, and shared resources. It is the house of the occult and of regenerating crises. Planets here indicate a life marked by intense transformations that, when crossed consciously, generate an exceptional power of rebirth.",
        love: "In love, House 8 speaks of total fusion: sexual and psychic intimacy that goes beyond the superficial. Relationships with planets here are transformative, intense, and often karmic. Themes of power, control, and vulnerability are central to the love dynamic.",
        career: "Professionally, House 8 favors vocations that work with the deep: psychoanalysis, medicine, surgery, investment banking, estate management, occult research, and any area of crisis and regeneration.",
        positives: ["Capacity for transformation and deep regeneration", "Access to the unconscious and hidden motivations", "Intensity and depth in all bonds", "Resilience before the most difficult crises", "Power of attraction and personal magnetism"],
        negatives: ["Control and manipulation in relationships", "Obsession with power and others' resources", "Deep fear of abandonment and vulnerability", "Tendency to live in constant crises", "Difficulty trusting and opening up genuinely"]
    },
    9: {
        title: "The Philosophy Stage",
        scenario: "higher studies, long trips, and the search for meaning.",
        challenge: "To build an own belief system based on direct experience.",
        essence: "The expansion of higher consciousness. It is the arrow launched at the sky seeking the whys of existence.",
        manifestation: "Foreign lands, universities, philosophy, religion, and the search for spiritual teachers.",
        shadow: "Fanatical dogmatism or unceasing search to escape present reality.",
        profile: "House 9 rules philosophy, higher studies, long trips, religion, and the search for meaning. It is the scenario where the mind transcends the everyday to seek broader truths. Planets here point to a life marked by spiritual search, higher education, and encounter with other cultures.",
        love: "In love, House 9 attracts relationships with people from other cultures, philosophies, or who represent expansion and adventure. Philosophical compatibility and shared values are essential for someone with energy in this house. Relationships must grow and expand the awareness of both.",
        career: "Professionally, House 9 favors university teaching, philosophy, law, spirituality, international tourism, publishing, photography, and world-impact communication.",
        positives: ["Exceptional mental and cultural openness", "Genuine search for meaning and wisdom", "Capacity to inspire with far-reaching visions", "Optimism and faith in the future", "Skill to integrate diverse perspectives into a larger synthesis"],
        negatives: ["Philosophical or religious dogmatism", "Flight from daily reality toward the far horizon", "Intolerance with more limited visions", "Excess theory with lack of practical application", "Promises of a bright future that never arrive"]
    },
    10: {
        title: "The Public Purpose Stage",
        scenario: "your career, social status, and your contribution to the world.",
        challenge: "To assume own authority and walk toward your peak with integrity.",
        essence: "The Midheaven (MC). It is the maximum social visibility and the legacy we leave in the world's structure.",
        manifestation: "Profession, public prestige, authority figures, and our long-term goals.",
        shadow: "Soul-less ambition or total identification with external status.",
        profile: "House 10 is the MC (Midheaven): the highest point of the chart and the maximum public expression of who you are. It rules career, reputation, status, and legacy. The MC sign indicates the area where you can achieve the greatest recognition and the way the world perceives you in your best version.",
        love: "In love, House 10 can indicate that relationships have an impact on social reputation or that the partner is seen as part of public success or failure. Whoever has a lot of this house may prioritize work and career over affective life.",
        career: "Professionally, House 10 is the most important: it points to the vocational area of greatest potential for recognition and legacy. It indicates the type of authority you exercise naturally and the leadership style the world sees in you.",
        positives: ["Ambition with purpose and clear direction", "Capacity to build a solid reputation", "Visible leadership with real social impact", "Discipline to reach long-term goals", "Lasting legacy in the professional field"],
        negatives: ["Total identification of own value with external success", "Ambition that sacrifices personal and affective life", "Fear of public failure that paralyzes", "Workaholism and addiction to the professional role", "Difficulty showing vulnerability outside the public character"]
    },
    11: {
        title: "The Group Stage",
        scenario: "friends, communities, collective ideals, and future projects.",
        challenge: "To collaborate with others without losing your singularity, serving a common vision.",
        essence: "Collective consciousness. The space where we join with like-minded people to transform social reality.",
        manifestation: "Social networks, voluntary interest groups, future plans, and hopes.",
        shadow: "Empty rebellion or ego dilution in the ideological mass.",
        profile: "House 11 rules groups, friendships, collective ideals, and future hopes. It is the house of vision: where we contribute to something bigger than ourselves. Planets here indicate an active life in communities, movements, or networks of like-minded people with whom a transformative vision is shared.",
        love: "In love, House 11 can indicate relationships that are born within groups of friends or communities of shared interests. Friendship as the base of love is fundamental. Planets here can also point to a love style that values individual freedom within the bond.",
        career: "Professionally, House 11 favors vocations with collective impact: activism, NGOs, social technology, collaboration networks, progressive politics, and innovation for the common good.",
        positives: ["Capacity to unite people with a common vision", "Broad and diverse network of contacts", "Genuine ideals that inspire collectives", "Originality within group collaboration", "Hope and vision of the future as a driver of action"],
        negatives: ["Dilution of identity in the group or ideology", "Empty rebellion without constructive purpose", "Difficulty committing to concrete individuals", "Utopianism that clashes with practical reality", "Emotional coldness in the name of the collective ideal"]
    },
    12: {
        title: "The Unconscious Stage",
        scenario: "spirituality, solitude, and connection with the totality.",
        challenge: "To surrender to the mystery of life and find unity in silence.",
        essence: "The cosmic womb and the end of the cycle. Where the individual ego dissolves to reintegrate into universal consciousness.",
        manifestation: "Collective unconscious, karma, necessary solitude, retreats, and silent mysticism.",
        shadow: "Chronic escapism, psychic confusion, or feeling of being a victim of fate.",
        profile: "House 12 is the most mysterious: it rules the deep unconscious, karma, retreats, spirituality, and ego dissolution. Planets here operate from the shadows: they are energies that are not easily expressed in the outside world but exert an enormous influence from within. Work with this house is deeply spiritual and therapeutic.",
        love: "In love, House 12 can indicate secret relationships, very intense karmic connections, or loves that develop in the sphere of the hidden or the unspoken. Whoever has planets here loves from an almost invisible depth, and often chooses relationships that allow them to dissolve the ego in the other.",
        career: "Professionally, House 12 favors vocations of silent dedication: hospital, monastic, or spiritual work, art as a meditative practice, deep psychology, work with vulnerable people, and any field that involves service from invisibility.",
        positives: ["Deep connection with the spiritual and invisible world", "Universal empathy and compassion", "Capacity for retreat and regeneration in solitude", "Access to the collective unconscious as a creative source", "Surrender to the mystery that brings profound peace"],
        negatives: ["Escapism and evasion of daily responsibility", "Excess sacrifice that generates resentment", "Confusion between pure intuition and mental projection", "Tendency toward victimhood or martyrdom", "Hidden enemies or own unconscious sabotages"]
    }
};
