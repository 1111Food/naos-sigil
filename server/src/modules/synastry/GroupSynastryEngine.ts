import { RelationshipType } from '../../types/synastry';

export interface GroupElementalMesh {
    fire: number;   // Iniciativa, Empuje, Riesgo
    earth: number;  // Materialización, Estructura, Ejecución
    air: number;    // Estrategia, Innovación, Redes
    water: number;  // Cohesión, Empatía, Adaptabilidad
    voids: string[]; // Elementos con menos de 10%
    predominant: string; // Elemento con más de 40%
    score: number; // Puntuación de balance (0-100)
}

export class GroupSynastryEngine {

    // Evaluate elemental mesh of a team (array of profiles with their astral pillars)
    public static calculateElementalMesh(teamMembers: any[], lang: string = 'es'): GroupElementalMesh {
        let fireCount = 0;
        let earthCount = 0;
        let airCount = 0;
        let waterCount = 0;
        let totalPoints = 0;

        const isEn = lang === 'en';

        teamMembers.forEach(member => {
            const elements = member.pillars?.astrology?.elements;
            if (elements) {
                // AstrologyEngine returns raw counts (e.g., Fire: 3). 
                // We normalize to 0-100 range by multiplying by 10 (approximate percentage).
                fireCount += (elements.fire || 0) * 10;
                earthCount += (elements.earth || 0) * 10;
                airCount += (elements.air || 0) * 10;
                waterCount += (elements.water || 0) * 10;
                totalPoints += 100; // Each person contributes 100 normalized points
            }
        });

        // Calculate average percentages for the group
        const fire = Math.round((fireCount / totalPoints) * 100) || 0;
        const earth = Math.round((earthCount / totalPoints) * 100) || 0;
        const air = Math.round((airCount / totalPoints) * 100) || 0;
        const water = Math.round((waterCount / totalPoints) * 100) || 0;

        // Detect voids and predominant elements (localized)
        const voids: string[] = [];
        const labelFire = isEn ? 'Fire' : 'Fuego';
        const labelEarth = isEn ? 'Earth' : 'Tierra';
        const labelAir = isEn ? 'Air' : 'Aire';
        const labelWater = isEn ? 'Water' : 'Agua';

        if (fire <= 10) voids.push(labelFire);
        if (earth <= 10) voids.push(labelEarth);
        if (air <= 10) voids.push(labelAir);
        if (water <= 10) voids.push(labelWater);

        let predominant = isEn ? 'Balanced' : 'Equilibrado';
        const maxElement = Math.max(fire, earth, air, water);
        if (maxElement > 40) {
            if (maxElement === fire) predominant = labelFire;
            if (maxElement === earth) predominant = labelEarth;
            if (maxElement === air) predominant = labelAir;
            if (maxElement === water) predominant = labelWater;
        }

        // Calculate a basic harmony score (100 = perfectly balanced 25/25/25/25, lowers with voids or huge extremes)
        let score = 100 - (voids.length * 15);
        if (maxElement > 50) score -= (maxElement - 50);
        score = Math.max(0, Math.min(100, Math.round(score)));

        return {
            fire,
            earth,
            air,
            water,
            voids,
            predominant,
            score
        };
    }

    public static generateTechnicalReport(teamMembers: any[], lang: string = 'es') {
        const mesh = this.calculateElementalMesh(teamMembers, lang);

        // Assemble team names for context
        const teamNames = teamMembers.map(m => m.name || m.role_label || (lang === 'en' ? 'Bond' : 'Vínculo'));

        return {
            score: mesh.score,
            teamNames,
            mesh,
            timestamp: new Date().toISOString()
        };
    }
}
