import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Infinity as InfinityIcon, ArrowRight, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';
import { naosQueryFn, naosQueryMutate } from '../lib/queryClient';
import { SynastryResultView } from './SynastryResultView';
import { RelationshipType } from './SynastryModule';
import { RelationshipLaboratory } from '../pages/RelationshipLaboratory';
import { useTranslation } from '../i18n';

interface DualSynastryViewProps {
    profile: any;
}

export const DualSynastryView: React.FC<DualSynastryViewProps> = ({ profile }) => {
    const { t, language } = useTranslation();
    const [step, setStep] = useState<'FORM' | 'TUNING' | 'RESULT'>('FORM');
    const [activeTab, setActiveTab] = useState<'FORM' | 'HISTORY'>('FORM');

    const [partnerData, setPartnerData] = useState({
        name: '', birthDate: '', birthTime: '12:00', birthCity: 'Guatemala', birthCountry: 'Guatemala'
    });
    const [relationshipType, setRelationshipType] = useState<RelationshipType>(RelationshipType.ROMANTIC);
    const [executionData, setExecutionData] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const qc = useQueryClient();

    const { data: history = [], refetch: refetchHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['synastry-history', profile?.id],
        queryFn: async () => {
            try {
                const result = await naosQueryFn<any[]>(`${API_BASE_URL}/api/synastry/history`);
                return result.filter((item: any) => item.relationship_type !== 'GROUP_DYNAMICS');
            } catch (err: any) {
                throw new Error(err.message || t('synastry_fetch_error'));
            }
        },
        enabled: activeTab === 'HISTORY' && !!profile?.id,
        staleTime: 1000 * 60 * 5,
    });

    const analyzeMutation = useMutation({
        mutationFn: async (payload: any) => {
            try {
                return await naosQueryMutate<any>(`${API_BASE_URL}/api/synastry/analyze`, 'POST', payload);
            } catch (err: any) {
                throw new Error(err.message || t('synastry_fetch_error'));
            }
        }
    });

    const deleteHistoryMutation = useMutation({
        mutationFn: async (id: string) => {
            let sanitizedId = id;
            if (id && typeof id === 'string' && id.startsWith('r_')) {
                sanitizedId = id.substring(2);
            }
            try {
                await naosQueryMutate(`${API_BASE_URL}/api/synastry/record/${sanitizedId}`, 'DELETE');
                return { id, sanitizedId };
            } catch (err) {
                throw new Error(t('synastry_delete_error'));
            }
        },
        onSuccess: ({ id, sanitizedId }) => {
            qc.setQueryData(['synastry-history', profile?.id], (oldData: any[]) => {
                if (!oldData) return [];
                return oldData.filter(item => item.id !== id && item.id !== sanitizedId);
            });
        },
        onError: () => {
            alert(t('synastry_delete_error'));
        }
    });

    const handleCalculate = async () => {
        if (!partnerData.name || !partnerData.birthDate || !partnerData.birthCity || !partnerData.birthCountry) {
            setError(t('synastry_form_incomplete'));
            return;
        }

        setError(null);
        setStep('TUNING');

        const payload = { 
            userProfile: profile, 
            partnerData: { ...partnerData }, 
            relationshipType,
            language: language || 'es'
        };

        analyzeMutation.mutate(payload, {
            onSuccess: (result) => {
                setTimeout(() => {
                    setExecutionData(result.data);
                    setStep('RESULT');
                }, 2500);
            },
            onError: (err: any) => {
                console.error("❌ Synastry Error:", err);
                setError(err.message || t('synastry_network_error'));
                setStep('FORM');
            }
        });
    };

    const handleTabChange = (tab: 'FORM' | 'HISTORY') => {
        setActiveTab(tab);
        if (tab === 'HISTORY') {
            refetchHistory();
        } else {
            setStep('FORM');
        }
    };

    const handleSelectHistory = async (item: any) => {
        setActiveTab('FORM');
        setStep('TUNING');
        
        const reconstructedPartnerData = {
            name: item.partner_name,
            birthDate: item.partner_birth_date || '', 
            birthTime: '12:00',
            birthCity: item.calculated_results?.partnerInfo?.birthCity || 'Guatemala',
            birthCountry: item.calculated_results?.partnerInfo?.birthCountry || 'Guatemala'
        };
        
        setPartnerData(reconstructedPartnerData);
        setRelationshipType(item.relationship_type);
        
        const payload = { 
            userProfile: profile, 
            partnerData: reconstructedPartnerData, 
            relationshipType: item.relationship_type,
            language: language || 'es'
        };

        analyzeMutation.mutate(payload, {
            onSuccess: (result) => {
                setExecutionData(result.data);
                setStep('RESULT');
            },
            onError: (err: any) => {
                console.error("❌ History Resync Error:", err);
                setError(err.message || t('synastry_network_error'));
                setStep('FORM');
            }
        });
    };

    const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm(t('synastry_delete_confirm'))) return;
        deleteHistoryMutation.mutate(id);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center relative p-4 mt-4 pb-36 md:pb-20">
            <div className="absolute inset-0 bg-[#050505]">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-900/10 blur-[100px] rounded-full" />
            </div>

            {/* Persistent Tab Menu */}
            <div className="relative z-20 flex justify-center mb-10 w-full max-w-4xl mx-auto border-b border-white/10 pb-4">
                <div className="flex gap-4 p-1 bg-white/5 border border-white/5 rounded-full p-2">
                    <button
                        onClick={() => handleTabChange('FORM')}
                        className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full transition-all ${activeTab === 'FORM' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-white/40 hover:text-white/80'}`}
                    >
                        {t('synastry_invoke_mirror')}
                    </button>
                    <button
                        onClick={() => handleTabChange('HISTORY')}
                        className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full transition-all ${activeTab === 'HISTORY' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-white/40 hover:text-white/80'}`}
                    >
                        {t('synastry_dual_history')}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'FORM' && (
                    <motion.div key="form-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative z-10 flex flex-col items-center">
                        {step === 'FORM' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-2xl bg-black/40 border border-purple-500/20 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl shrink-0"
                            >
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-serif text-primary mb-3">{t('synastry_arch_resonance')}</h3>
                                    <p className="text-secondary text-label leading-relaxed px-4">{t('synastry_arch_resonance_desc')}</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] tracking-widest uppercase text-center font-bold">
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-6">
                                    {(activeTab === 'FORM' && (analyzeMutation.isPending)) && (
                                        <div className="text-center py-20 animate-pulse text-white/50 text-xs tracking-widest uppercase">
                                            <div className="w-16 h-16 mx-auto mb-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                            {t('synastry_processing')}
                                        </div>
                                    )}
                                    
                                    <div className="relative w-full flex justify-center pb-6 border-b border-white/10">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all backdrop-blur-md"
                                            >
                                                <span>
                                                    {[
                                                        { id: RelationshipType.ROMANTIC, label: t('synastry_romantic') },
                                                        { id: RelationshipType.AMISTAD, label: t('synastry_friendship') },
                                                        { id: RelationshipType.PARENTAL, label: t('synastry_parental') },
                                                        { id: RelationshipType.BUSINESS, label: t('synastry_business') },
                                                    ].find(t => t.id === relationshipType)?.label || t('synastry_access')}
                                                </span>
                                                <ChevronDown size={14} className={cn("transition-transform duration-300 text-purple-400", isDropdownOpen && "rotate-180")} />
                                            </button>

                                            <AnimatePresence>
                                                {isDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                        className="absolute top-14 left-1/2 -translate-x-1/2 w-56 bg-black/90 border border-purple-500/20 rounded-2xl p-1.5 z-30 shadow-2xl backdrop-blur-xl flex flex-col gap-1"
                                                    >
                                                        {[
                                                            { id: RelationshipType.ROMANTIC, label: t('synastry_romantic') },
                                                            { id: RelationshipType.AMISTAD, label: t('synastry_friendship') },
                                                            { id: RelationshipType.PARENTAL, label: t('synastry_parental') },
                                                            { id: RelationshipType.BUSINESS, label: t('synastry_business') },
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => { setRelationshipType(opt.id); setIsDropdownOpen(false); }}
                                                                className={cn(
                                                                    "w-full px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-left transition-colors flex items-center justify-between",
                                                                    opt.id === relationshipType 
                                                                        ? "bg-purple-500/20 text-purple-200 border border-purple-500/30" 
                                                                        : "text-white/50 hover:text-white hover:bg-white/5"
                                                                )}
                                                            >
                                                                <span>{opt.label}</span>
                                                                {opt.id === relationshipType && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-label text-secondary ml-2">{t('synastry_identity_label')}</label>
                                            <input
                                                type="text"
                                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                                placeholder={t('synastry_name_placeholder')}
                                                value={partnerData.name}
                                                onChange={e => setPartnerData({ ...partnerData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">{t('synastry_temporal_point')}</label>
                                                <input
                                                    type="date"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 invert-calendar-icon"
                                                    value={partnerData.birthDate}
                                                    onChange={e => setPartnerData({ ...partnerData, birthDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">{t('synastry_approx_hour')}</label>
                                                <input
                                                    type="time"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 invert-calendar-icon"
                                                    value={partnerData.birthTime}
                                                    onChange={e => setPartnerData({ ...partnerData, birthTime: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">{t('synastry_base_city')}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder={t('synastry_city_placeholder')}
                                                    value={partnerData.birthCity}
                                                    onChange={e => setPartnerData({ ...partnerData, birthCity: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-label text-secondary ml-2">{t('synastry_country')}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                                    placeholder={t('synastry_country_placeholder')}
                                                    value={partnerData.birthCountry}
                                                    onChange={e => setPartnerData({ ...partnerData, birthCountry: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center mt-10">
                                        <button
                                            onClick={handleCalculate}
                                            disabled={analyzeMutation.isPending || !partnerData.name || !partnerData.birthDate}
                                            className={cn(
                                                "px-10 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-sm transition-all relative overflow-hidden group",
                                                (!partnerData.name || !partnerData.birthDate) ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                                            )}
                                        >
                                            <span className="relative z-10 flex items-center gap-3">
                                                {analyzeMutation.isPending ? t('synastry_generating') : t('synastry_analyze')}
                                                {analyzeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'RESULT' && executionData && (
                            <div className="w-full">
                                <div className="flex justify-center mb-6">
                                    <button onClick={() => setStep('FORM')} className="text-[10px] uppercase tracking-widest border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors relative z-50">
                                        {t('synastry_clear_analysis')}
                                    </button>
                                </div>
                                {executionData.consultation ? (
                                    <RelationshipLaboratory 
                                        metrics={executionData.metrics}
                                        report={executionData.consultation}
                                    />
                                ) : (
                                    <SynastryResultView
                                        data={executionData}
                                        onNew={() => setStep('FORM')}
                                        userA={profile}
                                        userB={{
                                            ...executionData.partnerInfo,
                                            ...partnerData
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'HISTORY' && (
                    <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 shrink-0 self-start pb-20">
                        {isLoadingHistory ? (
                            <div className="col-span-full flex justify-center py-20 text-white/30 text-xs uppercase tracking-widest">{t('synastry_loading')}</div>
                        ) : history.length === 0 ? (
                            <div className="col-span-full flex justify-center py-20 text-white/30 text-xs uppercase tracking-widest">{t('synastry_no_history')}</div>
                        ) : (
                            history.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-black/40 border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all cursor-pointer group flex flex-col justify-between h-56 relative overflow-hidden backdrop-blur-xl"
                                    onClick={() => handleSelectHistory(item)}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
                                    <div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                                                Score: <span className="text-white text-[11px]">{item.calculated_results?.report?.score || '0'}%</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-1">
                                                    {item.relationship_type === RelationshipType.ROMANTIC ? t('synastry_romantic') :
                                                        item.relationship_type === RelationshipType.AMISTAD ? t('synastry_friendship') :
                                                            item.relationship_type === RelationshipType.BUSINESS ? t('synastry_business') : t('synastry_family')}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="text-white font-serif text-2xl truncate mb-1 pr-4">{item.partner_name}</h4>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">
                                            {new Date(item.created_at).toISOString().split('T')[0]}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                                        <span className="text-[9px] uppercase tracking-[0.3em] font-black text-purple-400 group-hover:translate-x-1 transition-transform">{t('synastry_review')}</span>
                                        <button
                                            onClick={(e) => handleDeleteHistory(e, item.id)}
                                            className="w-8 h-8 rounded-full bg-red-500/5 text-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                            title={t('synastry_release_record')}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
