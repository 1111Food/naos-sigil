import { supabase } from './src/lib/supabase';

async function purgeCorruptedSynthesis() {
    console.log("🧹 Invocando purga de Síntesis Corrupta...");

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, profile_data');

    if (error) {
        console.error("❌ Error fetching profiles:", error);
        return;
    }

    let purgedCount = 0;

    for (const profile of profiles) {
        let isCorrupt = false;

        // Check legacy JSONB
        if (profile.profile_data?.naos_identity_code) {
            const values = Object.values(profile.profile_data.naos_identity_code);
            isCorrupt = values.some((val: any) =>
                typeof val === 'string' && (
                    val.includes("Buscando equilibrio...") ||
                    val.includes("Sintonizando esencia...") ||
                    val.includes("Observando el vacío...") ||
                    val.includes("Trazando el camino...") ||
                    val.includes("Equilibrando fuerzas...")
                )
            );
        }

        if (isCorrupt) {
            console.log(`⚠️ Perfil Corrupto Detectado: ${profile.id}. Purgando...`);

            const updatedData = { ...profile.profile_data };
            delete updatedData.naos_identity_code;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    naos_identity_code: null,
                    profile_data: updatedData
                })
                .eq('id', profile.id);

            if (updateError) {
                console.error(`❌ Fallo al purgar ${profile.id}:`, updateError);
            } else {
                console.log(`✅ Purgado exitosamente: ${profile.id}`);
                purgedCount++;
            }
        }
    }

    console.log(`\n✨ Purga Completada. ${purgedCount} núcleos liberados.`);
}

purgeCorruptedSynthesis();
