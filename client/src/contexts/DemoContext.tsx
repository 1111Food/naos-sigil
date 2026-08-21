import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoContextType {
    isDemoActive: boolean;
    setDemoActive: (active: boolean) => void;
    isMockSigil: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isDemoModeAvailable = true;
    const isMockSigil = true;

    const [isDemoActive, setIsDemoActive] = useState(false);

    useEffect(() => {
        if (!isDemoModeAvailable) {
            setIsDemoActive(false);
            localStorage.removeItem('naos_demo_active');
            return;
        }
        const active = localStorage.getItem('naos_demo_active') === 'true';
        if (active) setIsDemoActive(true);
    }, [isDemoModeAvailable]);

    const setDemoActive = (active: boolean) => {
        if (!isDemoModeAvailable) return;
        setIsDemoActive(active);
        if (active) {
            localStorage.setItem('naos_demo_active', 'true');
        } else {
            localStorage.removeItem('naos_demo_active');
        }
    };

    return (
        <DemoContext.Provider value={{ isDemoActive, setDemoActive, isMockSigil }}>
            {children}
        </DemoContext.Provider>
    );
};

export const useDemo = () => {
    const context = useContext(DemoContext);
    if (!context) throw new Error('useDemo must be used within DemoProvider');
    return context;
};
