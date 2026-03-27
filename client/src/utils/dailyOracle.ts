const ORACLE_QUOTES_ES = [
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

const ORACLE_QUOTES_EN = [
    "Stillness is not absence of movement, it is the center axis of the wheel.",
    "Do not build on motivation; discipline is the true architecture.",
    "The void is not desolate, it is full of pure potentiality.",
    "Inhabit the silence before attempting to master the word.",
    "Friction is the alchemical fire that transmutes your character.",
    "Observe the storm without becoming the rain.",
    "True power resides in the space between stimulus and your reaction.",
    "If you cannot flow like water, be the rock that breaks the current.",
    "Every broken habit is an empty room in your new mental architecture.",
    "Coherence is the unmistakable language of inner truth.",
    "Do not demand clarity from the waters you yourself blew upon.",
    "The shadow is not your enemy, it is the construction blueprint of your absolute light.",
    "Design your mind as you would design a temple: with no space for distractions.",
    "Growth requires the abandonment of the mold that is already too small for you.",
    "The gravity of your purpose will determine which orbits you attract.",
    "Before destroying ignorance, make sure you have wisdom to replace it.",
    "Your attention is the only valid chisel to sculpt reality.",
    "Fear is the centrifugal force; intention is the central gravity.",
    "Align your perception, and the entire Universe will reorganize itself before you.",
    "You are both the labyrinth and the Minotaur; solve your own enigma."
];

/**
 * Retorna la frase del día calculada de forma determinista 
 * usando los días transcurridos desde el Unix Epoch acorde a la zona local.
 */
export function getDailySynchronyQuote(lang: 'es' | 'en' = 'es'): string {
    const quotes = lang === 'en' ? ORACLE_QUOTES_EN : ORACLE_QUOTES_ES;
    
    // Calculamos el índice diario en función de los días totales locales (ms / 1000 / 60 / 60 / 24)
    const nowLocal = new Date();
    const tzOffsetMs = nowLocal.getTimezoneOffset() * 60 * 1000;
    const localTimestamp = nowLocal.getTime() - tzOffsetMs;

    const daysSinceEpoch = Math.floor(localTimestamp / 86400000);
    const index = daysSinceEpoch % quotes.length;

    return quotes[index];
}
