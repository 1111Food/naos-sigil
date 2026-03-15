import { RelationshipType, SynastryReport, CalculatedPillars, SynastryWeights } from '../../types/synastry';
import { UserProfile, AstrologyProfile, NumerologyProfile } from '../../types';
import { REL_WEIGHTS } from '../../config/relWeights';
import { NAWALES } from '../../utils/mayaCalculator';

export class SynastryEngine {
    public static calculate(profileA: UserProfile, pillarsB: CalculatedPillars, type: RelationshipType, nameA?: string, nameB?: string): SynastryReport {
        const weights = REL_WEIGHTS[type] || REL_WEIGHTS[RelationshipType.ROMANTIC];
        const firstNameA = (nameA || (profileA as any).full_name || profileA.name || 'Arquitecto').split(' ')[0];
        const firstNameB = (nameB || 'Vínculo').split(' ')[0];

        const pillarScores = {
            western: this.calculateAstrologyScore(profileA.astrology!, pillarsB.astrology, weights),
            numerology: this.calculateNumerologyScore(profileA.numerology!, pillarsB.numerology, weights),
            mayan: this.calculateMayanScore(this.getMayaA(profileA), pillarsB.mayan),
            chinese: this.calculateChineseScore(this.getChineseA(profileA), pillarsB.chinese)
        };
        const { indices, explanations, labels } = this.generatePremiumIndices(profileA, pillarsB, pillarScores, weights, type, firstNameA, firstNameB);
        const score = Math.round((pillarScores.western * weights.pillars.western) + (pillarScores.numerology * weights.pillars.numerology) + (pillarScores.mayan * weights.pillars.mayan) + (pillarScores.chinese * weights.pillars.chinese));

        return {
            score,
            indices,
            explanations,
            labels,
            A_StrongCompatibilities: this.extractStrengths(indices, type, firstNameA, firstNameB),
            B_PotentialTensions: this.extractTensions(indices, pillarScores, firstNameA, firstNameB),
            C_GrowthAreas: this.extractGrowth(indices, firstNameA, firstNameB),
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
        const trinos = [['Rata', 'Dragón', 'Mono'], ['Buey', 'Serpiente', 'Gallo'], ['Tigre', 'Caballo', 'Perro'], ['Conejo', 'Cabra', 'Cerdo']];
        if (trinos.some(t => t.includes(chinA.animal) && t.includes(chinB.animal))) return 100;
        const oposiciones: any = { 'Rata': 'Caballo', 'Buey': 'Cabra', 'Tigre': 'Mono', 'Conejo': 'Gallo', 'Dragón': 'Perro', 'Serpiente': 'Cerdo' };
        if (oposiciones[chinA.animal] === chinB.animal || oposiciones[chinB.animal] === chinA.animal) return 30;
        return 65;
    }
    private static generatePremiumIndices(profileA: UserProfile, pillarsB: CalculatedPillars, pillarScores: any, weights: SynastryWeights, type: RelationshipType, nameA: string, nameB: string): any {
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
            lbl_sexual = "Magnetismo Erotizado";
            const marsVenus = Math.round((getAspect('mars', 'venus') + getAspect('venus', 'mars')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((marsVenus * 0.7) + (elementAffinity * 0.3));
            exp_sexual = `El Magnetismo surge al alquimizar el voltaje entre el Marte de ${nameA} y el Venus de ${nameB}, modulado por la afinidad térmica de sus naturalezas base.`;
        } else if (isBusiness) {
            lbl_sexual = "Sinergia Creadora";
            const marsJup = Math.round((getAspect('mars', 'jupiter') + getAspect('jupiter', 'mars')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((marsJup * 0.7) + (elementAffinity * 0.3));
            exp_sexual = `La Sinergia Creadora evalúa el empuje expansivo (Júpiter) frente a la capacidad de ejecución (Marte) entre ${nameA} y ${nameB}, dictando su velocidad al materializar proyectos.`;
        } else if (isParental) {
            lbl_sexual = "Contención y Nutrición";
            const moonJup = Math.round((getAspect('moon', 'jupiter') + getAspect('jupiter', 'moon')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((moonJup * 0.7) + (elementAffinity * 0.3));
            exp_sexual = `La Contención evalúa el flujo protector entre la Luna de ${nameA} y el manto protector de ${nameB}, base fundamental para el desarrollo seguro dentro del sistema familiar.`;
        } else if (isAmistad) {
            lbl_sexual = "Afinidad Electiva";
            const mercJup = Math.round((getAspect('mercury', 'jupiter') + getAspect('jupiter', 'mercury')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((mercJup * 0.7) + (elementAffinity * 0.3));
            exp_sexual = `La Afinidad Electiva mide la capacidad de expandir horizontes intelectuales y sociales (Júpiter) mediante la comunicación fluida (Mercurio) entre ${nameA} y ${nameB}.`;
        } else {
            lbl_sexual = "Fricción Lúdica";
            const uranusMerc = Math.round((getAspect('uranus', 'mercury') + getAspect('mercury', 'uranus')) / 2);
            const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
            sexual_erotic = Math.round((uranusMerc * 0.7) + (elementAffinity * 0.3));
            exp_sexual = `La Fricción Lúdica refleja la asombrosa capacidad química entre el intelecto de ${nameA} y la espontaneidad de ${nameB} para romper el hielo y estimular la diversión pura.`;
        }

        // 2. intellectual_mercurial
        if (isBusiness) {
            lbl_intellectual = "Visión Estratégica";
            const mercSat = Math.round((getAspect('mercury', 'saturn') + getAspect('saturn', 'mercury')) / 2);
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercSat * 0.5) + (numScore * 0.5));
            exp_intellectual = `La Visión Estratégica revela si la estructura mental combina la ejecución (Saturno) con agilidad táctica (Mercurio), optimizando el Sendero Místico de ${nameA} (${numA.lifePathNumber || 'X'}) y el de ${nameB} (${numB.lifePathNumber || 'Y'}).`;
        } else if (isParental) {
            lbl_intellectual = "Guía y Transmisión";
            const mercJup = Math.round((getAspect('mercury', 'jupiter') + getAspect('jupiter', 'mercury')) / 2);
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercJup * 0.5) + (numScore * 0.5));
            exp_intellectual = `La Guía evalúa la capacidad de transferir sabiduría (Júpiter) mediante el diálogo (Mercurio) entre ${nameA} y ${nameB}, alineando sus propósitos de vida numerológicos.`;
        } else if (isAmistad) {
            lbl_intellectual = "Sintonía de Ideas";
            const mercMerc = getAspect('mercury', 'mercury');
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercMerc * 0.5) + (numScore * 0.5));
            exp_intellectual = `La Sintonía de Ideas nace de la conexión directa entre los Mercurios de ${nameA} y ${nameB}, facilitando un entendimiento mutuo que trasciende las palabras.`;
        } else {
            lbl_intellectual = "Estrategia Mental";
            const mercMerc = getAspect('mercury', 'mercury');
            const numScore = pillarScores.numerology;
            intellectual_mercurial = Math.round((mercMerc * 0.5) + (numScore * 0.5));
            exp_intellectual = `La Estrategia Mental nace de la interconexión geométrica entre el Mercurio analítico de ${nameA} y el intelecto de ${nameB}, fusionada con la fricción de sus Senderos de Vida (${numA.lifePathNumber || 'X'} y ${numB.lifePathNumber || 'Y'}).`;
        }

        // 3. emotional_lunar
        if (isBusiness) {
            lbl_emotional = "Confianza Operativa";
            const sunSat = Math.round((getAspect('sun', 'saturn') + getAspect('saturn', 'sun')) / 2);
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((sunSat * 0.6) + (mayanScore * 0.4));
            exp_emotional = `La Confianza Operativa evalúa la solidez de los acuerdos en el tiempo cruzando el Sol y Saturno mutuo, sostenida por la compatibilidad de sus firmas Maya (${mayaA.nawal} de ${nameA} con ${mayaB.nawal} de ${nameB}).`;
        } else if (isParental) {
            lbl_emotional = "Vínculo de Sangre";
            const moonMoon = getAspect('moon', 'moon');
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((moonMoon * 0.6) + (mayanScore * 0.4));
            exp_emotional = `El Vínculo de Sangre mide la sincronización subconsciente profunda entre las lunas de ${nameA} y ${nameB}, validado por sus arquetipos nahuales en el Tzolkin.`;
        } else if (isAmistad) {
            lbl_emotional = "Resonancia Fraterna";
            const moonVen = Math.round((getAspect('moon', 'venus') + getAspect('venus', 'moon')) / 2);
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((moonVen * 0.6) + (mayanScore * 0.4));
            exp_emotional = `La Resonancia Fraterna evalúa la comodidad y el afecto desinteresado entre ${nameA} y ${nameB}, validado por la armonía de sus sellos Mayas.`;
        } else {
            lbl_emotional = "Gravedad Emocional";
            const lunarMatch = Math.round((getAspect('moon', 'moon') + getAspect('moon', 'sun')) / 2);
            const mayanScore = pillarScores.mayan;
            emotional_lunar = Math.round((lunarMatch * 0.6) + (mayanScore * 0.4));
            exp_emotional = `La Gravedad se sintetiza al cruzar el resplandor Solar de ${nameA} con la profunda resonancia Lunar de ${nameB}, entrelazada con el destino cósmico entre sus nahuales (${mayaA.nawal} y ${mayaB.nawal}).`;
        }

        // 4. karmic_saturnian
        lbl_karmic = isBusiness ? "Arquitectura de Riesgos" : isParental ? "Legado Estructural" : "Fricción Kármica";
        const saturnMatch = Math.round((getAspect('saturn', 'sun') + getAspect('saturn', 'moon')) / 2) || 50;
        const chinScore = pillarScores.chinese;
        karmic_saturnian = Math.round((saturnMatch * 0.5) + (chinScore * 0.5));
        exp_karmic = isBusiness ?
            `La Arquitectura de Riesgos define cómo la estructura de ${nameA} maneja la restricción de ${nameB} (Saturno), influenciada enormemente por la compatibilidad de sus signos orientales (${chinA.animal} y ${chinB.animal}).` :
            isParental ?
                `El Legado Estructural mide la disciplina y las lecciones generacionales que ${nameA} transfiere o recibe de ${nameB}, bajo la influencia de sus ciclos orientales.` :
                `La Fricción Kármica calcula el peso de la restricción recíproca entre el severo Saturno de ${nameA} frente a la voluntad de ${nameB}, condicionada por la milenaria danza entre sus signos orientales (${chinA.animal} frente a ${chinB.animal}).`;

        // 5. spiritual_neptunian
        lbl_spiritual = isBusiness ? "Adaptabilidad Disruptiva" : isParental ? "Conexión Ancestral" : "Integración Psíquica";
        const nepMatch = Math.round((getAspect('neptune', 'moon') + getAspect('uranus', 'mercury')) / 2) || 50;
        const masterBonus = (([11, 22, 33].includes(numA.lifePathNumber || 0) || [11, 22, 33].includes(numB.lifePathNumber || 0)) ? 20 : 0);
        spiritual_neptunian = Math.min(Math.round(nepMatch + masterBonus), 100);
        exp_spiritual = isBusiness ?
            `La Adaptabilidad Disruptiva señala la capacidad conjunta inexplorada para innovar frente a lo impredecible (Urano) sin que la sociedad comercial colapse, potenciada por decodificaciones numéricas.` :
            isParental ?
                `La Conexión Ancestral explora los hilos invisibles y el propósito espiritual transgeneracional entre ${nameA} y ${nameB}, revelado por Neptuno y sus vibraciones numéricas maestras.` :
                `La Integración cuantifica el acceso a esferas transpersonales cruzando la disrupción Uraniana de ${nameA} y el velo de Neptuno de ${nameB}, catalizado fuertemente por sus resonancias maestras.`;

        // 6. action_martial
        lbl_action = isBusiness ? "Pulso Ejecutivo" : isParental ? "Autoridad y Respeto" : isAmistad ? "Aventura Conjunta" : "Dinámica de Poder";
        const martialPower = Math.round((getAspect('mars', 'pluto') + getAspect('sun', 'mars') + getAspect('pluto', 'mars')) / 3) || 50;
        action_martial = Math.round((martialPower + sexual_erotic) / 2);
        exp_action = isBusiness ?
            `El Pulso Ejecutivo mapea la capacidad de empuje conjunto, evaluando quién lidera la iniciativa bajo presión entre ${nameA} (Plutón) y ${nameB} (Marte).` :
            isParental ?
                `La Autoridad y Respeto define el equilibrio de límites y voluntad entre ${nameA} y ${nameB}, dictando la jerarquía natural del sistema familiar.` :
                isAmistad ?
                    `La Aventura Conjunta mide el impulso para emprender acciones y experiencias nuevas entre ${nameA} y ${nameB}, equilibrando la iniciativa de ambos.` :
                    `La Dinámica de Poder mapea los vectores de dominación evaluando el imponente Plutón de ${nameA} frente a la fuerza reactiva del Marte de ${nameB}, dictando matemáticamente quién contiene la estructura durante las presiones críticas.`;

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
    private static extractStrengths(indices: any, type: RelationshipType, nameA: string, nameB: string): any[] {
        const s = [];
        if (indices.emotional_lunar > 75) s.push({ key: 'RES_LUNAR', label: `Resonancia lunar profunda entre ${nameA} y ${nameB}` });
        if (indices.intellectual_mercurial > 75) s.push({ key: 'FLUJO_MERCURIAL', label: `Flujo mercurial de asimilación rápida` });
        if (indices.sexual_erotic > 80) s.push({ key: 'ATRACCION_TERMO', label: `Alta atracción termodinámica` });
        return s.length > 0 ? s : [{ key: 'ESTABILIDAD_BASE', label: "Estabilidad base y contención terrestre" }];
    }
    private static extractTensions(indices: any, scores: any, nameA: string, nameB: string): any[] {
        const t = [];
        if (indices.karmic_saturnian > 70) t.push({ key: 'CHOQUE_CARMICO', label: `Choque cármico en el eje Saturnino` });
        if (scores.mayan < 50) t.push({ key: 'FRIC_MAYA', label: `Fricción evolutiva en cruz maya` });
        if (scores.western < 40) t.push({ key: 'DIS_EL_BASE', label: `Disonancia de elementos astrológicos base` });
        return t.length > 0 ? t : [{ key: 'SINC_SUAVE', label: "Sincronización suave temporal" }];
    }
    private static extractGrowth(indices: any, nameA: string, nameB: string): any[] {
        return [{ key: 'CALIB_RITMOS', label: `Calibración de ritmos entre el empuje de ${nameA} y la resistencia de ${nameB}` }];
    }
}
