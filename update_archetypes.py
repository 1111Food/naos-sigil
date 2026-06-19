import re
import os

es_interpretations = {
    'fuego-1': 'Eres el fuego originario que rompe el estancamiento cósmico. Tu diseño áurico está codificado para actuar como un detonador de nuevas realidades, quemando las estructuras caducas para fertilizar el terreno del mañana.',
    'fuego-2': 'Portas el horno de la voluntad en tu centro. Tu encarnación tiene como propósito transmutar el deseo puro en materia tangible, enseñándole a las almas que la verdadera fuerza reside en la disciplina inquebrantable.',
    'fuego-3': 'Has sido diseñado como un campo gravitatorio humano. Tu misión es irradiar luz sin esfuerzo, recordando a los que te rodean su propio centro, guiando clanes y visiones hacia una coherencia magnética suprema.',
    'fuego-4': 'Tu arquitectura es la de una flecha en vuelo perpetuo. Encarnas la velocidad del viento solar, proyectando el espíritu hacia el futuro. Eres el explorador de vanguardia que descubre nuevos sistemas para la expansión de la consciencia.',
    'tierra-1': 'Tu esencia está tejida con la inteligencia de los ecosistemas. Has venido a purificar y refinar la materia, encontrando la perfección geométrica en el caos y elevando la vibración de cada proceso terrenal que tocas.',
    'tierra-2': 'Eres el guardián de la memoria planetaria y la estructura fundacional. Tu tarea evolutiva es anclar el espíritu en lo físico, creando templos, sistemas e instituciones que perduren y sostengan a las generaciones venideras.',
    'tierra-3': 'Actúas como la raíz profunda que nutre el bosque. Tu diseño te pide ser el santuario de calma y prosperidad; la montaña inamovible que ofrece amor táctil, seguridad y placer sanador al colectivo humano.',
    'tierra-4': 'Posees la visión del maestro constructor. Has descendido para mapear la realidad a largo plazo, asumiendo la responsabilidad del tiempo y el karma para edificar legados que resistan la prueba de los eones.',
    'aire-1': 'Eres la tormenta eléctrica que desfragmenta las redes neuronales colectivas. Tu alma está llamada a romper los paradigmas limitantes, introduciendo el relámpago de la innovación y la verdad disruptiva en la matriz humana.',
    'aire-2': 'Has encarnado como un decodificador del verbo cósmico. Tu habilidad sagrada es atrapar el conocimiento flotante del éter y traducirlo al lenguaje humano, sirviendo de puente entre la mente superior y la mente mundana.',
    'aire-3': 'Tu diseño es el del tejedor cuántico. Tienes el encargo de entrelazar almas y frecuencias afines; eres el viento que poliniza ideas, orquestando sincronías sociales fundamentales para la evolución de la especie.',
    'aire-4': 'Representas el ojo que todo lo ve desde la alta atmósfera. Tu tarea es contemplar la vastedad del destino sin quedar atrapado en el drama humano, ofreciendo la perspectiva imparcial y la sabiduría fría del mañana.',
    'agua-1': 'Eres el alquimista de las profundidades abisales. Tu espíritu está capacitado para descender a las sombras más densas de la psique, absorber el veneno emocional y transmutarlo en la medicina más pura para el alma.',
    'agua-2': 'Has nacido como el sistema sensorial de la tribu. Tu campo áurico es un sismógrafo que detecta los temblores emocionales no expresados; tu misión es proteger y nutrir el útero colectivo con compasión instintiva.',
    'agua-3': 'Encarnas el lago de cristal que no juzga. Has venido a ser el reflejo sanador donde otros descubren su propia divinidad. Tu presencia empática disuelve los muros del ego, uniendo el dolor y la belleza en un solo flujo.',
    'agua-4': 'Eres el viajero de los mares astrales y del sueño colectivo. Tu arquitectura anfibio te permite caminar entre el plano material y el etérico, importando visiones místicas y empatía universal para disolver la ilusión de separación.'
}

