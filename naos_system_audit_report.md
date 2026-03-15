# NAOS: Blueprint de Reconstrucción y Auditoría Técnica

Este documento proporciona una descripción exhaustiva del sistema NAOS, diseñada para que cualquier Inteligencia Artificial pueda reconstruir la interfaz y la lógica subyacente con precisión milimétrica, replicando la experiencia "Cyber-Mística, Elegante y Minimalista".

---

## 1. ADN Estético y Cromático

NAOS se rige por un tema **Deep Space Midnight**. El diseño utiliza *glassmorphism* agresivo, bordes de 1px con opacidad baja y filtros de desenfoque (`backdrop-blur`).

### Paleta de Colores (Tokens)
- **Fondo Primario:** `#020202` (Deep Black)
- **Bloques Bento (Glows & Accents):**
  - `cyan`: `#3b82f6` (Indigo/Blue) / `#22d3ee` (Electric)
  - `magenta`: `#a855f7` (Violet) / `#d946ef` (Magenta)
  - `emerald`: `#10b829` (Emerald)
  - `orange`: `#f59e0b` (Amber)
  - `red`: `#ef4444` (Alerta/Error)
- **Tipografía:**
  - `Serif Italic`: Usada para títulos y sabiduría (Ej: *Lora* o *Playfair Display*).
  - `Sans`: Inter o Roboto para datos técnicos.

---

## 2. Los 4 Bloques del Templo (Bento Grid)

La pantalla principal se organiza en un grid dinámico de "piezas de puzzle" superpuestas.

### Geometría (SVG Paths)
Cada bloque tiene un `clip-path` único que le permite encajar visualmente:
- **CÓDIGO DE IDENTIDAD:** `url(#puzzle-astro)` (Esquina superior izquierda, calada).
- **ORÁCULO DE ALMAS:** `url(#puzzle-command)` (Esquina superior derecha).
- **PROTOCOLOS Y RANGO:** `url(#puzzle-protocol)` (Inferior izquierda).
- **LABORATORIO ELEMENTAL:** `url(#puzzle-evolution)` (Inferior derecha).

### Capas de cada Bloque:
1. **Glass Base:** `bg-black/40` con `backdrop-blur-3xl`.
2. **Neon Border:** Borde de 1px con el color de acento y `opacity-40`.
3. **Internal Glow:** Gradiente radial desde la esquina superior (`from-[accent]`) desapareciendo al 10% de opacidad.
4. **Hover State:** Escala `1.02` y aumento del brillo del borde (`shadow-[glow]`).

---

## 3. Dinámica del "Guardian" (Sigil)

El Guardián no es una imagen, es un **intérprete simbólico consciente** manifestado a través de video y partículas.

### Estados del Guardián:
- **RESTING (Reposo):** Flotación suave (`y: [0, -4, 0]`), opacidad `0.85`.
- **LISTENING (Escuchando):** Escala `1.03`, aura ámbar suave.
- **RESPONDING (Respondiendo):** Brillo aumentado (`brightness-150`), aura blanca pulsante (`blur-[80px]`).

### Motor de Partículas (AtmosphereEngine):
El fondo reacciona al "Dominant Intent" del perfil:
- **Productividad:** Partículas cian subiendo rápido (`behavior: upward`).
- **Calma:** Partículas azules derivando lentamente (`behavior: drift`).
- **Fitness:** Partículas ámbar pulsando desde el centro (`behavior: pulse`).

---

## 4. Interfaz de Comunicación (Chat)

### Consola Ceremonial (Input)
- **Diseño:** Cápsula flotante (`rounded-[2rem]`) con borde ámbar cuando está en foco.
- **Tipografía:** Input con `italic serif` para el placeholder, sugiriendo una consulta sagrada.

### Lógica de Respuesta
- **Typewriter Effect:** 14ms por carácter.
- **Cursor Sagrado:** Un bloque ámbar (`bg-amber-400`) que pulsa al final del texto.
- **Sanitización Hardcoded:** Cualquier mención a "Hla" se convierte en "Saludos" y "conooimiento" en "conocimiento" (Filtro de integridad).

---

## 5. Infraestructura de Datos

### Integraciones
- **Supabase:** Gestión de `intentions`, `profiles` y `interaction_logs`.
- **Gemini (IA):** Motor de Sigil configurado en el backend (Fastify).
- **LocalStorage:** Almacena `naos_active_user` y `naos_audio_prefs`.

### Modos de Emergencia
- **Bunker Mode:** Si la coherencia es crítica, la interfaz vira a tonos rojos (`hue-rotate(320deg)`) y el Guardian se vuelve místico/críptico.

---

## 6. Anuncios y Notificaciones (Wisdom)

- **WisdomOverlay:** Modales de sabiduría con `backdrop-blur-[12px]` y tipografía gigante para el título.
- **StatusBadge:** Indica el rango (`FREE`, `ADEPT`, `ARCHITECT`) en la cabecera, junto a la Fase Lunar dinámica.

---

**Fin del Reporte de Auditoría (Identity Blueprint v3.5).**
Este documento permite la replicación total de la psique visual de NAOS.
