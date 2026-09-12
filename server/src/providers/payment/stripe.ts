import Stripe from 'stripe';
import { config } from '../../config/env';
import { PaymentProvider } from './interface';
import { BillingService } from '../../modules/billing/service';

const stripe = config.STRIPE_SECRET_KEY 
    ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any }) 
    : null;

export class StripeProvider implements PaymentProvider {
    async createCheckout(userId: string, priceId: string, email?: string) {
        if (!stripe) throw new Error('Stripe is not configured');
        
        const frontendUrl = config.NODE_ENV === 'production' ? 'https://naosos.com' : 'http://localhost:5173';
        const is3DayPlan = priceId === config.STRIPE_PRICE_3DAYS;
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: is3DayPlan ? 'payment' : 'subscription',
            client_reference_id: userId,
            customer_email: email,
            metadata: { user_id: userId, plan_mode: is3DayPlan ? '3days' : 'recurring' },
            success_url: frontendUrl + '/sanctuary?upgrade=success',
            cancel_url: frontendUrl + '/sanctuary?upgrade=canceled',
            allow_promotion_codes: true,
        });
        
        return { url: session.url! };
    }

    async handleWebhook(rawBody: string, signature: string) {
        if (!stripe || !config.STRIPE_WEBHOOK_SECRET) throw new Error('Stripe webhook not configured');
        
        const event = stripe.webhooks.constructEvent(rawBody, signature, config.STRIPE_WEBHOOK_SECRET);
        
        const eventId = event.id;
        const eventType = event.type;
        const occurredAt = new Date(event.created * 1000).toISOString();

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id || session.metadata?.user_id;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                const is3Day = session.metadata?.plan_mode === '3days';
                
                await BillingService.handleActivation(userId, 'stripe', customerId, subscriptionId, is3Day, eventId, eventType, occurredAt);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await BillingService.handleCancellation('stripe', subscription.id, eventId, eventType, occurredAt);
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                await BillingService.handlePaymentFailed('stripe', invoice.subscription, eventId, eventType, occurredAt);
                break;
            }
        }
    }
}
