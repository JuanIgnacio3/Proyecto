# API Pública — Contrato Frontend ↔ Backend

Contrato oficial de la **API pública** del sitio institucional (CTP San Pedro de
Barva). Documenta únicamente los endpoints de **lectura pública** que consume el
sitio web; **no** cubre la API administrativa (`/api/v1/*`, autenticada por roles).

- **Stack backend:** FastAPI + SQLAlchemy + PostgreSQL (no Django).
- **Estado:** especificación. **No implementado todavía.**
- **Regla base:** la API pública es de **solo lectura, sin autenticación**, y expone
  exclusivamente registros marcados como públicos.

## 1. Objetivos y alcance

**Qué consumirá el sitio público (dinámico, vía esta API):**
- **Noticias** → `GET /api/public/v1/news` (mapea al modelo `NewsItem` que el
  frontend ya consume en `src/content/noticias.ts`).
- **Calendario** → `GET /api/public/v1/calendar` (mapea al componente de Calendario
  que se construirá después).

**Qué permanece estático (NO usa esta API):**
Hero, Historia, Especialidades, Vida estudiantil, Admisión y Contacto viven en
`src/content/*` (o un CMS futuro). No requieren backend en el MVP.

**Qué datos son públicos:** solo los campos explícitamente listados en cada respuesta,
de registros marcados como públicos y ya publicados.

**Qué permanece privado:** borradores, registros no públicos, segmentación por rol/
audiencia, datos del autor (nombre/correo personal), identificadores internos
sensibles y cualquier PII.

**Integración con lo ya construido:** el frontend hoy lee un arreglo local. Al
conectar el backend, **solo cambia la fuente de datos**: la capa de servicio hace
`fetch` del endpoint, toma `response.data` y lo mapea al tipo existente. `NewsCard`,
las secciones y la UI **no cambian**.

## 2. Convenciones generales

- **Base URL:** `/api/public/v1`
- **Formato:** JSON (`Content-Type: application/json; charset=utf-8`).
- **Métodos:** solo `GET`.
- **Fechas:** ISO 8601 con zona (`2026-03-14T09:00:00-06:00`). Zona institucional:
  `America/Costa_Rica`.
- **Idioma:** contenido en español.
- **CORS:** permitido solo para el/los origen(es) del sitio público.
- **Cache:** respuestas cacheables (`Cache-Control: public, max-age=...`); aptas para CDN.

### Envoltura de respuesta (uniforme en todos los endpoints de lista)

```json
{
  "data": [ /* items */ ],
  "meta": { "page": 1, "page_size": 10, "total": 42, "total_pages": 5 }
}
```

El frontend mapea `response.data` → tipo del componente; `meta` alimenta la paginación.

## 3. Paginación (estrategia única)

- **Basada en página:** `?page=<n>&page_size=<m>`.
- **Defaults:** `page=1`, `page_size=10`. **Máximo:** `page_size=50` (valores mayores
  se recortan a 50).
- `meta` siempre incluye `page`, `page_size`, `total`, `total_pages`.
- Si `page` excede `total_pages`: `data: []` con `meta` coherente (no es error).
- **Extensión futura (no rompe):** si el volumen crece, se puede añadir paginación por
  cursor agregando `next_cursor` a `meta` sin quitar los campos actuales.

## 4. Versionado

- **Versionado por URL:** prefijo `/api/public/v1`. (Lo que el brief llamó
  `/api/public/news` corresponde a `/api/public/v1/news`.)
- **Cambios aditivos = no rompen** y permanecen en `v1`: nuevos endpoints, nuevos
  campos **opcionales**, nuevos filtros opcionales.
- **Cambios rompientes = nueva versión** (`v2`): eliminar/renombrar campos, cambiar
  tipos o semántica, volver obligatorio un opcional.
- Los consumidores **deben ignorar campos desconocidos** (tolerancia hacia adelante).

## 5. Imágenes

