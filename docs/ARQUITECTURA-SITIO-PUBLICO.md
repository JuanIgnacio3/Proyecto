# Arquitectura del Sitio Público — CTP San Pedro de Barva

Referencia oficial para la construcción del sitio público (Fase 4). Define la
estructura completa, la narrativa, el ritmo visual, las dependencias y el orden de
implementación. Guía maestra: ninguna sección se construye sin consultarla.

## Marco estructural (aplica a todo el documento)

- **Home narrativo de scroll continuo** (Hero → … → Footer) que compone secciones
  condensadas, **más rutas dedicadas** para el contenido que crece:
  `/especialidades` (y detalle por especialidad), `/noticias`, `/calendario`. Las
  secciones del Home son versiones resumidas que enlazan a esas rutas.
- **Objetivo de conversión único del sitio:** **Admisión / Matrícula**. Todo el
  recorrido empuja con sutileza hacia esa acción. El acceso al Portal (login) es
  siempre secundario (Header/Footer).
- **Frontera de componentes (regla dura):** el sitio público **no reutiliza la capa
  institucional del admin** (CrudTable, PageHeader, SectionCard, StatusBadge,
  CrudFormDialog, FormField/Select, RowActions, Banner, useModal…). Esos son de la
  aplicación de gestión y tienen otro lenguaje visual. El público reutiliza **solo
  primitives** (Button, Icon, Link, marca gráfica, tokens, el patrón de "slot de
  imagen") y sus **propios bloques presentacionales**.

## Secciones

### 1. Hero
- **Objetivo:** primera impresión y promesa institucional. Responde: *"¿qué es esto
  y por qué debería importarme?"*
- **Contenido:** estático (kicker, título, subtítulo, CTA, ubicación) + slot de
  fotografía. Del colegio: la foto real. Backend: ninguno.
- **Componentes:** exclusivo *Hero*; primitives Button/Icon/Link/marca/tokens; no
  institucionales.
- **Dependencias:** foto (opcional, ya hay fallback), CONTENT_GUIDE (mínimo), sin
  backend/CMS.
- **Prioridad:** Alta · **Estado:** ✅ cerrado

### 2. Historia e Identidad
- **Objetivo:** convertir la promesa en confianza. Responde: *"¿quiénes son y por qué
  confiar?"*
- **Contenido:** estático (reseña, pilares, ficha, manifiesto) + cifras verificables
  + foto "aprender haciendo". Del colegio: pilares, misión/visión (opcional), ficha
  oficial, foto. Backend: ninguno.
- **Componentes:** exclusivos *Intro asimétrica, Pilares, Zona de confianza (ficha +
  cifras), Manifiesto (franja navy)*; primitives + marca; no institucionales.
- **Dependencias:** CONTENT_GUIDE (crítico), foto (opcional), sin backend/CMS.
- **Prioridad:** Alta · **Estado:** 🟡 diseño aprobado, espera contenido

### 3. Especialidades técnicas
- **Objetivo:** materializar el "técnico": mostrar la oferta concreta. Responde:
  *"¿qué puedo estudiar aquí y a dónde me lleva?"*
- **Contenido:** estático estructurado (listado: nombre, nivel, descripción corta,
  salida) + foto por especialidad. Del colegio: el listado oficial (hoy solo
  *Desarrollo Web* verificada). Backend: ninguno en MVP.
- **Componentes:** exclusivos *rejilla de especialidades + tarjeta de especialidad +
  (futuro) página de detalle*; primitives; no institucionales.
- **Dependencias:** CONTENT_GUIDE (crítico), fotos (media), sin backend, CMS futuro
  (opcional).
- **Prioridad:** Alta · **Estado:** ⏳ pendiente (contenido incompleto)

### 4. Vida estudiantil
- **Objetivo:** pertenencia y emoción; mostrar cómo se *siente* estudiar aquí
  (comunidad, dual, proyectos). Responde: *"¿me imagino aquí?"*
- **Contenido:** foto-protagonista + textos breves; posibles testimonios/egresados y
  educación dual (Accenture). Del colegio: fotos reales y testimonios. Backend:
  ninguno (o futuro, si se liga a galería/noticias).
- **Componentes:** exclusivos *banda inmersiva fotográfica, (opcional)
  testimonio/quote*; primitives; no institucionales.
- **Dependencias:** **fotos (crítico)**; CONTENT_GUIDE (media), sin backend.
- **Prioridad:** Media · **Estado:** ⏳ pendiente

### 5. Noticias / Comunicados
- **Objetivo:** demostrar vitalidad institucional. Responde: *"¿qué pasa hoy en el
  colegio?"*
- **Contenido:** dinámico desde backend (módulo Comunicados ya existe en el admin,
  con audiencia por rol). Público = subconjunto marcado como público. Estático: solo
  el marco/encabezado.
- **Componentes:** exclusivos *tarjeta de noticia + rejilla/lista + ruta
  `/noticias`*; primitives; **NO** reutilizar el CrudTable del admin ni sus
  componentes de gestión.
- **Dependencias:** **endpoint público de comunicados (crítico)**; fotos
  (opcional/fallback); CMS = el propio backend; CONTENT_GUIDE (bajo).
- **Prioridad:** Media · **Estado:** ⏳ pendiente (depende de backend público)

### 6. Calendario de actividades
- **Objetivo:** orientar y anticipar (fechas, eventos, admisión). Responde: *"¿qué
  viene y cuándo?"*
- **Contenido:** dinámico desde backend (módulo Calendario ya existe en el admin).
  Público = eventos institucionales visibles.
- **Componentes:** exclusivos *lista/agenda de eventos públicos + ruta
  `/calendario`*; primitives; no institucionales.
- **Dependencias:** **endpoint público de eventos (crítico)**; sin fotos;
  CONTENT_GUIDE (bajo).
- **Prioridad:** Media · **Estado:** ⏳ pendiente (depende de backend público)

### 7. Admisión / Matrícula
- **Objetivo:** conversión — el fin del sitio. Responde: *"¿cómo ingreso?"*
- **Contenido:** estático (pasos, requisitos, fechas) + enlaces al proceso oficial
  existente (sitio de admisión, formularios, boleta). La matrícula real es proceso
  autenticado/administrativo, no público.
- **Componentes:** exclusivos *banda CTA de admisión (recurrente) + bloque de
  pasos/requisitos*; primitives; no institucionales.
- **Dependencias:** CONTENT_GUIDE (media: fechas/requisitos), sin backend (MVP vía
  enlaces oficiales), sin fotos.
- **Prioridad:** Alta · **Estado:** ⏳ pendiente (contenido mayormente público)

### 8. Contacto
- **Objetivo:** confianza práctica y localización. Responde: *"¿dónde están y cómo
  los contacto?"*
- **Contenido:** estático (dirección, teléfono, correo, horario, mapa, redes) — casi
  todo verificado en la investigación pública. Del colegio: confirmar dominio/correo
  oficial. Backend: opcional (un formulario requeriría endpoint + antispam; fuera de
  MVP → usar correo/enlaces directos).
- **Componentes:** exclusivos *bloque de contacto + mapa embebido + enlaces sociales
  + (aquí sí) foto de fachada*; primitives; no institucionales.
- **Dependencias:** CONTENT_GUIDE (baja), sin backend en MVP, foto de fachada (baja).
- **Prioridad:** Alta · **Estado:** ⏳ pendiente (contenido casi listo)

### 9. Footer
- **Objetivo:** cierre de marca, navegación secundaria y acceso al Portal. Responde:
  *"¿a dónde más puedo ir?"*
- **Contenido:** estático (marca, enlaces, portal, contacto resumido, redes,
  copyright).
- **Componentes:** exclusivo *PublicFooter* (ya existe); primitives + marca; no
  institucionales.
- **Dependencias:** CONTENT_GUIDE (baja: redes/contacto), sin backend/fotos.
- **Prioridad:** Alta · **Estado:** 🟡 base funcional; falta enriquecer (contacto/redes)

### Elemento estructural transversal — Header público
No es sección sino el *shell* de navegación (PublicHeader, ya existe): navegación,
marca, acceso al Portal. Al crecer necesita menú de anclas/rutas (Historia,
Especialidades, Admisión, Contacto) y su versión móvil. **Estado:** 🟡 funcional;
falta menú de navegación.

### Secciones adicionales recomendadas (justificadas)
- **Aliados / Educación dual** (Accenture, modelo dual): diferenciador real y
  verificado. No como sección propia (evitar bloat) → sub-bloque dentro de
  Especialidades o Vida estudiantil. Prioridad Baja.
- **Testimonios / Egresados:** alto valor de confianza. Opcional, integrable en Vida
  estudiantil. Prioridad Baja (depende de contenido real).
- **Detalle por especialidad** (`/especialidades/:slug`): futuro, cuando haya
  contenido rico por carrera. Prioridad Baja.

## Flujo narrativo (experiencia continua)

Arco de persuasión, no colección de páginas. Cada sección responde la pregunta que
abre la anterior:

```
Hero          → capta y PROMETE       ("esto impulsa tu futuro")
  ↓ ¿y quiénes son para prometerlo?
Historia      → genera CONFIANZA       (identidad + pilares + manifiesto)
  ↓ ¿y qué me ofrecen en concreto?
Especialidades→ da SUSTANCIA           (oferta técnica tangible)
  ↓ ¿cómo se siente estudiar aquí?
Vida estud.   → crea PERTENENCIA       (comunidad, emoción, dual)
  ↓ ¿está viva, es real, es activa?
Noticias/Cal. → demuestra VITALIDAD    (prueba de que sucede hoy)
  ↓ me convenció: ¿cómo entro?
Admisión      → invita a la ACCIÓN     (conversión, el fin del sitio)
  ↓ ¿dónde están, cómo los contacto?
Contacto      → ofrece ACCESO          (localización y confianza práctica)
  ↓
Footer        → CIERRE de marca
```

Es continuo porque ninguna sección es autónoma: cada una existe porque la anterior
deja una pregunta abierta. El pegamento es el patrón repetido (kicker + filete,
contenedor común, ritmo de espaciado) y la banda de Admisión recurrente que mantiene
visible el objetivo.

## Alternancia visual (ritmo, con justificación)

Regla: las bandas oscuras (navy) se reservan para identidad, emoción y acción; las
claras, para lectura y escaneo. Nunca dos fondos idénticos adyacentes sin un matiz
tonal.

| Sección | Fondo | Por qué esa transición |
|---|---|---|
| Hero | Oscuro | Impacto y promesa; máxima presencia |
| Historia | Claro *(cierra en franja navy)* | Alivio tras el navy + lectura; el manifiesto reancla la marca |
| Especialidades | Claro matizado (muted) | Continúa la lectura; el matiz evita fundirse con Historia |
| Vida estudiantil | Oscuro / fotográfico | Rompe dos bloques de lectura con una banda inmersiva y emocional |
| Noticias | Claro | Información fresca, escaneable |
| Calendario | Claro matizado | Estructurado; matiz tonal lo separa de Noticias |
| Admisión | Oscuro (CTA) | Momento de acción: destaca sobre todo lo demás |
| Contacto | Claro | Práctico (datos, mapa) |
| Footer | Oscuro | Cierre de marca, simetría con el Hero |

Pulso resultante: oscuro → claro → claro· → oscuro → claro → claro· → oscuro → claro
→ oscuro. Los cuatro momentos navy (Hero, Vida estudiantil, Admisión, Footer) son los
latidos del recorrido; el resto respira en claro.

## Dependencias del backend

| Se puede construir completo hoy (estático) | Debe esperar endpoint público |
|---|---|
| Hero ✅, Historia, Especialidades, Vida estudiantil, Admisión (enlaces), Contacto, Footer | Noticias (Comunicados públicos), Calendario (eventos públicos) |

- **Trabajo backend requerido (aislado y pequeño):** exponer 2 lecturas públicas sin
  autenticación — comunicados marcados como públicos y eventos institucionales
  visibles. No toca el modelo de permisos del admin; añade endpoints de solo lectura
  + un flag de visibilidad.
- Todo lo demás no depende del backend, sino del contenido del colegio.

## Roadmap de implementación (orden que minimiza retrabajo, no el orden visual)

1. **`docs/CONTENT_GUIDE.md`** — la columna de contenido que consumen todas las
   secciones estáticas. Construir secciones antes de fijarlo garantiza retrabajo.
2. **Convención de "shell de sección"** (ritmo de espaciado, contenedor, patrón
   kicker + filete, slot de imagen) — definirla una vez para que todas nazcan
   consistentes.
3. **Historia** — primera sección de contenido; valida el patrón sobre un caso real.
4. **Especialidades** — alto valor MVP, estática, reutiliza el patrón validado.
5. **Admisión + Contacto + enriquecer Footer + menú del Header** — cierran el MVP
   institucional. Contenido mayormente ya público.
6. **Vida estudiantil** — estática pero bloqueada por fotos; se hace cuando lleguen
   imágenes/autorizaciones.
7. **(En paralelo desde el paso 3)** backend: los 2 endpoints públicos → luego
   **Noticias** y **Calendario** como capa dinámica final.

**Por qué este orden y no el visual:** (a) se fija contenido y patrón una sola vez
antes de multiplicar secciones; (b) se agrupan todas las estáticas para avanzar sin
depender del backend; (c) el backend corre en paralelo y las secciones dinámicas
quedan al final, cuando su dependencia esté lista; (d) Vida estudiantil se pospone
hasta tener su insumo crítico (fotos). El orden visual obligaría a esperar backend en
medio del MVP → retrabajo.

## Resumen de estado

| Sección | Prioridad | Estado |
|---|---|---|
| Hero | Alta | ✅ cerrado |
| Historia e Identidad | Alta | 🟡 diseño aprobado |
| Especialidades | Alta | ⏳ pendiente |
| Admisión | Alta | ⏳ pendiente |
| Contacto | Alta | ⏳ pendiente |
| Footer | Alta | 🟡 base funcional |
| Vida estudiantil | Media | ⏳ pendiente (fotos) |
| Noticias | Media | ⏳ pendiente (backend) |
| Calendario | Media | ⏳ pendiente (backend) |
