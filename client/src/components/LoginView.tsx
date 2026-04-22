import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { useTranslation } from '../i18n';
import { StatusBadge } from './StatusBadge';

interface LoginViewProps {
    onCancel?: () => void;
    onSuccess?: (view: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onCancel, onSuccess }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'LOGIN' | 'RESET'>('LOGIN');
    const { signInWithPassword, resetPasswordForEmail } = useAuth();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            const cleanEmail = email.trim();
            console.log("🚀 LoginView: Autenticando llave para", cleanEmail, "...");
            let { data, error } = await signInWithPassword(cleanEmail, password);

            if (error) {
                alert(`${t('login_error_title')}\n\n${t('login_error_fallback')}`);
                setLoading(false);
                return;
            }

            const user = data?.user;
            if (user) {
                console.log("🚀 LoginView: Portal abierto. Delegando validación de identidad al Guardián de Sesión global...");
                if (onSuccess) onSuccess('TEMPLE');
            }
        } catch (err: any) {
            console.error('Error fatal en el portal de acceso:', err);
            alert(`${t('login_error_fatal')}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanEmail = email.trim();
            console.log("🚀 LoginView: Solicitando nueva llave para", cleanEmail, "...");
            const { error } = await resetPasswordForEmail(cleanEmail);

            if (error) {
                alert(`Error: ${error.message}`);
            } else {
                alert(t('login_reset_desc') + " (Email sent)");
                setMode('LOGIN');
            }
        } catch (err: any) {
            console.error('Error al pedir reset:', err);
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
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                    <X size={20} />
                </button>
            )}

            <div className="text-center space-y-4">
                <Sparkles className="mx-auto text-amber-300/40 w-12 h-12" />
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-300">
                    {mode === 'LOGIN' ? t('login_title') : t('login_reset_title')}
                </h1>
                <p className="text-cyan-200/40 text-[10px] uppercase tracking-[0.4em] font-light italic">
                    {mode === 'LOGIN' 
                        ? t('login_desc') 
                        : t('login_reset_desc')}
                </p>
            </div>

            <form onSubmit={mode === 'LOGIN' ? handleLogin : handleReset} className="space-y-4">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('login_email_placeholder')}
                    required
                    className="w-full bg-[#0a0a1f]/60 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all text-sm tracking-widest text-center"
                />
                {mode === 'LOGIN' && (
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('login_password_placeholder')}
                        required
                        className="w-full bg-[#0a0a1f]/60 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all text-sm tracking-widest text-center"
                    />
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-bold uppercase tracking-[0.5em] text-[11px] shadow-[0_10px_40px_rgba(139,92,246,0.2)] hover:shadow-[0_15px_60px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-4 disabled:opacity-30 disabled:pointer-events-none mt-4"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                    {loading ? t('login_processing') : mode === 'LOGIN' ? t('login_btn') : t('login_reset_btn')}
                </motion.button>
            </form>

            <div className="pt-8 space-y-6 text-center">
                <div className="flex justify-center mb-4">
                    <StatusBadge plan="FREE" />
                </div>

                {mode === 'LOGIN' ? (
                    <button
                        onClick={() => setMode('RESET')}
                        type="button"
                        className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white/20 pb-1"
                    >
                        {t('login_forgot_key')}
                    </button>
                ) : (
                    <button
                        onClick={() => setMode('LOGIN')}
                        type="button"
                        className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors border-b border-white/10 hover:border-white/30 pb-1"
                    >
                        {t('login_back_btn')}
                    </button>
                )}

                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 italic leading-relaxed pt-2 border-t border-white/5 mx-8">
                    {t('login_footer_motto')}
                </p>
            </div>
        </motion.div>
    );
};
