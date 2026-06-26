import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { config } from '../config/env';

// Initialize Stripe (It will throw error if not configured, but we check first)
const stripe = config.STRIPE_SECRET_KEY 
    ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any }) 
    : null;

export const checkoutRoutes = async (app: FastifyInstance) => {
    
    app.post('/create-session', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            if (!stripe) {
                console.error("❌ Stripe is not configured. Missing STRIPE_SECRET_KEY.");
                return reply.status(500).send({ error: 'Stripe configuration missing on server' });
            }

            const { priceId } = request.body as { priceId: string };
            const userId = request.headers['x-profile-id'] as string;

            if (!priceId) {
                return reply.status(400).send({ error: 'priceId is required' });
            }

            if (!userId) {
                return reply.status(401).send({ error: 'User must be authenticated (missing x-profile-id)' });
            }

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                // Important: pass the userId so the webhook can upgrade the correct account
                client_reference_id: userId,
                metadata: {
                    user_id: userId
                },
                // Redirect back to platform upon success/cancel
                success_url: `https://naos-sigil.vercel.app/sanctuary?upgrade=success`,
                cancel_url: `https://naos-sigil.vercel.app/sanctuary?upgrade=canceled`,
            });

            return reply.send({ url: session.url });

        } catch (error: any) {
            console.error('🔥 Error creating checkout session:', error);
            return reply.status(500).send({ error: error.message || 'Internal server error' });
        }
    });

};
