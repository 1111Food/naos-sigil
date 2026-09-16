import { supabaseAdmin } from '../src/lib/supabaseadmin';
import { MayaMathV1 } from '../src/modules/maya/MayaMathV1';
import { ArchetypeEngine } from '../src/modules/user/archetypeEngine';
import { NAWALES } from '../src/utils/mayaCalculator';
import { NaosCompilerService } from '../src/modules/user/naosCompiler.service';
import { UserService } from '../src/modules/user/service';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const EXPECTED_BLAST_RADIUS = 4;
const isApply = process.argv.includes('--apply');
const isConfirmed = process.argv.includes('--confirm-production-maya-migration');

async function run() {
    console.log(`TARGET_ENVIRONMENT: ${process.env.SUPABASE_URL}`);
    console.log(`MIGRATION_MODE: ${isApply ? 'APPLY' : 'DRY_RUN'}`);

    if (isApply && !isConfirmed) {
        console.error("ABORT: --apply requires --confirm-production-maya-migration");
        process.exit(1);
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: dcs } = await supabaseAdmin.from('daily_cosmic_states').select('date_utc');
    const { data: ues } = await supabaseAdmin.from('user_energy_snapshots').select('snapshot_date');
    
    let currentFutureDaily = 0;
    if (dcs) currentFutureDaily += dcs.filter(r => r.date_utc >= today).length;
    if (ues) currentFutureDaily += ues.filter(r => r.snapshot_date >= today).length;

    if (currentFutureDaily > 0) {
        console.error(`ABORT: Found ${currentFutureDaily} current/future daily records. Blast radius changed.`);
        process.exit(1);
    }

    let profilesScanned = 0;
    let profilesSkipped = 0;
    let affectedProfiles: any[] = [];
    
    let start = 0;
    const limit = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('id, birth_date, profile_data, language')
            .range(start, start + limit - 1);

        if (error || !profiles || profiles.length === 0) {
            hasMore = false;
            break;
        }

        for (const p of profiles) {
            profilesScanned++;
            if (!p.birth_date) {
                profilesSkipped++;
                continue;
            }

            const canonical = MayaMathV1.calculate({ localDate: p.birth_date });
            const legacyKey = canonical.canonicalNawalKey === "I'x" ? "Ix" : canonical.canonicalNawalKey;
            
            const newNawalIdx = NAWALES.findIndex((n: any) => n.name === legacyKey);
            const newColor = ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(newNawalIdx + 2) % 4];

            if (p.profile_data && p.profile_data.naos_identity_code) {
                const existingArchetype = p.profile_data.naos_identity_code.arquetipo?.nombre;
                
                const mockProfile = { ...p.profile_data, mayan: { color: newColor } };
                try {
                    const archNew = ArchetypeEngine.calculate(mockProfile, p.language || 'es');
                    if (existingArchetype !== archNew.nombre) {
                        affectedProfiles.push({ profile: p, newArchetype: archNew.nombre });
                    }
                } catch (e) {
                }
            }
        }
        start += limit;
    }

    console.log(`PROFILES_SCANNED: ${profilesScanned}`);
    console.log(`PROFILES_AFFECTED: ${affectedProfiles.length}`);

    if (affectedProfiles.length > EXPECTED_BLAST_RADIUS) {
        console.error(`ABORT: Affected profiles (${affectedProfiles.length}) exceeds expected radius (${EXPECTED_BLAST_RADIUS}).`);
        process.exit(1);
    }

    if (!isApply) {
        console.log("Dry run complete. No mutations performed.");
        return;
    }

    console.log("Starting production apply...");
    
    const rollbackFile = path.resolve(__dirname, 'migration_rollback.json');
    const rollbackData = affectedProfiles.map(a => ({
        id: a.profile.id,
        identity: a.profile.profile_data?.naos_identity_code,
        timestamp: new Date().toISOString()
    }));
    fs.writeFileSync(rollbackFile, JSON.stringify(rollbackData, null, 2));
    console.log(`Saved rollback state to ${rollbackFile}`);

    for (const { profile, newArchetype } of affectedProfiles) {
        console.log(`Migrating ${profile.id}... Target Archetype: ${newArchetype}`);
        
        const canonical16 = ["El Catalizador", "El Forjador", "El Regente Central", "El Vector", 
                             "El Optimizador", "El Custodio", "El Ancla", "El Arquitecto", 
                             "El Ingeniero de Paradigmas", "El Decodificador", "El Nodo", "El Observador",
                             "El Transmutador", "El Sismógrafo", "El Espejo", "El Navegante"];
                             
        const canonicalEn = ["The Catalyst", "The Forger", "The Central Regent", "The Vector", 
                             "The Optimizer", "The Custodian", "The Anchor", "The Architect", 
                             "The Paradigm Engineer", "The Decoder", "The Node", "The Observer",
                             "The Transmuter", "The Seismograph", "The Mirror", "The Navigator"];
                             
        if (!canonical16.includes(newArchetype) && !canonicalEn.includes(newArchetype)) {
            console.error(`ABORT: Target archetype ${newArchetype} not in Canonical 16!`);
            process.exit(1);
        }

        try {
            await NaosCompilerService.compile(profile.id, true, profile.language || 'es');
            console.log(`Compiled and persisted new identity for ${profile.id}.`);
        } catch (e: any) {
            console.error(`Failed to compile ${profile.id}: ${e.message}`);
            console.log(`Stopping migration to preserve isolation.`);
            process.exit(1);
        }

        if ((UserService as any).profilesCache && (UserService as any).profilesCache[profile.id]) {
            delete (UserService as any).profilesCache[profile.id];
        }

        const offsetHours = profile.profile_data?.utcOffset || 0;
        
        const { error: delErr } = await supabaseAdmin
            .from('user_energy_snapshots')
            .delete()
            .eq('user_id', profile.id)
            .gte('snapshot_date', today);
            
        if (delErr) {
            console.error(`Warning: Failed to invalidate energy snapshots for ${profile.id}:`, delErr);
        }
    }
    
    console.log("Migration complete.");
}

run().catch(console.error);