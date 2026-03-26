import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n';

interface TelegramConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
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
                            <p className="text-xs text-white/60 font-light leading-relaxed">
                                {t('telegram_instructions')}
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-4 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
                                        1
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-sm font-bold text-white mb-1">{t('telegram_step_1_title')}</h4>
                                        <p className="text-[10px] text-white/40">{t('telegram_step_1_desc')}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
                                        2
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-sm font-bold text-white mb-1">{t('telegram_step_2_title')}</h4>
                                        <p className="text-[10px] text-white/40">{t('telegram_step_2_desc')}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
                                        3
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-sm font-bold text-white mb-1">{t('telegram_step_3_title')}</h4>
                                        <p className="text-[10px] text-white/40 mb-2">{t('telegram_step_3_desc')}</p>
                                        <div className="px-3 py-2 bg-black/40 border border-cyan-500/20 rounded-lg flex items-center justify-between overflow-x-auto">
                                            <code className="text-xs text-cyan-400 whitespace-nowrap">tu_correo@email.com</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Action */}
                        <div className="p-6 bg-black/40 border-t border-white/5 flex flex-col gap-4">
                            <a
                                href="https://t.me/Sigil_Naos_bot"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                onClick={onClose}
                            >
                                <span>{t('telegram_open_btn')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
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