Las imágenes viajan como un objeto `image` **o `null`** (nunca cadena vacía):

```json
"image": {
  "url": "https://cdn.example/uploads/noticia-123.jpg",
  "thumbnail": "https://cdn.example/uploads/noticia-123_thumb.jpg",
  "alt": "Estudiantes en el taller de electrónica",
  "width": 1600,
  "height": 900
}
```

- `url`: imagen a tamaño completo (URL absoluta).
- `thumbnail`: versión reducida para listados/tarjetas (URL absoluta) — opcional; si
  no existe, el cliente usa `url`.
- `alt`: texto alternativo (accesibilidad). Puede ser `""` si es decorativa.
- `width`/`height`: dimensiones intrínsecas (evitan CLS) — opcionales.
- **`image: null`** cuando no hay imagen → el frontend usa su fallback ya existente.
- **Almacenamiento:** fuera de alcance por ahora. El contrato solo fija la **forma**;
  el backend decidirá luego dónde se guardan (disco/objeto/CDN) sin cambiar esta forma.

## 6. Slugs

- Cada recurso expone un `slug` estable y único (p. ej. `charla-vocacional-2026`).
- **Generación:** kebab-case del título, normalizado (sin tildes ni símbolos); ante
  colisión se sufija (`-2`, `-3`, o el año).
- **Inmutable** tras publicar: garantiza URLs permanentes aunque cambie el título.
- **Rutas de detalle (futuras, no implementar aún):**
  - `GET /api/public/v1/news/{slug}` → una noticia.
  - `GET /api/public/v1/calendar/{slug}` → un evento.
  - Frontend: `/noticias/:slug` y `/calendario/:slug`.

## 7. Endpoint 1 — Noticias

```
GET /api/public/v1/news
```

- **Propósito:** listar comunicados/noticias **públicos y publicados** para la sección
  Noticias y (a futuro) su ruta `/noticias`.
- **Filtros (query params, todos opcionales):**
  | Param | Tipo | Descripción |
  |---|---|---|
  | `page` | int | Página (default 1) |
  | `page_size` | int | Tamaño (default 10, máx 50) |
  | `tag` | string | Filtra por categoría (p. ej. `comunicados`) |
  | `featured` | bool | Solo destacadas (extensión futura) |
- **Orden:** por `date` **descendente** (más reciente primero). Fijo en v1.
- **Paginación:** sección 3.
- **Campos de cada item:**
  | Campo | Obligatorio | Tipo | Mapea a `NewsItem` |
  |---|---|---|---|
  | `id` | sí | string | `id` |
  | `tag` | sí | string | `tag` |
  | `title` | sí | string | `title` |
  | `summary` | sí | string | `summary` |
  | `date` | sí | string (ISO) | `date` |
  | `slug` | sí | string | *(uso futuro: detalle)* |
  | `image` | no | object \| null | *(uso futuro: media)* |

  > `NewsItem` (frontend) es `{ id, tag, title, summary, date? }`. La respuesta es un
  > **superset** (agrega `slug` e `image`); el frontend mapea solo lo que usa. **La UI
  > no cambia.**

- **Errores:** 400 (params inválidos), 429, 500. (404 aplica a la ruta de detalle por
  slug, no al listado.)

### Ejemplo de respuesta

```json
{
  "data": [
    {
      "id": "128",
      "tag": "Comunicados",
      "title": "Inicio del proceso de admisión 2027",
      "summary": "Ya está disponible la información para el ingreso a séptimo año.",
      "date": "2026-07-20T08:00:00-06:00",
      "slug": "inicio-proceso-admision-2027",
      "image": {
        "url": "https://cdn.example/uploads/admision-2027.jpg",
        "thumbnail": "https://cdn.example/uploads/admision-2027_thumb.jpg",
        "alt": "Estudiantes en la entrada del colegio",
        "width": 1600,
        "height": 900
      }
    },
    {
      "id": "127",
      "tag": "Actividades",
      "title": "Feria de especialidades técnicas",
      "summary": "Los estudiantes presentaron sus proyectos a la comunidad.",
      "date": "2026-07-05T14:00:00-06:00",
      "slug": "feria-especialidades-tecnicas",
      "image": null
    }
  ],
  "meta": { "page": 1, "page_size": 10, "total": 24, "total_pages": 3 }
}
```

