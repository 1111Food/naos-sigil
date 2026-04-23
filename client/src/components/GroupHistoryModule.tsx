import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trash2 } from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '../lib/api';
import { useTranslation } from '../i18n';

interface GroupHistoryModuleProps {
    profileId: string;
    onSelectHistory: (data: any) => void;
}

export const GroupHistoryModule: React.FC<GroupHistoryModuleProps> = ({ profileId, onSelectHistory }) => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        if (!profileId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/synastry/history`, { headers: getAuthHeaders() });
            if (!response.ok) throw new Error(t('synastry_fetch_error'));
            const result = await response.json();

            // Filter strictly for GROUP_DYNAMICS
            const groupHistory = result.filter((item: any) => item.relationship_type === 'GROUP_DYNAMICS');
            setHistory(groupHistory || []);
        } catch (err) {
            console.error("❌ Group History Error:", err);
            setError(t('synastry_fetch_error'));
        } finally {
            setIsLoading(false);
        }
    }, [profileId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        let sanitizedId = id;
        if (id && typeof id === 'string' && id.startsWith('r_')) {
            sanitizedId = id.substring(2);
        }
        if (!window.confirm(t('synastry_dissolve_confirm'))) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/synastry/record/${sanitizedId}`, {
                method: 'DELETE',
                headers: getAuthHeaders('DELETE')
            });
            if (!response.ok) throw new Error(t('synastry_delete_error'));
            setHistory(prev => prev.filter(item => item.id !== id && item.id !== sanitizedId));
        } catch (err) {
            alert(t('synastry_delete_error'));
        }
    };

    if (isLoading) {
        return <div className="w-full flex justify-center py-20"><Loader2 className="animate-spin text-blue-500/50" /></div>;
    }

    if (error) {
        return <div className="w-full text-center py-20 text-red-400 text-xs uppercase tracking-widest">{error}</div>;
    }

    if (history.length === 0) {
        return <div className="w-full text-center py-20 text-white/30 text-xs uppercase tracking-widest">{t('synastry_no_group_history')}</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 shrink-0 self-start pb-20 px-4">
            {history.map(item => (
                <div
                    key={item.id}
                    className="bg-black/40 border border-white/5 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all cursor-pointer group flex flex-col justify-between h-64 relative overflow-hidden backdrop-blur-xl shrink-0"
                    onClick={() => onSelectHistory(item.calculated_results)}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
                    <div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                {t('synastry_efficiency_score')} <span className="text-white text-[11px]">{item.calculated_results?.technicalReport?.score || '0'}%</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-1">
                                    {t('synastry_red_b2b')}
                                </span>
                            </div>
                        </div>
                        <h4 className="text-white font-serif text-xl mb-2 line-clamp-2 pr-4">{item.partner_name}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">
                            {new Date(item.created_at).toISOString().split('T')[0]}
                        </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                        <span className="text-[9px] uppercase tracking-[0.3em] font-black text-blue-400 group-hover:translate-x-1 transition-transform">{t('synastry_view_mesh')}</span>
                        <button
                            onClick={(e) => handleDeleteHistory(e, item.id)}
                            className="w-8 h-8 rounded-full bg-red-500/5 text-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                            title={t('synastry_dissolve_link')}
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};
