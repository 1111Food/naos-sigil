import React, { createContext, useContext, useState, useCallback } from 'react';

import { WISDOM_COPYS } from '../constants/wisdomContent';
import { useTranslation } from '../i18n';

type WisdomType = 'IDENTITY' | 'ORACLE' | 'PROTOCOL' | 'LAB' | 'DECISIONS' | 'MISSION' | 'CODIGO_IDENTIDAD' | 'SYNASTRY';

interface WisdomState {
    isOpen: boolean;
    type: WisdomType | null;
    title: string;
    description: string;
    accentColor: 'cyan' | 'magenta' | 'emerald' | 'orange' | 'purple' | 'red';
}

interface WisdomContextType {
    wisdom: WisdomState;
    openWisdom: (type: WisdomType) => void;
    closeWisdom: () => void;
}

const WisdomContext = createContext<WisdomContextType | undefined>(undefined);


export const WisdomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language } = useTranslation();
    const isEn = language === 'en';

    const [wisdom, setWisdom] = useState<WisdomState>({
        isOpen: false,
        type: null,
        title: '',
        description: '',
        accentColor: 'cyan'
    });

    const openWisdom = useCallback((type: WisdomType) => {
        const WISDOM_CONTENT_MAP: Record<WisdomType, { title: string; description: string; accentColor: 'cyan' | 'magenta' | 'emerald' | 'orange' | 'purple' | 'red' }> = {
            IDENTITY: { title: WISDOM_COPYS.IDENTITY_NEXUS.title[isEn ? 'en' : 'es'], description: WISDOM_COPYS.IDENTITY_NEXUS.description[isEn ? 'en' : 'es'], accentColor: WISDOM_COPYS.IDENTITY_NEXUS.accent },
            CODIGO_IDENTIDAD: { title: WISDOM_COPYS.IDENTITY_NEXUS.title[isEn ? 'en' : 'es'], description: WISDOM_COPYS.IDENTITY_NEXUS.description[isEn ? 'en' : 'es'], accentColor: WISDOM_COPYS.IDENTITY_NEXUS.accent },
            ORACLE: { title: WISDOM_COPYS.ORACLE.title[isEn ? 'en' : 'es'], description: WISDOM_COPYS.ORACLE.description[isEn ? 'en' : 'es'], accentColor: WISDOM_COPYS.ORACLE.accent },
            PROTOCOL: { title: WISDOM_COPYS.PROTOCOL_21.title[isEn ? 'en' : 'es'], description: WISDOM_COPYS.PROTOCOL_21.description[isEn ? 'en' : 'es'], accentColor: WISDOM_COPYS.PROTOCOL_21.accent },
            LAB: { title: WISDOM_COPYS.ELEMENTAL_LAB.title[isEn ? 'en' : 'es'], description: WISDOM_COPYS.ELEMENTAL_LAB.description[isEn ? 'en' : 'es'], accentColor: WISDOM_COPYS.ELEMENTAL_LAB.accent },
            SYNASTRY: { title: WISDOM_COPYS.SYNASTRY.title[isEn ? 'en' : 'es'], description: WISDOM_COPYS.SYNASTRY.description[isEn ? 'en' : 'es'], accentColor: WISDOM_COPYS.SYNASTRY.accent },
            DECISIONS: {
                title: isEn ? 'Decision Radiography' : 'Radiografía de Decisiones',
                description: isEn ? 'Analyze your choices under the light of symbols. A strategy tool for moments of bifurcation.' : 'Analiza tus elecciones bajo la luz de los símbolos. Una herramienta de estrategia para momentos de bifurcación.',
                accentColor: 'purple'
            },
            MISSION: {
                title: isEn ? 'Mission of the Year' : 'Misión del Año',
                description: isEn ? 'Your 12-month temporal horizon. The master focus coordinating all your actions in this cycle.' : 'Tu horizonte temporal de 12 meses. El enfoque maestro que coordina todas tus acciones en este ciclo.',
                accentColor: 'red'
            }
        };

        const content = WISDOM_CONTENT_MAP[type];
        if (content) {
            setWisdom({
                isOpen: true,
                type,
                ...content
            });
        }
    }, [isEn]);

    const closeWisdom = useCallback(() => {
        setWisdom(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <WisdomContext.Provider value={{ wisdom, openWisdom, closeWisdom }}>
            {children}
        </WisdomContext.Provider>
    );
};

export const useWisdom = () => {
    const context = useContext(WisdomContext);
    if (!context) {
        throw new Error('useWisdom must be used within a WisdomProvider');
    }
    return context;
};
