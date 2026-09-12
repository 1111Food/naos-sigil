import { supabaseAdmin } from '../../lib/supabaseAdmin';

export class BillingService {

    static async isEventProcessed(provider: string, eventId: string): Promise<boolean> {
        if (!eventId) return false;
        const { data } = await supabaseAdmin
            .from('processed_webhooks')
            .select('id')
            .eq('provider', provider)
            .eq('event_id', eventId)
            .maybeSingle();
        return !!data;
    }

    static async markEventProcessed(provider: string, eventId: string, eventType: string, occurredAt: string) {
        if (!eventId) return;
        await supabaseAdmin
            .from('processed_webhooks')
            .insert([{ provider, event_id: eventId, event_type: eventType, occurred_at: occurredAt }]);
    }

    // Returns the profile if the event should be processed (newer than last_webhook_occurred_at)
    static async getProfileForUpdate(userId: string | null, provider: string, subscriptionId: string, occurredAt: string) {
        let query = supabaseAdmin.from('profiles').select('id, last_webhook_occurred_at');
        if (userId) {
            query = query.eq('id', userId);
        } else {
            query = query.eq('payment_provider', provider).eq('provider_subscription_id', subscriptionId);
        }
        
        const { data } = await query.maybeSingle();
        if (!data) return null;

        const last = data.last_webhook_occurred_at ? new Date(data.last_webhook_occurred_at) : new Date(0);
        const current = new Date(occurredAt);
        if (current < last) return null; // Older event, ignore
        
        return data;
    }

    static async handleActivation(userId: string | undefined, provider: string, customerId: string, subscriptionId: string, is3Day: boolean, eventId: string, eventType: string, occurredAt: string) {
        if (!userId) return;
        
        if (await this.isEventProcessed(provider, eventId)) {
            console.log(`[BillingService] Event ${eventId} already processed, skipping safely.`);
            return;
        }

        const profile = await this.getProfileForUpdate(userId, provider, subscriptionId, occurredAt);
        if (!profile) {
            console.log(`[BillingService] Event ${eventId} is older than current state or profile not found, ignoring.`);
            await this.markEventProcessed(provider, eventId, eventType, occurredAt);
            return;
        }

        const expiresAt = new Date();
        if (is3Day) {
            expiresAt.setHours(expiresAt.getHours() + 72);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            expiresAt.setDate(expiresAt.getDate() + 3);
        }

        const updatePayload = {
            plan_type: 'premium',
            payment_provider: provider,
            provider_customer_id: customerId,
            provider_subscription_id: subscriptionId,
            subscription_status: 'active',
            current_period_end: expiresAt.toISOString(),
            last_webhook_occurred_at: occurredAt,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin.from('profiles').update(updatePayload).eq('id', profile.id);
        if (error) {
            console.error('BillingService: Error updating profile on activation:', error);
            throw new Error('Billing mutation failed');
        }

        await this.markEventProcessed(provider, eventId, eventType, occurredAt);
    }

    static async handleCancellation(provider: string, subscriptionId: string, eventId: string, eventType: string, occurredAt: string) {
        if (!subscriptionId) return;

        if (await this.isEventProcessed(provider, eventId)) return;

        const profile = await this.getProfileForUpdate(null, provider, subscriptionId, occurredAt);
        if (!profile) {
            await this.markEventProcessed(provider, eventId, eventType, occurredAt);
            return;
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ 
                plan_type: 'free', 
                subscription_status: 'canceled',
                last_webhook_occurred_at: occurredAt,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);
            
        if (error) throw new Error('Billing mutation failed');

        await this.markEventProcessed(provider, eventId, eventType, occurredAt);
    }

    static async handlePaymentFailed(provider: string, subscriptionId: string, eventId: string, eventType: string, occurredAt: string) {
        if (!subscriptionId) return;

        if (await this.isEventProcessed(provider, eventId)) return;

        const profile = await this.getProfileForUpdate(null, provider, subscriptionId, occurredAt);
        if (!profile) {
            await this.markEventProcessed(provider, eventId, eventType, occurredAt);
            return;
        }

        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ 
                subscription_status: 'past_due',
                last_webhook_occurred_at: occurredAt,
                updated_at: new Date().toISOString() 
            })
            .eq('id', profile.id);
            
        if (error) throw new Error('Billing mutation failed');

        await this.markEventProcessed(provider, eventId, eventType, occurredAt);
    }
}
