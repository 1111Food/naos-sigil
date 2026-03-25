import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, User, ArrowLeft, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { OracleExplainer } from '../components/OracleExplainer';
import { useSound } from '../hooks/useSound';
import { useTranslation } from '../i18n/translations';
import { useProfile } from '../contexts/ProfileContext';
import { ShieldCheck } from 'lucide-react';

interface IdentityNexusProps {
    onNavigate: (view: any) => void;
    onBack: () => void;
}
// @ts-ignore
export const IdentityNexus: React.FC<IdentityNexusProps> = ({ onNavigate, onBack }) => {
    const { t } = useTranslation();
    const [explainerType, setExplainerType] = React.useState<any>(null);
    const { playSound } = useSound();
    const { profile } = useProfile();
    const isAdmin = profile?.plan_type === 'admin';

    React.useEffect(() => {
        window.scrollTo(0, 0);
        const seen = localStorage.getItem('has_seen_identity');
        if (!seen) {
            setExplainerType('IDENTITY_COMPLETE');
            localStorage.setItem('has_seen_identity', 'true');
        }
    }, []);

    const options = [
        {
            id: 'PROFILE',
            title: t('view_full_code'),
            subtitle: t('view_full_code_sub'),
            icon: User,
            color: "from-blue-500/20 to-cyan-500/10",
            border: "border-blue-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(30,64,175,0.4)]"
        },
        {
            id: 'MANUALS',
            title: t('wisdom_library'),
            subtitle: t('wisdom_library_sub'),
            icon: Book,
            color: "from-purple-500/20 to-magenta-500/10",
            border: "border-purple-500/30",
            glow: "shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]"
        }
    ];

    return (
        <div className="relative min-h-[60vh] flex flex-col items-center justify-center p-6 mt-12">
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => { playSound('click'); onBack(); }}
                className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors group z-50"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">{t('back_temple')}</span>
            </motion.button>

                <div className="flex flex-col items-center justify-center gap-4 text-center mb-16 space-y-4">
                    {isAdmin && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 mb-2"
                        >
                            <ShieldCheck size={12} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Acceso Admin</span>
                        </motion.div>
                    )}
                    <div className="flex items-center justify-center gap-4">
                        <h2 className="text-3xl md:text-4xl font-serif italic text-white/90 tracking-wide">
                            {t('identity_nexus_title')}
                        </h2>
                        <button 
                            onClick={(e) => { e.stopPropagation(); playSound('click'); setExplainerType('IDENTITY_NEXUS'); }}
                            className="p-1 rounded-full text-white/40 hover:text-white hover:scale-110 transition-all"
                        >
                            <Info size={16} />
                        </button>
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mx-auto" />
                    <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">{t('architecture_ser')}</p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {options.map((opt, i) => (
                    <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => { playSound('click'); onNavigate(opt.id); }}
                        className={cn(
                            "relative group cursor-pointer p-10 rounded-[3rem] border transition-all duration-700 overflow-hidden bg-black/40 backdrop-blur-3xl",
                            opt.border,
                            opt.glow,
                            "hover:scale-[1.02] hover:bg-white/5"
                        )}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); playSound('click'); setExplainerType(opt.id === 'PROFILE' ? 'IDENTITY_COMPLETE' : 'IDENTITY_WISDOM'); }}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:scale-110 hover:bg-white/10 transition-all z-20 group/info"
                        >
                            <Info size={16} className="group-hover/info:rotate-12 transition-transform" />
                        </button>

                        {/* Decorative Background */}
                        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", opt.color)} />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:border-white/30 transition-all duration-500">
                                <opt.icon size={32} className="text-white/60 group-hover:text-white transition-colors" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xl font-serif italic tracking-wider text-white/90">
                                    {opt.title}
                                </h3>
                                <p className="text-[11px] text-white/40 uppercase tracking-widest leading-relaxed">
                                    {opt.subtitle}
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-400">{t('access')}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Explainer Overlay */}
            <AnimatePresence>
                {explainerType && (
                    <OracleExplainer 
                        type={explainerType} 
                        onClose={() => setExplainerType(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
