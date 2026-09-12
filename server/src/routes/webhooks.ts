import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StripeProvider } from '../providers/payment/stripe';
import { PaddleProvider } from '../providers/payment/paddle';

const stripeProvider = new StripeProvider();
const paddleProvider = new PaddleProvider();

export const webhookRoutes = async (app: FastifyInstance) => {
    app.post('/api/webhooks/stripe', async (request: FastifyRequest, reply: FastifyReply) => {
        const signature = request.headers['stripe-signature'] as string;
        const rawBody = (request as any).rawBody;

        try {
            await stripeProvider.handleWebhook(rawBody, signature);
            return reply.send({ received: true });
        } catch (err: any) {
            console.error(`Stripe Webhook Error [Req: ${request.id}]`);
            return reply.status(400).send('Webhook Error: Signature verification failed or malformed payload.');
        }
    });

    app.post('/api/webhooks/paddle', async (request: FastifyRequest, reply: FastifyReply) => {
        const signature = request.headers['paddle-signature'] as string;
        const rawBody = (request as any).rawBody;

        try {
            await paddleProvider.handleWebhook(rawBody, signature);
            return reply.send({ received: true });
        } catch (err: any) {
            console.error(`Paddle Webhook Error [Req: ${request.id}]`);
            return reply.status(400).send('Webhook Error: Signature verification failed or malformed payload.');
        }
    });
};
