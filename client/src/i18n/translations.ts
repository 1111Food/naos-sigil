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
        saving: "Guardando...",
        // Identity Nexus & Manuals
        identity_nexus_title: "Nexo de Identidad",
        architecture_ser: "Arquitectura del Ser",
        back_temple: "Regresar al Templo",
        view_full_code: "VER MI CÓDIGO COMPLETO",
        view_full_code_sub: "Explora tu diseño original: Astral, Numerología y Nahual.",
        wisdom_library: "BIBLIOTECA DE SABIDURÍA",
        wisdom_library_sub: "El repositorio de conocimientos ancestrales y guías del sistema.",
        access: "Acceder",
        pedagogical_marco: "Marco Pedagógico de Naos",
        close_curtain: "Cerrar Telón",
        // Onboarding
        threshold_quote: "Para revelar la arquitectura de tu Avatar, el Templo requiere las coordenadas de tu llegada.",
        sync_coordinates: "Sintonizar Coordenadas",
        calibration_title: "Calibración de Identidad Original",
        earthly_identity: "Identidad Terrenal",
        nickname_sigil: "Apodo / Sigilo",
        solar_cycle: "Ciclo Solar (Fecha)",
        exact_moment: "Momento Exacto (Hora)",
        origin_nation: "Nación de Origen",
        region_state: "Región / Estado",
        anchorage_city: "Anclaje (Ciudad)",
        email_label: "Correo Electrónico",
        start_ritual: "Iniciar Ritual de Sintonía",
        syncing_essence: "Sincronizando Esencia...",
        architecture_stars: "La arquitectura de las estrellas será trazada para tu avatar."
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
        saving: "Saving...",
        // Identity Nexus & Manuals
        identity_nexus_title: "Identity Nexus",
        architecture_ser: "Architecture of Being",
        back_temple: "Return to Temple",
        view_full_code: "VIEW MY FULL CODE",
        view_full_code_sub: "Explore your original design: Astral, Numerology, and Nahual.",
        wisdom_library: "WISDOM LIBRARY",
        wisdom_library_sub: "The repository of ancestral knowledge and system guides.",
        access: "Access",
        pedagogical_marco: "Naos Pedagogical Framework",
        close_curtain: "Close Manual",
        // Onboarding
        threshold_quote: "To reveal your Avatar’s architecture, the Temple requires your arrival coordinates.",
        sync_coordinates: "Tune Coordinates",
        calibration_title: "Original Identity Calibration",
        earthly_identity: "Earthly Identity",
        nickname_sigil: "Nickname / Sigil",
        solar_cycle: "Solar Cycle (Date)",
        exact_moment: "Exact Moment (Time)",
        origin_nation: "Nation of Origin",
        region_state: "Region / State",
        anchorage_city: "Anchorage (City)",
        email_label: "Email Address",
        start_ritual: "Start Tuning Ritual",
        syncing_essence: "Syncing Essence...",
        architecture_stars: "The architecture of the stars will be traced for your avatar."
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
