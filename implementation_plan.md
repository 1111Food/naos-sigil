# NAOS — VISUAL EXPERIENCE REDESIGN (PLANNING MODE)

## A. CURRENT ARCHITECTURE (Qué existe actualmente)
La pantalla de inicio de sesión actual no es una pantalla dedicada, sino un **modal flotante** (`LoginView.tsx`) que se superpone sobre la vista activa anterior (por ejemplo, el `LandingScreen`, `PreLaunchGate` o `WelcomeBackView`).
- **Componente Principal:** `LoginView.tsx`
- **Renderizado en:** `App.tsx` (bajo el case `'LOGIN'`)
- **Estilos:** Usa fondos translúcidos (`bg-[#0a0a1f]/80 backdrop-blur-2xl`), inputs redondeados, un botón violeta degradado con `framer-motion` y el `StatusBadge` en la parte inferior.
- **Ruta:** No hay un router tradicional; la navegación depende del estado `activeView` gestionado globalmente en `App.tsx`.
- **Datos dinámicos involucrados:** Usa el hook `useAuth()` para manejar el inicio de sesión y la recuperación de clave mediante Supabase. Utiliza el contexto de `i18n` para las traducciones.

## B. VISUAL PROBLEMS (Qué está mal o desactualizado visualmente)
1. **Sensación de "Modal Flotante":** El login se siente como una ventana emergente ("popup") en lugar de un umbral monumental hacia un santuario.
2. **Confusión de Capas:** Al tener un `backdrop-blur` sobre otra pantalla, se alcanza a leer texto por detrás (como el contador del Gate o los datos del viajero), creando "ruido visual" e interrumpiendo la experiencia cinemática.
3. **Identidad Esotérica Genérica:** Usa un degradado violeta/azul muy intenso en el botón, que se siente estándar.
4. **Ausencia de Escala:** No hay elementos gráficos que denoten inmensidad, profundidad o tecnología sofisticada (el concepto de Apple + Sci-Fi + Espiritualidad no se cumple del todo).
5. **Jerarquía Plana:** El logo de NAOS está arriba a la izquierda sin mucho peso, y la información secundaria compite visualmente con los campos de entrada.

## C. PRESERVE (Qué NO debemos tocar)
- **Lógica de Autenticación:** `signInWithPassword` y `resetPasswordForEmail` del `AuthContext`.
- **Navegación:** El sistema de transición de vistas mediante `setActiveView('TEMPLE')` / `setActiveView('ONBOARDING')`.
- **Traducciones:** El uso de las llaves en `i18n` (`t('login_title')`, `t('login_email_placeholder')`, etc).
- **Protección de Rutas (App Guard):** La validación que redirige a Onboarding si faltan datos en el perfil.
- **Roles:** El bypass de administradores.
- **Gestión del `loading` state** para deshabilitar los botones e inputs mientras Supabase responde.

## D. REDESIGN (Qué debe cambiar visualmente)
1. **Paso de Modal a Vista Completa (Fullscreen):** El login debe apoderarse del 100% de la pantalla. El fondo ya no debe dejar ver otra pantalla detrás; será un canvas independiente.
2. **Cinematografía (Background):** Se reemplaza el color sólido/difuminado por un *hero background* cinematográfico con composición de Templo Cósmico (portales, texturas estelares/planetas), manteniendo el centro limpio para la legibilidad.
3. **Jerarquía (Centro Absoluto):** El bloque de ingreso pasa al centro visual. La tipografía de "ACCESO DE VIAJERO" usará serifas elegantes doradas (estilo cinemático).
4. **Paleta de Color:** Se cambia el violeta saturado por:
   - *Fondo:* Negros profundos y azul medianoche (`#05050A`).
   - *Acentos:* Dorado sutil/Cobre (`#D4AF37`, `#FDE047`) para dar toque premium y de misterio.
5. **Tarjetas de Contexto (Context Cards):** La parte inferior mostrará los "Sellos de NAOS" (Acceso Instantáneo, Identidad Protegida, Propósito Manifestado) en tarjetas minimalistas o iconos estilizados.
6. **Formularios:** Inputs de líneas limpias, con bordes muy finos y transparencia elegante, sin fondos plásticos.

## E. NEW COMPONENTS (Qué componentes visuales serían necesarios)
- `LoginHeroLayout.tsx`: Un componente envoltorio dedicado exclusivamente a manejar fondos inmersivos en la pantalla de inicio.
- `CosmicBackground.tsx`: Un componente para manejar assets astronómicos (imágenes de fondo) o partículas de estrellas muy sutiles y de alta eficiencia.
- `NaosPillars.tsx`: Componente para renderizar la fila de iconografía inferior (los 4 sellos/pilares de NAOS mostrados en la referencia).
- `GoldenTypography.tsx` o clases utilitarias para recrear el efecto de texto dorado/metálico de la referencia.

