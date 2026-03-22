export const translations = {
    es: {
        identity: "Código de Identidad",
        oracle: "Oráculo",
        protocols: "Protocolos 21/90",
        laboratory: "Laboratorio Elemental",
        start: "Iniciar",
        complete_day: "Cerrar Día",
        evolution: "Evolucionar",
        archive: "Archivar",
        temple: "Templo",
        synastry: "Almas / Sinastría",
        settings: "Ajustes",
        voice_toggle: "Lectura de Voz",
        language_selector: "Idioma / Language"
    },
    en: {
        identity: "Identity Code",
        oracle: "Oracle",
        protocols: "Protocols 21/90",
        laboratory: "Elemental Lab",
        start: "Start",
        complete_day: "Seal Day",
        evolution: "Evolve",
        archive: "Archive",
        temple: "Temple",
        synastry: "Souls / Synastry",
        settings: "Settings",
        voice_toggle: "Voice Readout",
        language_selector: "Language"
    }
};

export type TranslationKey = keyof typeof translations.es;

import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
    const { language } = useLanguage();

    const t = (key: TranslationKey): string => {
        return translations[language][key] || key;
    };

    return { t, language };
};
