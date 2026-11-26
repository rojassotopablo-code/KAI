# KAI — Fase 3 (asistente completo)

## Qué hace
- **Activación por voz:** toca el ícono de ondas (arriba a la derecha) y di «KAI, …». También puedes tocar el orbe o el micrófono y hablar directo.
- **Conversación con Claude:** con la API key entiende lenguaje libre y responde en voz alta.
- **Proyectos y notas por voz:** «crea un proyecto llamado Quincho», «sube el avance del quincho al 40», «agrega la tarea comprar cemento al quincho», «anota que mañana reviso los empalmes», «¿qué proyectos tengo?».
- **Modo básico sin API key:** comandos fijos (hora, fecha, crear proyecto, anotar, listar).
- **Funciona offline** (salvo la conversación con Claude) y se instala como app.
- **Respaldo:** ☰ › Ajustes › Exportar / Importar (JSON).
- Di «silencio» o toca el orbe para cortar una respuesta hablada.

## Novedades fase 2
- **Proyectos completos:** estado, área, responsable, fecha objetivo, descripción y bitácora de comentarios.
- **Tareas** con fecha límite, responsable y prioridad (alta, media o baja). El avance del proyecto se calcula solo con las tareas completadas.
- **Agenda:** tareas vencidas, de hoy y de los próximos 7 días de todos los proyectos activos. Tocas una y te lleva al proyecto.
- **Resumen automático:** la primera vez que abres KAI cada día, muestra lo vencido y lo que tienes para hoy.
- **Copiar plan:** copia el proyecto completo como texto para pegarlo en WhatsApp, un correo o un informe.

### Comandos de voz (con API key, en lenguaje libre)
- «KAI, arma un plan para construir el quincho con fecha objetivo fin de año»
- «Agrega al quincho comprar fierro para el viernes, prioridad alta»
- «Completa la tarea del radier»
- «Pasa la tarea del techo a la próxima semana y asígnasela a Juan»
- «¿Qué tengo hoy?» / «¿Qué tengo vencido?»
- «¿Cómo va el proyecto quincho?»
- «Pausa el proyecto bodega» / «Da por terminado el proyecto bodega»
- «Deja un comentario en el quincho: se atrasó el camión de áridos»

### Sin API key (comandos fijos)
«crea un proyecto llamado …», «agrega la tarea … al proyecto …», «completa la tarea … del proyecto …», «qué tengo pendiente», «qué proyectos tengo», «anota que …».

## Actualizar desde la fase 1
Sube **index.html** y **sw.js** con Add file › Upload files y reemplaza los anteriores. Tus proyectos y notas se mantienen.

