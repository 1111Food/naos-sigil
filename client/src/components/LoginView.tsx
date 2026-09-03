import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n';
import { AmbientContext } from './gate/AmbientContext';
import { GateBackground } from './gate/GateBackground';
import { GateSeals } from './gate/GateSeals';

interface LoginViewProps {
    onCancel?: () => void;
    onSuccess?: (view: string) => void;
}

type GateState = 'NORMAL' | 'LOADING' | 'ERROR' | 'RESET';

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gateState, setGateState] = useState<GateState>('NORMAL');
    const { signInWithPassword, resetPasswordForEmail } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let currentEmail = email;
        let currentPassword = password;
        
        // iOS Safari Autofill Fallback
        const emailEl = document.getElementById('naos-login-email') as HTMLInputElement;
        const passEl = document.getElementById('naos-login-password') as HTMLInputElement;
        if (emailEl?.value) currentEmail = emailEl.value;
        if (passEl?.value) currentPassword = passEl.value;

        setGateState('LOADING');
        
        try {
            const cleanEmail = currentEmail.trim();
            console.log("🛠️ The Gate: Autenticando llave para", cleanEmail, "...");
            let { data, error } = await signInWithPassword(cleanEmail, currentPassword);

            if (error) {
                // If it's a network error vs invalid credentials
                if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
                    setGateState('ERROR');
                    // We can use a custom error state text, but for now we rely on the UI to show it
                    return;
                }
                setGateState('ERROR');
                return;
            }

            const user = data?.user;
            if (user) {
                console.log("🛠️ The Gate: Portal abierto.");
                if (onSuccess) onSuccess('TEMPLE');
            }
        } catch (err: any) {
            console.error('Error fatal en el portal de acceso:', err);
            setGateState('ERROR');
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let currentEmail = email;
        const emailEl = document.getElementById('naos-login-email') as HTMLInputElement;
        if (emailEl?.value) currentEmail = emailEl.value;

        setGateState('LOADING');
        try {
            const cleanEmail = currentEmail.trim();
            const { error } = await resetPasswordForEmail(cleanEmail);

            if (error) {
                setGateState('ERROR');
            } else {
                setGateState('NORMAL');
                alert(t('login_reset_desc') + " (Email sent)");
            }
        } catch (err: any) {
            setGateState('ERROR');
        }
    };

    const isReset = gateState === 'RESET';

    return (
        <GateBackground>
            <div className="w-full max-w-sm mx-auto flex flex-col items-center">
                
                {/* 1. NAOS Logo (Gold/Cosmic) */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center mb-2"
                >
                    <h1 className="text-4xl font-serif tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        NAOS
                    </h1>
                </motion.div>

                {/* 5. Ambient Context (Lunar Phase) */}
                <AmbientContext />

                {/* Main Gate Panel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full relative z-20"
                >
                    <div className="text-center space-y-3 mb-10">
                        <Sparkles className="mx-auto text-amber-400/50 w-6 h-6 mb-4" />
                        
                        {/* 2. ACCESO DE VIAJERO (Golden Heading) */}
                        <h2 className="text-2xl md:text-3xl font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                            {isReset ? t('login_reset_title') : t('login_title')}
                        </h2>
                        
                        <AnimatePresence mode="wait">
                            <motion.p 
                                key={gateState}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`text-[10px] uppercase tracking-[0.3em] italic ${
                                    gateState === 'ERROR' ? 'text-red-400/90 font-medium' :
                                    gateState === 'LOADING' ? 'text-cyan-400/90 animate-pulse' :
                                    'text-white/40'
                                }`}
                            >
                                {gateState === 'ERROR' ? t('login_state_error') :
                                 gateState === 'LOADING' ? t('login_state_loading') :
                                 isReset ? t('login_reset_desc') : t('login_desc')}
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* 3. Form */}
                    <form onSubmit={isReset ? handleReset : handleLogin} className="space-y-4">
                        <div className="relative group">
                            <input
                                id="naos-login-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (gateState === 'ERROR') setGateState('NORMAL');
                                }}
                                placeholder={t('login_email_placeholder')}
                                required
                                disabled={gateState === 'LOADING'}
                                className="w-full bg-[#0a0a1f]/40 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-[#0a0a1f]/60 transition-all text-sm tracking-widest text-center shadow-inner"
                            />
                        </div>
                        
                        {!isReset && (
                            <div className="relative group">
                                <input
                                    id="naos-login-password"
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (gateState === 'ERROR') setGateState('NORMAL');
                                    }}
                                    placeholder={t('login_password_placeholder')}
                                    required
                                    disabled={gateState === 'LOADING'}
                                    className="w-full bg-[#0a0a1f]/40 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:bg-[#0a0a1f]/60 transition-all text-sm tracking-widest text-center shadow-inner"
                                />
                            </div>
                        )}

                        {/* 4. Naos CTA */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                if (isReset) handleReset(e as any);
                                else handleLogin(e as any);
                            }}
                            disabled={gateState === 'LOADING'}
                            className="w-full relative group py-5 rounded-xl bg-[#05020a] border border-amber-600/30 overflow-hidden disabled:opacity-50 disabled:pointer-events-none mt-6 shadow-[0_0_30px_rgba(139,92,246,0.1)] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:border-amber-500/60 active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {/* Mystic Violet Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-indigo-800/10 to-violet-900/20 group-hover:from-violet-800/40 group-hover:via-indigo-700/30 group-hover:to-violet-800/40 transition-colors pointer-events-none" />
                            
                            <div className="relative flex items-center justify-center gap-4 text-white font-bold uppercase tracking-[0.4em] text-[10px] pointer-events-none">
                                {gateState === 'LOADING' ? <Loader2 className="animate-spin text-amber-500" size={14} /> : <Send size={14} className="text-amber-500/70 group-hover:text-amber-400 transition-colors" />}
                                {gateState === 'LOADING' ? t('login_state_loading') : 
                                 isReset ? t('login_state_reset') : t('login_btn')}
                            </div>
                        </button>
                    </form>

                    {/* Secondary Actions */}
                    <div className="pt-8 text-center">
                        {!isReset ? (
                            <button
                                onClick={() => setGateState('RESET')}
                                type="button"
                                className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors border-b border-transparent hover:border-white/20 pb-1"
                            >
                                {t('login_forgot_key')}
                            </button>
                        ) : (
                            <button
                                onClick={() => setGateState('NORMAL')}
                                type="button"
                                className="text-[9px] uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors border-b border-transparent hover:border-white/20 pb-1"
                            >
                                {t('login_back_btn')}
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Gate Seals */}
                <GateSeals />
            </div>
        </GateBackground>
    );
};
