import { config } from '../../config/env';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

// Pricing config: DO NOT SCATTER LITERALS
export const MODEL_PRICING = {
    'gemini-2.5-flash': { input_1m: 0.30, output_1m: 2.50 },
    'gemini-1.5-flash': { input_1m: 0.075, output_1m: 0.30 }, // Fallback logic
    'gemini-1.5-flash-8b': { input_1m: 0.0375, output_1m: 0.15 } // Background tasks
};

export const DEFAULT_USER_BUDGET_USD = 1.00;

export interface AiLedgerEntry {
    feature: string;
    provider: string;
    model: string;
    input_tokens: number;
    output_tokens: number;
    cached_tokens?: number;
    request_id?: string;
}

export class AiLedgerService {
    static getUsageCycle(profile: any): string {
        // BETA FIXED CREDIT MODEL:
        // No auto-renewal, no billing period reset, no calendar month reset.
        // Future subscription-cycle economics (Paddle) will add dynamic logic here.
        return 'beta_fixed';
    }

    static async checkBudget(userId: string, profile: any): Promise<{ allowed: boolean, reason?: string, isOwner: boolean }> {
        // 1. Owner check
        const isOwner = (profile?.system_role === 'owner' || profile?.system_role === 'admin');
        if (isOwner) {
            return { allowed: true, isOwner: true }; // Unlimited internal budget
        }

        // 2. Resolve Budget Limit
        let budgetLimit = DEFAULT_USER_BUDGET_USD;
        try {
            const { data: override, error } = await supabaseAdmin
                .from('user_ai_budgets')
                .select('budget_usd')
                .eq('user_id', userId)
                .maybeSingle();
            if (error) {
                console.error("[ECONOMICS] Budget lookup failed:", error);
                return { allowed: false, reason: 'BUDGET_CHECK_FAILED', isOwner: false };
            }
            if (override) {
                budgetLimit = Number(override.budget_usd);
            }
        } catch (e) {
            console.error("[ECONOMICS] Budget lookup crashed:", e);
            return { allowed: false, reason: 'BUDGET_CHECK_FAILED', isOwner: false };
        }

        // 3. Resolve Current Cycle Usage
        const cycle = this.getUsageCycle(profile);
        let used = 0.0;
        try {
            const { data: usage, error } = await supabaseAdmin
                .from('ai_usage_ledger')
                .select('estimated_cost_usd')
                .eq('user_id', userId)
                .eq('usage_cycle_period', cycle);
                
            if (error) {
                console.error("[ECONOMICS] Ledger lookup failed:", error);
                return { allowed: false, reason: 'BUDGET_CHECK_FAILED', isOwner: false };
            }
            if (usage) {
                used = usage.reduce((acc, row) => acc + Number(row.estimated_cost_usd || 0), 0);
            }
        } catch (e) {
            console.error("[ECONOMICS] Ledger lookup crashed:", e);
            return { allowed: false, reason: 'BUDGET_CHECK_FAILED', isOwner: false };
        }

        if (used >= budgetLimit) {
            return { allowed: false, reason: 'BUDGET_EXHAUSTED', isOwner: false };
        }

        return { allowed: true, isOwner: false };
    }

    static async recordUsage(userId: string, profile: any, entry: AiLedgerEntry): Promise<void> {
        const cycle = this.getUsageCycle(profile);
        
        let cost = 0.0;
        const pricing = MODEL_PRICING[entry.model as keyof typeof MODEL_PRICING];
        if (pricing) {
            cost = ((entry.input_tokens / 1_000_000) * pricing.input_1m) + ((entry.output_tokens / 1_000_000) * pricing.output_1m);
        }

        const payload = {
            user_id: userId,
            usage_cycle_period: cycle,
            feature: entry.feature,
            provider: entry.provider,
            model: entry.model,
            input_tokens: entry.input_tokens,
            output_tokens: entry.output_tokens,
            cached_tokens: entry.cached_tokens || 0,
            estimated_cost_usd: cost,
            request_id: entry.request_id
        };

        try {
            const { error } = await supabaseAdmin.from('ai_usage_ledger').insert(payload);
            if (error) throw error;
        } catch (e: any) {
            console.error("[ECONOMICS] Error recording ledger usage:", e);
            throw e;
        }
    }
}
