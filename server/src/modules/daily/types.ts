export type SystemType = 'astrology' | 'numerology' | 'maya' | 'chinese' | 'astronomical' | 'core';
export type Granularity = 'day' | 'month' | 'year' | 'transit' | 'event';

export interface BaseSignal {
    id: string;
    system: SystemType;
    engine: string;
    method: string;
    granularity: Granularity;
    localDate: string;
    calculatedAt: string;
    deterministic: true;
    inputs: Record<string, string | number | undefined>;
}

export interface AstrologyDailySignal extends BaseSignal {
    system: 'astrology';
    value: {
        transitPlanet: string;
        natalTarget: string;
        aspectType: string;
        orb: number;
        isPriority: boolean;
    };
}

export interface NumerologyDailySignal extends BaseSignal {
    system: 'numerology';
    value: number; // e.g. 7
}

export interface MayaDailySignal extends BaseSignal {
    system: 'maya';
    value: {
        nahual: string;
        tone: number;
        name: string;
    };
}

export interface ChineseDailySignal extends BaseSignal {
    system: 'chinese';
    value: {
        animal: string;
        element: string;
    };
}

export interface AstronomicalEventSignal extends BaseSignal {
    system: 'astronomical';
    value: {
        eventName: string;
        description: string;
    };
}

export type DailySignal = 
    | AstrologyDailySignal 
    | NumerologyDailySignal 
    | MayaDailySignal 
    | ChineseDailySignal 
    | AstronomicalEventSignal;

export interface DailyContextLayerA {
    contextVersion: 'v2_daily_context';
    localDate: string;
    currentTimezoneOffset: number;
    language: string;

    identity: {
        natalAstro: Record<string, unknown>;
        natalNum: Record<string, unknown>;
        natalMaya: Record<string, unknown>;
        natalChinese: { animal: string; element: string };
    };

    astrology: {
        currentPositions: Array<{ name: string; sign: string; absDegree: number }>;
        priorityAspects: Array<{
            transitPlanet: string;
            natalTarget: string;
            aspectType: string;
            exactAngle: number;
            actualSeparation: number;
            orb: number;
            isPriority: boolean;
        }>;
        allAspects: Array<{
            transitPlanet: string;
            natalTarget: string;
            aspectType: string;
            exactAngle: number;
            actualSeparation: number;
            orb: number;
            isPriority: boolean;
        }>;
    };

    numerology: {
        universalYear: number;
        universalMonth: number;
        universalDay: number;
        personalYear: number;
        personalMonth: number;
        personalDay: number;
    };

    maya: {
        dailyNahual: string;
        dailyTone: number;
    };

    chinese: {
        currentYearAnimal: string;
        currentYearElement: string;
    };

    astronomicalEvents: AstronomicalEventSignal[]; // Empty for V1

    personalContext: {
        protocol21State?: Record<string, unknown>;
        coherenceState: 'LOW' | 'MEDIUM' | 'HIGH';
    };

    provenance: DailySignal[];
}
