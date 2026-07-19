import React from 'react';
import { X, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FrecuenciaDiaData } from '../hooks/useFrecuenciaDia';

interface FrecuenciaDiaModalProps {
    data: FrecuenciaDiaData;
    onClose: () => void;
    onHookClick: (hookText: string) => void;
}

export const FrecuenciaDiaModal: React.FC<FrecuenciaDiaModalProps> = ({ data, onClose, onHookClick }) => {
    const { t } = useTranslation();
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-gradient-to-b from-black to-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Score Gigante */}
                <div className="p-8 pb-4 text-center border-b border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs font-semibold mb-2">{t('sigil.dailyFrequency')}</p>
                    <div className="text-7xl font-light text-white tracking-tighter tabular-nums mb-1">
                        {data.score_energia_general}
                        <span className="text-4xl text-white/30">%</span>
                    </div>
                    <p className="text-white/60 text-sm">{t('sigil.quantumEnergyLevel')}</p>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    {/* Prioridades Dinámicas */}
                    <div className="grid grid-cols-3 gap-3">
                        {data.prioridades_dinamicas?.map((p, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="text-2xl mb-1">{p.icono}</div>
                                <div className="text-white font-medium text-lg">{p.score}</div>
                                <div className="text-white/40 text-[10px] uppercase tracking-wider">{p.nombre}</div>
                            </div>
                        ))}
                    </div>

                    {/* Texto Principal */}
                    <div className="space-y-4">
                        <p className="text-white/90 leading-relaxed font-light">
                            {data.texto_principal}
                        </p>
                    </div>

                    {/* Riesgo y Oportunidad */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                            <p className="text-red-400 text-xs uppercase tracking-widest font-semibold mb-2">{t('sigil.risk')}</p>
                            <p className="text-white/70 text-sm font-light leading-snug">{data.riesgo}</p>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                            <p className="text-emerald-400 text-xs uppercase tracking-widest font-semibold mb-2">{t('sigil.opportunity')}</p>
                            <p className="text-white/70 text-sm font-light leading-snug">{data.oportunidad}</p>
                        </div>
                    </div>

                    {/* Conversational Hook */}
                    {data.conversational_hook && (
                        <div className="pt-4 pb-2">
                            <button
                                onClick={() => {
                                    onHookClick(data.conversational_hook.replace(/['"]/g, ''));
                                    onClose();
                                }}
                                className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center justify-between gap-4">
                                    <p className="text-white/80 font-medium italic text-left text-sm">
                                        "{data.conversational_hook.replace(/['"]/g, '')}"
                                    </p>
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <Send className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
