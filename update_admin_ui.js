const fs = require('fs');

let content = fs.readFileSync('client/src/pages/AdminView.tsx', 'utf8');

// Add new state variables
const searchStates = `    const [isDemoEnabled, setIsDemoEnabled] = useState<boolean>(false);`;
const replaceStates = `    const [isDemoEnabled, setIsDemoEnabled] = useState<boolean>(false);
    
    // New User State
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');`;

content = content.replace(searchStates, replaceStates);

// Add the handleCreateUser function
const searchHandleRole = `    const handleRoleChange = async (email: string, role: string, id: string) => {`;
const replaceHandleRole = `    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName || !newUserEmail) return;
        
        setIsCreatingUser(true);
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;
            
            const response = await fetch(\`\${API_BASE_URL}/api/admin/users\`, {
                method: 'POST',
                headers: { 
                    'Authorization': \`Bearer \${accessToken}\`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: newUserEmail, name: newUserName })
            });
            
            if (response.ok) {
                alert('Usuario invitado exitosamente. Se ha enviado un correo.');
                setNewUserName('');
                setNewUserEmail('');
                fetchUsers(searchTerm);
            } else {
                const data = await response.json();
                alert('Error al crear: ' + (data.error || 'Desconocido'));
            }
        } catch (e: any) {
            alert('Error de conexión');
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleRoleChange = async (email: string, role: string, id: string) => {`;

content = content.replace(searchHandleRole, replaceHandleRole);

// Add the UI
const searchUI = `                    {/* Barra de Búsqueda */}`;
const replaceUI = `                    {/* Add User Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Crear Nueva Cuenta (Invitación)</h2>
                        <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-4">
                            <input 
                                type="text"
                                placeholder="Nombre completo"
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"
                                required
                            />
                            <input 
                                type="email"
                                placeholder="Correo electrónico"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white"
                                required
                            />
                            <button 
                                type="submit"
                                disabled={isCreatingUser}
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center whitespace-nowrap"
                            >
                                {isCreatingUser ? 'Enviando...' : '+ Crear Cuenta'}
                            </button>
                        </form>
                    </div>

                    {/* Barra de Búsqueda */}`;

content = content.replace(searchUI, replaceUI);

fs.writeFileSync('client/src/pages/AdminView.tsx', content);
console.log("AdminView updated with create user form");
