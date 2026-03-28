import { RelationshipType, SynastryReport, CalculatedPillars, SynastryWeights } from '../../types/synastry';
import { UserProfile, AstrologyProfile, NumerologyProfile } from '../../types';
import { REL_WEIGHTS } from '../../config/relWeights';
import { NAWALES } from '../../utils/mayaCalculator';

export class SynastryEngine {
    public static calculate(profileA: UserProfile, pillarsB: CalculatedPillars, type: RelationshipType, nameA?: string, nameB?: string, lang: string = 'es'): SynastryReport {
        const weights = REL_WEIGHTS[type] || REL_WEIGHTS[RelationshipType.ROMANTIC];
        const firstNameA = (nameA || (profileA as any).full_name || profileA.name || 'Arquitecto').split(' ')[0];
        const firstNameB = (nameB || 'Vínculo').split(' ')[0];

        const pillarScores = {
            western: this.calculateAstrologyScore(profileA.astrology!, pillarsB.astrology, weights),
            numerology: this.calculateNumerologyScore(profileA.numerology!, pillarsB.numerology, weights),
            mayan: this.calculateMayanScore(this.getMayaA(profileA), pillarsB.mayan),
            chinese: this.calculateChineseScore(this.getChineseA(profileA), pillarsB.chinese)
        };
        const { indices, explanations, labels } = this.generatePremiumIndices(profileA, pillarsB, pillarScores, weights, type, firstNameA, firstNameB, lang);
        
        const { coreScore, level } = this.calculateUnifiedCompatibility(pillarScores, type, lang);
        const dynamicVector = this.calculateDynamicVector(profileA.astrology!, pillarsB.astrology, lang);
        const structuralRisk = this.calculateStructuralRisk(coreScore, dynamicVector, pillarScores.mayan, lang);
        const { actionPlan } = this.generateActionPlan(structuralRisk, dynamicVector, lang);

        return {
            score: coreScore,
            levelLabel: level,
            indices,
            explanations,
            labels,
            dynamicVector,
            structuralRisk,
            actionPlan,
            A_StrongCompatibilities: this.extractStrengths(indices, type, firstNameA, firstNameB, lang),
            B_PotentialTensions: this.extractTensions(indices, pillarScores, firstNameA, firstNameB, lang),
            C_GrowthAreas: this.extractGrowth(indices, firstNameA, firstNameB, lang),
            pillarBreakdown: pillarScores
        };
    }
    private static calculateAstrologyScore(chartA: AstrologyProfile, chartB: AstrologyProfile, weights: SynastryWeights): number {
        let score = 0;
        const elementCompatibility = this.checkElementCompatibility(chartA.elements, chartB.elements);
        score += elementCompatibility * 30;
        let aspectPoints = 0, totalWeight = 0;
        Object.entries(weights.celestialBodies).forEach(([body, w]) => {
            const degA = (chartA as any)[body]?.absDegree, degB = (chartB as any)[body]?.absDegree;
            if (degA !== undefined && degB !== undefined) { aspectPoints += this.calculateAspectScore(degA, degB) * w; totalWeight += w; }
        });
        if (totalWeight > 0) score += (aspectPoints / totalWeight) * 70;
        return Math.min(Math.round(score), 100);
    }
    private static calculateNumerologyScore(numA: NumerologyProfile, numB: NumerologyProfile, weights: SynastryWeights): number {
        let matched = 0, possible = 0;
        Object.entries(weights.numerologySlots).forEach(([slot, w]) => {
            const valA = (numA as any)[slot + 'Number'] || (numA as any)[slot], valB = (numB as any)[slot + 'Number'] || (numB as any)[slot];
            if (valA && valB) { possible += w; if (valA === valB) matched += w; else if ((valA + valB) % 9 === 0) matched += w * 0.6; }
        });
        return possible > 0 ? Math.round((matched / possible) * 100) : 50;
    }
    private static calculateMayanScore(mayaA: any, mayaB: any): number {
        if (mayaA.nawal === mayaB.nawal) return 100;
        const idxA = NAWALES.findIndex((n: any) => n.name === mayaA.nawal), idxB = NAWALES.findIndex((n: any) => n.name === mayaB.nawal);
        if (idxA === -1 || idxB === -1) return 50;
        const dist = Math.abs(idxA - idxB);
        if (dist === 1 || dist === 19) return 90;
        if (dist === 5 || dist === 15) return 85;
        if (dist === 10) return 40;
        return 60;
    }
    private static calculateChineseScore(chinA: any, chinB: any): number {
        const trinos = [['Rata', 'Dragón', 'Mono'], ['Buey', 'Serpiente', 'Gallo'], ['Tigre', 'Caballo', 'Perro'], ['Conejo', 'Cabra', 'Cerdo'], ['Rat', 'Dragon', 'Monkey'], ['Ox', 'Snake', 'Rooster'], ['Tiger', 'Horse', 'Dog'], ['Rabbit', 'Goat', 'Pig']];
        if (trinos.some(t => t.includes(chinA.animal) && t.includes(chinB.animal))) return 100;
        const oposiciones: any = { 
            'Rata': 'Caballo', 'Buey': 'Cabra', 'Tigre': 'Mono', 'Conejo': 'Gallo', 'Dragón': 'Perro', 'Serpiente': 'Cerdo',
            'Rat': 'Horse', 'Ox': 'Goat', 'Tiger': 'Monkey', 'Rabbit': 'Rooster', 'Dragon': 'Dog', 'Snake': 'Pig'
        };
        if (oposiciones[chinA.animal] === chinB.animal || oposiciones[chinB.animal] === chinA.animal) return 30;
        return 65;
    }
    private static generatePremiumIndices(profileA: UserProfile, pillarsB: CalculatedPillars, pillarScores: any, weights: SynastryWeights, type: RelationshipType, nameA: string, nameB: string, lang: string = 'es'): any {
        const isEn = lang === 'en';
        const astroA = profileA.astrology!, astroB = pillarsB.astrology;
        const numA = profileA.numerology!, numB = pillarsB.numerology;
        const mayaA = this.getMayaA(profileA), mayaB = pillarsB.mayan;
        const chinA = this.getChineseA(profileA), chinB = pillarsB.chinese;

        const getAspect = (bodyA: string, bodyB: string) => this.calculateAspectScore((astroA as any)[bodyA]?.absDegree ?? (bodyA === 'rising' ? astroA.rising?.absDegree : 0), (astroB as any)[bodyB]?.absDegree ?? (bodyB === 'rising' ? astroB.rising?.absDegree : 0)) * 100;

        let sexual_erotic, intellectual_mercurial, emotional_lunar, karmic_saturnian, spiritual_neptunian, action_martial;
        let exp_sexual, exp_intellectual, exp_emotional, exp_karmic, exp_spiritual, exp_action;
        let lbl_sexual, lbl_intellectual, lbl_emotional, lbl_karmic, lbl_spiritual, lbl_action;

        const isBusiness = type === RelationshipType.BUSINESS;
        const isParental = type === RelationshipType.PARENTAL;
        const isFraternal = type === RelationshipType.FRATERNAL;
        const isAmistad = type === RelationshipType.AMISTAD;
        const isRomantic = !isBusiness && !isParental && !isFraternal && !isAmistad;

        // 1. sexual_erotic -> Base Synergy (changes by type)
        if (isRomantic) {
            lbl_sexual = isEn ? "Erotic Magnetism" : "Magnetismo Erotizado";
            const marsVenus = Math.round((getAspect('mars', 'venus') + getAspect('venus', 'mars')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((marsVenus * 0.7) + (elementAffinity * 0.3));
            exp_sexual = isEn 
                ? `Magnetism arises by alchemizing the voltage between ${nameA}'s Mars and ${nameB}'s Venus (${marsVenus}%). Modulated by the thermal affinity of their base natures (Elements: ${elementAffinity}%).`
                : `El Magnetismo surge al alquimizar el voltaje entre el Marte de ${nameA} y el Venus de ${nameB} (${marsVenus}%). Modulado por la afinidad térmica de sus naturalezas base (Elementos: ${elementAffinity}%).`;
        } else if (isBusiness) {
            lbl_sexual = isEn ? "Creative Synergy" : "Sinergia Creadora";
            const marsJup = Math.round((getAspect('mars', 'jupiter') + getAspect('jupiter', 'mars')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((marsJup * 0.7) + (elementAffinity * 0.3));
            exp_sexual = isEn
                ? `Creative Synergy evaluates the expansive drive (Jupiter) versus the execution capacity (Mars) between ${nameA} and ${nameB} (${marsJup}%), dictating their speed when materializing projects (Elements: ${elementAffinity}%).`
                : `La Sinergia Creadora evalúa el empuje expansivo (Júpiter) frente a la capacidad de ejecución (Marte) entre ${nameA} y ${nameB} (${marsJup}%), dictando su velocidad al materializar proyectos (Elementos: ${elementAffinity}%).`;
        } else if (isParental) {
            lbl_sexual = isEn ? "Containment and Nutrition" : "Contención y Nutrición";
            const moonJup = Math.round((getAspect('moon', 'jupiter') + getAspect('jupiter', 'moon')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((moonJup * 0.7) + (elementAffinity * 0.3));
            exp_sexual = isEn
                ? `Containment evaluates the protective flow between ${nameA}'s Moon and ${nameB}'s protective mantle (${moonJup}%), a fundamental base for secure development within the family system (Elements: ${elementAffinity}%).`
                : `La Contención evalúa el flujo protector entre la Luna de ${nameA} y el manto protector de ${nameB} (${moonJup}%), base fundamental para el desarrollo seguro dentro del sistema familiar (Elementos: ${elementAffinity}%).`;
        } else if (isAmistad) {
            lbl_sexual = isEn ? "Elective Affinity" : "Afinidad Electiva";
            const mercJup = Math.round((getAspect('mercury', 'jupiter') + getAspect('jupiter', 'mercury')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((mercJup * 0.7) + (elementAffinity * 0.3));
            exp_sexual = isEn
                ? `Elective Affinity measures the capacity to expand intellectual and social horizons (Jupiter) through fluid communication (Mercury) between ${nameA} and ${nameB} (${mercJup}%) (Elements: ${elementAffinity}%).`
                : `La Afinidad Electiva mide la capacidad de expandir horizontes intelectuales y sociales (Júpiter) mediante la comunicación fluida (Mercurio) entre ${nameA} y ${nameB} (${mercJup}%) (Elementos: ${elementAffinity}%).`;
        } else {
            lbl_sexual = isEn ? "Playful Friction" : "Fricción Lúdica";
            const uranusMerc = Math.round((getAspect('uranus', 'mercury') + getAspect('mercury', 'uranus')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((uranusMerc * 0.7) + (elementAffinity * 0.3));
            exp_sexual = isEn
                ? `Playful Friction reflects the amazing chemical capacity between ${nameA}'s intellect and ${nameB}'s spontaneity (${uranusMerc}%) to break the ice and stimulate fun (Elements: ${elementAffinity}%).`
                : `La Fricción Lúdica refleja la asombrosa capacidad química entre el intelecto de ${nameA} y la espontaneidad de ${nameB} (${uranusMerc}%) para romper el hielo y estimular la diversión (Elementos: ${elementAffinity}%).`;
        }

        // 2. intellectual_mercurial
        if (isBusiness) {
            lbl_intellectual = isEn ? "Strategic Vision" : "Visión Estratégica";
            const mercSat = Math.round((getAspect('mercury', 'saturn') + getAspect('saturn', 'mercury')) / 2);
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercSat * 0.5) + (numScore * 0.5));
            exp_intellectual = isEn
                ? `Strategic Vision reveals if the mental structure combines execution (Saturn) with tactical agility (Mercury) (${mercSat}%), optimizing the Mystic Path for both (Numerology: ${numScore}%).`
                : `La Visión Estratégica revela si la estructura mental combina la ejecución (Saturno) con agilidad táctica (Mercurio) (${mercSat}%), optimizando el Sendero Místico de ambos (Numerología: ${numScore}%).`;
        } else if (isParental) {
            lbl_intellectual = isEn ? "Guidance and Transmission" : "Guía y Transmisión";
            const mercJup = Math.round((getAspect('mercury', 'jupiter') + getAspect('jupiter', 'mercury')) / 2);
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercJup * 0.5) + (numScore * 0.5));
            exp_intellectual = isEn
                ? `Guidance evaluates the capacity to transfer wisdom (Jupiter) through dialogue (Mercury) between ${nameA} and ${nameB} (${mercJup}%), aligning their life purposes (Numerology: ${numScore}%).`
                : `La Guía evalúa la capacidad de transferir sabiduría (Júpiter) mediante el diálogo (Mercurio) entre ${nameA} y ${nameB} (${mercJup}%), alineando sus propósitos de vida (Numerología: ${numScore}%).`;
        } else if (isAmistad) {
            lbl_intellectual = isEn ? "Harmony of Ideas" : "Sintonía de Ideas";
            const mercMerc = getAspect('mercury', 'mercury');
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercMerc * 0.5) + (numScore * 0.5));
            exp_intellectual = isEn
                ? `Harmony of Ideas arises from the direct connection between ${nameA}'s and ${nameB}'s Mercuries (${mercMerc}%), facilitating a mutual understanding that transcends words (Numerology: ${numScore}%).`
                : `La Sintonía de Ideas nace de la conexión directa entre los Mercurios de ${nameA} y ${nameB} (${mercMerc}%), facilitando un entendimiento mutuo que trasciende las palabras (Numerología: ${numScore}%).`;
        } else {
            lbl_intellectual = isEn ? "Mental Strategy" : "Estrategia Mental";
            const mercMerc = getAspect('mercury', 'mercury');
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercMerc * 0.5) + (numScore * 0.5));
            exp_intellectual = isEn
                ? `Mental Strategy arises from the geometric interconnection between the analytical Mercury of ${nameA} and ${nameB} (${mercMerc}%), fused with the vibration of their Life Paths (Numerology: ${numScore}%).`
                : `La Estrategia Mental nace de la interconexión geométrica entre el Mercurio analítico de ${nameA} y el de ${nameB} (${mercMerc}%), fusionada con la vibración de sus Senderos de Vida (Numerología: ${numScore}%).`;
        }

        // 3. emotional_lunar
        if (isBusiness) {
            lbl_emotional = isEn ? "Operational Trust" : "Confianza Operativa";
            const sunSat = Math.round((getAspect('sun', 'saturn') + getAspect('saturn', 'sun')) / 2);
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((sunSat * 0.6) + (mayanScore * 0.4));
            exp_emotional = isEn
                ? `Operational Trust evaluates the solidity of agreements over time by crossing mutual Sun and Saturn (${sunSat}%), sustained by the compatibility of their Mayan signatures (${mayaA.nawal} and ${mayaB.nawal}) (${mayanScore}%).`
                : `La Confianza Operativa evalúa la solidez de los acuerdos en el tiempo cruzando el Sol y Saturno mutuo (${sunSat}%), sostenida por la compatibilidad de sus firmas Maya (${mayaA.nawal} y ${mayaB.nawal}) (${mayanScore}%).`;
        } else if (isParental) {
            lbl_emotional = isEn ? "Blood Bond" : "Vínculo de Sangre";
            const moonMoon = getAspect('moon', 'moon');
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((moonMoon * 0.6) + (mayanScore * 0.4));
            exp_emotional = isEn
                ? `Blood Bond measures the deep subconscious synchronization between ${nameA}'s and ${nameB}'s Moons (${moonMoon}%), validated by their nawal archetypes in the Tzolkin (${mayanScore}%).`
                : `El Vínculo de Sangre mide la sincronización subconsciente profunda entre las Lunas de ${nameA} y ${nameB} (${moonMoon}%), validado por sus arquetipos nahuales en el Tzolkin (${mayanScore}%).`;
        } else if (isAmistad) {
            lbl_emotional = isEn ? "Fraternal Resonance" : "Resonancia Fraterna";
            const moonVen = Math.round((getAspect('moon', 'venus') + getAspect('venus', 'moon')) / 2);
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((moonVen * 0.6) + (mayanScore * 0.4));
            exp_emotional = isEn
                ? `Fraternal Resonance evaluates comfort and selfless affection (Moon-Venus: ${moonVen}%), validated by the harmony of their Mayan seals (${mayanScore}%).`
                : `La Resonancia Fraterna evalúa la comodidad y el afecto desinteresado (Luna-Venus: ${moonVen}%), validado por la armonía de sus sellos Mayas (${mayanScore}%).`;
        } else {
            lbl_emotional = isEn ? "Emotional Gravity" : "Gravedad Emocional";
            const lunarMatch = Math.round((getAspect('moon', 'moon') + getAspect('moon', 'sun')) / 2);
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((lunarMatch * 0.6) + (mayanScore * 0.4));
            exp_emotional = isEn
                ? `Gravity is synthesized by crossing the Sun-Moon radiance of ${nameA} and ${nameB} (${lunarMatch}%), intertwined with the cosmic destiny between their nawals (${mayaA.nawal} and ${mayaB.nawal}) (${mayanScore}%).`
                : `La Gravedad se sintetiza al cruzar el resplandor Sol-Luna de ${nameA} y ${nameB} (${lunarMatch}%), entrelazada con el destino cósmico entre sus nahuales (${mayaA.nawal} y ${mayaB.nawal}) (${mayanScore}%).`;
        }

        // 4. karmic_saturnian
        if (isEn) {
            lbl_karmic = isBusiness ? "Risk Architecture" : isParental ? "Structural Legacy" : "Karmic Friction";
        } else {
            lbl_karmic = isBusiness ? "Arquitectura de Riesgos" : isParental ? "Legado Estructural" : "Fricción Kármica";
        }
        const saturnMatch = Math.round((getAspect('saturn', 'sun') + getAspect('saturn', 'moon')) / 2) || 50;
        const chinScore = pillarScores.chinese;
        karmic_saturnian = Math.round((saturnMatch * 0.5) + (chinScore * 0.5));
        if (isEn) {
            exp_karmic = isBusiness ?
                `Risk Architecture defines how the structure handles restriction (Saturn: ${saturnMatch}%), influenced by oriental compatibility (${chinA.animal}-${chinB.animal}: ${chinScore}%).` :
                isParental ?
                    `Structural Legacy measures discipline and generational lessons (Saturn: ${saturnMatch}%), under oriental influence (${chinA.animal}-${chinB.animal}: ${chinScore}%).` :
                    `Karmic Friction calculates the weight of reciprocal restriction (Saturn: ${saturnMatch}%), conditioned by the oriental dance (${chinA.animal} vs ${chinB.animal}) (${chinScore}%).`;
        } else {
            exp_karmic = isBusiness ?
                `La Arquitectura de Riesgos define cómo la estructura maneja la restricción (Saturno: ${saturnMatch}%), influenciada por la compatibilidad oriental (${chinA.animal}-${chinB.animal}: ${chinScore}%).` :
                isParental ?
                    `El Legado Estructural mide la disciplina y las lecciones generacionales (Saturno: ${saturnMatch}%), bajo la influencia oriental (${chinA.animal}-${chinB.animal}: ${chinScore}%).` :
                    `La Fricción Kármica calcula el peso de la restricción recíproca (Saturno: ${saturnMatch}%), condicionada por la danza oriental (${chinA.animal} frente a ${chinB.animal}) (${chinScore}%).`;
        }

        // 5. spiritual_neptunian
        if (isEn) {
            lbl_spiritual = isBusiness ? "Disruptive Adaptability" : isParental ? "Ancestral Connection" : "Psychic Integration";
        } else {
            lbl_spiritual = isBusiness ? "Adaptabilidad Disruptiva" : isParental ? "Conexión Ancestral" : "Integración Psíquica";
        }
        const nepMatch = Math.round((getAspect('neptune', 'moon') + getAspect('uranus', 'mercury')) / 2) || 50;
        const masterBonus = (([11, 22, 33].includes(numA.lifePathNumber || 0) || [11, 22, 33].includes(numB.lifePathNumber || 0)) ? 20 : 0);
        spiritual_neptunian = Math.min(Math.round(nepMatch + masterBonus), 100);
        if (isEn) {
            exp_spiritual = isBusiness ?
                `Disruptive Adaptability indicates the capacity to innovate in the face of the unpredictable (Uranus-Neptune: ${nepMatch}%), boosted by numerical vibrations (+${masterBonus}%).` :
                isParental ?
                    `Ancestral Connection explores invisible threads and spiritual transgenerational purpose (Neptune: ${nepMatch}%), boosted by numerical vibrations (+${masterBonus}%).` :
                    `Integration quantifies access to transpersonal spheres by crossing Uranus and Neptune (${nepMatch}%), catalyzed by master resonances (+${masterBonus}%).`;
        } else {
            exp_spiritual = isBusiness ?
                `La Adaptabilidad Disruptiva señala la capacidad para innovar frente a lo impredecible (Urano-Neptuno: ${nepMatch}%), potenciada por vibraciones numéricas (+${masterBonus}%).` :
                isParental ?
                    `La Conexión Ancestral explora los hilos invisibles y el propósito espiritual transgeneracional (Neptuno: ${nepMatch}%), potenciado por vibraciones numéricas (+${masterBonus}%).` :
                    `La Integración cuantifica el acceso a esferas transpersonales cruzando Urano y Neptuno (${nepMatch}%), catalizado por resonancias maestras (+${masterBonus}%).`;
        }

        // 6. action_martial
        if (isEn) {
            lbl_action = isBusiness ? "Executive Pulse" : isParental ? "Authority and Respect" : isAmistad ? "Joint Adventure" : "Power Dynamics";
        } else {
            lbl_action = isBusiness ? "Pulso Ejecutivo" : isParental ? "Autoridad y Respeto" : isAmistad ? "Aventura Conjunta" : "Dinámica de Poder";
        }
        const martialPower = Math.round((getAspect('mars', 'pluto') + getAspect('sun', 'mars') + getAspect('pluto', 'mars')) / 3) || 50;
        action_martial = Math.round((martialPower + sexual_erotic) / 2);
        if (isEn) {
            exp_action = isBusiness ?
                `Executive Pulse maps the capacity for joint drive by evaluating Pluto-Mars (${martialPower}%) (Energy: ${sexual_erotic}%).` :
                isParental ?
                    `Authority and Respect defines the balance of limits and drive-will (${martialPower}%), dictating the family hierarchy (Energy: ${sexual_erotic}%).` :
                    isAmistad ?
                        `Joint Adventure measures the drive to undertake new actions (${martialPower}%), balancing initiative (Energy: ${sexual_erotic}%).` :
                        `Power Dynamics maps the Pluto-Mars dominance vectors (${martialPower}%), dictating who contains the structure (Energy: ${sexual_erotic}%).`;
        } else {
            exp_action = isBusiness ?
                `El Pulso Ejecutivo mapea la capacidad de empuje conjunto evalúando Plutón-Marte (${martialPower}%) (Energía: ${sexual_erotic}%).` :
                isParental ?
                    `La Autoridad y Respeto define el equilibrio de límites y voluntad de empuje (${martialPower}%), dictando la jerarquía familiar (Energía: ${sexual_erotic}%).` :
                    isAmistad ?
                        `La Aventura Conjunta mide el impulso para emprender acciones nuevas (${martialPower}%), equilibrando la iniciativa (Energía: ${sexual_erotic}%).` :
                        `La Dinámica de Poder mapea los vectores de dominación Plutón-Marte (${martialPower}%), dictando quién contiene la estructura (Energía: ${sexual_erotic}%).`;
        }

        return {
            indices: {
                sexual_erotic,
                intellectual_mercurial,
                emotional_lunar,
                karmic_saturnian,
                spiritual_neptunian,
                action_martial
            },
            explanations: {
                sexual_erotic: exp_sexual,
                intellectual_mercurial: exp_intellectual,
                emotional_lunar: exp_emotional,
                karmic_saturnian: exp_karmic,
                spiritual_neptunian: exp_spiritual,
                action_martial: exp_action
            },
            labels: {
                sexual_erotic: lbl_sexual,
                intellectual_mercurial: lbl_intellectual,
                emotional_lunar: lbl_emotional,
                karmic_saturnian: lbl_karmic,
                spiritual_neptunian: lbl_spiritual,
                action_martial: lbl_action
            }
        };
    }
    private static checkElementCompatibility(elA: any, elB: any): number {
        const getMax = (el: any) => { const map: any = { fire: el.fire, earth: el.earth, air: el.air, water: el.water }; return Object.entries(map).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0]; };
        const maxA = getMax(elA), maxB = getMax(elB);
        const compatible: any = { fire: ['fire', 'air'], air: ['fire', 'air'], earth: ['earth', 'water'], water: ['earth', 'water'] };
        return maxA === maxB ? 1.0 : compatible[maxA]?.includes(maxB) ? 0.85 : 0.4;
    }
    private static calculateAspectScore(degA: number, degB: number): number {
        const diff = Math.abs(degA - degB) % 360, dist = diff > 180 ? 360 - diff : diff;
        if (dist <= 8) return 1.0;
        if (Math.abs(dist - 120) <= 8) return 1.0;
        if (Math.abs(dist - 60) <= 6) return 0.85;
        if (Math.abs(dist - 90) <= 8) return 0.3;
        if (Math.abs(dist - 180) <= 8) return 0.4;
        return 0.15;
    }
    private static getMayaA(p: UserProfile) { return { nawal: p.mayan?.kicheName || p.nawal_maya || 'Imox', tone: p.mayan?.tone || p.nawal_tono || 1 }; }
    private static getChineseA(p: UserProfile) { return { animal: p.chinese_animal || 'Rata', element: p.chinese_element || 'Madera' }; }
    private static extractStrengths(indices: any, type: RelationshipType, nameA: string, nameB: string, lang: string = 'es'): any[] {
        const isEn = lang === 'en';
        const s = [];
        if (indices.emotional_lunar > 75) s.push({ key: 'RES_LUNAR', label: isEn ? `Deep lunar resonance between ${nameA} and ${nameB}` : `Resonancia lunar profunda entre ${nameA} y ${nameB}` });
        if (indices.intellectual_mercurial > 75) s.push({ key: 'FLUJO_MERCURIAL', label: isEn ? `Fast assimilation mercurial flow` : `Flujo mercurial de asimilación rápida` });
        if (indices.sexual_erotic > 80) s.push({ key: 'ATRACCION_TERMO', label: isEn ? `High thermodynamic attraction` : `Alta atracción termodinámica` });
        return s.length > 0 ? s : [{ key: 'ESTABILIDAD_BASE', label: isEn ? "Base stability and terrestrial containment" : "Estabilidad base y contención terrestre" }];
    }
    private static extractTensions(indices: any, scores: any, nameA: string, nameB: string, lang: string = 'es'): any[] {
        const isEn = lang === 'en';
        const t = [];
        if (indices.karmic_saturnian > 70) t.push({ key: 'CHOQUE_CARMICO', label: isEn ? `Karmic clash on the Saturnian axis` : `Choque cármico en el eje Saturnino` });
        if (scores.mayan < 50) t.push({ key: 'FRIC_MAYA', label: isEn ? `Evolutionary friction in Mayan cross` : `Fricción evolutiva en cruz maya` });
        if (scores.western < 40) t.push({ key: 'DIS_EL_BASE', label: isEn ? `Dissonance of base astrological elements` : `Disonancia de elementos astrológicos base` });
        return t.length > 0 ? t : [{ key: 'SINC_SUAVE', label: isEn ? "Temporal smooth synchronization" : "Sincronización suave temporal" }];
    }
    private static extractGrowth(indices: any, nameA: string, nameB: string, lang: string = 'es'): any[] {
        const isEn = lang === 'en';
        return [{ key: 'CALIB_RITMOS', label: isEn ? `Rhythm calibration between ${nameA}'s drive and ${nameB}'s resistance` : `Calibración de ritmos entre el empuje de ${nameA} y la resistencia de ${nameB}` }];
    }

    // Prompt 18: Motor de Compatibilidad Unificada (CoreScore)
    public static calculateUnifiedCompatibility(pillarScores: any, type: RelationshipType, lang: string = 'es') {
        const isEn = lang === 'en';
        let weights = { western: 0.25, numerology: 0.25, mayan: 0.25, chinese: 0.25 };

        if (type === RelationshipType.ROMANTIC) {
            weights = { western: 0.40, mayan: 0.30, numerology: 0.15, chinese: 0.15 };
        } else if (type === RelationshipType.BUSINESS) {
            weights = { western: 0.25, numerology: 0.25, mayan: 0.25, chinese: 0.25 };
        } else {
            // Grupal o Amistad
            weights = { mayan: 0.35, chinese: 0.25, western: 0.20, numerology: 0.20 };
        }

        const coreScore = Math.round(
            (pillarScores.western * weights.western) +
            (pillarScores.numerology * weights.numerology) +
            (pillarScores.mayan * weights.mayan) +
            (pillarScores.chinese * weights.chinese)
        );

        let level = isEn ? "HIGH FRICTION" : "ALTA FRICCIÓN";
        if (coreScore >= 80) level = isEn ? "HIGH COMPATIBILITY" : "ALTA COMPATIBILIDAD";
        else if (coreScore >= 60) level = isEn ? "FUNCTIONAL COMPATIBILITY" : "COMPATIBILIDAD FUNCIONAL";
        else if (coreScore >= 40) level = isEn ? "UNSTABLE COMPATIBILITY" : "COMPATIBILIDAD INESTABLE";

        return { coreScore, level };
    }

    // Prompt 19: Vector de Dinámica de Relación
    public static calculateDynamicVector(astroA: any, astroB: any, lang: string = 'es') {
        const isEn = lang === 'en';
        // Marte vs Marte - Dominance
        const aspectMartial = this.calculateAspectScore(astroA.mars?.absDegree ?? 0, astroB.mars?.absDegree ?? 0);
        let dominanceLevel = isEn ? "MEDIUM" : "MEDIO";
        if (aspectMartial >= 0.85) dominanceLevel = isEn ? "HIGH" : "ALTO";
        if (aspectMartial <= 0.4 && aspectMartial > 0.15) dominanceLevel = isEn ? "LOW" : "BAJO";

        // Mercurio vs Mercurio - Comunicación
        const aspectMerc = this.calculateAspectScore(astroA.mercury?.absDegree ?? 0, astroB.mercury?.absDegree ?? 0);
        let communicationStyle = isEn ? "MIXED" : "MIXTA";
        if (aspectMerc >= 0.85) communicationStyle = isEn ? "FLUID" : "FLUIDA";
        if (aspectMerc <= 0.4) communicationStyle = isEn ? "DIFFICULT" : "DIFICIL";

        // Luna vs Luna - Estabilidad
        const aspectMoon = this.calculateAspectScore(astroA.moon?.absDegree ?? 0, astroB.moon?.absDegree ?? 0);
        let emotionalStability = isEn ? "VARIABLE" : "VARIABLE";
        if (aspectMoon >= 0.85) emotionalStability = isEn ? "STABLE" : "ESTABLE";
        if (aspectMoon <= 0.4) emotionalStability = isEn ? "VOLATILE" : "VOLÁTIL";

        // Saturno vs Saturno - Conflicto
        let conflictPattern = isEn ? "CYCLIC" : "CICLICO";
        if (aspectMartial <= 0.4 || aspectMoon <= 0.4) conflictPattern = isEn ? "DESTRUCTIVE" : "DESTRUCTIVO";
        else if (aspectMoon >= 0.85) conflictPattern = isEn ? "CONSTRUCTIVE" : "CONSTRUCTIVO";

        return { dominanceLevel, communicationStyle, emotionalStability, conflictPattern };
    }

    // Prompt 20: Riesgo Estructural
    public static calculateStructuralRisk(coreScore: number, dynamicVector: any, mayanScore: number, lang: string = 'es') {
        const isEn = lang === 'en';
        let riskLevel = isEn ? "LOW" : "BAJO";
        const riskType: string[] = [];
        let warning = isEn ? "Harmonic relational flow." : "Flujo relacional armónico.";

        if (coreScore < 50) {
            riskLevel = isEn ? "HIGH" : "ALTO";
            riskType.push(isEn ? "structural" : "estructural");
            warning = isEn ? "High base structural incompatibility." : "Incompatibilidad de base estructural alta.";
        }

        if (dynamicVector.communicationStyle === (isEn ? "DIFFICULT" : "DIFICIL")) {
            if (riskLevel !== (isEn ? "HIGH" : "ALTO")) riskLevel = isEn ? "MEDIUM" : "MEDIO";
            riskType.push(isEn ? "communication" : "comunicación");
            warning = isEn ? "Risk of misunderstanding and intellectual friction." : "Riesgo de malentendidos y fricción intelectual.";
        }

        if (dynamicVector.emotionalStability === (isEn ? "VOLATILE" : "VOLÁTIL") || mayanScore <= 40) {
            if (riskLevel !== (isEn ? "HIGH" : "ALTO")) riskLevel = isEn ? "MEDIUM" : "MEDIO";
            riskType.push(isEn ? "emotional" : "emocional");
            warning = isEn ? "High subconscious volatility. Avoid dependencies." : "Alta volatilidad subconsciente. Evitar dependencias.";
        }

        return { riskLevel, riskType, warning };
    }

    // Prompt 21: Recomendación Práctica (Action Plan)
    public static generateActionPlan(risk: any, dynamic: any, lang: string = 'es') {
        const isEn = lang === 'en';
        let actionPlan = isEn ? "Foster direct collaboration in synergy areas." : "Fomentar la colaboración directa en áreas de sinergia.";

        if (risk.riskLevel === (isEn ? "HIGH" : "ALTO")) {
            actionPlan = isEn ? "Define clear boundaries and separate operational roles to avoid speed clash." : "Definir límites claros y separar roles operativos para evitar choque de velocidades.";
        } else if (dynamic.communicationStyle === (isEn ? "DIFFICULT" : "DIFICIL")) {
            actionPlan = isEn ? "Establish written communication protocols and mutual verification pauses." : "Establecer protocolos de comunicación escrita y pausas de verificación mutua.";
        } else if (dynamic.dominanceLevel === (isEn ? "HIGH" : "ALTO") && risk.riskType.includes(isEn ? "structural" : "estructural")) {
            actionPlan = isEn ? "Avoid critical joint decisions without a mediator or fixed rule framework." : "Evitar decisiones conjuntas críticas sin un mediador o marco de reglas fijas.";
        }

        return { actionPlan };
    }
}
