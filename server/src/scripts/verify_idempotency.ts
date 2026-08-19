import { supabase } from './lib/supabase';
import fs from 'fs';
import crypto from 'crypto';

async function verifyIdempotency() {
    const log: string[] = [];
    const logger = (msg: string) => {
        console.log(msg);
        log.push(msg);
    };

    logger("--- Initializing NEW Deterministic UUID Lock Simulation ---");
    const { data: firstUser, error: fetchErr } = await supabase.from('profiles').select('id, profile_data').limit(1).single();
    if (fetchErr || !firstUser) {
        logger("No users found in database: " + JSON.stringify(fetchErr));
        fs.writeFileSync('verification_results.log', log.join('\n'));
        return;
    }
    const testUserId = firstUser.id;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Generate the same lock ID as the cron
    const lockString = `ORACLE_LOCK:${testUserId}:${todayStr}`;
    const hash = crypto.createHash('sha1').update(lockString).digest('hex');
    const lockId = `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-a${hash.substring(17,20)}-${hash.substring(20,32)}`;
    
    logger("Testing with User ID: " + testUserId);
    logger("Deterministic Lock ID: " + lockId);
    
    // 1. Cleanup ANY existing lock for today to allow fresh test
    logger("Cleaning up existing locks for today...");
    await supabase.from('interaction_logs').delete().eq('id', lockId);

    logger("Launching 3 concurrent claim attempts...");
    
    const attempt = async (instanceId: number) => {
        logger(`INSTANCE_${instanceId}: Attempting atomic insert of lock ID...`);
        const { error: claimError } = await supabase.from('interaction_logs').insert({
            id: lockId,
            user_id: testUserId,
            user_message: `[ORACLE_TRIGGER_DAILY: ${todayStr}]`,
            sigil_response: 'Processing...'
        });

        if (claimError) {
            if ((claimError as any).code === '23505' || (claimError as any).code === 'PGRST23505') {
                return `INSTANCE_${instanceId}: SKIPPED_ALREADY_CLAIMED (Unique Constraint Violation)`;
            }
            return `INSTANCE_${instanceId}: ERROR: ${JSON.stringify(claimError)}`;
        }
        return `INSTANCE_${instanceId}: SUCCESS_CLAIMED`;
    };

    const results = await Promise.all([
        attempt(1),
        attempt(2),
        attempt(3)
    ]);
    
    logger("Final Results List:");
    results.forEach(r => logger(" - " + r));
    
    const successCount = results.filter(r => r.includes("SUCCESS_CLAIMED")).length;
    if (successCount === 1) {
        logger("✅ IDEMPOTENCY VERIFIED: Only 1 instance succeeded in acquiring the lock.");
    } else {
        logger(`❌ FAILURE: ${successCount} instances succeeded! (Expected 1)`);
    }

    fs.writeFileSync('verification_results.log', log.join('\n'));
}

verifyIdempotency();
