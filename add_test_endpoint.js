const fs = require('fs');

let content = fs.readFileSync('server/src/routes/admin.ts', 'utf8');

const injectImports = `import { sendProactiveMessage } from '../modules/sigil/telegramService';`;
if (!content.includes('sendProactiveMessage')) {
    content = content.replace(`import { config } from '../config/env';`, `import { config } from '../config/env';\nimport { sendProactiveMessage } from '../modules/sigil/telegramService';`);
}

const searchAdminTest = `    app.get('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {`;
const replaceAdminTest = `    app.post('/api/admin/telegram-test', { preHandler: [requireAdmin] }, async (req, reply) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader!.replace('Bearer ', '');
            const { data: { user } } = await supabaseAdmin.auth.getUser(token);
            
            if (user?.email !== 'luisalfredoherreramendez@gmail.com') {
                return reply.status(403).send({ error: "Only the founder can send test messages." });
            }

            const { data: profile } = await supabaseAdmin.from('profiles').select('telegram_chat_id').eq('id', user.id).single();
            if (!profile?.telegram_chat_id) {
                return reply.status(400).send({ error: "No tienes Telegram vinculado." });
            }

            const success = await sendProactiveMessage(
                profile.telegram_chat_id, 
                "Prueba Operacional NAOS. Enlace de Telegram activo. (Este mensaje fue disparado desde el Panel de Administración)"
            );

            if (success) {
                return { success: true };
            } else {
                return reply.status(500).send({ error: "Error enviando el mensaje a Telegram." });
            }
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

    app.get('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {`;

content = content.replace(searchAdminTest, replaceAdminTest);
fs.writeFileSync('server/src/routes/admin.ts', content);
console.log("Added telegram test endpoint");
