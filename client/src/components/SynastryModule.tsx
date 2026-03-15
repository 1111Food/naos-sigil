import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { WisdomOverlay } from './WisdomOverlay';
import { WISDOM_COPYS } from '../constants/wisdomContent';

import { SynastryHub } from './SynastryHub';
import { DualSynastryView } from './DualSynastryView';
import { GroupSynastryView } from './GroupSynastryView';

export const RelationshipType = {
    ROMANTIC: 'ROMANTIC',
    FRATERNAL: 'FRATERNAL',
    PARENTAL: 'PARENTAL',
    BUSINESS: 'BUSINESS',
    AMISTAD: 'AMISTAD',
    GROUP_DYNAMICS: 'GROUP_DYNAMICS'
} as const;

export type RelationshipType = typeof RelationshipType[keyof typeof RelationshipType];

interface SynastryModuleProps {
    onSwitchToTarot?: () => void;
}

export const SynastryModule: React.FC<SynastryModuleProps> = ({ onSwitchToTarot }) => {
    const { profile } = useProfile();
    const [showWisdom, setShowWisdom] = useState(false);

    // Router State
    const [view, setView] = useState<'HUB' | 'DUAL' | 'GROUP'>('HUB');

    if (!profile) return null;

    return (
        <div className="w-full min-h-[50vh] lg:min-h-[80vh] flex flex-col items-center relative overflow-visible lg:overflow-hidden">
            <WisdomOverlay
                key="wisdom-synastry"
                isOpen={showWisdom}
                onClose={() => setShowWisdom(false)}
                {...WISDOM_COPYS.SYNASTRY}
                accentColor={WISDOM_COPYS.SYNASTRY.accent}
            />

            <AnimatePresence mode="wait">
                {view === 'HUB' && (
                    <SynastryHub
                        key="hub"
                        onSelectView={setView}
                        onBack={() => { if (onSwitchToTarot) onSwitchToTarot(); }}
                        onShowWisdom={() => setShowWisdom(true)}
                    />
                )}

                {view === 'DUAL' && (
                    <DualSynastryView key="dual" profile={profile} />
                )}

                {view === 'GROUP' && (
                    <GroupSynastryView key="group" profile={profile} />
                )}
            </AnimatePresence>
        </div>
    );
};
