import React, { createContext, useContext, useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';

type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile, updateProfile } = useProfile();
    const [language, setLanguageState] = useState<Language>('es');

    useEffect(() => {
        // 1. Check localStorage
        const cachedLang = localStorage.getItem('naos_language') as Language;
        if (cachedLang && (cachedLang === 'es' || cachedLang === 'en')) {
            setLanguageState(cachedLang);
            return;
        }

        // 2. Check profile
        if (profile && (profile as any).language && ((profile as any).language === 'es' || (profile as any).language === 'en')) {
            setLanguageState((profile as any).language as Language);
            return;
        }

        // 3. Browser detection
        const browserLang = navigator.language.startsWith('es') ? 'es' : 'en';
        setLanguageState(browserLang);
    }, [profile]);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('naos_language', lang);
        
        try {
            if (profile) {
                // Safely attempt to save to profile
                await updateProfile({ language: lang } as any);
            }
        } catch (e) {
            console.warn("LanguageContext: Failed to update profile language field.", e);
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