## Publicarlo (una vez, gratis, ~10 min) — GitHub Pages
El micrófono solo funciona en sitios **https**, por eso hay que publicarlo:
1. Crea una cuenta en github.com.
2. Botón **New repository** → nombre `KAI` → **Public** → Create.
3. **Add file › Upload files** → arrastra los 5 archivos: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` → **Commit changes**.
4. **Settings › Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save.
5. En 1–2 minutos queda en https://rojassotopablo-code.github.io/KAI/.

Para actualizar KAI en el futuro: subes el `index.html` nuevo al mismo repositorio y listo, se actualiza en todos tus dispositivos.

## Instalarlo
- **Celular Android (Chrome):** abre el enlace › menú ⋮ › **Agregar a pantalla de inicio / Instalar app**.
- **iPhone (Safari):** Compartir › **Agregar a inicio** (el reconocimiento de voz en iPhone es más limitado).
- **PC (Chrome o Edge):** abre el enlace › ícono de instalar en la barra de direcciones (o menú › *Instalar KAI*).
- La primera vez, acepta el permiso de micrófono.

## API key de Claude
1. Entra a console.anthropic.com, crea cuenta y carga créditos (pago por uso).
2. **API Keys › Create Key**, cópiala.
3. En KAI: ☰ › **Ajustes** › pega la key › Guardar.
- La key queda guardada **solo en ese dispositivo** (hay que pegarla en el celular y en el PC por separado).
- No compartas el enlace con la key ya cargada en un equipo ajeno. Si alguna vez se filtra, bórrala en la consola y crea otra.
- Modelo recomendado para uso diario: **Haiku 5.5** (más rápido y barato). Sonnet 5.5 para tareas más complejas.

## Cambios v4.3 — Tareas largas, deshacer y confirmaciones
- **Modo tarea larga:** para encargos grandes («prepárame todo para la auditoría del lunes», «arma la campaña de diciembre») KAI muestra un plan con pasos, los marca a medida que avanza, revisa su trabajo al final y entrega un resumen. Botón **Detener** en cualquier momento.
- **Deshacer:** todo lo que KAI cambia queda registrado. Bajo cada respuesta con cambios aparece «↩ Deshacer los N cambios de esta respuesta»; también por voz: «KAI, deshaz eso». Historial completo en Ajustes › Actividad de KAI, con deshacer por acción.
- **Confirmación en acciones importantes:** antes de borrar tareas, eventos, KPIs o memoria, o de reescribir completa una creación, KAI pregunta. Respondes «sí» o «no» por voz o con el botón. Se puede desactivar en Ajustes.

## Cambios v4.2 — Memoria, modelo automático y control de gasto
- **Memoria personal:** KAI recuerda lo que le cuentas (tu equipo y sus roles, mandantes, preferencias, decisiones, datos de tu pyme) y lo usa sin que lo repitas. Aprende solo o con «KAI, recuerda que…» / «olvida lo de…». Se ve y se edita en Ajustes › Memoria de KAI, y se sincroniza entre dispositivos. Nunca guarda contraseñas, llaves ni datos de tarjetas.
- **Modelo automático (nuevo por defecto):** Haiku 5.5 para conversar, consultar y gestionar (rápido y unas 20 veces más barato), y Sonnet 5.5 para crear documentos, presentaciones, Excel y apps, analizar o trabajar con fotos y archivos. Si Haiku decide crear algo, ese paso lo hace Sonnet.
- **Caché de instrucciones:** la parte fija de cada consulta se cobra a una fracción del precio cuando se repite.
- **Gasto de Claude (Ajustes):** cuánto llevas este mes (suma de todos tus dispositivos), por modelo, con **tope mensual** (20 US$ por defecto): aviso al 80% y pausa al 100%. Por voz: «¿cuánto llevo gastado este mes?».

## Cambios v4.1 — WhatsApp, correo y redes sociales
- **Envíos con un toque:** «mándale el informe a Juan por WhatsApp», «escríbele un correo a Pedro con el Excel de presupuesto», «publica en LinkedIn que cerramos noviembre sin incidentes». KAI redacta el texto adaptado al canal, adjunta el archivo (Word, PowerPoint o Excel) y muestra una **tarjeta de envío**. Al tocar el botón se abre WhatsApp, el correo, LinkedIn, Facebook, Instagram o X con todo listo, y tú confirmas.
- El texto de la tarjeta se puede corregir antes de enviar. También están los botones «Otra app» (menú de compartir del teléfono), «Copiar texto» y, en el PC, «Gmail web» / «Outlook web».
- **Contactos** (☰ › Notas › Contactos): nombre, correo y WhatsApp. Se sincronizan entre dispositivos. Por voz: «guarda a Juan Pérez, su WhatsApp es +56 9…».
- **Publicaciones programadas:** «programa esta publicación de LinkedIn para el lunes a las 9». Queda en la agenda y a esa hora KAI muestra la tarjeta lista (con la app abierta).
- KAI nunca envía ni publica solo: siempre confirmas tú en la app de destino.

## Cambios v4.0 — KPIs con gráficos
- Nueva pestaña **KPIs**: cada indicador con su último valor, semáforo frente a la meta (verde cumple, ámbar a menos de 10%, rojo no cumple), flecha de tendencia y minigráfico. Agrupados por categoría.
- Al tocar un KPI: gráfico con línea de meta y puntos de color, último valor, promedio, % de periodos en meta, filtros 30 días / 90 días / 12 meses / todo, historial y registro manual.
- **Por voz:** «KAI, cumplimiento del programa esta semana 92%», «este mes tuvimos 1 incidente con tiempo perdido», «¿cómo vamos en disponibilidad?», «muéstrame el KPI de ausentismo». Si el KPI no existe, KAI lo crea con meta y sentido razonables.
- **Informes:** botón «Pedir informe a KAI» (PowerPoint ejecutivo con datos reales) y exportación a Excel con hoja resumen y una hoja por KPI con fórmula de cumplimiento.
- Set de KPIs sugeridos para operaciones, seguridad y personal (solo definiciones, sin datos).
- El resumen diario avisa qué KPIs toca registrar según su frecuencia. Los KPIs se sincronizan entre dispositivos.

## Cambios v3.7 — Excel y PowerPoint reales
- **PowerPoint (.pptx):** toda presentación se descarga como PowerPoint con diseño: portada azul, títulos, viñetas, tablas, número de diapositiva y **notas del orador**. Se puede editar en PowerPoint o Google Slides.
- **Excel (.xlsx):** nuevo tipo de creación «Excel» con varias hojas, **fórmulas reales** (SUM, AVERAGE, IF, referencias entre hojas), formatos de moneda, porcentaje, fecha y números, encabezados con color, filas alternadas, filtros y fila TOTAL. En KAI se ve una vista previa con las fórmulas calculadas.
- Las «tablas» también se descargan como Excel (.xlsx).
- Por voz: «hazme un Excel de presupuesto para la mantención de la correa», «prepara un PowerPoint de 8 diapositivas sobre bloqueo de energías», «descárgalo en PowerPoint».
- Las librerías van dentro de la app (carpeta `lib/`), así que funcionan sin internet.

## Cambios v3.6
- Vincular el celular ahora es más fácil: el QR del PC es un enlace. Apunta con la **cámara normal del teléfono** y toca el enlace: KAI se abre ya vinculado y trae tus datos.
- El código es más corto (QR menos denso) y KAI tiene un segundo lector de QR por si el navegador no trae uno.
- Al vincular se muestra en la conversación cuántos elementos se trajeron o, si falló, el motivo.

## Cambios v3.5 — Sincronización entre celular y PC
- Tus proyectos, agenda, notas y creaciones se guardan en un **repositorio privado de tu GitHub** (`kai-datos`) y aparecen en todos tus dispositivos. Gratis, sin servicios de terceros.
- Se sincroniza solo: al abrir KAI, al volver a la app, 4 segundos después de cada cambio y cada 2 minutos. Sin internet, sigue funcionando y sincroniza cuando vuelve la conexión.
- Si cambias cosas en los dos dispositivos, se combinan registro por registro (gana el cambio más reciente) y los borrados también se sincronizan.
- **Configuración (una vez, en el PC):** Ajustes › Sincronización › Configurar en este dispositivo, y sigue los 3 pasos (crear repositorio privado, crear llave, conectar).
- **Segundo dispositivo:** en el PC toca *Mostrar QR para otro dispositivo*; en el celular, Ajustes › *Vincular con código QR* y saca una foto al código. Queda con tu llave de GitHub y tu API key, sin escribir nada.
- No se sincronizan: la conversación, las variantes de voz aprendidas ni el historial de versiones de las creaciones (cada dispositivo guarda el suyo).

## Cambios v3.4 — Fotos y archivos
- Botón 📎 al lado del cuadro de texto (también dentro de una creación abierta). En el celular permite sacar una foto con la cámara o elegirla de la galería.
- Acepta **fotos**, **PDF**, **Excel** (.xlsx/.xls), **Word** (.docx) y archivos de texto (.txt, .csv, .md, .json), hasta 15 MB cada uno y varios a la vez.
- En el PC también puedes **pegar** una imagen (Ctrl+V) o **arrastrar** archivos a la ventana.
- Adjuntas y luego hablas o escribes qué hacer: «¿qué ves en esta foto?», «resume este PDF», «convierte este documento en un procedimiento», «haz un informe de hallazgo con esta foto», «analiza esta planilla y dime qué turno tiene más horas».
- Las fotos se achican antes de enviarse para que sea rápido y barato. KAI recuerda los adjuntos de los últimos mensajes para seguir conversando sobre ellos.

## Cambios v3.3
- **Conversación continua:** toca el orbe una vez (o di «KAI») y conversa de corrido. Después de cada respuesta KAI sigue escuchando sin que repitas su nombre. Termina cuando dices «gracias», «eso es todo» o «chao», o tras 15 segundos de silencio (se ajusta en Ajustes).
- **Navegación por voz:** «abre la agenda», «muéstrame los proyectos», «ve a creaciones», «vuelve al inicio», «cierra». Las órdenes cortas se ejecutan al instante; las más complejas («muéstrame la reunión del viernes») las resuelve Claude.
- KAI ya no inventa un calendario aparte: usa la agenda propia de la app.
- **Bip en Android:** la escucha continua con «KAI» se pausa sola tras 3 minutos sin voz. La forma recomendada en el celular es tocar el orbe y conversar.

## Cambios v3.2
- Corregido: KAI podía quedarse "escuchando" sin ejecutar nada cuando el navegador no avisaba que había terminado de hablar. Ahora se libera solo.
- Con una creación abierta, abajo se ve lo que KAI escucha, lo que está haciendo (con segundos transcurridos) y cualquier error.
- Los cambios puntuales en documentos son mucho más rápidos: KAI edita solo la parte que cambia en vez de reescribir todo.

## Cambios v3.1
- La conversación avanza sola: queda fija en pantalla y siempre muestra lo último, sin tener que desplazarse.
- El orbe se achica cuando hay diálogo, para dejar más espacio a la conversación.
- Mientras KAI piensa aparecen tres puntos animados, y la respuesta va apareciendo palabra por palabra.
- Si subes a leer algo anterior, KAI no te mueve la pantalla; aparece un botón ↓ para volver al final.

## Novedades v3.0 — KAI crea cualquier cosa
- **Creaciones:** pídele documentos, procedimientos, informes, actas, cartas, presentaciones, apps (calculadoras, checklists, formularios, juegos), planillas o código. Se abren a pantalla completa y se guardan en ☰ › Creaciones.
- **Cambios en tiempo real:** con la creación abierta, dile «agrega una sección de riesgos», «hazlo más corto» o «tradúcelo al inglés», y se actualiza en pantalla. El botón *Deshacer último cambio* vuelve a la versión anterior (guarda hasta 10).
- **Exportar:** documentos a Word o PDF, presentaciones a HTML (se presentan con las flechas del teclado o tocando la pantalla), tablas a Excel (CSV) y apps a HTML.
- **Agenda tipo calendario:** vista mensual con eventos (punto celeste) y tareas de proyectos (punto naranjo). Por voz: «agenda reunión con el administrador el jueves a las 10 en la oficina». KAI avisa 15 minutos antes mientras está abierto (activa *Avisos de eventos* en Ajustes).
- **Responde como Claude:** respuestas completas con formato y búsqueda en internet para información actual. Si la búsqueda no está disponible en tu cuenta, KAI la desactiva solo.
- **Más rápido:** responde después de 1,5 s de silencio (antes 2 s) y habla un poco más rápido. En respuestas largas lee solo el comienzo y deja el resto en pantalla.

Ejemplos: «crea un procedimiento de trabajo seguro para cambio de polines», «prepara una charla de 5 minutos sobre bloqueo de energías», «hazme una app checklist de inspección de correa», «crea una planilla de dotación por turno 4x3 y 7x7», «qué dice la ley sobre jornada excepcional en minería».

## Cambios v2.2
- KAI ya no corta las instrucciones: acumula lo que dices y la envía cuando haces silencio (ajustable en Ajustes, 2 segundos por defecto). Tocar el orbe mientras hablas la envía al instante.
- Reacciona apenas reconoce «KAI», sin esperar a que termines la frase.
- **Entrenar palabra de activación** (Ajustes): dices «KAI» 3 veces y KAI aprende cómo te transcribe ese dispositivo. Hazlo una vez en el celular y otra en el PC.
- Cuando la escucha continua está activa, muestra en pantalla lo último que escuchó, para que veas cómo te está entendiendo.

## Cambios v2.1
- Corregido el «Error 400 al conectar con Claude» que aparecía después de que KAI usaba una herramienta. Ahora, si algo falla, KAI se recupera solo y muestra el motivo real del error.
- Escucha continua más estable en Android, pantalla encendida mientras escucha, vibración al activarse y reinicio automático del micrófono.
- Modo conversación (Ajustes): después de responder, KAI sigue escuchando sin que repitas «KAI».

## Limitaciones conocidas de esta fase
- Los datos viven en cada dispositivo; lo del celular no aparece en el PC (la sincronización es una fase posterior). Usa Exportar/Importar para moverlos.
- En Android, la escucha continua puede sonar un "bip" cada cierto tiempo y se detiene con la pantalla apagada; es una limitación de Chrome. Para escucha permanente real se necesita una app nativa (fase posterior).
- La palabra de activación usa el reconocimiento de Google, así que necesita internet.

## Próximas fases
2. ✅ Gestor de proyectos completo.
3. Panel de KPIs con gráficos y registro por voz.
4. Integración con Bitácora y Finanzas.
5. Sincronización en la nube, redes sociales y automatizaciones programadas.
