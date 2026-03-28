import { useRef, useCallback, useEffect } from 'react';

export type BreathPhase = 'inhale' | 'exhale' | 'hold' | 'none';

export const useBreathingSound = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const swellGainRef = useRef<GainNode | null>(null);
    const subGainRef = useRef<GainNode | null>(null);
    const pannerRef = useRef<StereoPannerNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const subOscRef = useRef<OscillatorNode | null>(null);

    const initAudio = useCallback(() => {
        if (audioCtxRef.current) return;

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = ctx;

            // 1. White Noise Generator (Lung Swoosh Effect)
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;
            noiseSourceRef.current = noise;

            // 2. High Shaper (Lowpass filter shaping the swoosh sound)
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            filterRef.current = filter;

            // 3. Stereo Panner
            const panner = ctx.createStereoPanner();
            panner.pan.value = 0;
            pannerRef.current = panner;

            // 4. Swell Node (Riding volume curves)
            const swell = ctx.createGain();
            swell.gain.value = 0.001;
            swellGainRef.current = swell;

            // 5. Sub-Bass Oscillator (40Hz)
            const subOsc = ctx.createOscillator();
            subOsc.type = 'sine';
            subOsc.frequency.value = 40;
            subOscRef.current = subOsc;

            const subGain = ctx.createGain();
            subGain.gain.value = 0.001;
            subGainRef.current = subGain;

            // Connect nodes
            noise.connect(filter);
            filter.connect(panner);
            panner.connect(swell);
            swell.connect(ctx.destination);

            subOsc.connect(subGain);
            subGain.connect(ctx.destination);

            noise.start();
            subOsc.start();
        } catch (err) {
            console.error("[useBreathingSound] Failed to init audio:", err);
        }
    }, []);

    const setPhase = useCallback((phase: BreathPhase, duration: number = 4) => {
        const ctx = audioCtxRef.current;
        if (!ctx || ctx.state !== 'running') return;

        const now = ctx.currentTime;

        // --- Chime Node ---
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeGain.gain.setValueAtTime(0, now);
        chimeGain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Balanced chime
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        if (phase === 'inhale') {
            chime.frequency.setValueAtTime(440, now);
            chime.frequency.linearRampToValueAtTime(523.25, now + 0.3);

            swellGainRef.current?.gain.cancelScheduledValues(now);
            swellGainRef.current?.gain.linearRampToValueAtTime(0.35, now + duration * 0.5);
            filterRef.current?.frequency.linearRampToValueAtTime(1400, now + duration * 0.5);
            subGainRef.current?.gain.cancelScheduledValues(now);
            subGainRef.current?.gain.linearRampToValueAtTime(0.25, now + duration * 0.5);
            pannerRef.current?.pan.cancelScheduledValues(now);
            pannerRef.current?.pan.linearRampToValueAtTime(1, now + duration * 0.8);

        } else if (phase === 'exhale') {
            chime.frequency.setValueAtTime(523.25, now);
            chime.frequency.linearRampToValueAtTime(349.23, now + 0.4);

            swellGainRef.current?.gain.cancelScheduledValues(now);
            swellGainRef.current?.gain.linearRampToValueAtTime(0.005, now + duration);
            filterRef.current?.frequency.linearRampToValueAtTime(350, now + duration);
            subGainRef.current?.gain.cancelScheduledValues(now);
            subGainRef.current?.gain.linearRampToValueAtTime(0.001, now + duration);
            pannerRef.current?.pan.cancelScheduledValues(now);
            pannerRef.current?.pan.linearRampToValueAtTime(-1, now + duration * 0.8);

        } else if (phase === 'hold') {
            chime.frequency.setValueAtTime(392, now);

            swellGainRef.current?.gain.cancelScheduledValues(now);
            swellGainRef.current?.gain.linearRampToValueAtTime(0.05, now + 0.3);
            subGainRef.current?.gain.cancelScheduledValues(now);
            subGainRef.current?.gain.linearRampToValueAtTime(0.05, now + 0.3);
        }

        if (phase !== 'none') {
            chime.start(now);
            chime.stop(now + 1.5);
        } else {
            swellGainRef.current?.gain.cancelScheduledValues(now);
            swellGainRef.current?.gain.linearRampToValueAtTime(0, now + 0.5);
            subGainRef.current?.gain.cancelScheduledValues(now);
            subGainRef.current?.gain.linearRampToValueAtTime(0, now + 0.5);
        }
    }, []);

    const stop = useCallback(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
            const now = audioCtxRef.current.currentTime;
            swellGainRef.current?.gain.cancelScheduledValues(now);
            swellGainRef.current?.gain.linearRampToValueAtTime(0, now + 0.5);
            subGainRef.current?.gain.cancelScheduledValues(now);
            subGainRef.current?.gain.linearRampToValueAtTime(0, now + 0.5);
            
            setTimeout(() => {
                audioCtxRef.current?.suspend().catch(() => {});
            }, 600);
        }
    }, []);

    const resume = useCallback(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        } else if (!audioCtxRef.current) {
            initAudio();
        }
    }, [initAudio]);

    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(() => {});
            }
        };
    }, []);

    return { setPhase, stop, resume, audioCtx: audioCtxRef.current };
};
