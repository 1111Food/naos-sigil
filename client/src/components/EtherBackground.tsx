import React, { useMemo } from 'react';

const ZODIAC_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22'];

interface FloatingItem {
    id: number;
    char: string;
    left: string;
    top: string;
    duration: string;
    delay: string;
    size: string;
    opacity: number;
    driftX: string;
    driftY: string;
    rotationEnd: string;
}

export const EtherBackground: React.FC = () => {
    const symbols = useMemo(() => {
        const items: FloatingItem[] = [];
        const pool = [...ZODIAC_SYMBOLS, ...ZODIAC_SYMBOLS, ...NUMBERS];

        for (let i = 0; i < 48; i++) {
            const size = 0.5 + Math.random() * 1.5;
            items.push({
                id: i,
                char: pool[Math.floor(Math.random() * pool.length)],
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                duration: `${40 + Math.random() * 60}s`,
                delay: `-${Math.random() * 100}s`,
                size: `${size}rem`,
                opacity: size > 1.2 ? 0.02 + Math.random() * 0.03 : 0.04 + Math.random() * 0.06,
                driftX: `${(Math.random() - 0.5) * 200}px`,
                driftY: `${-100 - Math.random() * 200}px`, // Always upward but with variation
                rotationEnd: `${Math.random() * 90 - 45}deg`
            });
        }
        return items;
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
            {/* Base Ether Gradient removed to show Global Auras */}
            <div className="absolute inset-0 bg-transparent" />

            {/* Subtle Vignette - Theme Aware */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_var(--vignette-color)]" />

            {/* Floating Elements Area */}
            <div className="absolute inset-0">
                {symbols.map((item) => (
                    <div
                        key={item.id}
                        className="absolute theme-aware-symbol blur-[0.3px] font-serif animate-float-particle mix-blend-screen aura-zen-white:mix-blend-normal"
                        style={{
                            left: item.left,
                            top: item.top,
                            fontSize: item.size,
                            // @ts-ignore
                            '--duration': item.duration,
                            '--opacity': item.opacity,
                            '--drift-x': item.driftX,
                            '--drift-y': item.driftY,
                            '--rotation-end': item.rotationEnd,
                            animationDelay: item.delay,
                            opacity: `calc(var(--aura-symbol-opacity) * ${item.opacity * 10})`
                        } as React.CSSProperties}
                    >
                        {item.char}
                    </div>
                ))}
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
        </div>
    );
};
