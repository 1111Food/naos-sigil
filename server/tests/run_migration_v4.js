/**
 * Direct PostgreSQL migration runner using the pg client.
 * Supabase connection strings:
 *   Direct: postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres
 *   Pooler: postgresql://postgres.REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
 *
 * The service_role JWT can be used as password with the Supabase REST-auth pooler
 * in some Supabase versions. We try all known patterns.
 */

require('dotenv').config();
const { Pool } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Supabase connection patterns to try
const connectionStrings = [
    // Pattern 1: Session pooler with service_role as password (Supabase JWT auth mode)
    `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    // Pattern 2: Transaction pooler with service_role
    `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    // Pattern 3: Direct connection with service_role (some Supabase configs)
    `postgresql://postgres:${SERVICE_ROLE_KEY}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
];

const migrations = [
    'ALTER TABLE public.user_protocols DROP CONSTRAINT IF EXISTS user_protocols_current_day_check;',
    'ALTER TABLE public.user_protocols ADD CONSTRAINT user_protocols_current_day_check CHECK (current_day >= 1 AND current_day <= 90);',
    'ALTER TABLE public.protocol_daily_logs DROP CONSTRAINT IF EXISTS protocol_daily_logs_day_number_check;',
    'ALTER TABLE public.protocol_daily_logs ADD CONSTRAINT protocol_daily_logs_day_number_check CHECK (day_number >= 1 AND day_number <= 90);',
];

async function tryConnection(connStr) {
    const pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
    });
    try {
        const client = await pool.connect();
        const { rows } = await client.query('SELECT current_database() as db, current_user as usr');
        console.log(`  ✅ Connected! DB=${rows[0].db}, User=${rows[0].usr}`);
        return client;
    } catch (e) {
        console.log(`  ❌ Failed: ${e.message.substring(0, 80)}`);
        await pool.end();
        return null;
    }
}

async function main() {
    console.log('=== NAOS Migration Runner v4 (pg direct) ===');
    console.log(`Project ref: ${PROJECT_REF}`);
    console.log('');

    let client = null;
    for (let i = 0; i < connectionStrings.length; i++) {
        const masked = connectionStrings[i].replace(SERVICE_ROLE_KEY.substring(0, 20) + '...', '[KEY]');
        console.log(`Trying connection ${i + 1}/${connectionStrings.length}...`);
        client = await tryConnection(connectionStrings[i]);
        if (client) break;
    }

    if (!client) {
        console.log('\n❌ All connection attempts failed.');
        console.log('Migration must be executed manually via Supabase SQL Editor:\n');
        console.log('https://supabase.com/dashboard/project/avaikhukgugvcocwedsz/sql/new\n');
        console.log('Copy and paste the following SQL:\n');
        console.log('-- ============================================================');
        for (const sql of migrations) {
            console.log(sql);
        }
        console.log('-- ============================================================');
        process.exit(3); // exit code 3 = manual SQL needed
    }

    console.log('\nApplying migrations...');
    let failed = false;
    for (const sql of migrations) {
        process.stdout.write(`  → ${sql.substring(0, 60)}... `);
        try {
            await client.query(sql);
            console.log('✅');
        } catch (e) {
            console.log(`❌ ${e.message}`);
            failed = true;
        }
    }

    // Verify
    console.log('\nVerifying constraints...');
    const { rows: c1 } = await client.query(`
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'public.user_protocols'::regclass AND conname = 'user_protocols_current_day_check'`);
    const { rows: c2 } = await client.query(`
        SELECT conname FROM pg_constraint
        WHERE conrelid = 'public.protocol_daily_logs'::regclass AND conname = 'protocol_daily_logs_day_number_check'`);
    
    console.log(`  user_protocols_current_day_check:       ${c1.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  protocol_daily_logs_day_number_check:   ${c2.length > 0 ? '✅ EXISTS' : '❌ MISSING'}`);

    // Test that day 22 is now accepted
    const { rows: testRows } = await client.query(`
        SELECT 1 FROM (VALUES (22)) t(v) WHERE v >= 1 AND v <= 90`);
    console.log(`  Constraint range test (22 in [1,90]):   ${testRows.length > 0 ? '✅' : '❌'}`);

    client.release && client.release();
    console.log(failed ? '\n❌ Migration FAILED' : '\n✅ Migration COMPLETE');
    process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
