import { supabase } from '../../lib/supabase';
import { DailyContextBuilder } from './DailyContextBuilder';
import { DailyInterpreter } from './DailyInterpreter';
import { DailyContextLayerA } from './types';
import { DailyInterpretation } from './interpretationTypes';
import { RequestDeduplicator } from '../../lib/deduplicator';

export interface V2Payload {
    contextVersion: 'v2_daily_context';
    interpretationVersion: 'v1';
    layerA: DailyContextLayerA;
    interpretation: DailyInterpretation | null;
}

export class DailyContextOrchestrator {
    static async getOrGenerate(
        userId: string, 
        fullProfile: any, 
        currentTimezoneOffset: number, 
        language: string, 
        coherenceLevel: number = 50,
        now: Date = new Date()
    ): Promise<V2Payload> {
        
        const { DateUtils } = require('../../utils/DateUtils');
        const localDate = DateUtils.getUserLocalDate(currentTimezoneOffset, now);

        const cacheKey = `daily_${userId}_${localDate}_${language}_v2_daily_context_v1`;

        return await RequestDeduplicator.execute(cacheKey, async () => {
            const { data: cached } = await supabase
                .from('user_energy_snapshots')
                .select('payload')
                .eq('user_id', userId)
                .eq('snapshot_date', localDate)
                .eq('language', language)
                .maybeSingle();

            let layerA: DailyContextLayerA;

            if (cached && cached.payload && cached.payload.contextVersion === 'v2_daily_context') {
                const payload = cached.payload as V2Payload;
                // Cache HIT for FULL Payload
                if (payload.interpretationVersion === 'v1' && payload.interpretation?.interpretationStatus === 'ready') {
                    return payload;
                }
                // Partial HIT (Layer A exists, Interpretation failed or old version)
                layerA = payload.layerA;
            } else {
                // Total MISS
                layerA = await DailyContextBuilder.build(userId, fullProfile, currentTimezoneOffset, language, coherenceLevel, now);
            }

            const interpretation = await DailyInterpreter.interpret(layerA);

            const payload: V2Payload = {
                contextVersion: 'v2_daily_context',
                interpretationVersion: 'v1',
                layerA,
                interpretation
            };

            // Persist UPSERT
            await supabase.from('user_energy_snapshots').upsert({
                user_id: userId,
                snapshot_date: localDate,
                language: language,
                payload: payload,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, snapshot_date, language' });

            return payload;
        });
    }

    static async getDailySnapshot(
        userId: string, 
        currentTimezoneOffset: number, 
        language: string, 
        now: Date = new Date()
    ): Promise<V2Payload | null> {
        const { DateUtils } = require('../../utils/DateUtils');
        const localDate = DateUtils.getUserLocalDate(currentTimezoneOffset, now);

        const { data: cached } = await supabase
            .from('user_energy_snapshots')
            .select('payload')
            .eq('user_id', userId)
            .eq('snapshot_date', localDate)
            .eq('language', language)
            .maybeSingle();

        if (cached && cached.payload && cached.payload.contextVersion === 'v2_daily_context') {
            const payload = cached.payload as V2Payload;
            if (payload.interpretationVersion === 'v1') {
                return payload;
            }
        }
        return null;
    }
}
