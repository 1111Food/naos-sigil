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
        if (!paddle) throw new Error('Paddle SDK is not initialized');

        const bindingSecret = config.PADDLE_CHECKOUT_BINDING_SECRET;
        if (!bindingSecret) {
            throw new Error('Missing PADDLE_CHECKOUT_BINDING_SECRET. Failing closed.');
        }

        const crypto = require('crypto');
        const naos_binding = crypto.createHmac('sha256', bindingSecret)
            .update(`${userId}:${priceId}`)
            .digest('hex');

        const payload: any = {
            items: [{ priceId, quantity: 1 }],
            customData: {                user_id: userId,
                naos_binding
            }
        };

        if (priceId === config.PADDLE_PRICE_YEARLY && config.PADDLE_DISCOUNT_LAUNCH) {
            payload.discountId = config.PADDLE_DISCOUNT_LAUNCH;
        }

        const transaction = await paddle.transactions.create(payload);
        return { transactionId: transaction.id };
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
            case 'subscription.activated':
            case 'subscription.updated':
            case 'subscription.resumed': {
                const subId = entity.id;
                const customerId = entity.customerId;
                const status = entity.status;
                if (status !== 'active') {
                    console.warn(`[PaddleProvider] Ignoring ${eventData.eventType} because status is '${status}', not 'active'.`);
                    break;
                }

                // Paddle SDK Subscription entity has items array and currentBillingPeriod
                const priceId = entity.items?.[0]?.price?.id;
                const endsAtStr = entity.currentBillingPeriod?.endsAt;

                // --- NAOS BINDING VERIFICATION (P0) ---
                const naosBinding = customData?.naos_binding;
                const bindingSecret = config.PADDLE_CHECKOUT_BINDING_SECRET;
                if (!bindingSecret) {
                    console.error('[PaddleProvider] PADDLE_CHECKOUT_BINDING_SECRET missing. Rejecting activation securely.');
                    break;
                }

                if (!naosBinding || typeof naosBinding !== 'string') {
                    console.error(`[PaddleProvider] Missing or invalid naos_binding for user_id [${userId}]. Rejecting activation.`);
                    break;
                }

                const crypto = require('crypto');
                const expectedBinding = crypto.createHmac('sha256', bindingSecret)
                    .update(`${userId}:${priceId}`)
                    .digest('hex');

                if (naosBinding.length !== expectedBinding.length || !crypto.timingSafeEqual(Buffer.from(naosBinding), Buffer.from(expectedBinding))) {
                    console.error(`[PaddleProvider] Invalid naos_binding signature for user_id [${userId}]. Rejecting activation.`);
                    break;
                }

                if (subId && userId && priceId && endsAtStr) {
                    const overrideExpiresAt = new Date(endsAtStr);
                    // Add 3 days grace period to Paddle's exact end date
                    overrideExpiresAt.setDate(overrideExpiresAt.getDate() + 3);
                    await BillingService.handleActivation(
                        userId,
                        'paddle',
                        customerId,
                        subId,
                        false,
                        eventId,
                        eventType,
                        occurredAt,
                        overrideExpiresAt,
                        priceId
                    );
                }
                break;
            }
            case 'subscription.paused': {
                const subscriptionId = entity.id;
                if (subscriptionId) {
                    await BillingService.handleCancellation('paddle', subscriptionId, eventId, eventType, occurredAt, 'paused');
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