**Mapeo backend (nota de implementación):** proviene del modelo `Comunicado`. Solo se
exponen registros con `es_publico = true` y `fecha_publicacion <= now()`. `tag` = una
categoría pública (puede requerir un campo `categoria`/`tipo` en el modelo; **no** se
deriva de la audiencia por rol, que es privada). Nunca se expone autor ni audiencia.

## 8. Endpoint 2 — Calendario

```
GET /api/public/v1/calendar
```

- **Propósito:** listar **eventos institucionales públicos** para la sección/ruta de
  Calendario (a construir).
- **Filtros (opcionales):**
  | Param | Tipo | Descripción |
  |---|---|---|
  | `page` | int | Página (default 1) |
  | `page_size` | int | Tamaño (default 10, máx 50) |
  | `from` | string (ISO date) | Eventos con `start >=` fecha |
  | `to` | string (ISO date) | Eventos con `start <=` fecha |
  | `month` | string (`YYYY-MM`) | Atajo para agenda mensual |
  | `featured` | bool | Solo destacados (extensión futura) |
- **Orden:** por `start` **ascendente** (próximos primero). Fijo en v1.
- **Paginación:** sección 3 (o todos los del mes si se usa `month`).
- **Campos de cada evento:**
  | Campo | Obligatorio | Tipo | Descripción |
  |---|---|---|---|
  | `id` | sí | string | Identificador |
  | `title` | sí | string | Nombre del evento |
  | `summary` | no | string | Descripción breve |
  | `start` | sí | string (ISO) | Inicio |
  | `end` | no | string (ISO) \| null | Fin |
  | `all_day` | no | bool | Evento de día completo |
  | `location` | no | string \| null | Lugar |
  | `tag` | no | string \| null | Categoría |
  | `slug` | sí | string | Detalle futuro |
  | `image` | no | object \| null | Sección 5 |
- **Errores:** 400, 429, 500 (404 en detalle por slug).

### Ejemplo de respuesta

```json
{
  "data": [
    {
      "id": "45",
      "title": "Charla vocacional para séptimo año",
      "summary": "Orientación sobre las especialidades técnicas del colegio.",
      "start": "2026-08-12T09:00:00-06:00",
      "end": "2026-08-12T11:00:00-06:00",
      "all_day": false,
      "location": "Auditorio del colegio",
      "tag": "Orientación",
      "slug": "charla-vocacional-septimo-2026",
      "image": null
    },
    {
      "id": "46",
      "title": "Feriado — Día de la Anexión",
      "summary": null,
      "start": "2026-07-25T00:00:00-06:00",
      "end": null,
      "all_day": true,
      "location": null,
      "tag": "Feriado",
      "slug": "feriado-anexion-2026",
      "image": null
    }
  ],
  "meta": { "page": 1, "page_size": 10, "total": 12, "total_pages": 2 }
}
```

**Mapeo backend:** proviene del modelo `Evento`. Solo eventos con
`es_publico = true` (o visibilidad pública equivalente). Nunca se exponen eventos
internos/segmentados por rol.

## 9. Errores (estructura uniforme)

Todos los errores comparten la misma forma:

```json
{
  "error": {
    "code": "not_found",
    "message": "El recurso solicitado no existe.",
    "status": 404
  }
}
```

| HTTP | `code` | Cuándo |
|---|---|---|
| **400** | `bad_request` | Parámetros inválidos (p. ej. `page_size` no numérico, `month` mal formado) |
| **404** | `not_found` | Slug/recurso inexistente (rutas de detalle) |
| **429** | `rate_limited` | Límite de solicitudes superado. Incluye header `Retry-After` |
| **500** | `internal_error` | Error del servidor (mensaje genérico, sin detalles internos) |

