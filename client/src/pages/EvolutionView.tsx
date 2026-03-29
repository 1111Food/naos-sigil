import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Wind, Mountain, Droplets, ChevronLeft, Play, Quote, Bell } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { useTranslation } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { LaboratoryReminderModal } from '../components/Sanctuary/LaboratoryReminderModal';

interface EvolutionViewProps {
    onBack: () => void;
}

type ElementType = 'FUEGO' | 'AIRE' | 'TIERRA' | 'AGUA';

interface Practice {
    id: string;
    titleKey: string;
    duration: string;
    descriptionKey: string;
    typeKey: string;
}

const ELEMENT_DATA: Record<ElementType, {
    titleKey: string,
    subtitleKey: string,
    color: string,
    accent: string,
    icon: any,
    breathwork: Practice[],
    meditations: Practice[],
    declarations: Practice[]
}> = {
    FUEGO: {
        titleKey: 'element_fire',
        subtitleKey: 'synastry_activar_transmutar',
        color: 'rose',
        accent: '#f43f5e',
        icon: Flame,
        breathwork: [
            { id: 'f1', titleKey: 'practice_f1_title', duration: '5 min', descriptionKey: 'practice_f1_desc', typeKey: 'practice_type_breath' },
            { id: 'f-b1', titleKey: 'practice_fb1_title', duration: '3 min', descriptionKey: 'practice_fb1_desc', typeKey: 'practice_type_breath' }
        ],
        meditations: [
            { id: 'f2', titleKey: 'practice_f2_title', duration: '10 min', descriptionKey: 'practice_f2_desc', typeKey: 'practice_type_meditation' }
        ],
        declarations: [
            { id: 'f3', titleKey: 'practice_f3_title', duration: '1 min', descriptionKey: 'practice_f3_desc', typeKey: 'practice_type_declaration' }
        ]
    },
    AIRE: {
        titleKey: 'element_air',
        subtitleKey: 'synastry_fluir_adaptar',
        color: 'cyan',
        accent: '#06b6d4',
        icon: Wind,
        breathwork: [
            { id: 'a1', titleKey: 'practice_a1_title', duration: '7 min', descriptionKey: 'practice_a1_desc', typeKey: 'practice_type_breath' }
        ],
        meditations: [
            { id: 'a2', titleKey: 'practice_a2_title', duration: '12 min', descriptionKey: 'practice_a2_desc', typeKey: 'practice_type_meditation' }
        ],
        declarations: [
            { id: 'a3', titleKey: 'practice_a3_title', duration: '1 min', descriptionKey: 'practice_a3_desc', typeKey: 'practice_type_declaration' }
        ]
    },
    TIERRA: {
        titleKey: 'element_earth',
        subtitleKey: 'synastry_concretar_arraigar',
        color: 'emerald',
        accent: '#10b981',
        icon: Mountain,
        breathwork: [
            { id: 't1', titleKey: 'practice_t1_title', duration: '4 min', descriptionKey: 'practice_t1_desc', typeKey: 'practice_type_breath' }
        ],
        meditations: [
            { id: 't2', titleKey: 'practice_t2_title', duration: '15 min', descriptionKey: 'practice_t2_desc', typeKey: 'practice_type_meditation' }
        ],
        declarations: [
            { id: 't3', titleKey: 'practice_t3_title', duration: '1 min', descriptionKey: 'practice_t3_desc', typeKey: 'practice_type_declaration' }
        ]
    },
    AGUA: {
        titleKey: 'element_water',
        subtitleKey: 'synastry_regular_sanar',
        color: 'blue',
        accent: '#3b82f6',
        icon: Droplets,
        breathwork: [
            { id: 'ag1', titleKey: 'practice_ag1_title', duration: '6 min', descriptionKey: 'practice_ag1_desc', typeKey: 'practice_type_breath' }
        ],
        meditations: [
            { id: 'ag2', titleKey: 'practice_ag2_title', duration: '10 min', descriptionKey: 'practice_ag2_desc', typeKey: 'practice_type_meditation' }
        ],
        declarations: [
            { id: 'ag3', titleKey: 'practice_ag3_title', duration: '1 min', descriptionKey: 'practice_ag3_desc', typeKey: 'practice_type_declaration' }
        ]
    }
};

