
import { useCallback } from 'react';

export const useSound = () => {
    const playSound = useCallback((type: 'click' | 'success' | 'transition' = 'click') => {
        const soundUrls = {
            click: '/audio/atmospheres/clientpublicaudioatmospheresearth.mp3', // Using atmosphere as placeholder
            success: '/audio/atmospheres/clientpublicaudioatmosphereswater.mp3',
            transition: '/audio/atmospheres/clientpublicaudioatmospheresair.mp3'
        };

        const audio = new Audio(soundUrls[type]);
        audio.volume = 0.15;
        audio.play().catch(e => {
            // Silently handle autoplay blocks or 403s
            if (e.name !== 'NotAllowedError') {
                console.warn(`[useSound] Audio ${type} could not play:`, e.message);
            }
        });
    }, []);

    return { playSound };
};
