export const ORACLE_QUOTES = [
    "La quietud no es ausencia de movimiento, es el eje central de la rueda.",
    "No construyas sobre la motivación; la disciplina es la verdadera arquitectura.",
    "El vacío no está desolado, está lleno de pura potencialidad.",
    "Habita el silencio antes de intentar dominar la palabra.",
    "La fricción es el fuego alquímico que transmuta tu carácter.",
    "Observa la tormenta sin convertirte en la lluvia.",
    "El verdadero poder reside en el espacio entre el estímulo y tu reacción.",
    "Si no puedes fluir como el agua, sé la roca que parte la corriente.",
    "Cada hábito roto es una habitación vacía en tu nueva arquitectura mental.",
    "La coherencia es el idioma inconfundible de la verdad interior.",
    "No exijas claridad de las aguas que tú mismo soplaste.",
    "La sombra no es tu enemigo, es el plano constructivo de tu luz absoluta.",
    "Diseña tu mente como diseñarías un templo: sin espacio para distracciones.",
    "El crecimiento requiere el abandono del molde que ya te queda pequeño.",
    "La gravedad de tu propósito determinará qué órbitas atraerás.",
    "Antes de destruir la ignorancia, asegúrate de tener sabiduría para reemplazarla.",
    "Tu atención es el único cincel válido para esculpir la realidad.",
    "El miedo es la fuerza centrífuga; la intención es la gravedad central.",
    "Alinea tu percepción, y el Universo entero se reorganizará frente a ti.",
    "Tú eres tanto el laberinto como el Minotauro; resuelve tu propio enigma."
];

/**
 * Retorna la frase del día calculada de forma determinista 
 * usando los días transcurridos desde el Unix Epoch acorde a la zona local.
 */
export function getDailySynchronyQuote(): string {
    // Calculamos el índice diario en función de los días totales locales (ms / 1000 / 60 / 60 / 24)
    // Se resta el offset de zona horaria para coincidir con la medianoche local del usuario
    const nowLocal = new Date();
    const tzOffsetMs = nowLocal.getTimezoneOffset() * 60 * 1000;
    const localTimestamp = nowLocal.getTime() - tzOffsetMs;

    const daysSinceEpoch = Math.floor(localTimestamp / 86400000);
    const index = daysSinceEpoch % ORACLE_QUOTES.length;

    return ORACLE_QUOTES[index];
}
