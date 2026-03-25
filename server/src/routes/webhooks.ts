import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { config } from '../config/env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

/**
 * Lemon Squeezy Webhook Integration
 * Handles 'subscription_created', 'subscription_updated', and 'order_created' events.
 */
export const webhookRoutes = async (app: FastifyInstance) => {
    
    // We need to capture the raw body for HMAC verification before Fastify parses it.
    app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
        try {
            const json = JSON.parse(body.toString());
            (req as any).rawBody = body; // Attach raw buffer
            done(null, json);
        } catch (err: any) {
            done(err, null);
        }
    });

    app.post('/api/webhooks/lemonsqueezy', async (request: FastifyRequest, reply: FastifyReply) => {
        const secret = config.LEMON_SQUEEZY_WEBHOOK_SECRET;
        const xSignature = request.headers['x-signature'] as string;
        const rawBody = (request as any).rawBody;

        if (!secret) {
            console.error("❌ [WEBHOOK] LEMON_SQUEEZY_WEBHOOK_SECRET is missing.");
            return reply.status(500).send({ error: 'Server configuration error' });
        }

        if (!xSignature || !rawBody) {
            console.warn("⚠️ [WEBHOOK] Unauthorized: Missing signature or body.");
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        // VERIFY CRYPTOGRAPHIC SIGNATURE
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(rawBody).digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(xSignature), Buffer.from(digest))) {
            console.error("❌ [WEBHOOK] INVALID SIGNATURE. Potential spoofing attempt.");
            return reply.status(401).send({ error: 'Invalid signature' });
        }

        const body = request.body as any;
        const eventName = body.meta.event_name;
        const customData = body.meta.custom_data;

        console.log(`🔔 [WEBHOOK] Lemon Squeezy Incident Detected: ${eventName}`);

        // Handle relevant events for 'Billion Dollar App' SCALE
        switch (eventName) {
            case 'subscription_created':
            case 'order_created':
            case 'subscription_updated': {
                const userId = customData?.user_id;
                if (!userId) {
                    console.error("❌ [WEBHOOK] Missing user_id in custom_data metadata.");
                    return reply.status(400).send({ error: 'Metadata missing' });
                }

                const attributes = body.data.attributes;
                const expiresAt = attributes.renews_at || attributes.ends_at;

                console.log(`💎 Upgrading User ${userId} to PREMIUM. Strategy: ${eventName}`);

                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        plan_type: 'premium',
                        subscription_expires_at: expiresAt,
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
            
            case 'subscription_expired':
            case 'subscription_cancelled': {
                const userId = customData?.user_id;
                if (userId) {
                    await supabaseAdmin
                        .from('profiles')
                        .update({ plan_type: 'free' })
                        .eq('id', userId);
                    console.log(`📉 [WEBHOOK] Subscription ended for User ${userId}.`);
                }
                break;
            }

            default:
                console.log(`ℹ️ [WEBHOOK] Ignored event: ${eventName}`);
        }

        return { status: 'secure_processed' };
    });
};
