export const getNumberImage = (num: string | number): string => {
    const n = String(num).trim();
    return new URL(`../assets/numbers/${n}.webp`, import.meta.url).href;
};

export const getNumberText = (num: string | number, language: string = 'es'): string => {
    const isEn = language === 'en';
    const texts_es: Record<string, string> = {
        '1': 'UNO', '2': 'DOS', '3': 'TRES', '4': 'CUATRO', '5': 'CINCO',
        '6': 'SEIS', '7': 'SIETE', '8': 'OCHO', '9': 'NUEVE', '11': 'ONCE', '22': 'VEINTIDÓS', '33': 'TREINTA Y TRES'
    };
    const texts_en: Record<string, string> = {
        '1': 'ONE', '2': 'TWO', '3': 'THREE', '4': 'FOUR', '5': 'FIVE',
        '6': 'SIX', '7': 'SEVEN', '8': 'EIGHT', '9': 'NINE', '11': 'ELEVEN', '22': 'TWENTY-TWO', '33': 'THIRTY-THREE'
    };
    const texts = isEn ? texts_en : texts_es;
    return texts[String(num)] || String(num);
};
