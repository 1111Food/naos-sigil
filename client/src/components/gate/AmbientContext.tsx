import React from 'react';
import { useTranslation } from '../../i18n';

// Simple zero-latency moon phase calculator
const getMoonPhase = (date: Date = new Date()) => {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;
    let c = 365.25 * year;
    let e = 30.6 * month;
    let jd = c + e + day - 694039.09; // julian days since known new moon
    jd /= 29.5305882; // divide by moon cycle
    let b = Math.floor(jd); 
    jd -= b; 
    b = Math.round(jd * 8);

    if (b >= 8) b = 0; 
    
    // 0: New, 1: Waxing Crescent, 2: First Quarter, 3: Waxing Gibbous
    // 4: Full, 5: Waning Gibbous, 6: Last Quarter, 7: Waning Crescent
    return b;
};

export const AmbientContext: React.FC = () => {
    const { t, language } = useTranslation();
    const phaseIndex = getMoonPhase();
    
    // Hardcoded simple translations for zero-latency
    const phasesEs = [
        "NUEVA", "CRECIENTE", "CUARTO CRECIENTE", "GIBOSA CRECIENTE",
        "LLENA", "GIBOSA MENGUANTE", "CUARTO MENGUANTE", "MENGUANTE"
    ];
    const phasesEn = [
        "NEW MOON", "WAXING CRESCENT", "FIRST QUARTER", "WAXING GIBBOUS",
        "FULL MOON", "WANING GIBBOUS", "LAST QUARTER", "WANING CRESCENT"
    ];

    const phaseText = language === 'en' ? phasesEn[phaseIndex] : phasesEs[phaseIndex];

    return (
        <div className="flex items-center justify-center space-x-2 text-[9px] md:text-[10px] tracking-[0.3em] font-semibold text-amber-500/70 mb-8 mt-4 animate-in fade-in duration-1000">
            <span className="uppercase">{t('moon_phase_prefix')}</span>
            <span className="text-amber-500/30">·</span>
            <span className="uppercase text-amber-400">{phaseText}</span>
        </div>
    );
};
