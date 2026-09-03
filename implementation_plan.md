# NAOS — THE GATE (FINAL IMPLEMENTATION PLAN)

## A. Archivos a modificar
1. `client/src/components/LoginView.tsx` (Se transformará de un simple modal flotante a la composición completa de The Gate, gestionando los nuevos estados narrativos y el layout responsive).
2. `client/src/App.tsx` (Ajustes menores de layout si el contenedor padre restringe el `100dvh` o la expansión de `LoginView`).
3. `client/src/i18n/index.tsx` (Actualización de llaves de traducción para reflejar los estados narrativos: "ABRIENDO EL TEMPLO...", "LA LLAVE NO FUE RECONOCIDA", "NO HAY CONEXIÓN").

## B. Archivos nuevos
1. `client/src/components/gate/AmbientContext.tsx` (Componente ligero para renderizar la fase lunar y el reloj estelar sin consumir APIs externas pesadas).
2. `client/src/components/gate/GateBackground.tsx` (Gestor del fondo cinematográfico con `radial-gradient` de respaldo y manejo optimizado de imágenes).
3. `client/src/components/gate/GateSeals.tsx` (Componente minimalista para los 3 sellos en la parte inferior).

## C. Assets necesarios
1. **Fondo Cinematográfico (Placeholder primero, Final después):** 
   - `bg-gate-mobile.webp` (Enfoque central, optimizado para teclado, ~100KB).
   - `bg-gate-desktop.webp` (Composición completa, ~250KB).
2. **Iconografía Minimalista (SVGs en línea o importados):** 
   - Estrella / Portal (para la cima de The Gate).
   - 3 Íconos de Sellos (Acceso, Identidad, Propósito).

## D. Componentes reutilizados
1. `StatusBadge` (Se adaptará visualmente para encajar en el ecosistema, pero su lógica se mantiene).
2. `AuthContext` (Toda la lógica de autenticación de Supabase permanece intacta).
3. `useLunarPhase` (Si existe localmente, se usa para el cálculo astronómico en memoria sin latencia).

## E. Componentes nuevos (Primitivas del Design System)
Estos componentes nacerán en The Gate pero se estandarizarán para el resto de NAOS:
1. `NaosInput`: Input de bordes finos, fondo *glassmorphism* profundo y foco elegante.
2. `NaosCTA`: Botón maestro. Fondo oscuro + Borde cobre/dorado + *Inner glow* violeta/mystic sutil.
3. `GoldHeading`: Tipografía cinematográfica para titulares principales con un ligero shader metálico en CSS.

## F. Estados (Narrative + Semantic)
1. **NORMAL:** "ACCESO DE VIAJERO" | "Escribe tu llave para entrar al Templo"
2. **LOADING:** "ABRIENDO EL TEMPLO..." (Animación sutil de procesamiento).
3. **INVALID CREDENTIALS:** "LA LLAVE NO FUE RECONOCIDA" (Color ámbar/rojo sutil, retroalimentación clara).
4. **NETWORK ERROR:** "NO HAY CONEXIÓN" (Evitando mensajes fatalistas como "Reality fractured", manteniendo seriedad técnica).
5. **PASSWORD RESET:** "RESTAURAR LLAVE" (Flujo secundario sin perder el contexto de The Gate).

## G. Responsive
- **Mobile (390x844):** Prioridad absoluta al formulario. Uso estricto de `min-h-[100dvh]` para lidiar con la barra de Safari. Los sellos inferiores (`GateSeals`) se comprimen o desaparecen si el teclado está activo (`keyboard-safe`).
- **Tablet / Desktop:** Despliegue completo de la composición. El formulario se asienta en el centro visual (ancho máximo ~420px), permitiendo que el arte conceptual cósmico respire en los márgenes.

## H. Performance
- **Zero-Latency Data:** La fase lunar se calculará con algoritmos matemáticos en el cliente (Ej. epacta lunar) para evitar llamadas de red a NASA/JPL antes del login.
- **CSS Fallback:** Mientras carga el WebP de fondo, se mostrará un `radial-gradient(circle at center, #1a0b2e 0%, #05050A 100%)` para un LCP inmediato.
- **Sin WebGL:** La atmósfera se logrará con mezcla de capas (mix-blend-mode) y CSS, no con Canvas/3D pesados.

## I. QA (Quality Assurance)
Antes de dar por concluida la implementación, se probará rigurosamente:
1. Resoluciones: iPhone (390x844), iPad (768x1024), Desktop (1440+).
2. Funcionalidad: Login exitoso, rechazo por clave incorrecta, reseteo de clave.
3. Edge cases: Interacción con el teclado en iOS (Focus state, auto-scroll), carga con red lenta (3G simulado para ver el fallback del fondo), y accesibilidad (contraste de los inputs).

## J. Rollback Strategy
- Los cambios se realizarán creando los nuevos sub-componentes en una carpeta `/gate/`.
- `LoginView.tsx` será refactorizado, pero si existe un error crítico en producción, se puede revertir a la versión exacta del commit actual `0de704c` mediante Git sin afectar la lógica de base de datos, ya que Supabase y los Contextos no serán modificados.
