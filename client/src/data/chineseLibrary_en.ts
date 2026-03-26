// chineseLibrary_en.ts
// Enriched Chinese Horoscope Library
// Inspired by the methodology and style of Ludovica Squirru Dari
// Fields: profile, love, career, positives[], negatives[], karma, talisman

export interface ChineseAnimalLib {
    name: string;
    chineseName: string;
    element: string;
    polarity: string;
    trine: string;
    years: string;
    profile: string;
    love: string;
    career: string;
    positives: string[];
    negatives: string[];
    karma: string;
    talisman: string;
}

export const CHINESE_LIB_EN: Record<string, ChineseAnimalLib> = {
    "Rat": {
        name: "Rat",
        chineseName: "Zǐ (子)",
        element: "Water",
        polarity: "Yang",
        trine: "First Trine with Dragon and Monkey",
        years: "1900, 1912, 1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020",
        profile: "The Rat is the first sign of the Chinese zodiac and, according to Ludovica Squirru, one of the most complex and intelligent beings in the cycle. Born under the Water element in its Yang aspect, it possesses an insatiable curiosity that leads it to explore every corner of the material and intellectual world. Its survival instinct is legendary: the Rat is not born with an easy life, but builds it with the cunning of someone who knows the terrain better than anyone. It is sociable and charming, capable of slipping into the most closed hearts with its natural charisma. It loves information and accumulates it like an invisible treasure. Demanding of itself and others, it pushes in the direction of constant growth. It leads the trine of the intellect along with the Dragon and the Monkey, being the most practical mind of the three.",
        love: "In love, the Rat is passionate and deeply loyal when it finds someone it considers its equal. It looks for a partner to share concrete life projects with, not just ephemeral romanticism. Its controlling nature and its need for emotional security can make it jealous or overprotective. When it truly loves, it gives everything: its intelligence, its time, and its loyalty. It will struggle if its partner does not respect its privacy and its space to think. Its best bonds are with the Dragon, the Ox, and the Monkey, with whom it builds real castles.",
        career: "Professionally, the Rat excels in areas where strategy, mental speed, and adaptability are key. It is an excellent negotiator, analyst, researcher, and entrepreneur. Its love for detail makes it valuable in financial, journalistic, scientific, or consulting roles. It frequently generates its own job positions and creates specialized studies that the community values. Its ambition never rests, but it needs to learn to delegate so as not to overextend itself. The Rat thrives in environments that give it autonomy and intellectual recognition.",
        positives: [
            "Exceptional practical and intuitive intelligence",
            "Ability to adapt to any circumstance",
            "Natural leader with great charisma and social charm",
            "Prodigious memory and sharp analytical mind",
            "Resilience and ability to recover from setbacks"
        ],
        negatives: [
            "Tendency toward manipulation when feeling threatened",
            "Anxiety from excessive accumulation of goods or information",
            "Difficulty fully trusting others",
            "Overly calculating, can lose emotional spontaneity",
            "Boundless ambition that can lead to selfishness"
        ],
        karma: "The Rat comes to this world to learn the difference between survival and abundance. Its karma is to transform cunning into wisdom and control into trust. Its greatest spiritual challenge is to open up to give without calculating the return.",
        talisman: "Chinese gold coin, citrine quartz crystal, all in navy blue and silver tones"
    },

    "Ox": {
        name: "Ox",
        chineseName: "Chǒu (丑)",
        element: "Earth",
        polarity: "Yin",
        trine: "Second Trine with Snake and Rooster",
        years: "1901, 1913, 1925, 1937, 1949, 1961, 1973, 1985, 1997, 2009, 2021",
        profile: "The Ox is the rock of the Chinese zodiac. For Ludovica Squirru, it represents the most silent and persistent force of the cycle: it doesn't need applause to keep walking. Born under Yin Earth, the Ox possesses a deep, methodical, and profoundly honest nature. Its word is sacred and its effort, immovable. It is not the fastest or the brightest at first glance, but its constancy converts dreams into real structures. It is the builder of civilizations, the one who works when everyone else sleeps. Its fidelity is absolute and its sense of duty, unshakable. It resists change although this sometimes locks it into paradigms of the past.",
        love: "The Ox loves with the solidity of its four feet on the ground: deeply, without fuss, and forever. It is not an expressive or dramatic lover, but its constant presence is the deepest form of love it knows. It needs to feel secure before opening up emotionally, and it can take time to trust. Once it does, it is an unconditional life partner. Its greatest romantic challenge is rigidity: it struggles to adapt its routines or yield in conflicts. Its best partners are the Rat, the Rooster, and the Snake, with whom it shares traditional values and long-term visions.",
        career: "The Ox is the most reliable professional of the zodiac. It arrives early, leaves late, and never delivers a half-finished job. It excels in roles that require patience, precision, and responsibility: agriculture, architecture, medicine, law, accounting, and any field that demands rigor and method. Its authority is earned with facts, not words. However, its resistance to change can make it lose opportunities in dynamic environments. It learns slowly but learns forever. Its ideal work world is orderly, predictable, and with long-term recognition.",
        positives: [
            "Unparalleled perseverance and endurance in the face of adversity",
            "Absolute fidelity and loyalty in all its relationships",
            "Reliability: its word has the value of a contract",
            "Discipline and method that bring any project to fruition",
            "Infinite patience with those it loves and respects"
        ],
        negatives: [
            "Mental rigidity that makes it difficult to adapt to changes",
            "Accumulated resentment that can explode late and hard",
            "Stubbornness that can block personal growth",
            "Difficulty expressing emotions and vulnerability",
            "Tendency toward isolation when feeling misunderstood"
        ],
        karma: "The Ox comes to learn that strength also needs flexibility. Its karma is to let go of the weight of the past and trust that the river always finds its way to the sea, even if it changes course.",
        talisman: "Green jade stone, seeds from the earth, dark green and ochre tones"
    },

    "Tiger": {
        name: "Tiger",
        chineseName: "Yín (寅)",
        element: "Wood",
        polarity: "Yang",
        trine: "Third Trine with Horse and Dog",
        years: "1902, 1914, 1926, 1938, 1950, 1962, 1974, 1986, 1998, 2010, 2022",
        profile: "The Tiger is the sign of indomable charisma. Ludovica Squirru defines it as the most intense and magnetic being of the Chinese zodiac: anyone who shares a room with it inevitably feels it. Born under Wood Yang, the Tiger lives by its own rules and instinctively rebels against any restriction. It is idealistic, generous to the extreme, and capable of sacrificing itself for noble causes without hesitation. Its energy is a hurricane that can build or destroy depending on the awareness with which it is directed. Its ego, when not tamed, can be its greatest enemy. The Tiger needs purpose: without a cause that inflames it, its energy turns against itself.",
        love: "The Tiger loves with an intensity that few can sustain. As a partner, it demands absolute loyalty and gives it unconditionally in return. It is passionate, protective, and enormously generous with those it loves. However, its impulsiveness can create unnecessary storms and its wounded ego can turn into emotional explosions. It needs a partner who is its equal: someone who isn't intimidated by its fire but doesn't try to extinguish it either. Its most compatible bonds are with the Horse, the Dog, and the Pig. With the Monkey, tension can be irreconcilable.",
        career: "At work, the Tiger shines in leadership positions, activism, performing arts, politics, high-performance sports, or any field where courage and originality are valued. It is not suited for monotonous tasks or following orders without questioning them. It is innovative, provocative, and capable of inspiring entire teams with its vision. Its problem is constancy: when the novelty runs out, it can abandon promising projects. If it learns to manage its energy and impulsiveness, the Tiger becomes unstoppable.",
        positives: [
            "Magnetism and charisma that inspire those around it",
            "Bravery to defend what is right even when alone",
            "Limitless generosity with those it loves",
            "Ability to reinvent itself after the hardest falls",
            "Passionate spirit that ignites projects and people"
        ],
        negatives: [
            "Impulsiveness that takes decisions without measuring consequences",
            "Outsized ego that can alienate valuable allies",
            "Inconstancy when novelty and challenge run out",
            "Difficulty accepting criticism or external limitations",
            "Tendency toward extremes: all or nothing, calm or storm"
        ],
        karma: "The Tiger comes to transform its intensity into mastery. Its karma is to learn that true power does not roar: it radiates. Humility and patience are its most difficult and necessary lessons.",
        talisman: "Golden amber, wooden tiger figure, orange and forest green tones"
    },

    "Rabbit": {
        name: "Rabbit",
        chineseName: "Māo (卯)",
        element: "Wood",
        polarity: "Yin",
        trine: "Fourth Trine with Goat and Pig",
        years: "1903, 1915, 1927, 1939, 1951, 1963, 1975, 1987, 1999, 2011, 2023",
        profile: "The Rabbit is the sign of beauty, diplomacy, and soft magic. According to Ludovica Squirru, it possesses an innate elegance that permeates everything it touches, with a refined aesthetic sense and an intuition that rarely fails it. It is a dual being, with very marked yin and yang: it can be tender and firm at the same time, dreamy and calculating, open and hermetic. Its character is avant-garde and innovative, with an artistic vocation that always appears whenever it has the space to express itself. It is the great diplomat of the zodiac: it finds the middle path when everything seems irreconcilable. But behind its apparent docility there can be a will of steel and, in its shadow, tyrannical impulses that surprise those who underestimated it.",
        love: "The Rabbit is a refined and cultured lover, who seduces more with its intelligence and sensitivity than with grandiloquent gestures. It detests vulgarity and solitude almost equally. In love it seeks a safe and beautiful refuge where it can lower its guard. It is tender and in need of constant signs of affection, although it struggles to ask for them. Its fear of conflict can lead it to accumulate resentments instead of expressing them, which sometimes explodes at unexpected moments. Its best partners are the Goat, the Pig, and the Dog. With the Rooster, tension is inevitable.",
        career: "The Rabbit thrives in environments that value finesse, judgment, and the ability to mediate: fashion, diplomacy, arts, psychology, public relations, literature, decoration, and any field that combines creativity with strategy. It is an exceptional counselor and advisor: its objectivity and tact make people trust it naturally. A disciplined and persevering Rabbit can go very far. Its challenge is to overcome the passivity and fear of risk that sometimes paralyze it at key moments.",
        positives: [
            "Elegance and refinement that beautify every environment",
            "Exceptional diplomacy for resolving conflicts without wounds",
            "Deep intuition and highly developed aesthetic sense",
            "Adaptability and talent for surviving with grace",
            "Genuine charm that builds solid social networks"
        ],
        negatives: [
            "Escapism: flees from conflict instead of confronting it",
            "Passivity that can make it lose key opportunities",
            "Fear of failure that paralyzes necessary action",
            "Silent resentments that explode disproportionately",
            "Emotional dependency disguised as independence"
        ],
        karma: "The Rabbit comes to learn that true peace is not the absence of conflict but the ability to inhabit it with grace. Its karma is to develop the courage to tell the truth even if it is uncomfortable.",
        talisman: "Moonstone, carved lotus flower, pearl white and sage green tones"
    },

    "Dragon": {
        name: "Dragon",
        chineseName: "Chén (辰)",
        element: "Earth",
        polarity: "Yang",
        trine: "First Trine with Rat and Monkey",
        years: "1904, 1916, 1928, 1940, 1952, 1964, 1976, 1988, 2000, 2012, 2024",
        profile: "The Dragon is the only mythical being of the Chinese zodiac and, for Ludovica Squirru, the most imposing and charismatic sign of the cycle. Born under Yang Earth, the Dragon does not just dream big — it lives big in every one of its gestures. It possesses overwhelming vitality, a magnanimous heart, and a presence that fills rooms without saying a single word. It is creative, passionate, and called to spread its wings to guide others, especially in times of crisis. Its ego, when unbalanced, can become a tyrant of itself and others. Arrogance is its greatest trap, as it makes it believe that everything depends exclusively on its genius. The Dragon that humbles itself and listens reaches its full mythical potential.",
        love: "The Dragon enchants with its presence and generosity, but maintaining a relationship with it is not for weak souls. It demands admiration and needs to feel special at all times. In love it can be intensely romantic and then completely absorbed in its projects, leaving the partner with the feeling that they are competing with a greater cause. When it truly loves, it protects and gives with real nobility. Its best bonds are with the Rat, the Monkey, and the Rooster. With the Dog, the clash of personalities can be irreconcilable.",
        career: "The Dragon needs a mission, not just a job. It excels in politics, art, business management, innovative ventures, medicine, spirituality, and any field where long-term vision and leadership capacity are required. It is a natural motivator that lifts entire teams with its enthusiasm. Its Achilles' heel is impatience with others' inefficiency and difficulty delegating. When it learns to work with others instead of over them, it creates extraordinary legacies.",
        positives: [
            "Charisma and presence that inspire devotion and admiration",
            "Overwhelming creativity and long-range strategic vision",
            "Inexhaustible vitality and energy for its projects",
            "Generosity and magnanimity of an authentic heart",
            "Leadership capacity in times of crisis and change"
        ],
        negatives: [
            "Arrogance that blinds it to the needs of others",
            "Intolerance for others' inefficiency and slowness",
            "Impulsivity to burn important bridges",
            "Need for admiration that can become dependency",
            "Difficulty being patient with processes it does not control"
        ],
        karma: "The Dragon comes to learn that true power serves, it does not dominate. Its karma is to descend from the clouds and understand that the greatest legacies are built with knees on the ground.",
        talisman: "River pearl, golden sandalwood incense, imperial gold and crimson red colors"
    },

    "Snake": {
        name: "Snake",
        chineseName: "Sì (巳)",
        element: "Fire",
        polarity: "Yin",
        trine: "Second Trine with Ox and Rooster",
        years: "1905, 1917, 1929, 1941, 1953, 1965, 1977, 1989, 2001, 2013, 2025",
        profile: "The Snake is the most enigmatic and wise sign of the Chinese zodiac. According to Ludovica Squirru, it symbolizes regeneration and rebirth: every period of its life involves shedding a skin to emerge transformed. Born under Yin Fire, its strength is not visible but felt: it radiates a magnetic presence and a deep intelligence that operates from the subtlest layers. It is beautiful, intuitive, and extremely selective: it prefers quality over quantity in absolutely everything. It possesses a seductive charisma that attracts without trying. Its inner world is vast and complex. The Snake observes, analyzes, and acts at the exact moment, with an accuracy that astounds. Its karma is to purify the shadow of control and distrust.",
        love: "The Snake loves with an intensity that few people can handle. It is possessive, jealous, and profoundly faithful when it gives its heart. Its relationships are all or nothing: it doesn't know how to love halfway. It needs to build a very high level of trust before opening up, which can make it seem cold or distant at first. Its sensuality is legendary and its emotional intelligence, when in balance, makes it a deeply satisfying partner. Its best bonds are with the Ox, the Rooster, and the Monkey. With the Pig, energetic tension can be irreconcilable.",
        career: "The Snake thrives in fields that require intellectual depth, intuition, and strategy: psychoanalysis, philosophy, scientific research, fine arts, spirituality, alternative medicine, finance, and high-level consulting. It is the best strategist of the zodiac when it trusts its instinct. Its advice is highly valued and people pay well for it. It struggles to work under orders from those it considers intellectually inferior. It needs autonomy and long-term projects that nourish its deep mind.",
        positives: [
            "Deep wisdom forged by constant introspection",
            "Almost supernatural intuition for reading people and situations",
            "Elegance and sophistication in every personal expression",
            "Capacity for transformation and renewal in the face of adversity",
            "Impeccable strategy and patience for the exact moment"
        ],
        negatives: [
            "Extreme distrust that can turn into paranoia",
            "Possessiveness and jealousy that suffocate its most intimate relationships",
            "Excessive secrecy that generates walls of isolation",
            "Tendency to subtly manipulate to maintain control",
            "Resentment that does not easily forgive perceived betrayals"
        ],
        karma: "The Snake comes to learn that vulnerability does not weaken: it frees. Its karma is to transform control into surrender and secrecy into loving transparency.",
        talisman: "Red carnelian or garnet, silver snake amulet, burgundy and deep black tones"
    },

    "Horse": {
        name: "Horse",
        chineseName: "Wǔ (午)",
        element: "Fire",
        polarity: "Yang",
        trine: "Third Trine with Tiger and Dog",
        years: "1906, 1918, 1930, 1942, 1954, 1966, 1978, 1990, 2002, 2014, 2026",
        profile: "The Horse is the most free and indomable spirit of the Chinese zodiac. For Ludovica Squirru, it possesses exceptional physical skills and natural leadership that always takes it to the center of the stage. Born under Yang Fire, it vibrates with an energy that can become a hurricane of joy and humor that enchants those around it. It is independent, dynamic, and its life is marked by constant action. The Horse does not understand stillness: it needs movement, horizon, and wind in its mane. Its greatest learning is to laugh at itself and not fall into the vanity of someone who knows they shine. Its inconstancy is not betrayal: it is the very nature of the being that was born running.",
        love: "The Horse loves with the same intensity with which it gallops: at full speed and without looking back. Its commitment as a partner is constant as long as its autonomy and freedom are not threatened. Marriage is one of its goals, but it needs to reach it by its own conviction, never by pressure. It is generous, passionate, and vital in its relationships. Its challenge is emotional inconstancy and the promises it makes in the heat of the gallop and cannot sustain in the calm. Its best partners are the Tiger, the Dog, and the Goat, with whom it shares vital force and complicity.",
        career: "The Horse thrives in environments where speed, leadership, and visibility are valued: elite sports, politics, media, advertising, public relations, travel and tourism, acting, and any career that implies movement and contact with the public. It is a natural salesperson and an exceptional motivator. Its Achilles' heel is constancy and managing details. It needs allies who anchor its brilliant ideas in executable plans.",
        positives: [
            "Vitality and enthusiasm that infect its entire environment",
            "Magnetic leadership and irresistible natural charisma",
            "Independence and courage to open new paths",
            "Versatility and mental agility to adapt to change",
            "Genuine generosity and sportsmanship toward life"
        ],
        negatives: [
            "Inconstancy that abandons projects before seeing them grow",
            "Involuntary selfishness that forgets others' needs",
            "Impatience that does not tolerate the slowness of processes",
            "Sincere promises in the moment that it cannot sustain",
            "Vanity that can block learning from its mistakes"
        ],
        karma: "The Horse comes to learn that real freedom is not fleeing but consciously choosing to stay. Its karma is to transform flight into commitment and the solitary gallop into a shared race.",
        talisman: "Orange quartz, silver horseshoe, fire red and bright white colors"
    },

    "Goat": {
        name: "Goat",
        chineseName: "Wèi (未)",
        element: "Earth",
        polarity: "Yin",
        trine: "Fourth Trine with Rabbit and Pig",
        years: "1907, 1919, 1931, 1943, 1955, 1967, 1979, 1991, 2003, 2015, 2027",
        profile: "The Goat is the most creative, compassionate, and sensitively spiritual sign of the Chinese zodiac. According to Ludovica Squirru, it lives its life in a process of continuous transformation and transmutation. Born under Yin Earth, its soul is deeply artistic and its heart enormously empathetic. It has the ability to create beauty from pain and to find meaning in the invisible. Its availability, good heart, and Samaritan spirit are gifts it offers naturally. It is the sign that most experiences emotional magnetism: in its best moments, it radiates a warmth that turns any space into a home. It needs to feel needed to flourish.",
        love: "The Goat lives love from the purest sensitivity and creativity. It is a tender, imaginative, and profoundly faithful partner. Its greatest emotional need is to feel secure and valued: when it doesn't feel this, it can fall into dependency or self-pity. In its best moments it is a companion that enhances the life of the person it loves with delicacy and genuine presence. Its most compatible relationships are with the Rabbit, the Pig, and the Horse. With the Ox, there can be deep clashes of character that require great maturity from both parties.",
        career: "The Goat shines in all the arts: painting, music, poetry, dance, gastronomy, design, fashion, and also in the caring professions: holistic medicine, social work, psychology, and alternative therapies. Its artistic sensitivity transforms the everyday into an aesthetic experience. It needs a nurturing environment free of extreme pressure to give its best. Its greatest work challenge is self-discipline: it scatters its talent in multiple directions and needs external structure to materialize. When it finds sponsors or mentors who support it, it is capable of creating extraordinary works.",
        positives: [
            "Artistic creativity that transforms pain into beauty",
            "Deep empathy and genuine capacity for compassion",
            "Spiritual resilience to rebuild after every fall",
            "Sensitivity that detects nuances that others do not perceive",
            "Generosity and availability for those who need help"
        ],
        negatives: [
            "Emotional dependency that can suffocate its relationships",
            "Self-pity that can become unconscious manipulation",
            "Lack of self-discipline to materialize its vast potential",
            "Pessimism and complaint when feeling overwhelmed by the world",
            "Excess sensitivity that makes it vulnerable to others' energies"
        ],
        karma: "The Goat comes to learn that its sensitivity is a strength, not a frailty. Its karma is to cultivate an inner strength that doesn't depend on others' recognition to flourish.",
        talisman: "Violet amethyst, crescent moon image, lavender and pale pink tones"
    },

    "Monkey": {
        name: "Monkey",
        chineseName: "Shēn (申)",
        element: "Metal",
        polarity: "Yang",
        trine: "First Trine with Rat and Dragon",
        years: "1908, 1920, 1932, 1944, 1956, 1968, 1980, 1992, 2004, 2016",
        profile: "The Monkey is the fastest, most restless, and radically dual intelligence of the Chinese zodiac. For Ludovica Squirru, it doesn't see problems but puzzles waiting to be solved with a twist of the wrist. Born under Yang Metal, its mind is extraordinarily agile and its capacity for adaptation almost superhuman. It is creative, irreverent, curious, and capable of learning any skill with staggering ease. The Monkey never bores: its humor is acidic but endearing, its ingenuity a source of inexhaustible unexpected solutions. Its shadow is the arrogance that underestimates the other and the lack of scruples when the end justifies the means for its brilliant mind.",
        love: "The Monkey in love is fun, sensual, and eternally young, but also profoundly difficult to catch. It needs constant intellectual stimulation in its partner: boredom is its greatest emotional repellent. It can be impulsive and competitive, which generates unnecessary friction. When it matures emotionally, it develops an unexpectedly deep loyalty. Its best emotional bonds are with the Rat, the Dragon, and the Snake. With the Tiger, tension is almost chemical and irreconcilable.",
        career: "The Monkey is the innovator par excellence. It thrives in technology, communication, advertising, entertainment, stock market, scientific research, writing, theater, and any field where creativity and mental speed are competitive advantages. It is a brilliant entrepreneur and a skilled negotiator. Its challenge is constancy: when it solves the puzzle, it loses interest. It needs to go from challenge to challenge or build a mission large enough to keep it engaged.",
        positives: [
            "Extraordinary intelligence and incomparable mental speed",
            "Healing humor that relieves tension in any situation",
            "Versatility and ability to learn any skill quickly",
            "Strategic ingenuity to solve complex problems",
            "Playful charisma that creates instant connections"
        ],
        negatives: [
            "Arrogance that underestimates the intelligence of others",
            "Lack of scruples when the end justifies the means",
            "Inconstancy and loss of interest after solving the challenge",
            "Superficiality in relationships that could be deep",
            "Tendency to use intelligence to hurt instead of heal"
        ],
        karma: "The Monkey comes to learn that the highest intelligence is that which serves and builds, not that which proves or competes. Its karma is to put its prodigious mind at the service of the heart.",
        talisman: "Metallic pyrite, Bagua symbol, silver and sapphire blue tones"
    },

    "Rooster": {
        name: "Rooster",
        chineseName: "Yǒu (酉)",
        element: "Metal",
        polarity: "Yin",
        trine: "Second Trine with Ox and Snake",
        years: "1909, 1921, 1933, 1945, 1957, 1969, 1981, 1993, 2005, 2017",
        profile: "The Rooster is the herald of the new day: the first to wake the world and the most rigorous custodian of order. For Ludovica Squirru, it possesses a great enthusiasm for life, art, fashion, and music, combined with admirable work capacity and talent. Born under Yin Metal, the Rooster is precise, correct, and profoundly honest — sometimes painfully honest. Its dignity is its shield and its aesthetic sense, a gift it prints on everything it builds. It does not tolerate disorder or mediocrity and its standards are high for itself and those around it. Its shadow is vanity and criticism that can become biting when it doesn't pass through the filter of compassion.",
        love: "The Rooster in love is a protective, dedicated, and very hard-working partner for the well-being of its home. It can live new experiences, reconnect with its feelings, and feel the desire to build a solid family. However, its perfectionism can make its partner feel they are never good enough for its standards. It needs to learn to yield in small conflicts to win the big battles of the relationship. Its best bonds are with the Ox, the Snake, and the Dragon. With the Rabbit, tension is constant.",
        career: "The Rooster is extraordinarily organized and has a talent and work capacity that others envy. It excels in administration, finance, law, fashion, architecture, surgery, high-end gastronomy, and civil service. Its attention to detail, its punctuality, and its aesthetic sense make it invaluable in management and direction positions. Public recognition comes naturally and empowers it enormously. Its greatest challenge is not to become so critical and demanding that it generates stifling work environments.",
        positives: [
            "Discipline and organization that lead to sustained success",
            "Honest and rectitude that generate respect and trust",
            "Refined aesthetic sense that prints quality on everything",
            "Courage to tell the truth even if it is uncomfortable",
            "Dedication and efficiency that turn ambitions into achievements"
        ],
        negatives: [
            "Vanity that can turn into obsession with appearance",
            "Biting criticism toward others when it loses compassion",
            "Neurotic perfectionism that paralyzes or exhausts the team",
            "Difficulty relaxing and enjoying without an agenda",
            "Pride that prevents it from asking for help or recognizing errors"
        ],
        karma: "The Rooster comes to learn that perfection is an illusion and that the sun rises beautiful without needing to prove it. Its karma is to transform demand into grace and criticism into compassion.",
        talisman: "Rose quartz, brightly colored feathers, solar gold and bright red tones"
    },

    "Dog": {
        name: "Dog",
        chineseName: "Xū (戌)",
        element: "Earth",
        polarity: "Yang",
        trine: "Third Trine with Tiger and Horse",
        years: "1910, 1922, 1934, 1946, 1958, 1970, 1982, 1994, 2006, 2018",
        profile: "The Dog is the most noble, loyal, and morally upright sign of the Chinese zodiac. According to Ludovica Squirru, it is characterized by its loyalty — which is special because it doesn't necessarily imply fidelity in the conventional sense, but a deep commitment to the beings and causes it loves. Born under Yang Earth, the Dog possesses a sharp sense of justice that makes it a fierce defender of the most vulnerable. Honest, direct, and profoundly responsible, it is the friend who appears without being called when the situation is difficult. Its shadow is pessimism and a defensive anxiety that leads it to anticipate tragedies that rarely occur.",
        love: "The Dog loves with a loyalty and deepness that are rarely found. When it chooses someone, it chooses them truly and forever. Its year holds relationships with real projection: doors open to deep alliances and authentic commitments. In love it can be overprotective and anxious, especially if it has been hurt previously. It needs to feel valued and see clear reciprocity. Its best emotional bonds are with the Tiger, the Horse, and the Rabbit. With the Dragon, ideological clashes can be irreconcilable.",
        career: "The Dog shines in all professions related to justice, protection, and service to others: law, social activism, humanitarian work, security forces, emergency medicine, education, and psychology. Its relationship with the Horse is especially stimulating in business: both are creative, supportive, and capable of starting new stages of entrepreneurship together. The team's trust is its best fuel. Its greatest professional challenge is the pessimism that can boycott its own opportunities.",
        positives: [
            "Absolute loyalty and nobility that generate lifelong bonds",
            "Radical honesty that builds genuine trust",
            "Sense of justice that defends what's right regardless of the cost",
            "Unconditional generosity with its loved ones",
            "Responsibility and reliability in everything it commits to"
        ],
        negatives: [
            "Pessimism and anxiety that anticipate non-existent tragedies",
            "Paranoid distrust after being hurt or betrayed",
            "Cynicism that can become a shield against joy",
            "Stubbornness that prevents it from changing its mind even if necessary",
            "Hyper-criticism of itself that erodes its self-esteem"
        ],
        karma: "The Dog comes to learn that the deepest protection comes from trusting in the flow of life, not from monitoring it. Its karma is to transform fear into faith and pessimism into gratitude.",
        talisman: "Black obsidian, sandalwood necklace, forest green and earth brown tones"
    },

    "Pig": {
        name: "Pig",
        chineseName: "Hài (亥)",
        element: "Water",
        polarity: "Yin",
        trine: "Fourth Trine with Rabbit and Goat",
        years: "1911, 1923, 1935, 1947, 1959, 1971, 1983, 1995, 2007, 2019",
        profile: "The Pig is the last sign of the Chinese zodiac and, for Ludovica Squirru, the symbol of the most genuine spiritual nobility and pleasure lived with awareness. Born under Yin Water, it possesses a heart of gold and a brutal honesty that sometimes puts it at a disadvantage in a world that doesn't always reward transparency. It is brave, hard-working, and profoundly generous, believing with an almost naive faith in the intrinsic goodness of human beings. Its life is usually a journey of shared abundance and banquets of the soul. Its greatest challenge is to discern between those who appreciate its generosity and those who simply consume it without giving anything in return.",
        love: "The Pig loves with its great heart open and without reservations. For it, love and friendship are intimately linked: its best relationships begin in shared laughter. It is passionate, tender, and enormously faithful when the bond is real. Year of emotional banquets: encounters on travels or celebrations will expand its sentimental world. Its best emotional partners are the Rabbit, the Goat, and the Tiger. With the Snake, energetic tension can be irreconcilable because one's distrust patterns clash with the other's unlimited openness.",
        career: "The Pig thrives in environments where its warmth, creativity, and sense of pleasure are appreciated: gastronomy, hospitality, cinema, theater, fashion, social work, education, and any field of genuine service. Its commitment to quality and its innate ethics make it an exceptional professional. Its challenge is learning to put a fair price on its talent and not to underestimate its own work. Good faith in business is its virtue and its Achilles' heel: it must learn to protect itself from those who approach for what it can give.",
        positives: [
            "Nobility of heart and genuine generosity without calculation",
            "Radical honesty that generates trust and respect",
            "Joyful vitality and ability to enjoy life fully",
            "Unexpected willpower when it has a real cause",
            "Ability to create environments of warmth and abundance"
        ],
        negatives: [
            "Naivety that exposes it to being exploited by others",
            "Excessive indulgence in pleasures that can damage its health",
            "Financial disregard that can create serious imbalances",
            "Tendency to carry others' problems as its own",
            "Blind good faith that does not distinguish true intentions"
        ],
        karma: "The Pig comes to learn that generosity without discernment is not a virtue: it is martyrdom. Its karma is to learn to receive with the same grace as it gives and protect its abundance with wisdom.",
        talisman: "Pink coral, white jade pig figure, pure white and rose gold tones"
    }
};
