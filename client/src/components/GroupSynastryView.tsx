import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupDynamicsModule } from './GroupDynamicsModule';
import { GroupHistoryModule } from './GroupHistoryModule';
import { useTranslation } from '../i18n';

interface GroupSynastryViewProps {
    profile: any;
}

export const GroupSynastryView: React.FC<GroupSynastryViewProps> = ({ profile }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'FORM' | 'HISTORY'>('FORM');
    // Group Dynamics Module handles its own internal calculation state.
    // However, if we view history, we might want to pass data back.
    // For now, if they select history, we could render the GroupDynamics report.
    // We'll pass a prop to GroupDynamicsModule to accept pre-calculated reports via a wrapper or internal prop.

    // To keep it simple and clean, if a history item is selected, we pass it down to GroupDynamicsModule
    // Or we handle it directly here if GroupDynamicsModule exports its report view.
    // Currently GroupDynamicsModule holds the `report` state internally.

    const [selectedHistoricalReport, setSelectedHistoricalReport] = useState<any>(null);

    const handleTabChange = (tab: 'FORM' | 'HISTORY') => {
        setActiveTab(tab);
        if (tab === 'FORM') {
            setSelectedHistoricalReport(null); // Clear selected history
        }
    };

    const handleSelectHistory = (data: any) => {
        setSelectedHistoricalReport(data);
        setActiveTab('FORM'); // Let GroupDynamicsModule render this data
    };

    return (
        <div className="w-full flex flex-col items-center justify-center relative p-4 mt-8">
            <div className="absolute inset-0 bg-[#050505]">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* Persistent Tab Menu */}
            <div className="relative z-20 flex justify-center mb-10 w-full max-w-4xl mx-auto border-b border-white/10 pb-4">
                <div className="flex gap-4 p-1 bg-white/5 border border-white/5 rounded-full p-2">
                    <button
                        onClick={() => handleTabChange('FORM')}
                        className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full transition-all ${activeTab === 'FORM' ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-white/40 hover:text-white/80'}`}
                    >
                        {t('synastry_group_assembly')}
                    </button>
                    <button
                        onClick={() => handleTabChange('HISTORY')}
                        className={`text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full transition-all ${activeTab === 'HISTORY' ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-white/40 hover:text-white/80'}`}
                    >
                        {t('synastry_group_history')}
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'FORM' && (
                    <motion.div key="form-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative z-10">
                        {/* We inject GroupDynamicsModule. We may need to modify it to accept `initialReport` */}
                        <GroupDynamicsModule initialReport={selectedHistoricalReport} onClearReport={() => setSelectedHistoricalReport(null)} />
                    </motion.div>
                )}

                {activeTab === 'HISTORY' && (
                    <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative z-10">
                        <GroupHistoryModule profileId={profile?.id} onSelectHistory={handleSelectHistory} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
