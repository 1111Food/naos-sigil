// server/src/services/SynastryCalculator.ts
import { UserProfile, AstrologyProfile, NumerologyProfile } from '../types';
import { RelationshipType, SynastryProfile, SynastryReport, CalculatedPillars, SynastryWeights } from '../types/synastry';
import { SynastryWeightEngine } from './SynastryWeightEngine';
import { AstrologyService } from '../modules/astrology/astroService';
import { NumerologyService } from '../modules/numerology/service';
import { MayanCalculator, NAWALES } from '../utils/mayaCalculator';
import { ChineseAstrology } from '../utils/chineseAstrology';

/**
 * Main Calculator for the NAOS Synastry System (4 Pillars).
 * Coordinates comparisons between User A and a target SynastryProfile B.
 */
export class SynastryCalculator {

    /**
     * Executes the multidimensional synastry analysis.
     */
    public async calculateSynastry(
        profileA: UserProfile,
        profileBData: SynastryProfile,
        relationshipType: RelationshipType
    ): Promise<SynastryReport> {

        // 1. Get dynamic weights based on relationship type
        const weights = SynastryWeightEngine.getWeights(relationshipType);

        // 2. Fetch/Calculate Pillars for Person B
        const pillarsB = await this.calculatePillarsForB(profileBData);

        // 3. Prepare pillars for Person A (ensure data exists)
        const pillarsA = this.preparePillarsForA(profileA);

        // 4. Calculate Scores for Each Pillar (0-100)
        const pillarScores = {
            western: this.calculateAstrologyScore(profileA.astrology!, pillarsB.astrology, weights),
            numerology: this.calculateNumerologyScore(profileA.numerology!, pillarsB.numerology),
            mayan: this.calculateMayanScore(pillarsA.mayan, pillarsB.mayan),
            chinese: this.calculateChineseScore(pillarsA.chinese, pillarsB.chinese)
        };

        // 5. Generate Relational Indices (0-100%) and their esoteric explanations
        const { indices, explanations } = this.generateRelationalIndices(pillarScores, profileA, pillarsB, weights);

        // 6. Extract Qualitative Patterns
        const A_StrongCompatibilities = this.extractStrongCompatibilities(indices, relationshipType);
        const B_PotentialTensions = this.extractPotentialTensions(indices, pillarScores);
        const C_GrowthAreas = this.extractGrowthAreas(indices, relationshipType);

        // 7. Global Score calculation
        const score = this.calculateGlobalScore(pillarScores, weights);

        return {
            score,
            indices,
            explanations,
            A_StrongCompatibilities,
            B_PotentialTensions,
            C_GrowthAreas,
            pillarBreakdown: pillarScores
        };
    }

    /**
     * Calculates the 4 pillars for Person B using input data.
     */
    private async calculatePillarsForB(data: SynastryProfile): Promise<CalculatedPillars> {
        const astro = await AstrologyService.calculateProfile(
            data.birthDate, data.birthTime,
            data.coordinates?.lat || 0, data.coordinates?.lng || 0,
            data.utcOffset || 0
        );

        const num = NumerologyService.calculateProfile(data.birthDate, data.name);
        const maya = MayanCalculator.calculate(data.birthDate);
        const chinese = ChineseAstrology.calculate(data.birthDate);

        return {
            astrology: astro,
            numerology: num,
            mayan: { nawal: maya.kicheName, tone: maya.tone },
            chinese: { animal: chinese.animal, element: chinese.element }
        };
    }

    private preparePillarsForA(profile: UserProfile): any {
        return {
            mayan: { nawal: profile.nawal_maya || 'Imox', tone: profile.nawal_tono || 1 },
            chinese: { animal: profile.chinese_animal || 'Rata', element: profile.chinese_element || 'Madera' }
        };
    }

    // --- PILLAR CALCULATIONS (MATHEMATICAL CORE) ---

