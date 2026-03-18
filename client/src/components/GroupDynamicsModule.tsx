import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, ArrowLeft, Loader2, Trash2, Edit, Building2, Workflow, ShieldAlert, Cpu, Zap, Target, Brain, Sparkles } from 'lucide-react';
import { RosterService } from '../services/rosterService';
import type { RosterProfile } from '../services/rosterService';
import { API_BASE_URL, getAuthHeaders } from '../lib/api';

interface GroupDynamicsModuleProps {
    initialReport?: any;
    onClearReport?: () => void;
}

export const GroupDynamicsModule: React.FC<GroupDynamicsModuleProps> = ({ initialReport, onClearReport }) => {
    const [roster, setRoster] = useState<RosterProfile[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<RosterProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<any>(null);

    // Form for new roster member
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMember, setNewMember] = useState<Partial<RosterProfile>>({
        name: '', birthDate: '', birthTime: '12:00', birthCountry: '', birthState: '', birthCity: '', roleLabel: 'Miembro'
    });
    const [editingMember, setEditingMember] = useState<RosterProfile | null>(null);

    useEffect(() => {
        loadRoster();
        if (initialReport) {
            setReport(initialReport);
        }
    }, [initialReport]);

    const loadRoster = async () => {
        setIsLoading(true);
        try {
            const data = await RosterService.getProfiles();
            setRoster(data);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMember?.id) return;
        try {
            const updated = await RosterService.updateProfile(editingMember.id, editingMember);
            setRoster(prev => prev.map(m => m.id === updated.id ? updated : m));
            setSelectedMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
            setEditingMember(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await RosterService.addProfile(newMember as RosterProfile);
            setRoster([added, ...roster]);
            setShowAddForm(false);
            setNewMember({ name: '', birthDate: '', birthTime: '12:00', birthCountry: '', birthState: '', birthCity: '', roleLabel: 'Miembro' });
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteMember = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("¿Eliminar perfil del Roster?")) return;
        try {
            await RosterService.deleteProfile(id);
            setRoster(prev => prev.filter(m => m.id !== id));
            setSelectedMembers(prev => prev.filter(m => m.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const toggleSelection = (member: RosterProfile) => {
        setSelectedMembers(prev => {
            const isSelected = prev.find(m => m.id === member.id);
            if (isSelected) {
                return prev.filter(m => m.id !== member.id);
            } else {
                if (prev.length >= 5) {
                    alert("Máximo 5 perfiles para Dinámica de Grupo.");
                    return prev;
                }
                return [...prev, member];
            }
        });
    };

    const handleAnalyze = async () => {
        if (selectedMembers.length < 3) {
            alert("Mínimo 3 perfiles requeridos para un equipo.");
            return;
        }

        setIsAnalyzing(true);
        try {
            // Apply strict slice to prevent validation errors on server
            const payload = { rosterProfiles: selectedMembers.slice(0, 5) };
            console.log(`📤 Sending Group Dynamics Analysis Request: ${payload.rosterProfiles.length} members`);

            const response = await fetch(`${API_BASE_URL}/api/synastry/analyze/group`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error en el análisis de grupo');
            }

            const data = await response.json();

            // Simulating a calculation delay for UX
            setTimeout(() => {
                setReport(data.data);
                setIsAnalyzing(false);
            }, 3000);

        } catch (err: any) {
            alert(err.message);
            setIsAnalyzing(false);
        }
    };

    const getElementColor = (element: string) => {
        switch (element) {
            case 'Fuego': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'Tierra': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Aire': return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
            case 'Agua': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        }
    };

    if (isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-[2rem] border-2 border-dashed border-blue-500/20" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-[2rem] border border-blue-400/20" />
                    <Building2 className="text-blue-400/40 w-16 h-16 animate-pulse" />
                </div>
                <h3 className="tracking-[0.4em] uppercase text-blue-300 font-bold mt-8 text-sm animate-pulse">Consultando Arquitectura B2B...</h3>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Mapeando Sinergia de {selectedMembers.length} Nodos</p>
            </div>
        );
    }

    if (report) {
        return (
            <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <button onClick={() => {
                    setReport(null);
                    if (onClearReport) onClearReport();
                }} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Limpiar Tablero
                </button>

                <div className="bg-black/40 border border-blue-500/20 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="text-center mb-12">
                        <div className="inline-flex px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                            Reporte Organizacional
                        </div>
                        <h2 className="text-4xl font-serif text-white mb-2">Malla Elemental Operativa</h2>
                        <p className="text-white/40 uppercase tracking-[0.2em] text-xs">Puntuación de Eficiencia: <span className="text-white font-serif text-xl ml-2">{report.technicalReport.score}%</span></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Technical Left */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
                                    <Workflow size={14} /> Distribución de Carga
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-xl border ${getElementColor('Fuego')}`}>
                                        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Iniciativa (Fuego)</div>
                                        <div className="text-2xl font-serif">{report.technicalReport.mesh.fire}%</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${getElementColor('Tierra')}`}>
                                        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Ejecución (Tierra)</div>
                                        <div className="text-2xl font-serif">{report.technicalReport.mesh.earth}%</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${getElementColor('Aire')}`}>
                                        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Estrategia (Aire)</div>
                                        <div className="text-2xl font-serif">{report.technicalReport.mesh.air}%</div>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${getElementColor('Agua')}`}>
                                        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Cohesión (Agua)</div>
                                        <div className="text-2xl font-serif">{report.technicalReport.mesh.water}%</div>
                                    </div>
                                </div>
                            </div>

                            {report.technicalReport.mesh.voids.length > 0 && (
                                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-xl">
                                    <h3 className="text-[10px] uppercase tracking-widest text-rose-400 mb-2 font-bold flex items-center gap-2">
                                        <ShieldAlert size={14} /> Vacíos Operativos Detectados
                                    </h3>
                                    <p className="text-white/60 text-sm">El ensamble carece peligrosamente de energía en: <span className="text-white font-bold">{report.technicalReport.mesh.voids.join(', ')}</span></p>
                                </div>
                            )}
                        </div>

                        {/* Synthesis Right */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] uppercase tracking-widest text-blue-400 mb-4 font-bold flex items-center gap-2 border-b border-blue-500/20 pb-4">
                                <Cpu size={14} /> Dictamen de Arquitectura Organizacional
                            </h3>

                            {[
                                { key: 'sinergia_global', label: 'Sinergia del Ensamble', icon: Zap },
                                { key: 'friccion_operativa', label: 'Fricciones Sistémicas', icon: ShieldAlert },
                                { key: 'liderazgo_distribuido', label: 'Estructura de Poder', icon: Target },
                                { key: 'flujo_informacion', label: 'Flujo de Datos', icon: Brain },
                                { key: 'veredicto_arquitecto', label: 'Veredicto del Arquitecto', icon: Sparkles }
                            ].map((item) => (
                                <div key={item.key} className="bg-white/5 p-5 rounded-xl border text-left border-white/5 relative overflow-hidden group hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <item.icon size={10} className="text-blue-300/40" />
                                        <p className="text-[9px] uppercase tracking-widest text-blue-300/60 font-bold">{item.label}</p>
                                    </div>
                                    <p className="text-white/80 text-sm italic font-light leading-relaxed">{report.synthesis[item.key]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 px-4 h-full relative z-10">
            {/* LEFT PANEL: ROSTER */}
            <div className="flex-1 bg-black/40 border border-white/10 rounded-[2rem] p-6 backdrop-blur-xl flex flex-col max-h-[70vh]">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                    <h3 className="text-white font-serif text-xl italic flex items-center gap-3">
                        <Users className="text-purple-400 opacity-50" /> Roster B2B
                    </h3>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                    >
                        {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    </button>
                </div>

                {showAddForm && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 space-y-4 bg-white/5 p-4 rounded-xl border border-white/5"
                        onSubmit={handleAddMember}
                    >
                        <input required type="text" placeholder="Nombre (Ej: M. Zuckerberg)" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm focus:border-purple-500 outline-none" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Fecha Solar</label>
                                <input required type="date" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm invert-calendar-icon outline-none" value={newMember.birthDate} onChange={e => setNewMember({ ...newMember, birthDate: e.target.value })} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Hora</label>
                                <input type="time" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm outline-none" value={newMember.birthTime} onChange={e => setNewMember({ ...newMember, birthTime: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">País</label>
                                <input type="text" placeholder="Ej: México" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm focus:border-purple-500 outline-none" value={newMember.birthCountry} onChange={e => setNewMember({ ...newMember, birthCountry: e.target.value })} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Estado</label>
                                <input type="text" placeholder="Ej: CDMX" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm focus:border-purple-500 outline-none" value={newMember.birthState} onChange={e => setNewMember({ ...newMember, birthState: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Ciudad</label>
                                <input type="text" placeholder="Ej: Cuauhtémoc" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm focus:border-purple-500 outline-none" value={newMember.birthCity} onChange={e => setNewMember({ ...newMember, birthCity: e.target.value })} />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Rol Operativo</label>
                                <input required type="text" placeholder="Ej: CEO" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm focus:border-purple-500 outline-none" value={newMember.roleLabel} onChange={e => setNewMember({ ...newMember, roleLabel: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-purple-500/20 text-purple-300 border border-purple-500/30 p-2 rounded uppercase text-[10px] tracking-widest font-bold hover:bg-purple-500/30">Guardar Perfil</button>
                    </motion.form>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-white/30" /></div>
                    ) : roster.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <p className="text-center text-[10px] uppercase tracking-widest text-white/40">El roster B2B está vacío.</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-6 py-3 bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 group shadow-[0_0_15px_rgba(0,0,0,0.2)]"
                            >
                                <Plus size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                Crear Nuevo Vínculo
                            </button>
                        </div>
                    ) : (
                        roster.map(member => (
                            <div
                                key={member.id}
                                onClick={() => toggleSelection(member)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group ${selectedMembers.find(m => m.id === member.id) ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            >
                                <div>
                                    <p className="text-white font-medium flex items-center gap-2">
                                        {member.name}
                                        {selectedMembers.find(m => m.id === member.id) && <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"></span>}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{member.roleLabel}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingMember(member); }}
                                        className="w-8 h-8 rounded bg-blue-500/5 text-blue-400/50 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
                                        title="Editar"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteMember(member.id!, e)}
                                        className="w-8 h-8 rounded bg-red-500/5 text-red-400/50 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: TEAM ASSEMBLER */}
            <div className="flex-1 bg-gradient-to-br from-blue-900/10 to-transparent border border-blue-500/20 rounded-[2rem] p-8 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent to-blue-500/50" />

                <div>
                    <h2 className="text-3xl font-serif text-white mb-2 italic text-left">Ensamblaje Organizacional</h2>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-8 text-left">Selecciona de 3 a 5 nodos para calcular Malla Elemental</p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        <AnimatePresence>
                            {selectedMembers.map((m, i) => (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    key={`sel-${m.id}`}
                                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-xs flex items-center gap-2 font-bold flex-shrink-0"
                                >
                                    <div className="w-4 h-4 rounded-full bg-blue-400/20 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</div>
                                    <span className="truncate max-w-[80px]">{m.name}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleSelection(m); }} 
                                        className="hover:text-white text-blue-300/40 p-0.5 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
                                        title="Deseleccionar"
                                    >
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {selectedMembers.length === 0 && (
                            <div className="w-full text-center py-10 border border-dashed border-white/10 rounded-xl text-white/20 text-xs italic font-serif">
                                Selecciona miembros en el Roster (Panel Izquierdo)
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                    <button
                        onClick={handleAnalyze}
                        disabled={selectedMembers.length < 3}
                        className={`w-full py-4 rounded-xl border border-blue-500/30 uppercase tracking-[0.2em] text-xs font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] flex justify-center items-center gap-2 ${selectedMembers.length >= 3 ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 cursor-pointer' : 'bg-black/40 text-white/20 cursor-not-allowed opacity-50'}`}
                    >
                        <Building2 size={16} />
                        {selectedMembers.length < 3 ? 'Requiere mínimo 3 nodos' : 'Ejecutar Algoritmo Táctico'}
                    </button>
                </div>
            </div>
            {editingMember && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel w-full max-w-md p-6 rounded-3xl z-10 border border-white/10 relative">
                        <h3 className="text-lg font-serif text-white mb-6">Editar Perfil</h3>
                        <form onSubmit={handleUpdateMember} className="space-y-4">
                            <input required type="text" placeholder="Nombre" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm" value={editingMember.name} onChange={e => setEditingMember({ ...editingMember, name: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Fecha</label>
                                    <input required type="date" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm" value={editingMember.birthDate} onChange={e => setEditingMember({ ...editingMember, birthDate: e.target.value })} />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Hora</label>
                                    <input type="time" className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm" value={editingMember.birthTime} onChange={e => setEditingMember({ ...editingMember, birthTime: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-500/20 text-blue-300 border border-blue-500/30 p-2 rounded uppercase text-[10px] font-bold">Guardar</button>
                            <button type="button" onClick={() => setEditingMember(null)} className="w-full bg-white/5 text-white/60 p-2 rounded text-xs">Cancelar</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