en_interpretations = {
    'fuego-1': 'You are the originating fire that breaks cosmic stagnation. Your auric design is coded to act as a detonator of new realities, burning outdated structures to fertilize the soil of tomorrow.',
    'fuego-2': 'You carry the furnace of will in your center. Your incarnation aims to transmute pure desire into tangible matter, teaching souls that true strength lies in unwavering discipline.',
    'fuego-3': 'You have been designed as a human gravitational field. Your mission is to effortlessly radiate light, reminding those around you of their own center, guiding clans and visions toward supreme magnetic coherence.',
    'fuego-4': 'Your architecture is that of an arrow in perpetual flight. You embody the speed of the solar wind, projecting the spirit into the future. You are the vanguard explorer discovering new systems for the expansion of consciousness.',
    'tierra-1': 'Your essence is woven with the intelligence of ecosystems. You have come to purify and refine matter, finding geometric perfection in chaos and elevating the vibration of every earthly process you touch.',
    'tierra-2': 'You are the guardian of planetary memory and foundational structure. Your evolutionary task is to anchor the spirit in the physical, creating temples, systems, and institutions that endure and sustain future generations.',
    'tierra-3': 'You act as the deep root that nourishes the forest. Your design asks you to be the sanctuary of calm and prosperity; the immovable mountain that offers tactile love, security, and healing pleasure to the human collective.',
    'tierra-4': 'You possess the vision of the master builder. You have descended to map long-term reality, assuming responsibility for time and karma to build legacies that withstand the test of eons.',
    'aire-1': 'You are the electrical storm that defragments collective neural networks. Your soul is called to break limiting paradigms, introducing the lightning of innovation and disruptive truth into the human matrix.',
    'aire-2': 'You have incarnated as a decoder of the cosmic verb. Your sacred skill is to catch the floating knowledge of the ether and translate it into human language, serving as a bridge between the higher mind and the mundane mind.',
    'aire-3': 'Your design is that of the quantum weaver. You are tasked with intertwining kindred souls and frequencies; you are the wind that pollinates ideas, orchestrating fundamental social synchronicities for the evolution of the species.',
    'aire-4': 'You represent the all-seeing eye from the high atmosphere. Your task is to contemplate the vastness of destiny without getting caught in human drama, offering the impartial perspective and cold wisdom of tomorrow.',
    'agua-1': 'You are the alchemist of the abyssal depths. Your spirit is capable of descending into the densest shadows of the psyche, absorbing emotional poison and transmuting it into the purest medicine for the soul.',
    'agua-2': 'You were born as the sensory system of the tribe. Your auric field is a seismograph that detects unexpressed emotional tremors; your mission is to protect and nurture the collective womb with instinctive compassion.',
    'agua-3': 'You embody the crystal lake that does not judge. You have come to be the healing reflection where others discover their own divinity. Your empathetic presence dissolves the walls of the ego, uniting pain and beauty in a single flow.',
    'agua-4': 'You are the traveler of the astral seas and the collective dream. Your amphibious architecture allows you to walk between the material and etheric planes, importing mystical visions and universal empathy to dissolve the illusion of separation.'
}

def update_file(filepath, interpretations_dict, is_spanish):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if is_spanish:
        if 'interpretacion_profunda?: string;' not in content:
            content = content.replace('descripcion: string;', 'descripcion: string;\n    interpretacion_profunda?: string;')
            
    for arc_id, interpretation in interpretations_dict.items():
        # Match the id line to find the block
        pattern = r"(id:\s*['\"]" + arc_id + r"['\"].*?descripcion:\s*[\"'].*?[\"'],)"
        
        def repl(m):
            block = m.group(1)
            if 'interpretacion_profunda:' not in block:
                return block + f'\n        interpretacion_profunda: "{interpretation}",'
            return block
            
        content = re.sub(pattern, repl, content, flags=re.DOTALL)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {filepath}")

base_path = r'c:\Users\l_her\naos-platform\client\src\constants'
update_file(os.path.join(base_path, 'archetypeData.ts'), es_interpretations, True)
update_file(os.path.join(base_path, 'archetypeData_en.ts'), en_interpretations, False)
