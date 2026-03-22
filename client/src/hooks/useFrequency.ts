import { useState, useCallback, useRef, useEffect } from 'react';

// frequencies based on Solfeggio / Zen principles
export const ELEMENT_FREQUENCIES = {
    FIRE: { baseHz: 528, label: "528 Hz - Transmutación", color: "#f97316" }, // Orange
    WATER: { baseHz: 432, label: "432 Hz - Armonía", color: "#06b6d4" }, // Cyan
    EARTH: { baseHz: 174, label: "174 Hz - Enraizamiento", color: "#10b981" }, // Emerald 
    AIR: { baseHz: 639, label: "639 Hz - Claridad", color: "#d946ef" } // Fuchsia
};

export type ElementType = keyof typeof ELEMENT_FREQUENCIES;

export const useFrequency = () => {
    const [activeElement, setActiveElement] = useState<ElementType | null>(null);
    const [isAtmosphereEnabled, setIsAtmosphereEnabled] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);
    const gainNodeRef = useRef<GainNode | null>(null);
    const lfoRef = useRef<OscillatorNode | null>(null);
    const atmosphereNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const atmosphereOscillatorsRef = useRef<OscillatorNode[]>([]);
    
    // Safety refs for async fetches
    const activeElementRef = useRef(activeElement);
    const isAtmosphereEnabledRef = useRef(isAtmosphereEnabled);
    
    useEffect(() => { activeElementRef.current = activeElement; }, [activeElement]);
    useEffect(() => { isAtmosphereEnabledRef.current = isAtmosphereEnabled; }, [isAtmosphereEnabled]);

    // Initialize Audio Context lazily to comply with browser autoplay policies
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const stopFrequency = useCallback(() => {
        if (!audioContextRef.current) return;

        const now = audioContextRef.current.currentTime;

        // Fade out
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0, now, 0.5); // 0.5s fade out
        }

        // Stop oscillators slightly after fade out
        setTimeout(() => {
            oscillatorsRef.current.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) { }
            });
            if (lfoRef.current) {
                try { lfoRef.current.stop(); lfoRef.current.disconnect(); } catch (e) { }
            }
            if (gainNodeRef.current) {
                gainNodeRef.current.disconnect();
            }
            if (atmosphereNodeRef.current) {
                try { atmosphereNodeRef.current.disconnect(); } catch(e) {}
            }
            atmosphereOscillatorsRef.current.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) {}
            });

            oscillatorsRef.current = [];
            atmosphereOscillatorsRef.current = [];
            gainNodeRef.current = null;
            lfoRef.current = null;
            atmosphereNodeRef.current = null;
            setActiveElement(null);
        }, 1500);
    }, []);

    const playFrequency = useCallback((element: ElementType, forceRestart: boolean = false) => {
        initAudioContext();

        // If the same element is already playing and we're not forcing a restart (e.g. for atmosphere toggle), do nothing
        if (!forceRestart && activeElement === element) return;

        // If something else is playing, stop it first
        if (activeElement) {
            // Immediate stop of previous without fade to prevent overlapping muddiness
            oscillatorsRef.current.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) { }
            });
            if (gainNodeRef.current) gainNodeRef.current.disconnect();
            if (atmosphereNodeRef.current) {
                try { atmosphereNodeRef.current.stop(); } catch(e) {}
                try { atmosphereNodeRef.current.disconnect(); } catch(e) {}
            }
            atmosphereOscillatorsRef.current.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) {}
            });
            oscillatorsRef.current = [];
            atmosphereOscillatorsRef.current = [];
        }

        const ctx = audioContextRef.current!;
        const { baseHz } = ELEMENT_FREQUENCIES[element];

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0; // Start at 0 for fade-in
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        if (!isAtmosphereEnabled) {
            // ============================================
            // BRANCH A: ONDA PURA (Binaural Beat Entrainment)
            // ============================================
            // Create stereoscopic separation for Binaural Beats (4Hz Detune)
            const oscLeft = ctx.createOscillator();
            oscLeft.type = 'sine';
            oscLeft.frequency.value = baseHz;

            const oscRight = ctx.createOscillator();
            oscRight.type = 'sine';
            oscRight.frequency.value = baseHz + 4; // 4Hz offset for Theta Brainwave Flow

            const pannerLeft = ctx.createStereoPanner();
            pannerLeft.pan.value = -1;
            
            const pannerRight = ctx.createStereoPanner();
            pannerRight.pan.value = 1;

            const osc2 = ctx.createOscillator(); // Sub-octave for body (center)
            osc2.type = 'triangle';
            osc2.frequency.value = baseHz / 2;

            const osc3 = ctx.createOscillator(); // Perfect fifth, lower volume, for mystique
            osc3.type = 'sine';
            osc3.frequency.value = baseHz * 1.5;

            // Create LFO to modulate gain (creates breathing wave)
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.1; // Slow 10s wave

            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.15; // Depth of breathing

            lfo.connect(lfoGain);

            const carrierGain = ctx.createGain();
            carrierGain.connect(masterGain);

            const mixGain1 = ctx.createGain(); mixGain1.gain.value = 0.4;
            const mixGain2 = ctx.createGain(); mixGain2.gain.value = 0.25;
            const mixGain3 = ctx.createGain(); mixGain3.gain.value = 0.1;

            // Stereoscopic connection
            oscLeft.connect(pannerLeft);
            oscRight.connect(pannerRight);
            pannerLeft.connect(mixGain1);
            pannerRight.connect(mixGain1); // Combine fundamental into same master gain trigger

            osc2.connect(mixGain2);
            osc3.connect(mixGain3);

            mixGain1.connect(carrierGain);
            mixGain2.connect(carrierGain);
            mixGain3.connect(carrierGain);

            lfoGain.connect(carrierGain.gain);

            oscLeft.start();
            oscRight.start();
            osc2.start();
            osc3.start();
            lfo.start();

            oscillatorsRef.current = [oscLeft, oscRight, osc2, osc3];
            if (!lfoRef.current) lfoRef.current = lfo;

        } else {
            // ============================================
            // BRANCH B: INMERSIVO (File Playback Only)
            // ============================================
            // --- ACTUAL MP3 ATMOSPHERE ---
            const atmosphereGain = ctx.createGain();
            atmosphereGain.connect(masterGain); // Connect to master so it gets the smooth master fade-in
            // Base volume of the MP3
            atmosphereGain.gain.setValueAtTime(1.5, ctx.currentTime);
            
            // Map the element to the actual MP3 filename uploaded
            const elementFileMap: Record<ElementType, string> = {
                'WATER': 'clientpublicaudioatmosphereswater.mp3',
                'FIRE': 'clientpublicaudioatmospheresfire.mp3',
                'AIR': 'clientpublicaudioatmospheresair.mp3',
                'EARTH': 'clientpublicaudioatmospheresearth.mp3'
            };
            
            const fileName = elementFileMap[element];
            
            console.log(`🚀 [useFrequency] Initiating fetch for MP3: /audio/atmospheres/${fileName}`);
            
            // Fetch and decode the MP3 loop
            fetch(`/audio/atmospheres/${fileName}`)
                .then(response => {
                    console.log(`📦 [useFrequency] Fetch response: ${response.status} ${response.statusText}`);
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => {
                    console.log(`🧬 [useFrequency] ArrayBuffer loaded. Size: ${arrayBuffer.byteLength} bytes. Decoding...`);
                    return ctx.decodeAudioData(arrayBuffer);
                })
                .then(audioBuffer => {
                    console.log(`🎵 [useFrequency] Audio decoded successfully. Duration: ${audioBuffer.duration}s`);
                    console.log(`🔍 [useFrequency] Checks - ctx Match: ${audioContextRef.current === ctx}, activeEl Match: ${activeElementRef.current === element}, AtmoEnabledRef: ${isAtmosphereEnabledRef.current}`);
                    console.log(`🎛️ [useFrequency] Context State: ${ctx.state}`);
                    
                    // Resume context if suspended
                    if (ctx.state === 'suspended') {
                        ctx.resume().then(() => console.log('✅ Context Resumed'));
                    }

                    // Force play
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.loop = true;
                    source.connect(atmosphereGain);
                    source.start();
                    atmosphereNodeRef.current = source;
                    console.log(`🔊 [useFrequency] MP3 Source started & connected into mix. Gain: 3.0`);
                })
                .catch(err => console.error("❌ [useFrequency] Error loading/decoding atmosphere audio:", err));
        }

        // Smooth master fade in for whichever branch was loaded
        const now = ctx.currentTime;
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.5, now + 2); // Reach full volume over 2 seconds

        setActiveElement(element);

    }, [activeElement, isAtmosphereEnabled]);

    const toggleFrequency = useCallback((element: ElementType) => {
        if (activeElement === element) {
            stopFrequency();
        } else {
            playFrequency(element);
        }
    }, [activeElement, playFrequency, stopFrequency]);

    // Handle real-time atmosphere toggle hot-swapping
    const prevAtmosphereRef = useRef(isAtmosphereEnabled);
    useEffect(() => {
        if (activeElement && prevAtmosphereRef.current !== isAtmosphereEnabled) {
            playFrequency(activeElement, true);
        }
        prevAtmosphereRef.current = isAtmosphereEnabled;
    }, [isAtmosphereEnabled, activeElement, playFrequency]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (oscillatorsRef.current.length > 0) {
                stopFrequency();
            }
        };
    }, [stopFrequency]);

    return {
        activeElement,
        isAtmosphereEnabled,
        setIsAtmosphereEnabled,
        playFrequency,
        stopFrequency,
        toggleFrequency,
        ELEMENT_FREQUENCIES
    };
};
