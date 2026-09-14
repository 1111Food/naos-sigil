import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n';
import { AiInterpretationCards } from './AiInterpretationCards';

interface DeepInterpretationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    text: string | null;
    isLoading: boolean;
    onRetry?: () => void;
}

export const DeepInterpretationModal: React.FC<DeepInterpretationModalProps> = ({
    isOpen,
    onClose,
    title,
    text,
    isLoading,
    onRetry
}) => {
    const { t } = useTranslation();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl bg-[#0B0C10] border border-purple-500/30 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between p-5 sm:p-6 border-b border-purple-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white">{t('deep_interpretation')}</h3>
                                    <p className="text-[10px] text-purple-300/60 uppercase tracking-wider">{title}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClose(); }}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10 relative z-50 cursor-pointer"
                            >
                                <X className="w-5 h-5 text-white/70" />
                            </button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                    <div className="w-12 h-12 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                                    <span className="text-xs uppercase tracking-[0.3em] text-amber-400/70 font-bold animate-pulse">
                                        {t('sintonizando_eter')}
                                    </span>
                                </div>
                            ) : text ? (
                                (() => {
                                    const isError = text.includes("No pudimos generar") || text.includes("We could not generate");
                                    if (isError) {
                                        return (
                                            <div className="flex flex-col items-center justify-center py-20 space-y-6 text-center px-4">
                                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
                                                    <X className="w-8 h-8 text-red-400" />
                                                </div>
                                                <p className="text-white/70 text-sm max-w-md">{text}</p>
                                                {onRetry && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onRetry(); }}
                                                        className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-95"
                                                    >
                                                        {text.includes("We could not generate") ? "RETRY INTERPRETATION" : "REINTENTAR INTERPRETACIÓN"}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }
                                    return <AiInterpretationCards text={text} />
                                })()
                            ) : (
                                <div className="text-center text-white/50 py-20 text-sm">
                                    {t('identity_syncing_msg') || 'Error...'}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
