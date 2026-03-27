export interface RitualStep {
    id: string;
    title: string;
    copy: string;
    description?: string; // Deep explanation for the Info Modal
    scientificImpact?: string; // Biological benefit (e.g., HRV gain)
    neuroEffect?: string; // Brain logic benefit
    durationSeconds: number;
}

export interface ElementRitual {
    id: string; // Path ID (e.g., 'path-architect')
    name: string; // Path Name (e.g., 'Manual del Arquitecto')
    breath: {
        id: string;
        label: string;
        copy: string;
        description?: string; 
        scientificImpact?: string;
        neuroEffect?: string;
        technique: 'WATER_CALM' | 'EARTH_GROUND' | 'FIRE_ACTIVATE' | 'AIR_FLOW' | 'BHASTRIKA' | 'BOX' | 'COHERENCE' | 'UJJAYI' | 'NADI' | 'BUMBLEBEE' | 'HYPEROX' | 'INTERMITTENT';
        durationSeconds: number;
    };
    meditation: RitualStep;
    anchor: RitualStep;
}

export const RITUAL_LIBRARY: Record<'WATER' | 'FIRE' | 'EARTH' | 'AIR', ElementRitual[]> = {
    FIRE: [
        {
            id: 'fire-architect',
            name: 'ritual_fire_architect_name',
            breath: {
                id: 'fire-1',
                label: 'ritual_fire_architect_breath_label',
                copy: 'ritual_fire_architect_breath_copy',
                description: 'ritual_fire_architect_breath_description',
                scientificImpact: 'ritual_fire_architect_breath_sci',
                neuroEffect: 'ritual_fire_architect_breath_neuro',
                technique: 'FIRE_ACTIVATE',
                durationSeconds: 120
            },
            meditation: {
                id: 'fire-2',
                title: 'ritual_fire_architect_meditation_title',
                copy: 'ritual_fire_architect_meditation_copy',
                description: 'ritual_fire_architect_meditation_description',
                scientificImpact: 'ritual_fire_architect_meditation_sci',
                neuroEffect: 'ritual_fire_architect_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'fire-3',
                title: 'ritual_fire_architect_anchor_title',
                copy: 'ritual_fire_architect_anchor_copy',
                description: 'ritual_fire_architect_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'fire-ancestral',
            name: 'ritual_fire_ancestral_name',
            breath: {
                id: 'fire-a1',
                label: 'ritual_fire_ancestral_breath_label',
                copy: 'ritual_fire_ancestral_breath_copy',
                description: 'ritual_fire_ancestral_breath_description',
                scientificImpact: 'ritual_fire_ancestral_breath_sci',
                neuroEffect: 'ritual_fire_ancestral_breath_neuro',
                technique: 'BHASTRIKA',
                durationSeconds: 120
            },
            meditation: {
                id: 'fire-a2',
                title: 'ritual_fire_ancestral_meditation_title',
                copy: 'ritual_fire_ancestral_meditation_copy',
                description: 'ritual_fire_ancestral_meditation_description',
                scientificImpact: 'ritual_fire_ancestral_meditation_sci',
                neuroEffect: 'ritual_fire_ancestral_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'fire-a3',
                title: 'ritual_fire_ancestral_anchor_title',
                copy: 'ritual_fire_ancestral_anchor_copy',
                description: 'ritual_fire_ancestral_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'fire-biohack',
            name: 'ritual_fire_biohack_name',
            breath: {
                id: 'fire-b1',
                label: 'ritual_fire_biohack_breath_label',
                copy: 'ritual_fire_biohack_breath_copy',
                description: 'ritual_fire_biohack_breath_description',
                scientificImpact: 'ritual_fire_biohack_breath_sci',
                neuroEffect: 'ritual_fire_biohack_breath_neuro',
                technique: 'HYPEROX',
                durationSeconds: 120
            },
            meditation: {
                id: 'fire-b2',
                title: 'ritual_fire_biohack_meditation_title',
                copy: 'ritual_fire_biohack_meditation_copy',
                description: 'ritual_fire_biohack_meditation_description',
                scientificImpact: 'ritual_fire_biohack_meditation_sci',
                neuroEffect: 'ritual_fire_biohack_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'fire-b3',
                title: 'ritual_fire_biohack_anchor_title',
                copy: 'ritual_fire_biohack_anchor_copy',
                description: 'ritual_fire_biohack_anchor_description',
                durationSeconds: 120
            }
        }
    ],
    EARTH: [
        {
            id: 'earth-architect',
            name: 'ritual_earth_architect_name',
            breath: {
                id: 'earth-1',
                label: 'ritual_earth_architect_breath_label',
                copy: 'ritual_earth_architect_breath_copy',
                description: 'ritual_earth_architect_breath_description',
                scientificImpact: 'ritual_earth_architect_breath_sci',
                neuroEffect: 'ritual_earth_architect_breath_neuro',
                technique: 'EARTH_GROUND',
                durationSeconds: 120
            },
            meditation: {
                id: 'earth-2',
                title: 'ritual_earth_architect_meditation_title',
                copy: 'ritual_earth_architect_meditation_copy',
                description: 'ritual_earth_architect_meditation_description',
                scientificImpact: 'ritual_earth_architect_meditation_sci',
                neuroEffect: 'ritual_earth_architect_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'earth-3',
                title: 'ritual_earth_architect_anchor_title',
                copy: 'ritual_earth_architect_anchor_copy',
                description: 'ritual_earth_architect_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'earth-ancestral',
            name: 'ritual_earth_ancestral_name',
            breath: {
                id: 'earth-a1',
                label: 'ritual_earth_ancestral_breath_label',
                copy: 'ritual_earth_ancestral_breath_copy',
                description: 'ritual_earth_ancestral_breath_description',
                scientificImpact: 'ritual_earth_ancestral_breath_sci',
                neuroEffect: 'ritual_earth_ancestral_breath_neuro',
                technique: 'BUMBLEBEE',
                durationSeconds: 120
            },
            meditation: {
                id: 'earth-a2',
                title: 'ritual_earth_ancestral_meditation_title',
                copy: 'ritual_earth_ancestral_meditation_copy',
                description: 'ritual_earth_ancestral_meditation_description',
                scientificImpact: 'ritual_earth_ancestral_meditation_sci',
                neuroEffect: 'ritual_earth_ancestral_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'earth-a3',
                title: 'ritual_earth_ancestral_anchor_title',
                copy: 'ritual_earth_ancestral_anchor_copy',
                description: 'ritual_earth_ancestral_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'earth-biohack',
            name: 'ritual_earth_biohack_name',
            breath: {
                id: 'earth-b1',
                label: 'ritual_earth_biohack_breath_label',
                copy: 'ritual_earth_biohack_breath_copy',
                description: 'ritual_earth_biohack_breath_description',
                scientificImpact: 'ritual_earth_biohack_breath_sci',
                neuroEffect: 'ritual_earth_biohack_breath_neuro',
                technique: 'BOX',
                durationSeconds: 120
            },
            meditation: {
                id: 'earth-b2',
                title: 'ritual_earth_biohack_meditation_title',
                copy: 'ritual_earth_biohack_meditation_copy',
                description: 'ritual_earth_biohack_meditation_description',
                durationSeconds: 180
            },
            anchor: {
                id: 'earth-b3',
                title: 'ritual_earth_biohack_anchor_title',
                copy: 'ritual_earth_biohack_anchor_copy',
                description: 'ritual_earth_biohack_anchor_description',
                durationSeconds: 120
            }
        }
    ],
    WATER: [
        {
            id: 'water-architect',
            name: 'ritual_water_architect_name',
            breath: {
                id: 'water-1',
                label: 'ritual_water_architect_breath_label',
                copy: 'ritual_water_architect_breath_copy',
                description: 'ritual_water_architect_breath_description',
                scientificImpact: 'ritual_water_architect_breath_sci',
                neuroEffect: 'ritual_water_architect_breath_neuro',
                technique: 'WATER_CALM',
                durationSeconds: 120
            },
            meditation: {
                id: 'water-2',
                title: 'ritual_water_architect_meditation_title',
                copy: 'ritual_water_architect_meditation_copy',
                description: 'ritual_water_architect_meditation_description',
                scientificImpact: 'ritual_water_architect_meditation_sci',
                neuroEffect: 'ritual_water_architect_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'water-3',
                title: 'ritual_water_architect_anchor_title',
                copy: 'ritual_water_architect_anchor_copy',
                description: 'ritual_water_architect_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'water-ancestral',
            name: 'ritual_water_ancestral_name',
            breath: {
                id: 'water-a1',
                label: 'ritual_water_ancestral_breath_label',
                copy: 'ritual_water_ancestral_breath_copy',
                description: 'ritual_water_ancestral_breath_description',
                scientificImpact: 'ritual_water_ancestral_breath_sci',
                neuroEffect: 'ritual_water_ancestral_breath_neuro',
                technique: 'UJJAYI',
                durationSeconds: 120
            },
            meditation: {
                id: 'water-a2',
                title: 'ritual_water_ancestral_meditation_title',
                copy: 'ritual_water_ancestral_meditation_copy',
                description: 'ritual_water_ancestral_meditation_description',
                scientificImpact: 'ritual_water_ancestral_meditation_sci',
                neuroEffect: 'ritual_water_ancestral_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'water-a3',
                title: 'ritual_water_ancestral_anchor_title',
                copy: 'ritual_water_ancestral_anchor_copy',
                description: 'ritual_water_ancestral_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'water-biohack',
            name: 'ritual_water_biohack_name',
            breath: {
                id: 'water-b1',
                label: 'ritual_water_biohack_breath_label',
                copy: 'ritual_water_biohack_breath_copy',
                description: 'ritual_water_biohack_breath_description',
                technique: 'COHERENCE',
                durationSeconds: 120
            },
            meditation: {
                id: 'water-b2',
                title: 'ritual_water_biohack_meditation_title',
                copy: 'ritual_water_biohack_meditation_copy',
                description: 'ritual_water_biohack_meditation_description',
                scientificImpact: 'ritual_water_biohack_meditation_sci',
                neuroEffect: 'ritual_water_biohack_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'water-b3',
                title: 'ritual_water_biohack_anchor_title',
                copy: 'ritual_water_biohack_anchor_copy',
                description: 'ritual_water_biohack_anchor_description',
                durationSeconds: 120
            }
        }
    ],
    AIR: [
        {
            id: 'air-architect',
            name: 'ritual_air_architect_name',
            breath: {
                id: 'air-1',
                label: 'ritual_air_architect_breath_label',
                copy: 'ritual_air_architect_breath_copy',
                description: 'ritual_air_architect_breath_description',
                scientificImpact: 'ritual_air_architect_breath_sci',
                neuroEffect: 'ritual_air_architect_breath_neuro',
                technique: 'AIR_FLOW',
                durationSeconds: 120
            },
            meditation: {
                id: 'air-2',
                title: 'ritual_air_architect_meditation_title',
                copy: 'ritual_air_architect_meditation_copy',
                description: 'ritual_air_architect_meditation_description',
                scientificImpact: 'ritual_air_architect_meditation_sci',
                neuroEffect: 'ritual_air_architect_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'air-3',
                title: 'ritual_air_architect_anchor_title',
                copy: 'ritual_air_architect_anchor_copy',
                description: 'ritual_air_architect_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'air-ancestral',
            name: 'ritual_air_ancestral_name',
            breath: {
                id: 'air-a1',
                label: 'ritual_air_ancestral_breath_label',
                copy: 'ritual_air_ancestral_breath_copy',
                description: 'ritual_air_ancestral_breath_description',
                scientificImpact: 'ritual_air_ancestral_breath_sci',
                neuroEffect: 'ritual_air_ancestral_breath_neuro',
                technique: 'NADI',
                durationSeconds: 120
            },
            meditation: {
                id: 'air-a2',
                title: 'ritual_air_ancestral_meditation_title',
                copy: 'ritual_air_ancestral_meditation_copy',
                description: 'ritual_air_ancestral_meditation_description',
                scientificImpact: 'ritual_air_ancestral_meditation_sci',
                neuroEffect: 'ritual_air_ancestral_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'air-a3',
                title: 'ritual_air_ancestral_anchor_title',
                copy: 'ritual_air_ancestral_anchor_copy',
                description: 'ritual_air_ancestral_anchor_description',
                durationSeconds: 120
            }
        },
        {
            id: 'air-biohack',
            name: 'ritual_air_biohack_name',
            breath: {
                id: 'air-b1',
                label: 'ritual_air_biohack_breath_label',
                copy: 'ritual_air_biohack_breath_copy',
                description: 'ritual_air_biohack_breath_description',
                scientificImpact: 'ritual_air_biohack_breath_sci',
                neuroEffect: 'ritual_air_biohack_breath_neuro',
                technique: 'AIR_FLOW',
                durationSeconds: 120
            },
            meditation: {
                id: 'air-b2',
                title: 'ritual_air_biohack_meditation_title',
                copy: 'ritual_air_biohack_meditation_copy',
                description: 'ritual_air_biohack_meditation_description',
                scientificImpact: 'ritual_air_biohack_meditation_sci',
                neuroEffect: 'ritual_air_biohack_meditation_neuro',
                durationSeconds: 180
            },
            anchor: {
                id: 'air-b3',
                title: 'ritual_air_biohack_anchor_title',
                copy: 'ritual_air_biohack_anchor_copy',
                description: 'ritual_air_biohack_anchor_description',
                durationSeconds: 120
            }
        }
    ]
};
