import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_BASE_URL } from '../lib/api';

interface User {
    id: string;
    email: string;
    plan_type: string;
    created_at: string;
}

interface AdminStats {
    total: number;
    premium: number;
}

export function AdminView() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<AdminStats>({ total: 0, premium: 0 });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [updating, setUpdating] = useState<string | null>(null);
    const [isTestingTelegram, setIsTestingTelegram] = useState(false);
    
    // New User State
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserDuration, setNewUserDuration] = useState<number>(0);
    const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);
    const [isSubmittingUser, setIsSubmittingUser] = useState(false);

    const fetchUsers = async (query: string = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;

            const url = query ? `${API_BASE_URL}/api/admin/users?email=${query}` : `${API_BASE_URL}/api/admin/users`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!res.ok) throw new Error("Acceso denegado o error del servidor");

            const data = await res.json();
            setUsers(data.users || []);
            setStats(data.stats || { total: 0, premium: 0 });
        } catch (err: any) {
            console.error("Error al cargar usuarios:", err);
            // alert("No se pudo cargar la matriz. Verifica que tienes rol 'admin' y estás logueado.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(searchTerm);
    };

    
    const handleSetBudget = async (email: string, currentBudget: any) => {
        const val = prompt(`Set new budget in USD for ${email} (leave blank to remove override):`, currentBudget !== 'Unlimited' ? currentBudget : '');
        if (val === null) return;
        
        let budget = null;
        if (val.trim() !== '') {
            budget = parseFloat(val);
            if (isNaN(budget) || budget < 0) {
                alert("Invalid budget amount.");
                return;
            }
        }
        
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;
            
            const res = await fetch(`${API_BASE_URL}/api/admin/set-budget`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, budget })
            });
            if (res.ok) {
                fetchData();
            } else {
                alert("Error setting budget");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRoleChange = async (email: string, newRole: string, id: string) => {
        if (!email) return;
        if (!window.confirm(`¿Estás seguro de cambiar el rol de ${email} a [${newRole}]?`)) return;

        setUpdating(id);
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/admin/set-role`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ email, role: newRole })
            });

            if (response.ok) {
                alert(`Rol de ${email} actualizado a ${newRole}.`);
                fetchUsers(searchTerm); // Refresh list
            } else {
                const error = await response.json();
                alert(`Error: ${error.error || "Fallo en la actualización"}`);
            }
        } catch (err) {
            alert("Error de conexión");
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteUser = async (id: string, email: string) => {
        if (!window.confirm(`⚠️ PELIGRO EXTREMO: ¿Estás seguro de ELIMINAR permanentemente a ${email}? Esta acción no se puede deshacer y borrará toda su historia en el Templo.`)) return;

        setUpdating(id);
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                alert(`El usuario ${email} ha sido erradicado del sistema.`);
                fetchUsers(searchTerm); // Refresh list
            } else {
                const errorData = await response.json();
                if (errorData.error === 'Configuración Incompleta') {
                    alert('FALTA LLAVE MAESTRA: Dile a Antigravity que necesitas colocar tu SUPABASE_SERVICE_ROLE_KEY en el archivo .env del servidor para tener poder de borrar instancias.');
                } else {
                    alert(`Error: ${errorData.error} - ${errorData.details}`);
                }
            }
        } catch (err) {
            alert("Error de conexión al intentar borrar.");
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full max-w-[1200px] mx-auto relative pt-32 pb-20 px-4 overflow-hidden text-white font-sans">
            {/* Background Accents */}
            <div className="fixed inset-0 bg-slate-950 -z-10" />
            <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-3xl pointer-events-none -z-5" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -z-5" />

            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-2xl font-black tracking-wider uppercase bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Admin Panel</h1>
                        <p className="text-xs text-white/50">Control de usuarios y privilegios NAOS</p>
                    </div>
                </div>

                {/* Actions & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => {
                            setIsCreatingUser(true);
                            setCreatedCredentials(null);
                            setNewUserEmail('');
                            setNewUserPassword('');
                            setNewUserDuration(0);
                        }}
                        className="px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/50 transition-colors rounded-xl text-xs font-bold font-sans flex items-center justify-center"
                    >
                        + Crear Cuenta
                    </button>

                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2 flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                            <Search className="w-4 h-4 text-white/40" />
                            <input 
                                type="text" 
                                placeholder="Buscar por email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent text-sm focus:outline-none flex-grow"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl text-xs font-bold font-sans">
                            Filtrar
                        </button>
                    </form>
                </div>
            </header>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Total Usuarios</p>
                    <p className="text-3xl font-black mt-1">{stats.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <p className="text-xs text-purple-300 uppercase tracking-widest font-medium">Activos Premium</p>
                    <p className="text-3xl font-black mt-1 text-purple-300">{stats.premium}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="flex-grow bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
                {loading ? (
                    <div className="flex items-center justify-center p-20 text-sm text-white/50 animate-pulse">
                        Cargando matriz de usuarios...
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex items-center justify-center p-20 text-sm text-white/40">
                        No se encontraron usuarios.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/2 text-[11px] uppercase tracking-widest text-white/60">
                                    <th className="px-6 py-4">Usuario / Email</th>
                                    <th className="px-6 py-4">Rol / Plan</th>
                                    <th className="px-6 py-4">Registro</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-white/80">{u.email || "Sin Email"}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border",
                                                u.plan_type === 'premium' || u.plan_type === 'premium_plus' ? "bg-purple-500/10 border-purple-500/30 text-purple-300" :
                                                u.plan_type === 'admin' ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                                                "bg-white/10 border-white/20 text-white/60"
                                            )}>
                                                {u.plan_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-white/80">
                                            {u.ai_budget === 'Unlimited' ? '∞' : `${Number(u.ai_budget).toFixed(2)}`}
                                            <button onClick={() => handleSetBudget(u.email, u.ai_budget)} className="ml-2 text-blue-400 hover:text-blue-300">Edit</button>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-white/80">
                                            ${Number(u.ai_used || 0).toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-white/80">
                                            {u.ai_remaining === 'Unlimited' ? '∞' : `${Number(u.ai_remaining).toFixed(4)}`}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-white/40">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.plan_type !== 'admin' && (
                                                    <button 
                                                        onClick={() => handleRoleChange(u.email, 'admin', u.id)}
                                                        disabled={updating === u.id || !u.email}
                                                        className="p-1 px-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 rounded-lg text-[10px] font-bold text-amber-300 transition-all hover:scale-105"
                                                    >
                                                        Hacer Admin
                                                    </button>
                                                )}
                                                {u.plan_type !== 'premium' && (
                                                    <button 
                                                        onClick={() => handleRoleChange(u.email, 'premium', u.id)}
                                                        disabled={updating === u.id || !u.email}
                                                        className="p-1 px-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 transition-all hover:scale-105"
                                                    >
                                                        Hacer Premium
                                                    </button>
                                                )}
                                                {u.plan_type !== 'free' && (!u.email?.includes('luisalfredoherreramendez')) && (
                                                    <button 
                                                        onClick={() => handleRoleChange(u.email, 'free', u.id)}
                                                        disabled={updating === u.id || !u.email}
                                                        className="p-1 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 transition-all hover:scale-105"
                                                    >
                                                        Quitar Plan
                                                    </button>
                                                )}
                                                {(!u.email?.includes('luisalfredoherreramendez')) && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id, u.email || "Usuario sin email")}
                                                        disabled={updating === u.id}
                                                        className="p-1 px-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-300 transition-all hover:scale-105"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Create User Modal */}
            {isCreatingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full relative">
                        <button 
                            onClick={() => setIsCreatingUser(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Nueva Cuenta</h2>
                        
                        {createdCredentials ? (
                            <div className="space-y-4">
                                <p className="text-sm text-white/80">La cuenta se ha creado con éxito. Copia las credenciales antes de cerrar esta ventana.</p>
                                <div className="bg-black/50 p-4 rounded-xl border border-white/10 relative">
                                    <p className="text-xs text-white/50 uppercase mb-1">Email</p>
                                    <p className="font-mono text-sm mb-3">{createdCredentials.email}</p>
                                    <p className="text-xs text-white/50 uppercase mb-1">Contraseña</p>
                                    <p className="font-mono text-sm">{createdCredentials.password}</p>
                                    
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nContraseña: ${createdCredentials.password}`);
                                            alert("¡Credenciales copiadas al portapapeles!");
                                        }}
                                        className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                                    >
                                        Copiar Credenciales
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-white/50 mb-1 font-bold tracking-widest">Email</label>
                                    <input 
                                        type="email" 
                                        value={newUserEmail}
                                        onChange={e => setNewUserEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-white/50 mb-1 font-bold tracking-widest">Contraseña (opcional)</label>
                                    <input 
                                        type="text" 
                                        value={newUserPassword}
                                        onChange={e => setNewUserPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                                        placeholder="Dejar vacío para generar una"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-white/50 mb-1 font-bold tracking-widest">Plan / Duración</label>
                                    <select 
                                        value={newUserDuration}
                                        onChange={e => setNewUserDuration(Number(e.target.value))}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                                    >
                                        <option value={0}>Free (Ilimitado)</option>
                                        <option value={1}>Premium - 1 Día</option>
                                        <option value={3}>Premium - 3 Días</option>
                                        <option value={7}>Premium - 7 Días</option>
                                        <option value={30}>Premium - 30 Días</option>
                                    </select>
                                </div>
                                <button 
                                    onClick={async () => {
                                        if (!newUserEmail) return alert("El email es requerido");
                                        setIsSubmittingUser(true);
                                        try {
                                            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
                                            const parsedToken = token ? JSON.parse(token) : null;
                                            
                                            const res = await fetch(`${API_BASE_URL}/api/admin/create-account`, {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${parsedToken?.access_token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    email: newUserEmail,
                                                    password: newUserPassword || undefined,
                                                    days: newUserDuration
                                                })
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.error || "Error al crear cuenta");
                                            
                                            setCreatedCredentials({ email: data.email, password: data.password });
                                            fetchUsers();
                                        } catch (e: any) {
                                            alert(e.message);
                                        } finally {
                                            setIsSubmittingUser(false);
                                        }
                                    }}
                                    disabled={isSubmittingUser}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
                                >
                                    {isSubmittingUser ? 'Creando...' : 'Crear Cuenta'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
