import { supabaseAdmin } from '../src/lib/supabaseadmin';
import { MayanCalculator } from '../src/utils/mayaCalculator';
import { MayaMathV1 } from '../src/modules/maya/MayaMathV1';
import { ArchetypeEngine } from '../src/modules/user/archetypeEngine';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const NAWALES = [
    { name: "B'atz'" }, { name: "E" }, { name: "Aj" }, { name: "Ix" }, { name: "Tz'ikin" },
    { name: "Ajmaq" }, { name: "No'j" }, { name: "Tijax" }, { name: "Kawoq" }, { name: "Ajpu" },
    { name: "Imox" }, { name: "Iq'" }, { name: "Aq'ab'al" }, { name: "K'at" }, { name: "Kan" },
    { name: "Kame" }, { name: "Kej" }, { name: "Q'anil" }, { name: "Toj" }, { name: "Tz'i'" }
];

async function run() {
    console.log(`TARGET_ENVIRONMENT: ${process.env.SUPABASE_URL}`);
    console.log(`MIGRATION_MODE: DRY_RUN`);
    
    // Check tables for cosmic states and energy snapshots
    const { count: dailyCosmicStatesCount } = await supabaseAdmin.from('daily_cosmic_states').select('*', { count: 'exact', head: true });
    const { count: userEnergySnapshotsCount } = await supabaseAdmin.from('user_energy_snapshots').select('*', { count: 'exact', head: true });

    let profilesScanned = 0;
    let profilesSkipped = 0;
    let validBirthDates = 0;
    let storedNatalMayaMatch = 0;
    let storedNatalMayaMismatch = 0;
    let storedNatalToneMatch = 0;
    let storedNatalToneMismatch = 0;
    let backendNawalDifferences = 0;
    let backendToneDifferences = 0;
    
    let mayaColorChanged = 0;
    let mayaElementContributionChanged = 0;
    let elementScoreChangedUsers = 0;
    let elementScoreUnchangedUsers = 0;
    let archetypeChangedUsers = 0;
    let archetypeUnchangedUsers = 0;
    let nonCanonicalArchetypeGenerated = 0;
    let patternSourceContextChanged = 0;
    let identityRecompileRequired = 0;

    let archetypeTransitions: Record<string, number> = {};

    let hasMore = true;
    let start = 0;
    const limit = 1000;

    while (hasMore) {
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('id, birth_date, mayan, profile_data, language')
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
            validBirthDates++;

            const lang = p.language || 'es';

            // Current stored Maya
            const stored = p.mayan;
            // Canonical Maya directly from Math V1
            const canonical = MayaMathV1.calculate({ localDate: p.birth_date });
            // Legacy backend Maya (simulate the BUG mathematically)
            // The bug was D-1, so we simulate legacy output manually for comparison:
            const [year, month, day] = p.birth_date.split('-').map(Number);
            let y = year; let m = month;
            if (m < 3) { y -= 1; m += 12; }
            const a = Math.floor(y / 100); const b = 2 - a + Math.floor(a / 4);
            const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
            const tzolkinDays = Math.floor(jd - 584283);
            const legacyNawalIdx = ((tzolkinDays + 9) % 20 + 20) % 20;
            const legacyTone = ((tzolkinDays + 3) % 13 + 13) % 13 + 1;
            const legacyNawal = NAWALES[legacyNawalIdx].name;

            // 1. Check if stored matches Canonical (Frontend Math was right?)
            let legacyKeyStored = stored?.kicheName === 'Ix' ? "I'x" : stored?.kicheName;
            
            if (legacyKeyStored === canonical.canonicalNawalKey) {
                storedNatalMayaMatch++;
            } else {
                storedNatalMayaMismatch++;
            }
            if (stored?.tone === canonical.tone) {
                storedNatalToneMatch++;
            } else {
                storedNatalToneMismatch++;
            }

            // 2. Check if legacy backend differed from canonical
            if (legacyNawal !== canonical.canonicalNawalKey && !(legacyNawal === 'Ix' && canonical.canonicalNawalKey === "I'x")) {
                backendNawalDifferences++;
            }
            if (legacyTone !== canonical.tone) {
                backendToneDifferences++;
            }

            // 3. Archetype re-evaluation logic
            // The backend compiled Identity using the legacy calc.
            // Let's re-run old vs new
            const oldColor = ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(legacyNawalIdx + 2) % 4];
            
            const newNawalIdx = NAWALES.findIndex(n => n.name === (canonical.canonicalNawalKey === "I'x" ? "Ix" : canonical.canonicalNawalKey));
            const newColor = ['Rojo', 'Blanco', 'Azul', 'Amarillo'][(newNawalIdx + 2) % 4];

            if (oldColor !== newColor) {
                mayaColorChanged++;
                mayaElementContributionChanged++;
            }

            // Mock minimal profile to evaluate score changes
            if (p.profile_data) {
                const oldProfile = { ...p.profile_data, mayan: { color: oldColor } };
                const newProfile = { ...p.profile_data, mayan: { color: newColor } };

                try {
                    const archOld = ArchetypeEngine.calculate(oldProfile, lang);
                    const archNew = ArchetypeEngine.calculate(newProfile, lang);

                    const oldScoreStr = JSON.stringify(archOld.assignment_v2?.elementScores || {});
                    const newScoreStr = JSON.stringify(archNew.assignment_v2?.elementScores || {});

                    if (oldScoreStr !== newScoreStr) {
                        elementScoreChangedUsers++;
                        identityRecompileRequired++;
                        patternSourceContextChanged++;
                    } else {
                        elementScoreUnchangedUsers++;
                    }

                    if (archOld.nombre !== archNew.nombre) {
                        archetypeChangedUsers++;
                        const trans = `${archOld.nombre} -> ${archNew.nombre}`;
                        archetypeTransitions[trans] = (archetypeTransitions[trans] || 0) + 1;
                    } else {
                        archetypeUnchangedUsers++;
                    }
                } catch (e) {
                    // Profile data missing required astro/num fields, skip archetype eval
                }
            }
        }
        start += limit;
    }

    console.log(`\nPROFILES_SCANNED: ${profilesScanned}`);
    console.log(`PROFILES_WITH_VALID_BIRTH_DATE: ${validBirthDates}`);
    console.log(`PROFILES_SKIPPED: ${profilesSkipped}`);
    
    console.log(`STORED_NATAL_MAYA_MATCH_CANONICAL: ${storedNatalMayaMatch}`);
    console.log(`STORED_NATAL_MAYA_MISMATCH: ${storedNatalMayaMismatch}`);
    console.log(`STORED_NATAL_TONE_MISMATCH: ${storedNatalToneMismatch}`);

    console.log(`BACKEND_NAWAL_DIFFERENCES: ${backendNawalDifferences}`);
    console.log(`BACKEND_TONE_DIFFERENCES: ${backendToneDifferences}`);

    console.log(`MAYA_COLOR_CHANGED: ${mayaColorChanged}`);
    console.log(`MAYA_ELEMENT_CONTRIBUTION_CHANGED: ${mayaElementContributionChanged}`);

    console.log(`ELEMENT_SCORE_CHANGED_USERS: ${elementScoreChangedUsers}`);
    console.log(`ELEMENT_SCORE_UNCHANGED_USERS: ${elementScoreUnchangedUsers}`);

    console.log(`ARCHETYPE_CHANGED_USERS: ${archetypeChangedUsers}`);
    console.log(`ARCHETYPE_UNCHANGED_USERS: ${archetypeUnchangedUsers}`);
    console.log(`ARCHETYPE_TRANSITION_COUNTS:`, archetypeTransitions);
    console.log(`NON_CANONICAL_ARCHETYPE_GENERATED: ${nonCanonicalArchetypeGenerated}`);
    
    console.log(`IDENTITY_RECOMPILE_REQUIRED_COUNT: ${identityRecompileRequired}`);
    console.log(`PATTERN_SOURCE_CONTEXT_CHANGED_COUNT: ${patternSourceContextChanged}`);
    
    console.log(`DAILY_COSMIC_STATES_WOULD_INVALIDATE: ${dailyCosmicStatesCount || 0}`);
    console.log(`ENERGY_SNAPSHOTS_WOULD_INVALIDATE: ${userEnergySnapshotsCount || 0}`);
    console.log(`PROFILE_CACHE_INVALIDATION_REQUIRED_COUNT: ${identityRecompileRequired}`);
}

run().catch(console.error);