import { DateUtils } from '../../utils/DateUtils';
import { NumerologyService } from '../numerology/service';
import { MayanCalculator } from '../maya/calculator';
import { ChineseAstrology } from '../../utils/chineseAstrology';
import { TransitEngine } from '../astrology/TransitEngine';
import { DailyContextLayerA, DailySignal } from './types';

export class DailyContextBuilder {
    static async build(
        userId: string, 
        fullProfile: any, 
        currentTimezoneOffset: number, 
        language: string, 
        coherenceLevel: number = 50,
        now: Date = new Date()
    ): Promise<DailyContextLayerA> {
        const localDate = DateUtils.getUserLocalDate(currentTimezoneOffset, now);
        const calculatedAt = new Date().toISOString();
        const provenance: DailySignal[] = [];

        // 1. ASTROLOGY
        // We assume fullProfile.astrology has the birth data or natal positions.
        // TransitEngine requires lat, lng for the Observer. 
        // We can just use 0,0 or the natal lat/lng since transits are geocentric mostly.
        const lat = fullProfile.profile_data?.birthLat || 0;
        const lng = fullProfile.profile_data?.birthLng || 0;

        const currentPositions = TransitEngine.calculateCurrentTransits(now, lat, lng);
        
        let priorityAspects: any[] = [];
        let allAspects: any[] = [];
        
        if (fullProfile.astrology?.planets) {
            const natalPositions: Record<string, number> = {};
            for (const p of fullProfile.astrology.planets) {
                natalPositions[p.name] = p.absDegree;
            }
            if (fullProfile.astrology.ascendant) {
                natalPositions['Ascendant'] = fullProfile.astrology.ascendant.absDegree;
            }

            allAspects = TransitEngine.calculateAspects(currentPositions, natalPositions);
            priorityAspects = allAspects.filter(a => a.isPriority);

            // Add priority aspects to provenance
            for (const aspect of priorityAspects) {
                provenance.push({
                    id: `astrology.transit.${aspect.transitPlanet.toLowerCase()}_to_${aspect.natalTarget.toLowerCase()}`,
                    system: 'astrology',
                    engine: 'TransitEngine',
                    method: 'calculateAspects',
                    granularity: 'transit',
                    localDate,
                    calculatedAt,
                    deterministic: true,
                    inputs: { transitPlanet: aspect.transitPlanet, target: aspect.natalTarget },
                    value: aspect
                });
            }
        }

        // 2. NUMEROLOGY
        const birthDate = fullProfile.profile_data?.birthDate || fullProfile.birth_date;
        let numDaily: any = {};
        if (birthDate) {
            const dateObj = new Date(birthDate);
            const bDay = dateObj.getUTCDate();
            const bMonth = dateObj.getUTCMonth() + 1;

            numDaily = NumerologyService.calculateDailyNumerology(localDate, bDay, bMonth);

            provenance.push({
                id: 'numerology.personal_day',
                system: 'numerology',
                engine: 'NumerologyService',
                method: 'calculateDailyNumerology',
                granularity: 'day',
                localDate,
                calculatedAt,
                deterministic: true,
                inputs: { localDate, birthDay: bDay, birthMonth: bMonth },
                value: numDaily.personalDay
            });
        }

        // 3. MAYA
        const mayaDaily = MayanCalculator.calculate(localDate);
        provenance.push({
            id: 'maya.daily_nahual',
            system: 'maya',
            engine: 'MayanCalculator',
            method: 'calculate',
            granularity: 'day',
            localDate,
            calculatedAt,
            deterministic: true,
            inputs: { localDate },
            value: { nahual: mayaDaily.kicheName, tone: mayaDaily.tone, name: mayaDaily.meaning }
        });

        // 4. CHINESE (YEAR BOUNDARY)
        // ChineseAstrology.calculate automatically respects the Feb 4th solar boundary
        const chineseDaily = ChineseAstrology.calculate(`${localDate}T00:00:00Z`);
        provenance.push({
            id: 'chinese.current_year',
            system: 'chinese',
            engine: 'ChineseAstrology',
            method: 'calculate',
            granularity: 'year',
            localDate,
            calculatedAt,
            deterministic: true,
            inputs: { localDate },
            value: { animal: chineseDaily.animal, element: chineseDaily.element }
        });

        return {
            contextVersion: 'v2_daily_context',
            localDate,
            currentTimezoneOffset,
            language,
            identity: {
                natalAstro: fullProfile.astrology,
                natalNum: fullProfile.numerology,
                natalMaya: fullProfile.mayan,
                natalChinese: { animal: fullProfile.chinese_animal, element: fullProfile.chinese_element }
            },
            astrology: {
                currentPositions,
                priorityAspects,
                allAspects
            },
            numerology: {
                ...numDaily
            },
            maya: {
                dailyNahual: mayaDaily.kicheName,
                dailyTone: mayaDaily.tone
            },
            chinese: {
                currentYearAnimal: chineseDaily.animal,
                currentYearElement: chineseDaily.element
            },
            astronomicalEvents: [],
            personalContext: {
                // Protocol 21 injected later or mapped here if passed in profile
                coherenceState: coherenceLevel >= 75 ? 'HIGH' : coherenceLevel < 45 ? 'LOW' : 'MEDIUM'
            },
            provenance
        };
    }
}
