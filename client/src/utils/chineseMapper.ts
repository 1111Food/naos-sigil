export const getChineseZodiacImage = (animal: string): string => {
    // Definimos el mapeo invertido para asegurar que siempre usamos el nombre del archivo en español (técnico)
    const animalMap: Record<string, string> = {
        "rata": "rata", "rat": "rata",
        "buey": "buey", "ox": "buey", "bull": "buey",
        "tigre": "tigre", "tiger": "tigre",
        "conejo": "conejo", "rabbit": "conejo", "hare": "conejo",
        "dragon": "dragon", "dragón": "dragon",
        "serpiente": "serpiente", "snake": "serpiente",
        "caballo": "caballo", "horse": "caballo",
        "cabra": "cabra", "goat": "cabra", "sheep": "cabra", "ram": "cabra",
        "mono": "mono", "monkey": "mono",
        "gallo": "gallo", "rooster": "gallo", "chicken": "gallo",
        "perro": "perro", "dog": "perro",
        "cerdo": "cerdo", "pig": "cerdo", "boar": "cerdo"
    };

    const searchKey = animal.toLowerCase().trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const fileName = animalMap[searchKey] || searchKey;

    return new URL(`../assets/chinese/${fileName}.webp`, import.meta.url).href;
};


export const calculateChineseZodiac = (birthDateISO: string, language: string = 'es') => {
    const isEn = language === 'en';
    const date = new Date(birthDateISO);
    let year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    // Lichun (Start of Solar Spring) usually falls on Feb 4.
    // If birth is before Feb 4, use previous Chinese year.
    if (month < 2 || (month === 2 && day < 4)) {
        year--;
    }

    const ANIMALS_ES = [
        "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
        "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"
    ];

    const ANIMALS_EN = [
        "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake",
        "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
    ];

    const ANIMALS = isEn ? ANIMALS_EN : ANIMALS_ES;

    // Animal: Cycle starts from 1900 (Metal Rat)
    const animalIdx = (year - 1900) % 12;
    const animal = ANIMALS[animalIdx];

    // Element: Use the LAST DIGIT RULE (Heavenly Stems)
    const lastDigit = year.toString().slice(-1);
    let element: string;

    const ELEMENTS_ES: Record<string, string> = {
        '0': 'Metal', '1': 'Metal',
        '2': 'Agua', '3': 'Agua',
        '4': 'Madera', '5': 'Madera',
        '6': 'Fuego', '7': 'Fuego',
        '8': 'Tierra', '9': 'Tierra'
    };

    const ELEMENTS_EN: Record<string, string> = {
        '0': 'Metal', '1': 'Metal',
        '2': 'Water', '3': 'Water',
        '4': 'Wood', '5': 'Wood',
        '6': 'Fire', '7': 'Fire',
        '8': 'Earth', '9': 'Earth'
    };

    element = isEn ? ELEMENTS_EN[lastDigit] : ELEMENTS_ES[lastDigit];

    return {
        animal,
        element,
        birthYear: year
    };
};
