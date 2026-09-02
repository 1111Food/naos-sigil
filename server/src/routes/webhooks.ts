import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { config } from '../config/env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const stripe = config.STRIPE_SECRET_KEY 
    ? new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any }) 
    : null;

/**
 * Stripe Webhook Integration - STRIPE GO-LIVE TEST SUITE
 * Robust, secure, and idempotent.
 */
export const webhookRoutes = async (app: FastifyInstance) => {
    
    app.post('/api/webhooks/stripe', async (request: FastifyRequest, reply: FastifyReply) => {
        const secret = config.STRIPE_WEBHOOK_SECRET;
        const sig = request.headers['stripe-signature'] as string;
        
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
            // VERIFY CRYPTOGRAPHIC SIGNATURE (Test 05: Signature validation)
            event = stripe.webhooks.constructEvent(rawBody, sig, secret);
        } catch (err: any) {
            console.error(`❌ [WEBHOOK] Error verifying Stripe signature: ${err.message}`);
            return reply.status(400).send({ error: `Webhook Error: ${err.message}` });
        }

        console.log(`🔔 [WEBHOOK] Stripe Event Detected: ${event.type}`);

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    
                    // Source of truth: Backend metadata or client_reference_id
                    let userId = session.client_reference_id || session.metadata?.user_id;
                    const customerEmail = session.customer_details?.email || session.customer_email;
                    const stripeCustomerId = session.customer as string;
                    const stripeSubscriptionId = session.subscription as string;
                    
                    if (!userId && customerEmail) {
                        // Fallback by email only if ID was lost, but still bind customer ID
                        const { data } = await supabaseAdmin.from('profiles').select('id').eq('email', customerEmail).single();
                        if (data) userId = data.id;
                    }

                    if (!userId && !customerEmail) {
                        console.error("❌ [WEBHOOK] Missing user_id and email in session metadata.");
                        return reply.status(400).send({ error: 'Metadata missing' });
                    }

                    const is3DayPlan = session.metadata?.plan_mode === '3days';
                    const expiresAt = new Date();
                    
                    if (is3DayPlan) {
                        expiresAt.setTime(expiresAt.getTime() + 3 * 24 * 60 * 60 * 1000); 
                        console.log(`⚡ [WEBHOOK] 3-Day Plan activated. Expires: ${expiresAt.toISOString()}`);
                    } else {
                        expiresAt.setFullYear(expiresAt.getFullYear() + 10); 
                        console.log(`🔥 [WEBHOOK] Upgrading to PREMIUM. Strategy: checkout.session.completed`);
                    }

                    // ROBUST UPDATE (Test 06: DB Update)
                    // We save stripe_customer_id and stripe_subscription_id for bulletproof future operations
                    const updatePayload = {
                        plan_type: 'premium',
                        subscription_expires_at: expiresAt.toISOString(),
                        stripe_customer_id: stripeCustomerId,
                        stripe_subscription_id: stripeSubscriptionId,
                        updated_at: new Date().toISOString()
                    };

                    if (userId) {
                        const { error } = await supabaseAdmin
                            .from('profiles')
                            .update(updatePayload)
                            .eq('id', userId);
                            
                        if (error) throw new Error(`Supabase Update Error: ${error.message}`);
                        console.log(`✅ [SUCCESS] User ${userId} is now a Premium Architect.`);
                    } else if (customerEmail) {
                        const { error } = await supabaseAdmin
                            .from('profiles')
                            .update(updatePayload)
                            .eq('email', customerEmail);
                            
                        if (error) throw new Error(`Supabase Update by Email Error: ${error.message}`);
                        console.log(`✅ [SUCCESS] Email ${customerEmail} is marked as Premium (pending registration).`);
                    }

                    break;
                }
                
                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const customerId = subscription.customer as string;
                    const subscriptionId = subscription.id;
                    
                    console.log(`⚠️ [WEBHOOK] Subscription deleted: ${subscriptionId} for customer ${customerId}`);

                    // Idempotent and Secure Downgrade (Tests 09-12)
                    // Only downgrade if the deleted subscription matches the current active subscription in DB
                    // This prevents downgrading if the user just switched to a NEW subscription
                    const { data: users, error: fetchErr } = await supabaseAdmin
                        .from('profiles')
                        .select('id, email, stripe_subscription_id')
                        .eq('stripe_customer_id', customerId);

                    if (fetchErr) throw new Error(`Error fetching user by stripe_customer_id: ${fetchErr.message}`);

                    if (users && users.length > 0) {
                        for (const user of users) {
                            if (user.stripe_subscription_id === subscriptionId) {
                                const { error: updateErr } = await supabaseAdmin
                                    .from('profiles')
                                    .update({ 
                                        plan_type: 'free', 
                                        stripe_subscription_id: null,
                                        updated_at: new Date().toISOString() 
                                    })
                                    .eq('id', user.id);
                                
                                if (updateErr) throw new Error(`Error degrading user ${user.id}`);
                                console.log(`📉 [SUCCESS] User ${user.email} degraded to free. Subscription terminated.`);
                            } else {
                                console.log(`⏭️ [WEBHOOK] Ignoring deletion: User ${user.email} has a different active subscription.`);
                            }
                        }
                    } else {
                        console.log(`❓ [WEBHOOK] Customer ${customerId} not found in DB. Nothing to downgrade.`);
                    }
                    break;
                }

                case 'invoice.payment_failed': {
                    const invoice = event.data.object as any; // Bypass strict typing for Stripe Invoice to extract IDs safely
                    const customerId = invoice.customer as string;
                    const subscriptionId = invoice.subscription as string;
                    
                    if (customerId && subscriptionId) {
                        const { data: users, error: fetchErr } = await supabaseAdmin
                            .from('profiles')
                            .select('id, email, stripe_subscription_id')
                            .eq('stripe_customer_id', customerId);

                        if (!fetchErr && users) {
                            for (const user of users) {
                                if (user.stripe_subscription_id === subscriptionId) {
                                    await supabaseAdmin
                                        .from('profiles')
                                        .update({ 
                                            plan_type: 'free', 
                                            updated_at: new Date().toISOString() 
                                        })
                                        .eq('id', user.id);
                                    console.log(`⚠️ [WEBHOOK] Payment failed. Degraded ${user.email} to free.`);
                                }
                            }
                        }
                    }
                    break;
                }

                default:
                    console.log(`ℹ️ [WEBHOOK] Unhandled event type: ${event.type}`);
            }

            return reply.status(200).send({ received: true });
        } catch (err) {
            console.error("🚨 [WEBHOOK] Fatal error processing webhook:", err);
            // We return 500 so Stripe KNOWS it failed and retries later (Recovery/Reliability)
            return reply.status(500).send({ error: 'Webhook processing failed' });
        }
    });
};
