import React from 'react';

export const GateBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative min-h-[100dvh] w-full flex flex-col overflow-y-auto overscroll-none touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Fallback CSS Background */}
            <div className="fixed inset-0 z-0 bg-[#020205]">
                {/* Radial Glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#2a1b4d]/20 to-transparent rounded-full blur-[100px] opacity-70 pointer-events-none" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-[80px] opacity-50 pointer-events-none" />
                
                {/* Subtle Grid / Starfield Placeholder */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-12 px-6">
                {children}
            </div>
        </div>
    );
};