    private calculateAstrologyScore(chartA: AstrologyProfile, chartB: AstrologyProfile, weights: SynastryWeights): number {
        let score = 0;
        let totalWeight = 0;

        // 1. Element Affinity (Weighted by platform default)
        const elementMatch = this.checkElementCompatibility(chartA.elements, chartB.elements);
        score += elementMatch * 30; // Max 30 points

        // 2. Aspects for Principal Bodies
        const bodies = ['sun', 'moon', 'mercury', 'venus', 'mars'];
        bodies.forEach(body => {
            const w = weights.celestialBodies[body] || 0.5;
            const posA = (chartA as any)[body]?.absDegree;
            const posB = (chartB as any)[body]?.absDegree;

            if (posA !== undefined && posB !== undefined) {
                const aspectScore = this.calculateAspectScore(posA, posB);
                score += aspectScore * 14 * w; // Max ~14 points per body
                totalWeight += w;
            }
        });

        return Math.min(Math.round(score), 100);
    }

    private checkElementCompatibility(elA: any, elB: any): number {
        const getMax = (el: any) => {
            const map: any = { fire: el.fire, earth: el.earth, air: el.air, water: el.water };
            return Object.entries(map).reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0];
        };
        const maxA = getMax(elA);
        const maxB = getMax(elB);

        const compatible: any = {
            fire: ['fire', 'air'],
            air: ['fire', 'air'],
            earth: ['earth', 'water'],
            water: ['earth', 'water']
        };

