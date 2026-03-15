import { supabase } from './src/lib/supabase';

async function diagnoseTruncation() {
    console.log("🧪 Diagnosticando truncamiento en interaction_logs...");

    const longMessage = "A".repeat(500);
    const userId = "14bd699d-a1b0-466d-a1b0-000000000000"; // Valid profile ID

    try {
        const { data, error } = await supabase
            .from('interaction_logs')
            .insert({
                user_id: userId,
                user_message: "Test Truncation",
                sigil_response: longMessage
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Error al insertar:", JSON.stringify(error, null, 2));
            return;
        }

        console.log("✅ Registro insertado.");
        console.log("Longitud enviada:", longMessage.length);
        console.log("Longitud recibida:", data.sigil_response.length);

        if (data.sigil_response.length < longMessage.length) {
            console.log("🛑 ¡TRUNCAMIENTO DETECTADO! La base de datos recortó el mensaje.");
        } else {
            console.log("✨ No se detectó truncamiento en la inserción directa.");
        }

        // Cleanup
        await supabase.from('interaction_logs').delete().eq('id', data.id);

    } catch (err) {
        console.error("🔥 Error catastrófico:", err);
    }
}

diagnoseTruncation();
