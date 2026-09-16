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
    let effectiveChineseCycleYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
        effectiveChineseCycleYear = year - 1;
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
    // Safely handle negative diffs (Objective correctness bug fix)
    const diff = effectiveChineseCycleYear - 1900;
    const animalIdx = ((diff % 12) + 12) % 12;
    const animal = ANIMALS[animalIdx];

    // Element calculation
    const elementIdx = ((effectiveChineseCycleYear % 10) + 10) % 10;
    const elementIndexMapped = Math.floor(elementIdx / 2);

    const ELEMENTS_ES = ["Metal", "Agua", "Madera", "Fuego", "Tierra"];
    const ELEMENTS_EN = ["Metal", "Water", "Wood", "Fire", "Earth"];

    const element = isEn ? ELEMENTS_EN[elementIndexMapped] : ELEMENTS_ES[elementIndexMapped];

    return {
        animal,
        element,
        birthYear: effectiveChineseCycleYear
    };
};