        if (maxA === maxB) return 1.0;
        if (compatible[maxA].includes(maxB)) return 0.8;
        return 0.3;
    }

    private calculateAspectScore(degA: number, degB: number): number {
        const diff = Math.abs(degA - degB) % 360;
        const dist = diff > 180 ? 360 - diff : diff;

        if (dist <= 8) return 1.0; // Conjunction
        if (Math.abs(dist - 120) <= 8) return 1.0; // Trine
        if (Math.abs(dist - 60) <= 6) return 0.8; // Sextile
        if (Math.abs(dist - 90) <= 8) return 0.4; // Square
        if (Math.abs(dist - 180) <= 8) return 0.4; // Opposition

        return 0.1;
    }

    private calculateNumerologyScore(numA: NumerologyProfile, numB: NumerologyProfile): number {
        let score = 0;
        // Essence (Life Path) comparison
        if (numA.lifePathNumber === numB.lifePathNumber) score += 60;
        else if ((numA.lifePathNumber + numB.lifePathNumber) % 9 === 0) score += 40;

        // Master Numbers intensity
        const masters = [11, 22, 33];
        if (masters.includes(numA.lifePathNumber) && masters.includes(numB.lifePathNumber)) score += 20;

        return Math.min(score, 100);
    }

    private calculateMayanScore(mayaA: any, mayaB: any): number {
        if (mayaA.nawal === mayaB.nawal) return 100;

        const idxA = NAWALES.findIndex(n => n.name === mayaA.nawal);
        const idxB = NAWALES.findIndex(n => n.name === mayaB.nawal);

        if (idxA === -1 || idxB === -1) return 50;

        const dist = Math.abs(idxA - idxB);
        if (dist === 10) return 40; // Antipode (Friction)
        if (dist === 1 || dist === 19) return 90; // Oracle family affinity
        if (dist === 5 || dist === 15) return 85;

        return 50;
    }

    private calculateChineseScore(chinA: any, chinB: any): number {
        const trinos = [
            ['Rata', 'Dragón', 'Mono'],
            ['Buey', 'Serpiente', 'Gallo'],
            ['Tigre', 'Caballo', 'Perro'],
            ['Conejo', 'Cabra', 'Cerdo']
        ];

        for (const trino of trinos) {
            if (trino.includes(chinA.animal) && trino.includes(chinB.animal)) return 100;
        }

        const oposiciones: any = {
            'Rata': 'Caballo', 'Caballo': 'Rata',
            'Buey': 'Cabra', 'Cabra': 'Buey',
            'Tigre': 'Mono', 'Mono': 'Tigre'
        };

        if (oposiciones[chinA.animal] === chinB.animal) return 30;

        return 60;
    }

    // --- GENERATION OF RELATIONAL INDICES (FERRARI ENGINE) ---

    private generateRelationalIndices(pillarScores: any, profileA: UserProfile, pillarsB: CalculatedPillars, weights: SynastryWeights): { indices: any, explanations: any } {
        const astroA = profileA.astrology!;
        const astroB = pillarsB.astrology;
        const numA = profileA.numerology!;
        const numB = pillarsB.numerology;
        const mayaA = this.preparePillarsForA(profileA).mayan;
        const mayaB = pillarsB.mayan;
        const chinA = this.preparePillarsForA(profileA).chinese;
        const chinB = pillarsB.chinese;

        const getDist = (bodyA: string, bodyB: string) => {
            const pA = (astroA.planets || []).find(p => p.name.toLowerCase() === bodyA.toLowerCase());
            const pB = (astroB.planets || []).find(p => p.name.toLowerCase() === bodyB.toLowerCase());
            const fallbackA = (astroA as any)[bodyA]?.absDegree;
            const fallbackB = (astroB as any)[bodyB]?.absDegree;

            const degA = pA ? pA.absDegree : fallbackA;
            const degB = pB ? pB.absDegree : fallbackB;

            if (degA === undefined || degB === undefined) return 50;
            return this.calculateAspectScore(degA, degB) * 100;
        };

        // 1. Magnetismo Erotizado (Occidente: Marte/Venus + Elementos Occidentales)
        const marsVenus = Math.round((getDist('mars', 'venus') + getDist('venus', 'mars')) / 2);
        const elementAffinity = this.checkElementCompatibility(astroA.elements, astroB.elements) * 100;
        const sexual_erotic = Math.round((marsVenus * 0.7) + (elementAffinity * 0.3));
        const exp_sexual = `El Magnetismo Erotizado surge al alquimizar el voltaje entre el Marte de un perfil y el Venus del otro, modulado por la profunda afinidad de sus Elementos Astrológicos primordiales.`;

        // 2. Estrategia Mental (Occidente: Mercurio/Júpiter + Numerología: Sendero de Vida)
        const mercMerc = getDist('mercury', 'mercury');
        const numScore = pillarScores.numerology;
        const intellectual_mercurial = Math.round((mercMerc * 0.5) + (numScore * 0.5));
        const exp_intellectual = `La Estrategia Mental nace de la interconexión directa de las posiciones de Mercurio en sus cartas astrales, fusionada con la fricción matemática de los Senderos de Vida numerológicos (${numA?.lifePathNumber || 'X'} y ${numB?.lifePathNumber || 'Y'}).`;

        // 3. Gravedad Emocional (Occidente: Luna/Sol + Maya: Arquetipos Nawales)
        const lunarMatch = Math.round((getDist('moon', 'moon') + getDist('moon', 'sun')) / 2);
        const mayanScore = pillarScores.mayan;
        const emotional_lunar = Math.round((lunarMatch * 0.6) + (mayanScore * 0.4));
        const exp_emotional = `La Gravedad Emocional se sintetiza al cruzar la aspectación Lunar y Solar de ambos arquitectos, entrelazada con el destino encriptado en el Oráculo Maya (${mayaA.nawal} intersectando con ${mayaB.nawal}).`;

        // 4. Deuda / Responsabilidad (Occidente: Saturno/Plutón + Chino: Ramas Terrestres / Animales)
        const saturnMatch = Math.round((getDist('saturn', 'sun') + getDist('saturn', 'moon')) / 2) || 50;
        const chinScore = pillarScores.chinese;
        const karmic_saturnian = Math.round((saturnMatch * 0.5) + (chinScore * 0.5));
        const exp_karmic = `El Umbral de Responsabilidad (Karma) calcula el peso de la restricción recíproca de Saturno, modificado drásticamente por las alianzas y hostilidades milenarias entre sus signos zodiacales del Oriente (${chinA.animal} frente a ${chinB.animal}).`;

        // 5. Integración Psíquica (Occidente: Neptuno/Urano + Fusión Fractal Numérica)
        const nepMatch = Math.round((getDist('neptune', 'moon') + getDist('uranus', 'mercury')) / 2) || 50;
        const masterBonus = (([11, 22, 33].includes(numA?.lifePathNumber || 0) || [11, 22, 33].includes(numB?.lifePathNumber || 0)) ? 20 : 0);
        const spiritual_neptunian = Math.min(Math.round(nepMatch + masterBonus), 100);
        const exp_spiritual = `La Integración Psíquica cuantifica el acceso a bandas transpersonales cruzando la estática de choque (Urano) y la nebulosa colectiva (Neptuno), catalizado por la presencia o decodificación de Números Maestros.`;

        // 6. Dinámica de Poder (Occidente: Marte/Plutón + Tensión de Ejes Occidentales)
        const martialPower = Math.round((getDist('mars', 'pluto') + getDist('sun', 'mars')) / 2) || 50;
        const action_martial = Math.round((martialPower + sexual_erotic) / 2);
        const exp_action = `La Dinámica de Poder mapea los ejes vectoriales de dominación y construcción evaluando Plutón y el Sol frente a la agresividad cardinal (Marte), dictando quién sostiene la estructura cuando estalla el caos.`;

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
            }
        };
    }

    // --- QUALITATIVE ANALYTICAL PATTERNS ---

    private extractStrongCompatibilities(indices: any, type: RelationshipType): string[] {
        const strong = [];
        if (indices.sexual_erotic > 75) strong.push("Resonancia arquetípica de alta frecuencia");
        if (indices.emotional_lunar > 70) strong.push("Sintonía emocional y nutrición mutua sostenida");
        if (indices.intellectual_mercurial > 75) strong.push("Fluidez implacable en procesos cognitivos y dialéctica");
        if (indices.action_martial > 80) strong.push("Alineación táctica profunda de voluntades (Dinámica de Poder)");
        return strong.length > 0 ? strong : ["Afinidad en fase de sondeo y exploración"];
    }

    private extractPotentialTensions(indices: any, pillarScores: any): string[] {
        const tensions = [];
        if (indices.action_martial < 50) tensions.push("Fricción evolutiva: Lucha estructural por la dominación angular");
        if (pillarScores.western < 40) tensions.push("Disonancia densa de elementos primarios (Desafío de adaptación térmica)");
        if (indices.karmic_saturnian < 50) tensions.push("Tensión en deudas milenarias e incompatibilidad filosófica oriental");
        return tensions.length > 0 ? tensions : ["Armonía estructural arquitectónica estable"];
    }

    private extractGrowthAreas(indices: any, type: RelationshipType): string[] {
        const areas = ["Calibración consciente de lenguajes compartidos"];
        if (indices.karmic_saturnian > 70) areas.push("Transmutación de responsabilidades kármicas pesadas");
        if (indices.intellectual_mercurial < 60) areas.push("Destrucción de viejos puentes conceptuales para abrir paso a la novedad");
        return areas;
    }

    private calculateGlobalScore(pillarScores: any, weights: SynastryWeights): number {
        const ws = weights.pillars;
        const raw = (pillarScores.western * ws.western) +
            (pillarScores.numerology * ws.numerology) +
            (pillarScores.mayan * ws.mayan) +
            (pillarScores.chinese * ws.chinese);
        return Math.round(raw);
    }

    /**
     * Prepares Phase 3 Payload for Gemini LLM.
     */
    public buildPromptPayload(report: SynastryReport, type: RelationshipType): any {
        return {
            system: "NAOS_SYNASTRY_SYNTHESIS_V2",
            context: { relationshipType: type },
            metrics: {
                globalCompatibility: report.score,
                indices: report.indices,
                pillars: report.pillarBreakdown
            },
            patterns: {
                resonances: report.A_StrongCompatibilities,
                clashes: report.B_PotentialTensions,
                evolutionSteps: report.C_GrowthAreas
            }
        };
    }
}
