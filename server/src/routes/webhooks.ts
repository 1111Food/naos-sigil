import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { config } from '../config/env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const stripe = config.STRIPE_SECRET_KEY 
    ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any }) 
    : null;

/**
 * Stripe Webhook Integration
 * Handles 'checkout.session.completed' and 'customer.subscription.deleted' events.
 */
export const webhookRoutes = async (app: FastifyInstance) => {
    
    app.post('/api/webhooks/stripe', async (request: FastifyRequest, reply: FastifyReply) => {
        const secret = config.STRIPE_WEBHOOK_SECRET;
        const sig = request.headers['stripe-signature'] as string;
        
        // Fastify-raw-body attaches raw body buffer to request.rawBody
        const rawBody = (request as any).rawBody;

        if (!secret || !stripe) {
            console.error("❌ [WEBHOOK] STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is missing.");
            return reply.status(500).send({ error: 'Server configuration error' });
        }

        if (!sig || !rawBody) {
            console.warn("⚠️ [WEBHOOK] Unauthorized: Missing signature or body.");
            return reply.status(400).send({ error: 'Missing signature or body' });
        }

        let event: Stripe.Event;

        try {
            // VERIFY CRYPTOGRAPHIC SIGNATURE
            event = stripe.webhooks.constructEvent(rawBody, sig, secret);
        } catch (err: any) {
            console.error(`❌ [WEBHOOK] Error verifying Stripe signature: ${err.message}`);
            return reply.status(400).send({ error: `Webhook Error: ${err.message}` });
        }

        console.log(`🔔 [WEBHOOK] Stripe Event Detected: ${event.type}`);

        try {
            // Handle relevant events for subscription provisioning
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    
                    // We passed user_id in client_reference_id and metadata
                    const userId = session.client_reference_id || session.metadata?.user_id;
                    
                    if (!userId) {
                        console.error("❌ [WEBHOOK] Missing user_id in session metadata.");
                        return reply.status(400).send({ error: 'Metadata missing' });
                    }

                    console.log(`💎 Upgrading User ${userId} to PREMIUM. Strategy: checkout.session.completed`);

                    // Set expires_at to 1 year or 1 month in the future, or rely on Stripe's subscription updates
                    // For now, setting a very long time, Stripe handles rebilling
                    const expiresAt = new Date();
                    expiresAt.setFullYear(expiresAt.getFullYear() + 10);

                    const { error } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            plan_type: 'premium',
                            subscription_expires_at: expiresAt.toISOString(),
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', userId);

                    if (error) {
                        console.error("❌ [WEBHOOK] Supabase Update Error:", error.message);
                        return reply.status(500).send({ error: 'DB update failed' });
                    }

                    console.log(`🚀 [SUCCESS] User ${userId} is now a Premium Architect.`);
                    break;
                }
                
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const customerId = subscription.customer as string;
                    
                    try {
                        // Fetch the customer from Stripe to get their email
                        const customer = await stripe.customers.retrieve(customerId);
                        if (customer && !customer.deleted) {
                            const email = (customer as Stripe.Customer).email;
                            if (email) {
                                const { error } = await supabaseAdmin
                                    .from('profiles')
                                    .update({ plan_type: 'free', updated_at: new Date().toISOString() })
                                    .eq('email', email);
                                
                                if (error) throw error;
                                console.log(`📉 [WEBHOOK] Subscription deleted. Degraded ${email} to free.`);
                            }
                        }
                    } catch (e) {
                        console.error("❌ [WEBHOOK] Error degrading user on subscription deletion:", e);
                    }
                    break;
                }

                case 'invoice.payment_failed': {
                    const invoice = event.data.object as Stripe.Invoice;
                    const email = invoice.customer_email;
                    
                    if (email) {
                        try {
                            const { error } = await supabaseAdmin
                                .from('profiles')
                                .update({ plan_type: 'free', updated_at: new Date().toISOString() })
                                .eq('email', email);
                            
                            if (error) throw error;
                            console.log(`⚠️ [WEBHOOK] Payment failed. Degraded ${email} to free.`);
                        } catch (e) {
                            console.error("❌ [WEBHOOK] Error degrading user on payment failure:", e);
                        }
                    } else {
                        console.warn(`⚠️ [WEBHOOK] Payment failed but no email found in invoice: ${invoice.id}`);
                    }
                    break;
                }

                default:
                    console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event.type}`);
            }

            return reply.status(200).send({ received: true });
        } catch (err) {
            console.error("🔥 [WEBHOOK] Fatal error processing webhook:", err);
            return reply.status(500).send({ error: 'Webhook processing failed' });
        }
    });
};