- Nunca se filtran trazas ni detalles internos en `message`.
- El listado con `page` fuera de rango **no** es error (devuelve `data: []`).

## 10. Seguridad

- **Solo lectura:** exclusivamente `GET`. Sin `POST/PUT/PATCH/DELETE` públicos.
- **Sin autenticación:** no requiere token ni sesión.
- **Solo registros públicos:** cada endpoint filtra por `es_publico = true` y estado
  publicado (`fecha_publicacion <= now()`); nunca borradores ni futuros.
- **Sin información sensible:** respuesta = solo campos whitelisted. Prohibido exponer
  autor (nombre/correo), audiencia/segmentación por rol, correos, documentos de
  identidad, IDs internos sensibles o cualquier PII.
- **Rate limiting:** por IP, con respuesta `429` + `Retry-After`.
- **CORS restringido** al/los origen(es) del sitio público.
- **Superficie mínima:** la API pública es un módulo separado del router admin; no
  reutiliza dependencias de autenticación ni expone modelos completos (usa esquemas
  de salida específicos y reducidos).

## 11. Extensibilidad (sin romper compatibilidad)

Todo lo siguiente es **aditivo** (nuevos campos opcionales, filtros o endpoints) y
por tanto compatible con `v1`:

| Necesidad futura | Cómo se agrega |
|---|---|
| **Noticias destacadas** | Campo opcional `featured: bool` + filtro `?featured=true` en `/news` |
| **Eventos destacados** | Igual, en `/calendar` |
| **Galerías** | Nuevo endpoint `GET /api/public/v1/galleries` + `images: []` (forma de la sección 5) |
| **Banners** | Nuevo endpoint `GET /api/public/v1/banners` (título, imagen, enlace, vigencia) |
| **Especialidades dinámicas** | Nuevo endpoint `GET /api/public/v1/specialties` con la **misma forma** que `src/content/especialidades.ts` (name, level, description, icon, slug); el frontend cambia solo la fuente de datos |

**Reglas de compatibilidad:**
1. En `v1` solo se **agregan** campos opcionales, filtros o endpoints; nunca se
   elimina/renombra/retipa lo existente.
2. Los clientes ignoran campos desconocidos.
3. Un cambio rompiente obliga a `v2` conviviendo con `v1`.

---

## Evaluación (cierre de fase)

- **¿El frontend queda oficialmente cerrado?** Sí. `tsc`/`lint` en verde, sin
  overflow, accesible, y consolidado en el commit `c5df258`
  (`feat(public): finalize public website MVP`).
- **¿El commit es un buen punto de restauración?** Sí: contiene **solo** el frontend
  público (29 archivos), sin mezclar el trabajo pendiente de Ola A del admin. Es un
  estado coherente y restaurable.
- **¿El contrato de la API está listo para comenzar el backend?** Sí. Define forma de
  respuesta, paginación, versionado, errores, seguridad, imágenes, slugs y
  extensibilidad, con mapeo directo a `NewsItem` y al futuro Calendario. El backend
  puede implementarse contra este documento sin tocar la UI.
- **Decisiones arquitectónicas pendientes antes de programar:**
  1. **Categoría/tag público** de noticias: confirmar si `Comunicado` ya tiene un
     campo de categoría o si hay que añadirlo (separado de la audiencia por rol).
  2. **Flag de visibilidad pública** en `Comunicado` y `Evento` (`es_publico`) y su
     migración (fuera de este contrato; solo se señala).
  3. **Dominio oficial y CORS** (pendiente ya en CONTENT_GUIDE/SEO).
  4. **Almacenamiento de imágenes** (disco/objeto/CDN) — la forma ya está fijada; la
     ubicación se decide al implementar.
  5. **Rate limiting y capa de cache/CDN** — elegir mecanismo.