export const EvolutionView: React.FC<EvolutionViewProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const { playSound } = useSound();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020202] flex flex-col pt-20 overflow-hidden"
        >
            {/* BACKGROUND ANIMATION */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

            {/* HEADER */}
            <header className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                <button
                    onClick={() => { playSound('click'); onBack(); }}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors group self-start md:self-auto"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('synastry_regresar')}
                </button>
                
                <div className="flex flex-col items-center md:items-end text-center md:text-right">
                    <h2 className="text-3xl md:text-5xl font-thin tracking-[0.4em] text-white uppercase select-none mb-2">{t('synastry_laboratorio')}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]" />
                            <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.5em]">{t('synastry_evolution_stream')}</p>
                        </div>
                        <button
                            onClick={() => { playSound('click'); setIsReminderModalOpen(true); }}
                            className="flex items-center gap-3 px-6 py-3 rounded-full bg-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_45px_rgba(168,85,247,0.5)] transition-all duration-300 group/btn border border-purple-400/30"
                        >
                            <Bell className="w-4 h-4 text-white animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('lab_reminder_btn')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar w-full max-w-7xl mx-auto">

                {/* ELEMENTAL SYSTEM (Grid 4) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {(Object.keys(ELEMENT_DATA) as ElementType[]).map((key) => {
                        const data = ELEMENT_DATA[key];
                        const Icon = data.icon;
                        const isSelected = selectedElement === key;

                        return (
                            <motion.div
                                key={key}
                                layout
                                className={`
                                    relative p-1 rounded-[3rem] transition-all overflow-hidden cursor-pointer
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-white/10 to-transparent'
                                        : 'bg-white/5 hover:bg-white/10'}
                                `}
                                onClick={() => {
                                    playSound('click');
                                    setSelectedElement(isSelected ? null : key);
                                }}
                            >
                                <div className={`h-full p-8 rounded-[2.9rem] bg-black/60 backdrop-blur-3xl flex flex-col items-center text-center
                                    ${isSelected ? 'border border-white/10' : 'border border-transparent'}
                                `}>
                                    {/* Icon Box */}
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border border-white/5 transition-all
                                        ${isSelected ? `bg-${data.color}-500/20 border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]` : 'bg-white/5'}
                                    `}>
                                        <Icon className={`w-8 h-8 ${isSelected ? `text-${data.color}-400` : 'text-white/20'}`} />
                                    </div>

                                    <h3 className="text-2xl font-thin tracking-[0.2em] text-white uppercase mb-2">{t(data.titleKey as any)}</h3>
                                    <p className={`text-[9px] uppercase tracking-[0.3em] font-black ${isSelected ? `text-${data.color}-400` : 'text-white/20'}`}>
                                        {t(data.subtitleKey as any)}
                                    </p>

                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="mt-10 w-full space-y-8"
                                            >
                                                {/* SECTIONS: BREATH, MEDIT, DECLAR */}
                                                <PracticeSection t={t} title={t('synastry_respiracion_energia')} practices={ELEMENT_DATA[selectedElement].breathwork} />
                                                <PracticeSection t={t} title={t('synastry_meditaciones_guiadas')} practices={ELEMENT_DATA[selectedElement].meditations} />
                                                <PracticeSection t={t} title={t('synastry_decretos_declaraciones')} practices={ELEMENT_DATA[selectedElement].declarations} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </main>

            <LaboratoryReminderModal 
                isOpen={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                userId={user?.id || ''}
            />
        </motion.div>
    );
};

const PracticeSection = ({ t, title, practices }: { t: any, title: string, practices: Practice[] }) => (
    <div className="space-y-4">
        <h4 className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black border-b border-white/5 pb-2 text-left">{title}</h4>
        <div className="space-y-3">
            {practices.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all text-left flex items-start gap-4 active:scale-[0.98] group/practice">
                    <div className="mt-1">
                        {p.typeKey === 'practice_type_declaration' ? <Quote className="w-3 h-3 text-white/20" /> : <Play className="w-3 h-3 text-white/20" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h5 className="text-[11px] font-bold text-white/80 transition-colors group-hover/practice:text-white">{t(p.titleKey as any)}</h5>
                            <span className="text-[8px] text-white/20 font-black">{p.duration}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-tight">{t(p.descriptionKey as any)}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
