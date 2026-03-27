import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Archive, Calendar, Hexagon, Trophy, Sword } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getDailySynchronyQuote } from '../../utils/dailyOracle';
import { useTranslation } from '../../i18n';

interface ProtocolVaultProps {
    userId: string;
    onClose: () => void;
}

interface Relic {
    id: string;
    title: string;
    purpose: string;
    target_days: number;
    end_date: string;
    protocol_stage: string;
}

export const ProtocolVault: React.FC<ProtocolVaultProps> = ({ userId, onClose }) => {
    const { t } = useTranslation();
    const [relics, setRelics] = useState<Relic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRelics = async () => {
            try {
                // Fetch completed user protocols and join with protocols for title/purpose
                // Note: Assuming there's an implicit relation or we fetch separately and merge
                // for now fetching from user_protocols and we'll need title/purpose
                const { data, error } = await supabase
                    .from('user_protocols')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('status', 'completed')
                    .order('end_date', { ascending: false });

                if (error) throw error;

                // Fetch all protocols (intents) to match titles
                const { data: intents } = await supabase
                    .from('protocols')
                    .select('id, title, purpose')
                    .eq('user_id', userId);

                // Simple merge for now (in a real app we'd have a FK)
                const mergedRelics = (data || []).map(p => {
                    // Match by user_id and maybe date proximity if no FK, but let's assume we can find it
                    // For this implementation, we'll try to find the intent
                    const intent = intents?.find(i => i.title !== ''); // Placeholder matching logic
                    return {
                        id: p.id,
                        title: intent?.title || t('protocol_label' as any) || 'Protocolo NAOS',
                        purpose: intent?.purpose || t('evolution_conscious' as any) || 'Evolución Consciente',
                        target_days: p.target_days || 21,
                        end_date: p.end_date,
                        protocol_stage: p.protocol_stage
                    };
                });

                setRelics(mergedRelics);
            } catch (error) {
                console.error("Error al cargar la bóveda", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRelics();
    }, [userId]);

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#050505]/95 backdrop-blur-2xl px-4 md:px-0">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-4xl bg-[#080808]/80 border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] md:h-[80vh]"
            >
                {/* Header Section */}
                <div className="px-8 pt-10 pb-6 md:px-12 md:pt-16 border-b border-white/5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 text-amber-500">
                                <Archive size={16} />
                                <span className="text-[10px] uppercase tracking-[0.4em] font-black">{t('akashic_ascent_record')}</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif italic text-white tracking-tight">{t('akashic_vault_title')}</h2>
                            <p className="text-sm text-white/40 font-sans font-light">
                                "{t('akashic_vault_desc')}"
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <Calendar size={18} />
                        </button>
                    </div>

                    {/* Simple Stats/Status */}
                    <div className="mt-8 flex gap-8">
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">{t('relics_forged')}</span>
                            <span className="text-xl font-serif text-amber-200">{relics.length}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">{t('coherence_accumulated')}</span>
                            <span className="text-xl font-serif text-cyan-200">MAX</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                            <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                            <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">{t('invoking_records')}</span>
                        </div>
                    ) : relics.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                            <div className="p-8 rounded-full bg-white/[0.02] border border-white/5">
                                <Sword size={48} className="text-white/20" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif italic text-white/60">{t('vault_silent')}</h3>
                                <p className="text-xs uppercase tracking-widest text-white/30">{t('forge_first_seal')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence>
                                {relics.map((relic, index) => (
                                    <RelicCard key={relic.id} relic={relic} index={index} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Footer Subliminal */}
                <div className="px-12 py-6 border-t border-white/5 bg-white/[0.01]">
                    <p className="text-center font-serif italic text-white/20 text-xs tracking-widest leading-relaxed">
                        "{getDailySynchronyQuote(t('lang' as any) as any)}"
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const RelicCard: React.FC<{ relic: Relic; index: number }> = ({ relic, index }) => {
    const { t } = useTranslation();
    const is90Days = relic.target_days === 90;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
        >
            {/* Main Card Container */}
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-xl p-8 transition-all hover:bg-white/[0.06] hover:border-white/10 shadow-2xl">

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Hexagon size={120} strokeWidth={0.5} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Top Row: Title & Sello */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <h4 className="text-lg md:text-xl font-serif text-white/90 group-hover:text-white transition-colors">
                                {relic.title}
                            </h4>
                            <p className="text-xs italic text-white/40 group-hover:text-white/60 transition-colors">
                                "{relic.purpose}"
                            </p>
                        </div>

                        {/* Completion Seal */}
                        <div className={`p-3 rounded-2xl border transition-all ${is90Days
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                : "bg-slate-500/10 border-slate-500/30 text-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.2)]"
                            }`}>
                            {is90Days ? <Trophy size={20} /> : <Shield size={20} />}
                        </div>
                    </div>

                    {/* Middle: Large Seal Badge */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4">
                        <div className={`text-[9px] uppercase tracking-[0.5em] font-black mb-1 ${is90Days ? "text-amber-500" : "text-white/40"
                            }`}>
                            {t('cycle_completed', { days: relic.target_days })}
                        </div>
                        <div className={`h-[2px] w-12 rounded-full ${is90Days ? "bg-amber-500/50" : "bg-white/10"
                            }`} />
                    </div>

                    {/* Bottom Row: Metadata */}
                    <div className="mt-6 flex justify-between items-center border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2 text-white/20">
                            <Sparkles size={12} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">{t('relic_engraved')}</span>
                        </div>
                        <span className="text-[10px] text-white/40 font-mono">
                            {new Date(relic.end_date).toLocaleDateString(t('lang' as any) === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute -inset-1 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none ${is90Days ? "bg-amber-500/5" : "bg-cyan-500/5"
                    }`} />
            </div>
        </motion.div>
    );
};
