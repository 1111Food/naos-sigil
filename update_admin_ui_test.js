const fs = require('fs');
let content = fs.readFileSync('client/src/pages/AdminView.tsx', 'utf8');

const searchState = `    const [isDemoEnabled, setIsDemoEnabled] = useState<boolean>(false);`;
const replaceState = `    const [isDemoEnabled, setIsDemoEnabled] = useState<boolean>(false);
    const [isTestingTelegram, setIsTestingTelegram] = useState(false);`;

content = content.replace(searchState, replaceState);

const searchHandler = `    const handleCreateUser = async (e: React.FormEvent) => {`;
const replaceHandler = `    const handleTelegramTest = async () => {
        setIsTestingTelegram(true);
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;
            
            const response = await fetch(\`\${API_BASE_URL}/api/admin/telegram-test\`, {
                method: 'POST',
                headers: { 'Authorization': \`Bearer \${accessToken}\` }
            });
            
            if (response.ok) {
                alert('Mensaje de prueba enviado a Telegram.');
            } else {
                const data = await response.json();
                alert('Error al enviar: ' + (data.error || 'Desconocido'));
            }
        } catch (e) {
            alert('Error de conexión');
        } finally {
            setIsTestingTelegram(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {`;

content = content.replace(searchHandler, replaceHandler);

const searchUI = `                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Modo Demostración / AI Review</h2>`;

const replaceUI = `                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Modo Demostración / AI Review</h2>`;

// Let's add the button right after the Modo Demostración block.
const searchUIBlock = `                            <p className="text-gray-400 text-sm">Habilita acceso bypass para evaluadores.</p>
                        </div>
                        <button 
                            onClick={() => toggleDemoMode(!isDemoEnabled)}
                            className={\`px-6 py-2 rounded-xl font-bold transition-all \${
                                isDemoEnabled ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/10 text-white hover:bg-white/20'
                            }\`}
                        >
                            {isDemoEnabled ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>`;
                    
const replaceUIBlock = `                            <p className="text-gray-400 text-sm">Habilita acceso bypass para evaluadores.</p>
                        </div>
                        <button 
                            onClick={() => toggleDemoMode(!isDemoEnabled)}
                            className={\`px-6 py-2 rounded-xl font-bold transition-all \${
                                isDemoEnabled ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-white/10 text-white hover:bg-white/20'
                            }\`}
                        >
                            {isDemoEnabled ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>

                    {/* Telegram Test */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Probar Telegram (Founder Only)</h2>
                            <p className="text-gray-400 text-sm">Envía un mensaje de prueba al chat vinculado.</p>
                        </div>
                        <button 
                            onClick={handleTelegramTest}
                            disabled={isTestingTelegram}
                            className="px-6 py-2 rounded-xl font-bold bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/50 hover:bg-[#0088cc]/30"
                        >
                            {isTestingTelegram ? 'Enviando...' : 'Enviar Prueba'}
                        </button>
                    </div>`;

content = content.replace(searchUIBlock, replaceUIBlock);
fs.writeFileSync('client/src/pages/AdminView.tsx', content);
console.log("AdminView updated with telegram test button");
