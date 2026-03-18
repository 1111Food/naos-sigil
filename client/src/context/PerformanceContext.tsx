import React, { createContext, useContext, useState, useEffect } from 'react';

type PerformanceMode = 'high' | 'low';

interface PerformanceContextType {
    mode: PerformanceMode;
    isLowPerformance: boolean;
    setPerformanceMode: (mode: PerformanceMode) => void;
    togglePerformanceMode: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Detect default mode (low on mobile by default)
    const isMobileDefault = () => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // 2. Initialize from localStorage or default
    const [mode, setMode] = useState<PerformanceMode>(() => {
        const saved = localStorage.getItem('naos_performance_mode');
        if (saved === 'high' || saved === 'low') return saved;
        return isMobileDefault() ? 'low' : 'high';
    });

    const isLowPerformance = mode === 'low';

    // 3. Effect to apply CSS class to body
    useEffect(() => {
        if (isLowPerformance) {
            document.documentElement.classList.add('low-performance');
        } else {
            document.documentElement.classList.remove('low-performance');
        }
        localStorage.setItem('naos_performance_mode', mode);
    }, [mode, isLowPerformance]);

    const setPerformanceMode = (newMode: PerformanceMode) => {
        setMode(newMode);
    };

    const togglePerformanceMode = () => {
        setMode(prev => prev === 'high' ? 'low' : 'high');
    };

    return (
        <PerformanceContext.Provider value={{ mode, isLowPerformance, setPerformanceMode, togglePerformanceMode }}>
            {children}
        </PerformanceContext.Provider>
    );
};

export const usePerformance = () => {
    const context = useContext(PerformanceContext);
    if (context === undefined) {
        throw new Error('usePerformance must be used within a PerformanceProvider');
    }
    return context;
};
