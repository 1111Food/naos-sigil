import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Lock, Trash2 } from 'lucide-react';
import { useProfile } from '../contexts/ProfileContext';
import { API_BASE_URL, getAsyncAuthHeaders } from '../lib/api';
import { cn } from '../lib/utils';

export const ProfileSelector: React.FC = () => {
    const { profile, refreshProfile } = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form states for new profile
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthDepartment, setBirthDepartment] = useState('');
    const [birthCountry, setBirthCountry] = useState('');

    if (!profile) return null;

    const subProfiles = profile.sub_profiles || [];
    const isPremium = (profile as any).plan_type === 'premium' || (profile as any).plan_type === 'premium_plus' || (profile as any).plan_type === 'admin';
    const limit = isPremium ? 3 : 1;
    const canAdd = 1 + subProfiles.length < limit;

    const handleSwitch = async (id?: string) => {
        try {
            const headers = await getAsyncAuthHeaders();
            await fetch(`${API_BASE_URL}/api/user/profiles/switch`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ active_sub_profile_id: id })
            });
            await refreshProfile();
            setIsOpen(false);
        } catch (e) {
            console.error("Error switching profile:", e);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const headers = await getAsyncAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/api/user/profiles`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, birthDate, birthTime, birthCity, birthDepartment, birthCountry })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error || "Error adding profile");
                return;
            }
            await refreshProfile();
            setIsAdding(false);
            setName(''); setBirthDate(''); setBirthTime(''); setBirthCity(''); setBirthDepartment(''); setBirthCountry('');
        } catch (e) {
            console.error("Error adding profile:", e);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar este perfil?")) return;
        try {
            const headers = await getAsyncAuthHeaders();
            await fetch(`${API_BASE_URL}/api/user/profiles/${id}`, {
                method: 'DELETE',
                headers
            });
            await refreshProfile();
        } catch (e) {
             console.error("Error deleting profile:", e);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-3 rounded-full glass-panel border border-white/5 bg-black/40 hover:bg-cyan-500/10 transition-all text-cyan-100 hover:text-cyan-400 group"
            >
                <Users className="w-5 h-5 text-cyan-400 group-hover:animate-pulse" />
            </button>

            {isOpen && (
                <div className="absolute top-0 left-full ml-3 w-56 rounded-2xl glass-panel border border-white/10 bg-black/90 shadow-2xl p-2 z-50 flex flex-col gap-1">
                    {/* Master Profile */}
                    <button
                        onClick={() => handleSwitch(undefined)}
                        className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs transition-colors",
                            !profile.active_sub_profile_id ? "bg-white/10 text-white font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <span>{profile.name} (Principal)</span>
                    </button>

                    {/* Sub Profiles */}
                    {subProfiles.map(p => (
                        <div
                            key={p.id}
                            className={cn(
                                "flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs transition-colors group cursor-pointer",
                                profile.active_sub_profile_id === p.id ? "bg-white/10 text-white font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"
                            )}
                            onClick={() => handleSwitch(p.id)}
                        >
                            <span>{p.name}</span>
                            <button 
                                onClick={(e) => handleDelete(e, p.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    <div className="h-px bg-white/10 my-1" />

                    {/* Add Button */}
                    {canAdd ? (
                        <button
                            onClick={() => { setIsAdding(true); setIsOpen(false); }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-cyan-400 hover:bg-white/5 w-full text-left transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Añadir perfil</span>
                        </button>
                    ) : (
                        <div className="flex items-center justify-between px-3 py-2 text-xs text-white/30 cursor-not-allowed">
                            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-amber-500/60" /> Límite alcanzado</span>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Añadir Perfil */}
            {isAdding && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <form onSubmit={handleAdd} className="w-full max-w-sm glass-panel bg-black/90 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl">
                        <h3 className="text-sm font-serif italic text-white/80">Nuevo Perfil</h3>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-white/40">Nombre</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wider text-white/40">Fecha</label>
                                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wider text-white/40">Hora</label>
                                <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-white/40">País</label>
                            <input type="text" placeholder="Ej. Guatemala..." value={birthCountry} onChange={e => setBirthCountry(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-white/40">Región / Departamento</label>
                            <input type="text" placeholder="Ej. Guatemala, Petén..." value={birthDepartment} onChange={e => setBirthDepartment(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-white/40">Ciudad</label>
                            <input type="text" placeholder="Ej. Ciudad de Guatemala..." value={birthCity} onChange={e => setBirthCity(e.target.value)} required className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40" />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-3 py-2 rounded-xl border border-white/10 text-xs text-white/60 hover:bg-white/5">Cancelar</button>
                            <button type="submit" className="flex-1 px-3 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">Guardar</button>
                        </div>
                    </form>
                </div>,
                document.body
            )}
        </div>
    );
};
