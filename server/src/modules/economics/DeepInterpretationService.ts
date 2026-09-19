import { config } from '../../config/env';
import crypto from 'crypto';
import { AiLedgerService } from './AiLedgerService';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export interface DeepInterpretationQuery {
    userId: string;
    profile: any;
    interpretationKey: string;
    target: string;
    locale: string;
    canonicalData: any; // e.g. { birthDate, birthTime, lat, lng, offset }
    methodologyVersion: string;
    usageCyclePeriod: string;
}

export class DeepInterpretationService {
    private static inProgress = new Map<string, Promise<string>>();

    static calculateFingerprint(canonicalData: any): string {
        return crypto.createHash('sha256').update(JSON.stringify(canonicalData)).digest('hex');
    }

    static async getOrGenerate(
        query: DeepInterpretationQuery,
        generator: () => Promise<{ content: string; inputTokens: number; outputTokens: number; model: string }>
    ): Promise<{ content: string; fromCache: boolean; cost?: any }> {
        const fingerprint = this.calculateFingerprint(query.canonicalData);
        const uniqueKey = `${query.userId}:${query.interpretationKey}:${fingerprint}:${query.locale}:${query.methodologyVersion}`;

        // 1. Check in-memory deduplication
        if (this.inProgress.has(uniqueKey)) {
            console.log(`[DEEP CACHE] Deduplicating request for ${uniqueKey}`);
            const content = await this.inProgress.get(uniqueKey);
            return { content: content!, fromCache: true };
        }

        // 2. Check Database Persistence
        try {
            const { data: existing, error } = await supabaseAdmin
                .from('deep_interpretations')
                .select('content, status')
                .eq('user_id', query.userId)
                .eq('interpretation_key', query.interpretationKey)
                .eq('source_fingerprint', fingerprint)
                .eq('locale', query.locale)
                .eq('methodology_version', query.methodologyVersion)
                .single();

            if (!error && existing && existing.status === 'READY') {
                console.log(`[DEEP CACHE] DB Hit for ${uniqueKey}`);
                return { content: existing.content, fromCache: true };
            }
        } catch (e) {
            // DB fallback if table doesn't exist yet
        }

        // 3. Generate New Content (with economics)
        const generationPromise = (async () => {
            // Economics Preflight BEFORE GENERATION
            const budgetCheck = await AiLedgerService.checkBudget(query.userId, query.profile);
            if (!budgetCheck.allowed) {
                throw new Error(`LIMITE_PRESUPUESTO: ${budgetCheck.reason}`);
            }

            // Pre-insert GENERATING status if DB exists
            try {
                await supabaseAdmin.from('deep_interpretations').upsert({
                    user_id: query.userId,
                    interpretation_key: query.interpretationKey,
                    target: query.target,
                    locale: query.locale,
                    source_fingerprint: fingerprint,
                    methodology_version: query.methodologyVersion,
                    usage_cycle_period: query.usageCyclePeriod,
                    status: 'GENERATING'
                }, { onConflict: 'user_id, interpretation_key, source_fingerprint, locale, methodology_version' });
            } catch (e) {}

            try {
                const result = await generator();
                
                // Record Usage AFTER SUCCESS
                await AiLedgerService.recordUsage(query.userId, query.profile, {
                    feature: 'deep_interpretations',
                    provider: 'gemini',
                    model: result.model,
                    input_tokens: result.inputTokens,
                    output_tokens: result.outputTokens
                });

                // Save success to DB
                try {
                    await supabaseAdmin.from('deep_interpretations').upsert({
                        user_id: query.userId,
                        interpretation_key: query.interpretationKey,
                        target: query.target,
                        locale: query.locale,
                        source_fingerprint: fingerprint,
                        methodology_version: query.methodologyVersion,
                        usage_cycle_period: query.usageCyclePeriod,
                        status: 'READY',
                        content: result.content,
                        model_metadata: { model: result.model, input_tokens: result.inputTokens, output_tokens: result.outputTokens },
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id, interpretation_key, source_fingerprint, locale, methodology_version' });
                } catch (e) {}
                
                return result;
            } catch (error) {
                // Save failure to DB
                try {
                    await supabaseAdmin.from('deep_interpretations').upsert({
                        user_id: query.userId,
                        interpretation_key: query.interpretationKey,
                        target: query.target,
                        locale: query.locale,
                        source_fingerprint: fingerprint,
                        methodology_version: query.methodologyVersion,
                        usage_cycle_period: query.usageCyclePeriod,
                        status: 'FAILED',
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id, interpretation_key, source_fingerprint, locale, methodology_version' });
                } catch (e) {}
                throw error;
            }
        })();

        // Wrap the promise to return just content for the deduplication map
        this.inProgress.set(uniqueKey, generationPromise.then(res => res.content));

        try {
            const result = await generationPromise;
            this.inProgress.delete(uniqueKey);
            return { content: result.content, fromCache: false, cost: result };
        } catch (error) {
            this.inProgress.delete(uniqueKey);
            throw error;
        }
    }
}
