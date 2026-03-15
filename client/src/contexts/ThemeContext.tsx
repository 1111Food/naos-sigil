import React, { createContext, useContext, useState, useEffect } from 'react';

export type AuraType = 'deep-space' | 'zen-stone' | 'astral-turquoise' | 'mystic-lilac' | 'naos-red' | 'temple-gold';

interface ThemeContextType {
    activeAura: AuraType;
    setAura: (aura: AuraType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeAura, setActiveAura] = useState<AuraType>(() => {
        const saved = localStorage.getItem('naos_aura');
        return (saved as AuraType) || 'deep-space';
    });

    useEffect(() => {
        localStorage.setItem('naos_aura', activeAura);
        const body = document.body;
        // Ensure transition class is present
        if (!body.classList.contains('global-aura-bg')) {
            body.classList.add('global-aura-bg');
        }
        body.classList.remove('aura-deep-space', 'aura-zen-stone', 'aura-astral-turquoise', 'aura-mystic-lilac', 'aura-naos-red', 'aura-temple-gold');
        body.classList.add(`aura-${activeAura}`);
    }, [activeAura]);

    return (
        <ThemeContext.Provider value={{ activeAura, setAura: setActiveAura }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
