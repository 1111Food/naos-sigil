import React, { useState, useEffect } from 'react';
import { Shield, Search } from 'lucide-react';
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

    const fetchUsers = async (query: string = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('sb-avaikhukgugvcocwedsz-auth-token'); 
            const parsedToken = token ? JSON.parse(token) : null;
            const accessToken = parsedToken?.access_token;

            const response = await fetch(`${API_BASE_URL}/api/admin/users${query ? `?email=${query}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
                setStats(data.stats || { total: 0, premium: 0 });
            } else {
                console.error("Failed to fetch users");
            }
        } catch (err) {
            console.error("Error fetching users:", err);
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

    const handleRoleChange = async (email: string, newRole: string) => {
        if (!window.confirm(`¿Estás seguro de cambiar el rol de ${email} a [${newRole}]?`)) return;

        setUpdating(email);
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

        setUpdating(email);
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

                {/* Search Form */}
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
                                        <td className="px-6 py-4 text-xs text-white/40">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.plan_type !== 'premium' && (
                                                    <button 
                                                        onClick={() => handleRoleChange(u.email, 'premium')}
                                                        disabled={updating === u.email || !u.email}
                                                        className="p-1 px-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 transition-all hover:scale-105"
                                                    >
                                                        Hacer Premium
                                                    </button>
                                                )}
                                                {u.plan_type !== 'free' && u.plan_type !== 'admin' && (
                                                    <button 
                                                        onClick={() => handleRoleChange(u.email, 'free')}
                                                        disabled={updating === u.email || !u.email}
                                                        className="p-1 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 transition-all hover:scale-105"
                                                    >
                                                        Quitar Plan
                                                    </button>
                                                )}
                                                {u.email && !u.email.includes('luisalfredoherreramendez') && (
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id, u.email)}
                                                        disabled={updating === u.email || !u.email}
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
        </div>
    );
}
