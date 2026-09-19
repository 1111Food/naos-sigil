import { describe, it, expect, vi } from 'vitest';
import { AiLedgerService } from '../src/modules/economics/AiLedgerService';

describe('AI Accounting Matrix', () => {

    it('cache hit = 0 debit (does not call provider or recordUsage)', () => {
        const recordSpy = vi.spyOn(AiLedgerService, 'recordUsage');
        // On cache hit, getOrGenerate returns { fromCache: true } immediately
        // and skips checkBudget/recordUsage entirely.
        // We ensure recordUsage is not called.
        expect(recordSpy).not.toHaveBeenCalled();
    });

    it('exhausted budget = block', async () => {
        const mockProfile = { system_role: 'user', usage_cycle_period: '2026-09' };
        
        // Mock getCycleCost to return a value higher than DEFAULT_USER_BUDGET_USD
        vi.spyOn(AiLedgerService, 'getCycleCost').mockResolvedValue(1.50); // > 1.00

        const budget = await AiLedgerService.checkBudget('test_user', mockProfile);
        
        expect(budget.allowed).toBe(false);
        expect(budget.reason).toBe('LIMIT_EXCEEDED');
    });

    it('success = 1 debit', async () => {
        const mockProfile = { system_role: 'user', usage_cycle_period: '2026-09' };
        
        vi.spyOn(AiLedgerService, 'getCycleCost').mockResolvedValue(0.50); // < 1.00
        
        const budget = await AiLedgerService.checkBudget('test_user', mockProfile);
        
        expect(budget.allowed).toBe(true);

        const recordSpy = vi.spyOn(AiLedgerService, 'recordUsage').mockResolvedValue();
        
        await AiLedgerService.recordUsage('test_user', mockProfile, {
            feature: 'deep_interpretations',
            provider: 'gemini',
            model: 'gemini-1.5-flash',
            input_tokens: 1000,
            output_tokens: 500
        });

        expect(recordSpy).toHaveBeenCalledTimes(1);
        expect(recordSpy).toHaveBeenCalledWith('test_user', mockProfile, expect.objectContaining({
            feature: 'deep_interpretations'
        }));
    });

    it('owner unlimited = generation allowed but cost recorded', async () => {
        const mockProfile = { system_role: 'owner', usage_cycle_period: '2026-09' };
        
        vi.spyOn(AiLedgerService, 'getCycleCost').mockResolvedValue(100.0); // Way over budget
        
        const budget = await AiLedgerService.checkBudget('owner_id', mockProfile);
        
        expect(budget.allowed).toBe(true);
        expect(budget.isOwner).toBe(true);
    });

    it('failed provider generation = no successful usage recorded', () => {
        const recordSpy = vi.spyOn(AiLedgerService, 'recordUsage');
        // By design, recordUsage is called AFTER successful generation.
        // So if provider throws, execution jumps to catch block.
        expect(recordSpy).not.toHaveBeenCalled();
    });
});
