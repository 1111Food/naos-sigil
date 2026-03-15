export const getChineseZodiacImage = (animal: string): string => {
    // Normalizamos a minúsculas y eliminamos tildes para coincidir con los archivos subidos
    const normalizedAnimal = animal.toLowerCase().trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Elimina tildes (ej: Dragón -> dragon)

    return new URL(`../assets/chinese/${normalizedAnimal}.webp`, import.meta.url).href;
};

export const calculateChineseZodiac = (birthDateISO: string) => {
    const date = new Date(birthDateISO);
    let year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    // Lichun (Start of Solar Spring) usually falls on Feb 4.
    // If birth is before Feb 4, use previous Chinese year.
    if (month < 2 || (month === 2 && day < 4)) {
        year--;
    }

    const ANIMALS = [
        "Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente",
        "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"
    ];

    // Animal: Cycle starts from 1900 (Metal Rat)
    const animalIdx = (year - 1900) % 12;
    const animal = ANIMALS[animalIdx];

    // Element: Use the LAST DIGIT RULE (Heavenly Stems)
    const lastDigit = year.toString().slice(-1);
    let element: string;

    switch (lastDigit) {
        case '0':
        case '1':
            element = 'Metal';
            break;
        case '2':
        case '3':
            element = 'Agua';
            break;
        case '4':
        case '5':
            element = 'Madera';
            break;
        case '6':
        case '7':
            element = 'Fuego';
            break;
        case '8':
        case '9':
            element = 'Tierra';
            break;
        default:
            element = 'Fuego';
    }

    return {
        animal,
        element,
        birthYear: year
    };
};