## F. ASSET STRATEGY (Qué assets hacen falta y cómo optimizarlos)
- **Background Image:** Necesitamos una versión de alta calidad (WebP, comprimida, max 200-300kb) de la composición visual (Templo + Planeta).
- **Fallback Estético:** Si la imagen principal carga lento, debemos usar un degradado CSS `radial-gradient` que simule el brillo del portal para que el LCP (Largest Contentful Paint) no sufra.
- **Iconografía:** Necesitaremos SVGs limpios para los íconos de la bóveda inferior (Huella/Acceso, Escudo/Identidad, Loto/Propósito, Chispa/Inteligencia).

## G. DATA STRATEGY (Qué datos dinámicos puede consumir la pantalla)
Ya que NAOS es un sistema de Inteligencia Personal, el Login no debe ser "tonto". Antes de autenticarse, la pantalla puede consumir:
- **Fase Lunar Actual (Time-based):** NAOS ya tiene la función para calcular la fase lunar local en tiempo real. Esto puede aparecer de forma sutil en la cabecera (como en el render: "FASE LUNAR: GIBOSA MENGUANTE").
- Esto le da a NAOS un aura de estar "conectado con el cosmos" incluso antes de que el usuario meta su contraseña, sin comprometer datos personales (es información astronómica pública).

## H. RESPONSIVE STRATEGY (Cómo funcionará en mobile/tablet/desktop)
- **Desktop (Referencia):** Composición completa. Panel de login en el centro, paisaje épico a los lados. Sellos informativos en una sola fila horizontal en el pie de página.
- **Tablet:** El contenedor del formulario mantiene su ancho máximo, el paisaje se recorta sutilmente (object-fit: cover). Los sellos del footer pueden pasar a un grid 2x2.
- **Mobile (390x844):** 
  - El fondo de la izquierda (puerta) y derecha (planeta) pueden ser demasiado ruidosos. La imagen debe centrarse estratégicamente en el portal celestial, o desvanecerse en negro puro en la zona del teclado.
  - La fila de sellos del footer debe desaparecer o condensarse en un carrusel sutil deslizable horizontalmente para no causar scroll vertical innecesario y mantener la experiencia *above the fold* (todo en la primera pantalla).

## I. PERFORMANCE RISKS (Qué debemos evitar)
- **Imágenes Pesadas (Bloating):** No usar PNG/JPG de 5MB para el fondo.
- **Videos o WebGL innecesarios:** Un render 3D interactivo destruiría la batería del celular. Debe ser una imagen estática con efectos CSS ligeros (como un `mix-blend-mode` o un resplandor `drop-shadow` pulsante en CSS).
- **Z-Index Wars:** Evitar que el fondo interfiera con la interactividad de los inputs.
- **Keyboard Shift en iOS:** Asegurarnos de que el diseño se vea bien cuando el teclado del iPhone empuja el formulario hacia arriba (hacer uso de `height: 100dvh`).

## J. DESIGN SYSTEM OPPORTUNITIES (Qué elementos pueden convertirse en primitives reutilizables)
1. **Inputs Premium (`NaosInput.tsx`):** El estilo del borde fino, con icono a la izquierda y acción (ojo) a la derecha, debe estandarizarse para toda la app.
2. **Golden Headings:** El tratamiento tipográfico de "ACCESO DE VIAJERO" se convertirá en la tipografía principal para títulos mayores (ej. Nombres de Arquetipos, Signos, Sellos).
3. **Glass Panels:** Las tarjetas traslúcidas (como la caja de Login) se convertirán en el contenedor por defecto para mostrar información profunda del Templo.

## K. IMPLEMENTATION ORDER (Orden recomendado de implementación)
1. **Extracción y Preparación de Assets:** Optimizar y subir las imágenes de fondo astronómicas y SVGs de la iconografía.
2. **Refactorización de Layouts (`App.tsx`):** Aislar la vista de LOGIN para que no flote sobre otras vistas (limpiar el DOM cuando el usuario no está logueado).
3. **Desarrollo Base (Mobile First):** Reconstruir `LoginView.tsx` adaptándolo al nuevo estilo gráfico sin fondo para garantizar funcionalidad en móvil.
4. **Inyección Dinámica:** Conectar el gancho lunar (`useLunarPhase`) al encabezado de la pantalla de Login.
5. **Estilización (Desktop):** Inyectar el fondo cinematográfico y los sellos de NAOS.
6. **Pruebas (QA):** Validar que el botón, el scroll y el autofocus funcionen perfectamente en Safari iOS.

## L. RISK ASSESSMENT (Qué podría romperse y cómo evitarlo)
- **Riesgo:** El formulario podría dejar de enviar las credenciales.
  - **Mitigación:** Extraer únicamente las clases de Tailwind de los inputs y botones sin alterar los `onChange` ni las funciones `onSubmit`.
- **Riesgo:** En pantallas muy pequeñas, el formulario y los logos chocarían.
  - **Mitigación:** Ocultar los sellos inferiores (`hidden md:flex`) en teléfonos para preservar el espacio sagrado del ingreso.
- **Riesgo:** Desorientación del usuario con el botón "Demo".
  - **Mitigación:** Asegurar que los flujos de "Olvidé mi contraseña" e "Ingreso de Administrador" sigan existiendo sutilmente debajo del botón principal.
