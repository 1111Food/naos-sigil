import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { validateUser } from '../middleware/auth';
import { StripeProvider } from '../providers/payment/stripe';
import { PaddleProvider } from '../providers/payment/paddle';
import { config } from '../config/env';

const stripeProvider = new StripeProvider();
const paddleProvider = new PaddleProvider();

export const checkoutRoutes = async (app: FastifyInstance) => {
    app.post('/create-session', { preHandler: [validateUser] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { priceId } = request.body as { priceId: string };
            const userId = (request as any).user_id;

            if (!priceId) {
                return reply.status(400).send({ error: 'priceId is required' });
            }
            
            // Server-side Price Whitelist
            const validStripePrices = [config.STRIPE_PRICE_MONTHLY, config.STRIPE_PRICE_YEARLY];
            const validPaddlePrices = [config.PADDLE_PRICE_MONTHLY, config.PADDLE_PRICE_YEARLY];
            
            const isStripe = validStripePrices.includes(priceId);
            const isPaddle = validPaddlePrices.includes(priceId);
            
            if (!isStripe && !isPaddle) {
                return reply.status(400).send({ error: 'Invalid price ID' });
            }

            if (isStripe) {
                const session = await stripeProvider.createCheckout(userId, priceId);
                return reply.send(session);
            } else {
                const session = await paddleProvider.createCheckout(userId, priceId);
                return reply.send(session);
            }

        } catch (error: any) {
            console.error('Checkout error:', error);
            return reply.status(500).send({ error: error.message });
        }
    });

    app.post('/create-session-3days', { preHandler: [validateUser] }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { priceId } = request.body as { priceId?: string };
            const userId = (request as any).user_id;
            
            const targetPriceId = priceId || config.STRIPE_PRICE_3DAYS;
            
            if (targetPriceId !== config.STRIPE_PRICE_3DAYS) {
                 return reply.status(400).send({ error: 'Invalid price ID for 3-day plan' });
            }

            // 3-Day plan remains strictly Stripe for now
            const session = await stripeProvider.createCheckout(userId, targetPriceId);
            return reply.send(session);
            
        } catch (error: any) {
            console.error('Checkout error (3days):', error);
            return reply.status(500).send({ error: error.message });
        }
    });
};
