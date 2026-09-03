import React from 'react';
import { useTranslation } from '../../i18n';
import { Fingerprint, Shield, Sparkles } from 'lucide-react';

export const GateSeals: React.FC = () => {
    const { t } = useTranslation();

    const seals = [
        { icon: <Fingerprint size={16} />, text: t('seal_access') },
        { icon: <Shield size={16} />, text: t('seal_identity') },
        { icon: <Sparkles size={16} />, text: t('seal_purpose') }
    ];

    return (
        <div className="w-full border-t border-white/5 pt-8 mt-12 hidden md:flex flex-row justify-center items-center gap-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            {seals.map((seal, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full border border-amber-500/20 bg-[#0a0a1f]/50 flex items-center justify-center text-amber-500/50 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                        {seal.icon}
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors text-center w-24">
                        {seal.text}
                    </span>
                </div>
            ))}
        </div>
    );
};
