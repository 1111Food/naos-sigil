import type { FrequencyData, MasterNumberData, PinnaclePositionData } from './numerology';

export const NUMEROLOGY_MANUAL_EN = {
    navLibrary: "Back to Library",
    navTitle: "The Secret Code",
    tabs: {
        frequencies: "Frequencies",
        pinnacle: "The Pinnacle"
    },
    intro: {
        title: "The Language of the Universe",
        concept: "Everything in the universe vibrates, and that vibration has a number",
        content: "Welcome to the study of frequencies. Numerology in NAOS is not a divination tool, but a lens to observe the hidden order that sustains reality. Numbers are not cold labels; they are notes in the symphony of your existence. Just as a guitar string produces a different sound depending on its tension, your soul emits a unique frequency based on your name and your date of birth.",
        reduction: {
            title: "Theosophical Reduction",
            content: "To understand this language, we use the reduction technique: adding the digits of a number until reaching a single one (from 1 to 9). For example, if you were born on the 25th, your base frequency is 2 + 5 = 7.",
            masters_note: "Exceptions called Master Numbers (11, 22, 33). These are not initially reduced. They are 'high voltage' energies that require maturity and awareness to be sustained, like a light bulb that must learn to shine with great intensity without burning out."
        }
    },
    frequencies: [
        {
            number: "1",
            archetype: "The Pioneer",
            keyword: "Beginning · Will · Identity",
            essence: "The vibration of the beginning, will, independence, and the seed that breaks the earth to seek the sun.",
            profile: "One who vibrates in the 1 carries the strength of the cosmos' first impulse. It is the number of the self in its purest and most powerful state, the being who dares to take the first step when the path does not yet exist. Their mission is to forge an authentic identity and lead by example, not by imposition. The person with this frequency possesses an iron will and a creativity that springs forth spontaneously. Their greatest learning is balancing self-confidence with openness to collaboration.",
            love: "In love, the 1 seeks an equal, someone they can admire and walk alongside without needing constant guidance. They can be dominant if they don't work on their ego. They need space and autonomy to stay in love. Their love is intense and passionate, but they sometimes fear dependency. The challenge is learning to be vulnerable without feeling it as a defeat.",
            career: "The 1 thrives in leadership, entrepreneurship, and creation roles. It is the archetype of the founder, the director, the pioneering artist, and the innovator. They need projects where they have autonomy and their own vision. They do not work well under over-controlling management. Their best environments are those where they can leave an original mark and see the direct fruit of their effort.",
            positives: ["Natural and charismatic leadership", "Constant creativity and innovation", "Bravery to start new projects", "Determination and willpower", "Confidence in their own abilities"],
            negatives: ["Tendency toward egocentrism", "Difficulty delegating or asking for help", "Impulsivity that generates errors", "Loneliness due to inability to open up", "Stubbornness toward others' new ideas"],
            lesson: "Learn to walk on my own feet without waiting for anyone's permission, and to recognize that real strength includes knowing how to ask for help.",
            mantra: "I choose my own path with determination.",
            advice: "Do not wait to be ready; the path is made by walking. Your initial impulse is your most reliable compass."
        },
        {
            number: "2",
            archetype: "The Mediator",
            keyword: "Cooperation · Sensitivity · Harmony",
            essence: "The frequency of duality, sensitivity, cooperation, and the whisper that unites conflicting parties.",
            profile: "The 2 is the consciousness that knows that nothing exists without its opposite. It is the bridge, the diplomat, the one who transforms the chaos of two antagonistic forces into an ordered dance. One who vibrates in this frequency possesses extraordinary emotional perception; they feel the mood of a room before entering it. Their deepest gift is the ability to make others feel heard and understood. Their central challenge is learning to exist without dissolving into the desires of the other.",
            love: "The 2 is the great lover of numerology. They live for deep connection. They are attentive, considerate, and remember the small details that make their partner feel special. However, their tendency toward complacency can become a trap: they give so much that they can lose their own identity. They need a partner who values them and constantly reminds them of their own worth and uniqueness.",
            career: "The 2 flourishes in collaborative environments where their emotional intelligence is valued. Excellent for roles in mediation, therapy, human resources, counseling, and strategic support. They are the power behind the throne: the loyal advisor, the brilliant assistant who makes the machinery work. They do not enjoy the limelight, but their contribution is usually indispensable.",
            positives: ["Deep empathy and sensitivity", "Exceptional diplomatic skill", "Loyalty and commitment in relationships", "Ability to listen and understand", "Intuitive and receptive intelligence"],
            negatives: ["Excessive emotional dependency", "Difficulty saying 'no' assertively", "Tendency toward indecision and doubt", "Extreme sensitivity to criticism", "Loss of identity by adapting to others"],
            lesson: "Finding the balance between giving and receiving, recognizing that my own worth does not depend on others' approval.",
            mantra: "In the union of opposites, I find my harmony.",
            advice: "Your sensitivity is your superpower, not a weakness. Learn to say 'no' so that your 'yes' is true and comes from the heart."
        },
        {
            number: "3",
            archetype: "The Communicator",
            keyword: "Expression · Joy · Creativity",
            essence: "The vibration of self-expression, solar joy, creative expansion, and the flash of communication that inspires and connects.",
            profile: "The 3 is the spark of light that illuminates any conversation. It is the artist, the storyteller, the entertainer of the soul. One who vibrates in this frequency has the gift of seeing the bright side of life and turning that vision into words, images, or songs that uplift those around them. Their creativity is explosive and instinctive. Their challenge is discipline: learning to channel that torrent of ideas into concrete projects that see the light of day.",
            love: "The 3 is a charming companion, full of humor, affection, and surprises. They fill spaces with laughter and memorable moments. The problem arises when they use humor to evade emotionally difficult conversations. They need a partner who inspires them intellectually and doesn't weigh them down with excessive seriousness. Their love is genuine but needs creative freedom to not feel caged.",
            career: "The 3 thrives in any field where expression is the medium: writing, acting, music, advertising, design, teaching, and social media. They are a natural communicator who can sell ideas with amazing ease. Their vocational challenge is to avoid superficiality and commit to a project long enough to bring it to its maximum expression.",
            positives: ["Contagious optimism and joy", "Natural gift for communication and art", "Overflowing imagination", "Genuine sociability and charisma", "Ability to inspire and motivate others"],
            negatives: ["Dispersion among multiple projects", "Emotional superficiality as a defense mechanism", "Tendency toward drama to get attention", "Difficulty finishing what they start", "Severe criticism of their own work"],
            lesson: "Express my complete truth with the heart, not just the joyful part, allowing my vulnerability to also become art.",
            mantra: "My voice is a channel of joy and truth.",
            advice: "Do not fear your own light. The world needs your smile, but it also needs your depth. Let both coexist."
        },
        {
            number: "4",
            archetype: "The Builder",
            keyword: "Order · Discipline · Foundations",
            essence: "The frequency of cosmic order, structure, constant work, and the root that sustains the tree so it can touch the sky.",
            profile: "The 4 is the backbone of reality. It is the energy that takes dreams and turns them into architectural blueprints. One who vibrates in this frequency has an innate ability to create systems, organize chaos, and build on solid bases. It is the archetype of the master craftsman: patient, meticulous, and deeply honest. Their challenge is learning that rigidity is the enemy of mastery, and that the best foundations are those that allow for movement.",
            love: "The 4 is a loyal, reliable, and dedicated companion to the core. When they love, they build: a home, a routine, a solid joint life. They are not the most emotionally expressive, but their acts are their language of love. Their challenge is learning to let go of control and trust in the natural flow of the relationship. They need a partner who appreciates stability and understands that their silent loyalty is worth more than a thousand words.",
            career: "The 4 is the specialist, the expert, the professional called upon to solve concrete problems. They excel in engineering, architecture, accounting, law, project management, craftsmanship, and any discipline that demands precision and method. Their work ethic is legendary. They can reach the top of their field if they learn to delegate and not lose the forest for the trees.",
            positives: ["Extraordinary discipline and consistency", "Fireproof reliability and honesty", "Practical sense and ability to finalize", "Ability to create lasting systems and structures", "Patience and perseverance in the face of obstacles"],
            negatives: ["Mental rigidity and resistance to change", "Tendency toward pessimism and negativity", "Excessive work as a way to avoid emotions", "Difficulty seeing creative solutions", "Paralyzing control and perfectionism"],
            lesson: "Understand that structure is the path to freedom, not its opposite, and that change does not destroy, it transforms.",
            mantra: "I build on solid foundations to be free.",
            advice: "Consistency overcomes what bliss does not reach. Do not underestimate the power of small daily steps. Your rhythm is your greatest strength."
        },
        {
            number: "5",
            archetype: "The Freedom Seeker",
            keyword: "Change · Adventure · Magnetism",
            essence: "The vibration of change, perpetual adventure, insatiable curiosity, and the wind that accepts no prisons of any kind.",
            profile: "The 5 is the freest spirit in the numerological universe. It is the energy of the explorer, the journalist, the traveler of the soul who needs to taste, touch, feel, and experience to truly know. One who vibrates in this frequency learns through direct experience and possesses a personal magnetism that attracts diverse people to their gravitational field. Their deepest challenge is learning that true freedom is not the absence of commitment, but the ability to choose deeply.",
            love: "The 5 is an intense and passionate lover in the present moment, but routine is their greatest enemy within a relationship. They need a connection that is constantly renewed, that surprises, that evolves. They are not unfaithful by nature, but they can be if they feel caged. They need a partner as passionate about life as they are, who understands that space is not distance, but the condition for love to flourish.",
            career: "The 5 was not designed for the 9 to 5 desk. They thrive in roles with variety, movement, and constant stimulus: field journalism, high-impact sales, tourism, diplomacy, acting, digital marketing, politics, and entrepreneurship. They are the best salesperson of the numerological zodiac because they genuinely believe in what they communicate. Their challenge is the consistency to see projects through to the end.",
            positives: ["Unique adaptability and versatility", "Personal magnetism and natural charm", "Learns quickly from multiple experiences", "Open-mindedness and cosmopolitanism", "Ingenuity to solve problems creatively"],
            negatives: ["Impulsivity that generates hasty decisions", "Lack of commitment and tendency to disperse", "Use of excesses as an emotional escape", "Difficulty with introspection and calm", "Flight from responsibility when the situation gets complicated"],
            lesson: "Learn to be free by being the master of my own limits, discovering that the deepest commitment is the greatest act of bravery.",
            mantra: "Spiritual freedom is my natural state.",
            advice: "Change is the only constant, yes. But the art is in knowing when to change direction and when to sink roots."
        },
        {
            number: "6",
            archetype: "The Healer",
            keyword: "Love · Responsibility · Beauty",
            essence: "The frequency of sacred responsibility, unconditional love that nurtures, family, and the nest that protects and beautifies.",
            profile: "The 6 is the heart of numerology. It is the guardian of the home, the healer of wounds, the artist of coexistence. One who vibrates in this frequency has a magnet for people who need emotional support, and an innate ability to create environments of beauty and harmony. Their life mission is deeply intertwined with service and care. Their greatest challenge is learning to set limits so as not to turn their love into a trap of sacrifice and resentment.",
            love: "The 6 was made for deep love and the construction of a shared life project. They are the most attentive, generous, and committed companion in all of numerology. However, their perfectionism can lead to subtle but constant criticism of loved ones. They need to learn that authentic love accepts imperfection. Their greatest joy is seeing those they love flourish.",
            career: "The 6 excels in any service vocation: medicine, psychology, nursing, social work, teaching, interior design, gastronomy, gardening, and therapeutic art. Their aesthetic sense is refined, and they can also shine in fashion design or decoration. They need to feel that their work has a positive impact on the lives of others; without that purpose, they lose motivation.",
            positives: ["Unconditional love and genuine generosity", "Highly developed aesthetic and artistic sense", "Unshakable responsibility and commitment", "Great capacity for healing and emotional support", "Ability to create beauty and harmony in any environment"],
            negatives: ["Perfectionism that becomes disguised control", "Tendency toward martyrdom and unnecessary sacrifice", "Difficulty establishing healthy limits", "Subtle emotional blackmail when feeling undervalued", "Intrusion in others' affairs under the mask of care"],
            lesson: "Learn to care for myself with the same tenderness with which I care for others, understanding that my well-being is the condition for being able to give.",
            mantra: "I am a channel of love and balance.",
            advice: "You cannot give what you do not have. Make sure your own cup is full before trying to nourish others."
        },
        {
            number: "7",
            archetype: "The Sage",
            keyword: "Introspection · Analysis · Mystery",
            essence: "The vibration of deep introspection, sharp analysis, mystical faith, and the sacred silence of the inner temple.",
            profile: "The 7 is the great seeker of truth. While others look at the surface, the 7 pierces layers to reach the core of reality. It is the scientist, the philosopher, the monk, and the spiritual detective. One who vibrates with this frequency needs time and silence to process life; excessive noise diminishes them. Their inner wealth is immeasurable, but their challenge is learning to share it instead of remaining alone with their internal treasurer.",
            love: "The 7 does not love in a simple or superficial way. When they open their inner world to someone, it is because they have found a being they consider worthy of that honor. They need a partner who respects their need for solitude and silence, who doesn't constantly pressure them to 'open up'. Their emotional distance is often misinterpreted. At heart, they are one of the most loyal and profound beings when they find a true connection.",
            career: "The 7 thrives in fields that require depth, analysis, and research: science, philosophy, analytical psychology, theology, astrology, non-fiction writing, specialized technology, and any discipline that explores the 'why' of things. They do not like public-facing jobs; they prefer the laboratory, the library, their own studio as a sacred space for creation.",
            positives: ["Brilliant and profound analytical mind", "Natural spiritual and philosophical connection", "Capacity for research and introspection", "Wisdom that transcends formal education", "Originality of thought that opens new paradigms"],
            negatives: ["Social isolation as a defense mechanism", "Emotional coldness that drives away loved ones", "Cynicism and mistrust as armor", "Tendency to get paralyzed in mental labyrinths", "Difficulty acting without exhaustive prior analysis"],
            lesson: "To trust in my inner wisdom and in the invisible flow of life, learning that connection with others is not a distraction but a part of the truth.",
            mantra: "In silence I hear the voice of truth.",
            advice: "Do not allow your mind to become a prison. True wisdom also includes the intelligence of the heart."
        },
        {
            number: "8",
            archetype: "The Manifestor",
            keyword: "Power · Abundancia · Justice",
            essence: "The frequency of personal power, authority earned by merit, the perfect balance between the material and spiritual world.",
            profile: "The 8 is the number of material achievement and cosmic justice. It is the archetype of the executive with a soul, of the entrepreneur who builds empires to serve a greater purpose. One who vibrates in this frequency has an innate ability to understand power systems, money, and organization. Their energy is imposing and their presence, magnetic. Its most important lesson is that true power comes when it is used for the benefit of others, not for personal accumulation.",
            love: "The 8 in love is as intense as in business: committed, protective, and materially generous. However, their tendency toward control and their work addiction can create a real distance from their partner. They need to learn that love is not a contract that can be managed, but a flow that is nurtured with presence and vulnerability. Their ideal partner is someone secure in themselves who isn't intimidated by the strength of the 8.",
            career: "The 8 is the archetype of the businessman, CEO, lawyer, judge, banker, and visionary politician. Any field where power, resources, or justice are managed is their natural territory. They can also shine as a surgeon, elite athlete, or spiritual leader. They need big goals to stay motivated; small projects bore them.",
            positives: ["Exceptional executive and leadership capacity", "Business and financial intelligence", "Determination to achieve ambitious goals", "Deep sense of justice and ethics", "Extraordinary material manifestation power"],
            negatives: ["Addiction to work and success as validation", "Tendency toward control and rigidity", "Materialism that can cloud spiritual values", "Arrogance when the ego is not integrated", "Difficulty forgiving their own and others' mistakes"],
            lesson: "Learn that true success comes when my ambition serves a purpose greater than my personal ego.",
            mantra: "I handle power with integrity and in service of the greater good.",
            advice: "True abundance is a flow, not an accumulation. Practice balance between the physical and spiritual world every day."
        },
        {
            number: "9",
            archetype: "The Humanist",
            keyword: "Compassion · Detachment · Universality",
            essence: "The vibration of universal love, non-discriminatory compassion, wise detachment, and the bridge that connects the human with the divine.",
            profile: "The 9 is the number that contains all others. It is the sage who has completed the cycle of earthly experience and returns to the source with hands full of understanding. One who vibrates in this frequency has a heart so big that they can embrace the world's pain without breaking. Their mission is not for self-benefit, but for that of humanity. Their deepest challenge is letting go: people, situations, identities that no longer serve, so they can keep flowing.",
            love: "The 9 loves in a deep and universal way, but sometimes this can become a hurdle in romantic love. Their love is so unconditional that they can lose sight of their own needs. They need to learn to choose a partner who also has a high purpose, with whom they can build something that transcends the couple itself. Their greatest challenge in love is detachment: to commit fully without clinging in fear.",
            career: "The 9 needs a vocation that serves others: holistic medicine, art with social purpose, activism, philanthropy, missionary work, transformative education, and spiritual psychology. Money is not their primary engine, although curiously abundance finds them when they serve from their highest expression. Their most important work is to be a beacon of humanity in a world that sometimes forgets what it means.",
            positives: ["Boundless and unconditional compassion and generosity", "Global vision and humanitarian awareness", "Deep understanding of the human soul", "Creativity in service of a greater purpose", "Ability to forgive and heal karmic cycles"],
            negatives: ["Martyrdom and sacrifice as identity", "Disconnection from practical reality and the body", "Difficulty receiving and asking for help", "Clinging to the past to avoid closure", "Idealism bordering on dangerous naivety"],
            lesson: "Close cycles with gratitude and deliver my talents to the service of the world, trusting that life will always provide what my soul needs.",
            mantra: "I let go with love to embrace the new.",
            advice: "You are a citizen of the cosmos. Trust in the process of detachment; you will lose nothing that truly belongs to you."
        }
    ] as FrequencyData[],
    masters: [
        {
            number: "11",
            archetype: "The Illuminator",
            keyword: "Inspiration · Channel · Consciousness",
            description: "It is the direct connection between the divine and the human. If 2 (1+1) is the mediator, 11 is the download channel of higher consciousness. These people do not receive ideas; they receive transmissions. Their mission is to be a bridge between two worlds: the visible and the invisible.",
            gift: "Prophetic-level intuition, the ability to inspire massive awakenings with a single phrase, and a sensitivity that captures what is to come long before it happens.",
            challenge: "Chronic nervousness, the anxiety of not knowing how to handle so much internal information, doubt about whether their 'voice' is real or imagined, and the deep feeling of not belonging to this world.",
            love: "The 11 needs a connection that is also spiritual. They are not satisfied with ordinary love; they seek love that awakens something in both. Their partner must understand their need for withdrawal, their hypersensitivity, and their periods of 'downloading'. When they find that connection, their love is capable of awakening entire worlds.",
            career: "The 11 can shine as a spiritual guide, visionary artist, psychologist, healer, transformative teacher, philosopher, poet, or any role where their direct transmission of consciousness can impact others. Their most important work is learning to trust their own transmissions.",
            mantra: "I am a channel of light and awakening consciousness.",
            advice: "Ground your visions in matter. Your light only serves if it is turned on in this world. Care for your nervous system as the sacred instrument it is."
        },
        {
            number: "22",
            archetype: "The Master Builder",
            keyword: "Vision · Materialization · Legacy",
            description: "It is the ability to bring the highest dreams to earth and make them a reality on a global scale. If 4 (2+2) builds a house, 22 builds a system, an institution, a movement that benefits thousands of generations. Their mission is to be the architect of a new paradigm.",
            gift: "Elite spiritual pragmatism, unlimited vision that doesn't lose contact with the earth, and the ability to organize the chaos of big ideas into lasting structures that transcend the individual.",
            challenge: "Paralyzing fear of their own power, the feeling of disproportionate burden, the tendency to operate in the low frequency of 4 (rigidity, excessive work) when pressure becomes unbearable.",
            love: "The 22 needs a partner who understands that their mission is not a hobby but a soul call. They are loyal and committed, but their mind is always designing the next big project. They need to be loved in their entirety: with their ambition, their vision, and their fears.",
            career: "The 22 can be an architect of civilizations: transformative politician, founder of international organizations, inventor of systems that change the world, teacher of teachers, or CEO of companies with global impact. Their vocation is always long-term and massive scale.",
            mantra: "I materialize high visions for the greater good.",
            advice: "Do not fear the magnitude of your dreams. You have the innate ability to organize chaos into structures of light. Start with the first brick."
        },
        {
            number: "33",
            archetype: "The Master of Love",
            keyword: "Universal Love · Healing · Conscious Sacrifice",
            description: "It is the vibration of the avatar: unconditional love in its highest embodied expression. If 6 (3+3) cares for their family, 33 cares for all life. It is not just a number; it is a cosmic responsibility. Rarely found in its full frequency before age 40.",
            gift: "Absolute compassion that regenerates from within, ability to heal through mere presence, and the gift of transmitting love in a way so pure that it transforms everything it touches.",
            challenge: "Egoic self-immolation camouflaged as virtue, the martyr complex that sabotages one's own health, and hypersensitivity to the world's pain that can result in weakness or inaction.",
            love: "The 33 in love is the most compassionate and selfless lover in all of numerology. However, their deepest challenge is this: can they receive as much as they give? They need to learn that accepting love is as sacred as giving it.",
            career: "The 33 can operate as a healer of souls on a large scale: urban shaman, spiritual artist, leader of love and peace movements, doctor, or therapist who heals from presence. Their truest 'work' is not usually in the conventional job market.",
            mantra: "I am a beacon of unconditional love and healing.",
            advice: "Your love is infinite, but your physical body is not. Care for your container with the same devotion with which you care for the world: it is the temple from which you operate."
        }
    ] as MasterNumberData[],
    pinnacle: {
        title: "The Pinnacle of Destiny: Your Sacred Geometry",
        sectionTitle1: "The Soul",
        sectionTitle2: "Architecture",
        intro: "Your code or 'numerological tree of life' is built from your birth date (A: Month, B: Day, C: Year). Through the alchemy of these three pillars —summing to ascend toward the spirit and subtracting to descend toward the shadows— NAOS reveals the 15 fundamental pillars of your Soul Architecture.",
        positions: [
            { id: 'A', title: 'Month (Karma)', level: 'IDENTIDAD', description: 'Your external action energy and the learning you come to balance in your relationship with the world.' },
            { id: 'B', title: 'Day (Personality)', level: 'IDENTIDAD', description: 'Your essence in action, the first impression you project, and how you interact with your social environment.' },
            { id: 'C', title: 'Past Lives (Year)', level: 'IDENTIDAD', description: 'The accumulated wisdom and dormant talents from previous incarnations; what you already possess innately.' },
            { id: 'D', title: 'Essence', level: 'IDENTIDAD', description: 'Your divine core. It is who you are when you are alone, without masks. Your true deep nature.' },
            { id: 'E', title: 'Divine Gift', level: 'BRILLO', description: 'A special talent that the universe grants you "for free" to support you in this incarnation.' },
            { id: 'F', title: 'Destiny', level: 'BRILLO', description: 'The direction your soul pushes you toward. It is not optional; it is your inevitable north.' },
            { id: 'G', title: 'Life Mission', level: 'BRILLO', description: 'Your central purpose. The "why" you are here and the contribution you come to deliver.' },
            { id: 'H', title: 'Realization', level: 'BRILLO', description: 'The maximum achievement of your spirit. It is the summit of your personal mountain.' },
            { id: 'I', title: 'Subconscious', level: 'MISTERIO', description: 'Hidden desires and internal drivers that move you without you realizing it.' },
            { id: 'J', title: 'Unconscious', level: 'MISTERIO', description: 'Your automatic reactions to stress and the oldest memory of your soul.' },
            { id: 'P', title: 'Immediate Shadow', level: 'SOMBRAS', description: 'Your first major block. That which seems to stop you as soon as you try to move forward.' },
            { id: 'O', title: 'Negative Unconscious', level: 'SOMBRAS', description: 'Repetitive and harmful patterns you inherit from your personal history.' },
            { id: 'Q', title: 'Inherited Lower Self', level: 'SOMBRAS', description: 'Ancestral burdens and knots in your lineage that you come to untie.' },
            { id: 'R', title: 'Conscious Lower Self', level: 'SOMBRAS', description: 'Defects you already know about yourself, but that are hard for you to transform.' },
            { id: 'S', title: 'Latent Lower Self', level: 'SOMBRAS', description: 'The "hidden enemy". The final challenge that is only revealed when you have mastered the previous ones.' }
        ] as PinnaclePositionData[]
    },
    integration: {
        title: "Integration: How to Read Your Code",
        content: "Your architecture is a dynamic interaction of these vibrations. We are not a single note; we are a chord. For example, you could have a Soul Number 5 (which loves freedom and adventure) traveling through a Life Path 4 (a road that asks for structure and order). This is not a contradiction; it is your design: your mission is to find the expansion of 5 within the stability of 4. Building a solid foundation so that your freedom can fly without falling.",
        closing: "We invite you to see your numbers with compassion. There are no failed codes, only scores waiting to be interpreted with love and curiosity. You are the director of your frequency. Vibrate with intention."
    }
};
