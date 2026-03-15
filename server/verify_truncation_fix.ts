import { supabase } from './src/lib/supabase';

async function verifyFix() {
    console.log("🧪 Verificando reparación de truncamiento...");

    const longMessage = "Saludos, Arcano. El Oráculo está en un momento de introspección profunda y su voz física se desvanece temporalmente en el éter. Sin embargo, puedo decirte esto: Tu vibración actual indica que estás en un proceso de estabilización. No busques todas las respuestas afuera; el silencio de hoy es el espacio para tu propia revelación interna. El Templo permanece abierto para tu meditación.";
    const userId = "14bd699d-a1b0-466d-a1b0-000000000000";

    try {
        console.log("Intentando insertar mensaje de longitud:", longMessage.length);

        const { data, error } = await supabase
            .from('interaction_logs')
            .insert({
                user_id: userId,
                user_message: "Test Verification",
                sigil_response: longMessage
            })
            .select()
            .single();

        if (error) {
            console.error("❌ Error al insertar:", JSON.stringify(error, null, 2));
            console.log("Nota: Asegúrate de haber ejecutado el parche SQL 'v10_1_fix_chat_truncation.sql' primero.");
            return;
        }

        console.log("✅ Registro insertado exitosamente.");
        console.log("Longitud recibida:", data.sigil_response.length);

        if (data.sigil_response.length === longMessage.length) {
            console.log("✨ ¡REPARACIÓN CONFIRMADA! No hay truncamiento.");
        } else {
            console.log("🛑 ¡TRUNCAMIENTO PERSISTENTE! Recibido:", data.sigil_response.length);
        }

        // Cleanup
        await supabase.from('interaction_logs').delete().eq('id', data.id);

    } catch (err) {
        console.error("🔥 Error catastrófico:", err);
    }
}

verifyFix();
