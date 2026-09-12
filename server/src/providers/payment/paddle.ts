import { Environment, LogLevel, Paddle } from '@paddle/paddle-node-sdk';
import { PaymentProvider } from './interface';
import { config } from '../../config/env';
import { BillingService } from '../../modules/billing/service';

const paddle = config.PADDLE_API_KEY ? new Paddle(config.PADDLE_API_KEY, {
    environment: Environment.sandbox,
    logLevel: LogLevel.error,
}) : null;

export class PaddleProvider implements PaymentProvider {
    async createCheckout(userId: string, priceId: string, email?: string) {
        return { url: 'paddle_js_checkout' };
    }

    async handleWebhook(rawBody: string, signature: string) {
        if (!paddle) throw new Error('Paddle SDK is not initialized (Missing PADDLE_API_KEY)');
        const secret = config.PADDLE_WEBHOOK_SECRET;
        if (!secret) throw new Error('Missing PADDLE_WEBHOOK_SECRET');
        if (!signature || !rawBody) throw new Error('Missing signature or rawBody');

        let eventData;
        try {
            eventData = await paddle.webhooks.unmarshal(rawBody, secret, signature);
        } catch (e: any) {
            console.error('Paddle signature verification failed:', e.message);
            throw new Error('Invalid signature');
        }

        const entity: any = eventData.data;
        const customData = entity.customData || {};
        const userId = customData.user_id;

        const eventId = eventData.eventId;
        const eventType = eventData.eventType;
        const occurredAt = new Date(eventData.occurredAt).toISOString();

        switch (eventData.eventType) {
            case 'transaction.completed': {
                const subId = entity.subscriptionId;
                const customerId = entity.customerId;
                if (subId && userId) {
                    await BillingService.handleActivation(userId, 'paddle', customerId, subId, false, eventId, eventType, occurredAt);
                }
                break;
            }
            case 'subscription.canceled': {
                const subscriptionId = entity.id;
                if (subscriptionId) {
                    await BillingService.handleCancellation('paddle', subscriptionId, eventId, eventType, occurredAt);
                }
                break;
            }
            case 'subscription.past_due': {
                const subscriptionId = entity.id;
                if (subscriptionId) {
                    await BillingService.handlePaymentFailed('paddle', subscriptionId, eventId, eventType, occurredAt);
                }
                break;
            }
        }
    }
}
