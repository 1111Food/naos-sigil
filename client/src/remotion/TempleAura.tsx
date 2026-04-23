// PADDING TO PROTECT AGAINST CORRUPTION
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, random } from 'remotion';
import { useMemo } from 'react';

const SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "1", "3", "7", "9", "11", "33"];

// Color Palettes
const PALETTES = {
    LOW: { color: '#FF8C00', speed: 0.5, glow: 'rgba(255, 140, 0, 0.4)' }, // Amber/Earth
    MID: { color: '#00FFFF', speed: 1.0, glow: 'rgba(0, 255, 255, 0.4)' }, // Cyan/Water
    HIGH: { color: '#E0B0FF', speed: 2.5, glow: 'rgba(224, 176, 255, 0.6)' } // Electric Violet/Ether
};

export const TempleAura = ({ score = 50 }: { score?: number }) => {
    const frame = useCurrentFrame();
    const { fps, height } = useVideoConfig();

    // Determine Logic Level
    const level = score >= 75 ? 'HIGH' : score >= 50 ? 'MID' : 'LOW';
    const config = PALETTES[level];

    // Particle Count based on score
    const particleCount = score >= 75 ? 80 : score >= 50 ? 40 : 20;

    // Respiración Sagrada: Ciclo de 8 segundos (4s inhalar, 4s exhalar)
    // Speed modulated by score
    const breathingCycle = Math.sin((frame / (fps * (8 / config.speed))) * Math.PI * 2);
    const scaleLogo = interpolate(breathingCycle, [-1, 1], [1, 1.03]);

    // Memoize particles to be stable, but count depends on render (ok for remotion if key changes)
    // We will generate max particles and just render slice to keep hooks stable
    const allParticles = useMemo(() => {
        return new Array(100).fill(0).map((_, i) => ({
            id: i,
            x: random(i) * 100,
            delay: random(i + 10) * 100,
            baseSpeed: 1 + random(i * 2) * 2,
            symbol: SYMBOLS[Math.floor(random(i * 3) * SYMBOLS.length)]
        }));
    }, []);

    const activeParticles = allParticles.slice(0, particleCount);

    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
            {/* Background removed to allow Global Aura to shine through */}
            {/* Dynamic Aura Background - REMOVED CENTER GLOW PER USER REQUEST */}

            <AbsoluteFill style={{ opacity: 0.05, filter: 'contrast(150%) brightness(1000%)' }}>
                <svg width="100%" height="100%">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </AbsoluteFill>

            {activeParticles.map((p) => {
                const y = interpolate(
                    (frame * (p.baseSpeed * config.speed) + p.delay) % (height + 200),
                    [0, height + 200],
                    [-100, height + 100]
                );

                const opacity = interpolate(
                    y,
                    [-100, height * 0.2, height * 0.8, height + 100],
                    [0, 0.4, 0.4, 0]
                );

                const scale = interpolate(
                    y,
                    [-100, height],
                    [0.8, 1.2]
                );

                const blur = interpolate(y, [0, height], [0, 2]);

                return (
                    <div
                        key={p.id}
                        style={{
                            position: 'absolute',
                            left: `${p.x}%`,
                            top: y,
                            fontSize: 24,
                            color: config.color,
                            opacity,
                            transform: `scale(${scale})`,
                            filter: `blur(${blur}px)`,
                            fontFamily: 'serif',
                            textShadow: `0 0 10px ${config.glow}`
                        }}
                    >
                        {p.symbol}
                    </div>
                );
            })}

            {/* Logo and Center Glow removed to stabilize Sigil visual environment */}
        </AbsoluteFill>
    );
};
