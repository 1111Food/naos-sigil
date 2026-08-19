import { sendProactiveMessage } from './modules/sigil/telegramService';
async function run() {
    const result = await sendProactiveMessage('166709600', '✅ [SISTEMA Sincronizado]: Luis, he detectado y unificado 4 perfiles duplicados que estaban causando interferencia en tus notificaciones. A partir de ahora, todo está centralizado en un solo código. Realiza un REFRESH en la App.');
    console.log('Delivery Result:', result);
}
run();
