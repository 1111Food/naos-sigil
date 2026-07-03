import { SubscriptionStatus } from '../../types';
import { UserService } from '../user/service';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export class SubscriptionService {

    static async getStatus(userId: string): Promise<SubscriptionStatus> {
        const user = await UserService.getProfile(userId);
        
        // Auto-degrade expired premium plans (e.g. the 3-day Spark plan)
        if (user.plan_type === 'premium' || user.plan_type === 'premium_plus') {
            const expiresAt = (user as any).subscription_expires_at;
            if (expiresAt && new Date(expiresAt) < new Date()) {
                console.log(`⏰ [SUBSCRIPTION] Plan expired for user ${userId}. Auto-degrading to free.`);
                // Downgrade in DB asynchronously (fire and forget)
                supabaseAdmin.from('profiles')
                    .update({ plan_type: 'free', updated_at: new Date().toISOString() })
                    .eq('id', userId)
                    .then(({ error }) => {
                        if (error) console.error('❌ Auto-degrade failed:', error.message);
                    });
                return { plan: 'FREE', features: ['basic_chat'] };
            }
        }
        
        return user.subscription;
    }

    static async upgradePlan(userId: string): Promise<SubscriptionStatus> {
        const user = await UserService.getProfile(userId);

        // Mock Payment/Upgrade Logic
        const newStatus: SubscriptionStatus = {
            plan: 'PREMIUM',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            features: ['basic_chat', 'daily_energy', 'tarot_spreads', 'full_chart']
        };

        await UserService.updateProfile(userId, { subscription: newStatus });
        return newStatus;
    }

    static async upgradeToExtended(userId: string): Promise<SubscriptionStatus> {
        const user = await UserService.getProfile(userId);

        const newStatus: SubscriptionStatus = {
            plan: 'EXTENDED',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            features: ['unlimited_chat', 'priority_processing', 'professional_tools', 'extended_history']
        };

        await UserService.updateProfile(userId, { subscription: newStatus });
        return newStatus;
    }
}
