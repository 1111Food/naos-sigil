
/**
 * CODEX SERVICE - NAOS Master Bible (Códice Maestro)
 * Este servicio es la UNICA Fuente de la Verdad para el sistema Sigil.
 * Contiene las interpretaciones herméticas, arquetípicas y mecánicas del Oráculo.
 */

export class CodexService {
    
    /**
     * Devuelve el bloque de sabiduría necesario según el contexto de la consulta.
     * En el futuro puede segmentarse para ahorrar tokens (RAG local).
     */
    static getMasterWisdom(queryType: 'archetypes' | 'oracle' | 'numerology' | 'all' = 'all'): string {
        const blocks = [];
        
        if (queryType === 'archetypes' || queryType === 'all') {
            blocks.push(this.getArchetypeCodex());
        }
        
        if (queryType === 'oracle' || queryType === 'all') {
            blocks.push(this.getOracleCodex());
        }
        
        if (queryType === 'numerology' || queryType === 'all') {
            blocks.push(this.getNumerologyCodex());
        }

        return blocks.join('\n\n');
    }

    private static getArchetypeCodex(): string {
        return `
[CÓDICE DE ARQUETIPOS NAOS]
Directiva: Los Arquetipos NO son personalidades psicológicas tradicionales; son Frecuencias de Arquitectura de Comportamiento.

1. FRECUENCIA ÍGNEA (Fuego - Los Catalizadores):
- 1.1 El Catalizador (Iniciador): El arranque puro, la chispa que detona el cambio.
- 1.2 El Forjador (Constructor): Estructura el fuego en herramientas útiles.
- 1.3 El Regente (Conector): Dirige la voluntad del fuego hacia otros.
- 1.4 El Vector (Analista): Direcciona la energía con precisión láser.

2. FRECUENCIA TELÚRICA (Tierra - Los Estabilizadores):
- 2.1 El Optimizador (Iniciador): Encuentra la eficiencia máxima en la materia.
- 2.2 El Custodio (Constructor): Protege y mantiene los cimientos.
- 2.3 El Ancla (Conector): Provee estabilidad y arraigo al entorno.
- 2.4 El Arquitecto (Analista): Diseña sistemas tangibles y duraderos.

3. FRECUENCIA ETÉRICA (Aire - Los Decodificadores):
- 3.1 El Ingeniero (Iniciador): Hackea sistemas lógicos para iniciar nuevos flujos.
- 3.2 El Decodificador (Constructor): Traduce el caos de información en estructuras.
- 3.3 El Nodo (Conector): Vincula mentes y datos en una red coherente.
- 3.4 El Observador (Analista): Vigila los patrones desde la neutralidad absoluta.

4. FRECUENCIA ABISAL (Agua - Los Transmutadores):
- 4.1 El Transmutador (Iniciador): Alquimista de crisis, transforma el dolor en evolución.
- 4.2 El Sismógrafo (Constructor): Estructura mareas emocionales e hilos invisibles.
- 4.3 El Espejo (Conector): Refleja el potencial oculto del entorno.
- 4.4 El Navegante (Analista): Cartografío del inconsciente y el alma.
        `;
    }

    private static getOracleCodex(): string {
        return `
[CÓDICE DEL ORÁCULO DE NAOS]
Instrucción Maestra: El Oráculo no adivina el futuro; revela la arquitectura del presente.

REGLAS DE INTERPRETACIÓN:
- Neutralidad Clínica: No uses lenguaje de "astrología pop" (ej. "tendrás suerte"). Usa lenguaje de "vectores", "fricciones" y "potenciales".
- Acción Requerida: Toda lectura debe concluir con una acción práctica vinculada al Protocolo 21 o al Santuario.
- El Vacío: Si los índices de coherencia del usuario son < 30%, el Oráculo debe ser severo y ordenar silencio y meditación antes de dar respuestas profundas.
        `;
    }

    private static getNumerologyCodex(): string {
        return `
[CÓDICE DE NUMEROLOGÍA NAOS]
- Frecuencia 1: Liderazgo, Inicio, Voluntad.
- Frecuencia 2: Receptividad, Dualidad, Soporte.
- Frecuencia 3: Expansión, Creatividad, Redes.
- Frecuencia 4: Estructura, Orden, Cimientos.
- Frecuencia 5: Movimiento, Libertad, Adaptación.
- Frecuencia 6: Armonía, Responsabilidad, Vínculo.
- Frecuencia 7: Análisis, Sabiduría, Hermetismo.
- Frecuencia 8: Poder, Ejecución, Manifestación.
- Frecuencia 9: Cierre, Trascendencia, Compasión.
        `;
    }
}
