import React from 'react';
import { useUpgrade } from '../contexts/UpgradeContext';
import { useProfile } from '../hooks/useProfile';

export const GlobalUpgradeButton: React.FC = () => {
    const { triggerUpgrade } = useUpgrade();
    const { profile } = useProfile();

    // Do not show the upgrade button if they are already premium or admin
    if (profile?.plan_type === 'premium' || profile?.plan_type === 'admin') {
        return null;
    }

    return (
        <button
            onClick={() => triggerUpgrade('sigil')}
            className="flex text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            title="Activar Modo Arquitecto"
        >
            Hazte Arquitecto
        </button>
    );
};
