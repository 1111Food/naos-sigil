import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UpdatePasswordViewProps {
    onSuccess?: () => void;
}

export const UpdatePasswordView: React.FC<UpdatePasswordViewProps> = ({ onSuccess }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log("🚀 UpdatePasswordView: Creando nueva llave...");
            let { error } = await updatePassword(password);

            if (error) {
                alert(`Error al guardar tu nueva llave.\n\nFallo: ${error.message}`);
                setLoading(false);
                return;
            }

            console.log("🔮 UpdatePasswordView: Llave actualizada.");
            alert("¡Llave secreta actualizada y forjada exitosamente! Bienvenido de vuelta al Templo.");
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Error fatal al actualizar llave:', err);
            alert(`Hubo un problema inseperado: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md mx-auto space-y-12 bg-[#0a0a1f]/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative"
        >
            <div className="text-center space-y-4">
                <KeyRound className="mx-auto text-amber-300/40 w-12 h-12" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                    NUEVA LLAVE
                </h1>
                <p className="text-cyan-200/40 text-[10px] uppercase tracking-[0.4em] font-light italic">
                    Forja tu nueva contraseña para el Templo.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Escribe tu nueva Contraseña Mágica"
                    required
                    className="w-full bg-[#0a0a1f]/60 border border-emerald-500/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 focus:bg-white/5 transition-all text-sm tracking-widest text-center"
                />

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || password.length < 6}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold uppercase tracking-[0.5em] text-[11px] shadow-[0_10px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_60px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:pointer-events-none mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    {loading ? "PROCESANDO..." : "SELLAR NUEVA LLAVE"}
                </motion.button>
            </form>
        </motion.div>
    );
};
