const fs = require('fs');
let content = fs.readFileSync('server/src/routes/admin.ts', 'utf8');

const searchRequireAdmin = `        const userEmail = (user.email || '').toLowerCase();
        if (userEmail !== 'luisalfredoherreramendez@gmail.com' && !userEmail.includes('luisalfredoherreramendez') && !userEmail.includes('luis.herrera')) {
             const { data: profile } = await supabaseAdmin.from('profiles').select('plan_type').eq('id', user.id).single();
             if (profile?.plan_type !== 'admin') {
                 return reply.status(403).send({ error: "Forbidden: Destinado solo a Arquitectos." });
             }
        }`;

const replaceRequireAdmin = `        const userEmail = (user.email || '').toLowerCase();
        // 1. Hardcoded Founder safety bypass
        if (userEmail === 'luisalfredoherreramendez@gmail.com' || userEmail.includes('luisalfredoherreramendez') || userEmail.includes('luis.herrera')) {
            return; // Authorized
        }

        // 2. Safe schema fallback
        const { data: profile, error: dbError } = await supabaseAdmin.from('profiles').select('system_role').eq('id', user.id).maybeSingle();
        
        if (dbError && (dbError.code === '42703' || dbError.message.includes('column'))) {
             // MIGRATION NOT YET APPLIED - Fallback to plan_type
             const { data: oldProfile } = await supabaseAdmin.from('profiles').select('plan_type').eq('id', user.id).single();
             if (oldProfile?.plan_type !== 'admin') {
                 return reply.status(403).send({ error: "Forbidden: Destinado solo a Arquitectos (pre-mig)." });
             }
        } else {
             // MIGRATION APPLIED - Use canonical role
             if (profile?.system_role !== 'admin' && profile?.system_role !== 'owner') {
                 return reply.status(403).send({ error: "Forbidden: Se requiere rol de administrador." });
             }
        }`;

content = content.replace(searchRequireAdmin, replaceRequireAdmin);

const searchSetRole = `            // Protect Founder from demotion
            if (email === 'luisalfredoherreramendez@gmail.com' && role !== 'admin') {
                return reply.status(403).send({ error: "Cannot demote the Founder." });
            }

            const { error } = await supabaseAdmin.from('profiles').update({ plan_type: role }).eq('email', email);
            if (error) throw error;`;

const replaceSetRole = `            // Protect Founder from demotion
            if (email === 'luisalfredoherreramendez@gmail.com') {
                return reply.status(403).send({ error: "Cannot modify the Founder's role." });
            }

            // Fallback for role updates
            const { error: dbError } = await supabaseAdmin.from('profiles').update({ system_role: role }).eq('email', email);
            if (dbError && (dbError.code === '42703' || dbError.message.includes('column'))) {
                const { error: oldError } = await supabaseAdmin.from('profiles').update({ plan_type: role }).eq('email', email);
                if (oldError) throw oldError;
            } else if (dbError) {
                throw dbError;
            }`;

content = content.replace(searchSetRole, replaceSetRole);

fs.writeFileSync('server/src/routes/admin.ts', content);
console.log("Admin authorization separated from billing (v2)");
