import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/env';

// Pricing config: DO NOT SCATTER LITERALS
export const MODEL_PRICING = {
    'gemini-2.5-flash': { input_1m: 0.075, output_1m: 0.30 },
    'gemini-2.5-pro': { input_1m: 1.25, output_1m: 5.00 }
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
    private static supabaseAdmin = createClient(config.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

    static getUsageCycle(profile: any): string {
        // Simple usage cycle definition: YYYY-MM for simplicity,
        // unless they are on a specific active subscription period.
        if (profile?.current_period_end) {
            const endDate = new Date(profile.current_period_end);
            return `sub_cycle_${endDate.getUTCFullYear()}_${endDate.getUTCMonth() + 1}`;
        }
        
        // Trial/Test/Owner fallback
        const now = new Date();
        return `cal_${now.getUTCFullYear()}_${now.getUTCMonth() + 1}`;
    }

    static async checkBudget(userId: string, profile: any): Promise<{ allowed: boolean, reason?: string, isOwner: boolean }> {
        // 1. Owner check
        const isOwner = (profile?.system_role === 'owner' || profile?.system_role === 'admin' || profile?.plan_type === 'admin');
        if (isOwner) {
            return { allowed: true, isOwner: true }; // Unlimited internal budget
        }

        // 2. Resolve Budget Limit
        let budgetLimit = DEFAULT_USER_BUDGET_USD;
        try {
            const { data: override, error } = await this.supabaseAdmin
                .from('user_ai_budgets')
                .select('budget_usd')
                .eq('user_id', userId)
                .single();
            if (!error && override) {
                budgetLimit = override.budget_usd;
            }
        } catch (e) {
            // Graceful fallback if migration not run
        }

        // 3. Resolve Current Cycle Usage
        const cycle = this.getUsageCycle(profile);
        let used = 0.0;
        try {
            const { data: usage, error } = await this.supabaseAdmin
                .from('ai_usage_ledger')
                .select('estimated_cost_usd')
                .eq('user_id', userId)
                .eq('usage_cycle_period', cycle);
                
            if (!error && usage) {
                used = usage.reduce((acc, row) => acc + Number(row.estimated_cost_usd || 0), 0);
            }
        } catch (e) {
            // Graceful fallback
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
            await this.supabaseAdmin.from('ai_usage_ledger').insert(payload);
        } catch (e: any) {
            if (e?.code !== '42P01') { // Ignore relation does not exist
                console.error("[ECONOMICS] Error recording ledger usage:", e);
            }
        }
    }
}
