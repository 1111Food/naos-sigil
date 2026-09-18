import fs from 'fs';

let content = fs.readFileSync('server/src/routes/admin.ts', 'utf8');

const searchDelete = `    app.delete<{ Params: { id: string } }>('/users/:id', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { id } = req.params;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Necesito tu Llave Maestra (Service Role Key) en el .env del servidor para borrar identidades de Supabase." });
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);`;

const replaceDelete = `    app.delete<{ Params: { id: string } }>('/users/:id', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { id } = req.params;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Necesito tu Llave Maestra (Service Role Key) en el .env del servidor para borrar identidades de Supabase." });
            }

            // Protect Founder
            const { data: userToDelete } = await supabaseAdmin.auth.admin.getUserById(id);
            if (userToDelete?.user?.email === 'luisalfredoherreramendez@gmail.com') {
                return reply.status(403).send({ error: "Cannot delete the Founder." });
            }

            const { error } = await supabaseAdmin.auth.admin.deleteUser(id);`;

content = content.replace(searchDelete, replaceDelete);

const searchDemote = `    app.post<{ Body: { email: string, role: string } }>('/api/admin/set-role', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { email, role } = req.body;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." });
            }

            const { error } = await supabaseAdmin.from('profiles').update({ plan_type: role }).eq('email', email);`;

const replaceDemote = `    app.post<{ Body: { email: string, role: string } }>('/api/admin/set-role', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { email, role } = req.body;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." });
            }

            // Protect Founder from demotion
            if (email === 'luisalfredoherreramendez@gmail.com' && role !== 'admin') {
                return reply.status(403).send({ error: "Cannot demote the Founder." });
            }

            const { error } = await supabaseAdmin.from('profiles').update({ plan_type: role }).eq('email', email);`;

content = content.replace(searchDemote, replaceDemote);

// Add invite route
const searchUsersGet = `    app.get('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {`;
const replaceUsersGet = `    // Create user via invitation
    app.post<{ Body: { email: string, name: string } }>('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {
        const { email, name } = req.body;
        try {
            if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return reply.status(400).send({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." });
            }

            // Send invite via Supabase Auth
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: { full_name: name, plan_type: 'free' },
                redirectTo: 'https://naos-os.com/auth/callback'
            });

            if (error) throw error;
            
            // Note: Supabase will create the auth.users record. The trigger will create the profiles record.
            return { success: true, user: data.user };
        } catch (err: any) {
             return reply.status(500).send({ error: err.message });
        }
    });

    app.get('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {`;

content = content.replace(searchUsersGet, replaceUsersGet);

fs.writeFileSync('server/src/routes/admin.ts', content);
console.log("Admin routes updated with protection and invite");
