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
        profile: "Perfil",
        synastry: "Almas / Sinastría",
        settings: "Ajustes",
        sigil_settings: "Configuración del Sigil",
        sigil_voice_active_msg: "Módulo de Voz Activado",
        sigil_voice_active_desc: "El Sigil ahora puede comunicarse contigo verbalmente en la aplicación.",
        daily_reading_time: "Hora de Lectura Diaria",
        daily_reading_desc: "Define a qué hora deseas que el oráculo despache su sabiduría a tu Telegram.",
        dispatch_channels: "Canales de Despacho",
        link_telegram: "Vincular Telegram",
        open: "Abrir",
        voice_in_app: "Voz en Aplicación (Beta)",
        voice_toggle_label: "Activación de Voz del Sigil",
        voice_toggle_desc: "Habilita que el Sigil reproduzca sus respuestas en voz alta frente a eventos críticos.",
        voice_toggle: "Lectura de Voz",
        language_selector: "Idioma / Language",
        cancel: "Cancelar",
        save: "Guardar",
        saving: "Guardando..."
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
        profile: "Profile",
        synastry: "Souls / Synastry",
        settings: "Settings",
        sigil_settings: "Sigil Configuration",
        sigil_voice_active_msg: "Voice Module Activated",
        sigil_voice_active_desc: "The Sigil can now communicate with you verbally in the application.",
        daily_reading_time: "Daily Reading Time",
        daily_reading_desc: "Define what time you want the oracle to dispatch its wisdom to your Telegram.",
        dispatch_channels: "Dispatch Channels",
        link_telegram: "Link Telegram",
        open: "Open",
        voice_in_app: "Voice in Application (Beta)",
        voice_toggle_label: "Activate Sigil Voice",
        voice_toggle_desc: "Enables the Sigil to reproduce its responses aloud in critical events.",
        voice_toggle: "Voice Readout",
        language_selector: "Language",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving..."
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
