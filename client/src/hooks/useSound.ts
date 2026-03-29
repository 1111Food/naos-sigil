
import { useCallback } from 'react';

export const useSound = () => {
    const playSound = useCallback((type: 'click' | 'success' | 'transition' = 'click') => {
        const soundUrls = {
            click: '', 
            success: '', 
            transition: ''
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
