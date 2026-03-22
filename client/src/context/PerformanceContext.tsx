import React, { createContext, useContext, useState, useEffect } from 'react';

type PerformanceMode = 'high' | 'low';

interface PerformanceContextType {
    mode: PerformanceMode;
    isLowPerformance: boolean;
    isIdle: boolean;
    isSettled: boolean;
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

    const [isIdle, setIsIdle] = useState(false);
    const [isSettled, setIsSettled] = useState(false);
    const isLowPerformance = mode === 'low';

    // 2b. Global Static Frame Settle Cycle (7s fall / 5m sleep)
    useEffect(() => {
        if (isLowPerformance) return;

        let freezeTimer: ReturnType<typeof setTimeout>;

        const runCycle = () => {
            setIsSettled(false);
            freezeTimer = setTimeout(() => {
                setIsSettled(true);
            }, 10000); // 10s active fall
        };

        runCycle();

        const intervalTimer = setInterval(() => {
            runCycle();
        }, 5 * 60 * 1000); // 5 minutes interval

        return () => {
            clearTimeout(freezeTimer);
            clearInterval(intervalTimer);
        };
    }, [isLowPerformance]);

    // 3. Idle detection (5s without interaction)
    useEffect(() => {
        let timeoutId: number;

        const resetIdle = () => {
            setIsIdle(false);
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                setIsIdle(true);
            }, 5000); // 5 seconds threshold
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetIdle));

        resetIdle(); // Start timer

        return () => {
            events.forEach(event => window.removeEventListener(event, resetIdle));
            window.clearTimeout(timeoutId);
        };
    }, []);

    // 4. Effect to apply CSS class to body
    useEffect(() => {
        const classes = document.documentElement.classList;
        
        if (isLowPerformance) classes.add('low-performance');
        else classes.remove('low-performance');

        if (isIdle) classes.add('is-idle');
        else classes.remove('is-idle');

        localStorage.setItem('naos_performance_mode', mode);
    }, [mode, isLowPerformance, isIdle]);

    const setPerformanceMode = (newMode: PerformanceMode) => {
        setMode(newMode);
    };

    const togglePerformanceMode = () => {
        setMode(prev => prev === 'high' ? 'low' : 'high');
    };

    return (
        <PerformanceContext.Provider value={{ mode, isLowPerformance, isIdle, isSettled, setPerformanceMode, togglePerformanceMode }}>
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
