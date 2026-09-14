import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import { supabase } from '../lib/supabase';

interface TelegramConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
        const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Not authenticated');
            }
            const apiHost = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${apiHost}/api/telegram/link-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate token');
            }

            const data = await response.json();
            if (data.token) {
                // Open Telegram with the one-time link token
                const telegramUrl = `https://t.me/Sigil_Naos_bot?start=${data.token}`;
                window.open(telegramUrl, '_blank');
                onClose();
            } else {
                throw new Error('Token not found in response');
            }
        } catch (err: any) {
            setError(t('server_error') || 'Error connecting to Telegram. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-cyan-500/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                    <Send className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif italic text-white">{t('telegram_sync_title')}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-white/40">{t('telegram_channel_label')}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body - Instructions */}
                        <div className="p-6 md:p-8 space-y-6">
                            <p className="text-sm text-white/60 font-light leading-relaxed">
                                Vincula tu cuenta de Telegram mediante un token seguro de un solo uso. No necesitas escribir tu correo, el proceso es autom�tico.
                                <br/><br/>
                                1. Haz click en Conectar Telegram.<br/>
                                2. Se abrir� la aplicaci�n de Telegram con el Sigil.<br/>
                                3. Haz click en Iniciar / Start en el bot.
                            </p>
                            
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer - Action */}
                        <div className="p-6 bg-black/40 border-t border-white/5 flex flex-col gap-4">
                            <button
                                onClick={handleConnect}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>{t('telegram_open_btn')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/20">
                                <ShieldCheck className="w-3 h-3" />
                                <span>{t('telegram_p2p_notice')}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


