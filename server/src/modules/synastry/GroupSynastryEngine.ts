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
    public static calculateElementalMesh(teamMembers: any[]): GroupElementalMesh {
        let fireCount = 0;
        let earthCount = 0;
        let airCount = 0;
        let waterCount = 0;
        let totalPoints = 0;

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

        // Detect voids and predominant elements
        const voids: string[] = [];
        if (fire <= 10) voids.push('Fuego');
        if (earth <= 10) voids.push('Tierra');
        if (air <= 10) voids.push('Aire');
        if (water <= 10) voids.push('Agua');

        let predominant = 'Equilibrado';
        const maxElement = Math.max(fire, earth, air, water);
        if (maxElement > 40) {
            if (maxElement === fire) predominant = 'Fuego';
            if (maxElement === earth) predominant = 'Tierra';
            if (maxElement === air) predominant = 'Aire';
            if (maxElement === water) predominant = 'Agua';
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

    public static generateTechnicalReport(teamMembers: any[]) {
        const mesh = this.calculateElementalMesh(teamMembers);

        // Assemble team names for context
        const teamNames = teamMembers.map(m => m.name || m.role_label || 'Vínculo');

        return {
            score: mesh.score,
            teamNames,
            mesh,
            timestamp: new Date().toISOString()
        };
    }
}
