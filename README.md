# Sistema Institucional — CTP San Pedro de Barva

Sistema de gestión escolar con **tres superficies claramente separadas**: un **sitio público** institucional, un **panel administrativo** con control de acceso por rol, y una **API pública de solo lectura** que alimenta el sitio a partir de contenido marcado explícitamente como publicable.

No es un CRUD: la decisión central del diseño es una **frontera público/privado aplicada por construcción** — el contenido nunca aparece en público por accidente y la API pública no puede exponer datos internos.

![license](https://img.shields.io/badge/license-MIT-blue) ![backend](https://img.shields.io/badge/backend-FastAPI-009688) ![frontend](https://img.shields.io/badge/frontend-React%2019-61dafb) ![db](https://img.shields.io/badge/db-PostgreSQL%2016-336791)

> **Estado:** v1.0.0 — funcionalmente completo y auditado. Lo pendiente para un despliegue real es **externo** (contenido e imágenes del colegio, dominio, TLS); ver [Alcance y limitaciones](#alcance-y-limitaciones).

---

## Qué lo hace distinto

- **Frontera público/privado por diseño** — routers y serializadores separados; `es_publico` es *opt-in* con `server_default false` a nivel de base de datos.
- **API pública con contrato escrito** ([`docs/API_PUBLICA.md`](docs/API_PUBLICA.md)) — solo lectura, sin autenticación, campos en *whitelist*.
- **Infraestructura de producción real y verificada** — build multi-stage → Nginx (reverse proxy + estáticos + gzip + cache + cabeceras de seguridad), backend con workers y usuario no-root, PostgreSQL en red interna.
- **Evolución de esquema aditiva** — migraciones Alembic, nunca destructivas.

---

## Arquitectura (C4 · contenedores)

Topología de producción. En desarrollo no hay Nginx (Vite sirve la SPA y el backend se expone directo).

```mermaid
flowchart LR
    VP(["Visitante público"]):::actor
    UP(["Usuario del panel<br/>Administrador · Profesor · Administrativo<br/>Encargado · Estudiante"]):::actor
    SPA["SPA React<br/>sitio público + panel<br/>(se ejecuta en el navegador)"]:::app

    subgraph SRV["Servidor · producción (Docker)"]
        direction LR
        NGINX["Nginx<br/>sirve estáticos + reverse proxy"]:::app
        subgraph API["FastAPI"]
            direction TB
            PUB["/api/public/v1<br/>solo lectura · sin auth"]:::publicz
            ADM["/api/v1<br/>autenticado · require_roles"]:::authz
        end
        DB[("PostgreSQL")]:::data
    end

    VP --> SPA
    UP --> SPA
    SPA -->|"HTTPS · estáticos y /api"| NGINX
    NGINX -->|"proxy · sin token"| PUB
    NGINX -->|"proxy · Bearer JWT"| ADM
    PUB -->|SQLAlchemy| DB
    ADM -->|SQLAlchemy| DB

    classDef actor fill:#eceff1,stroke:#546e7a,color:#000
    classDef app fill:#f5f5f5,stroke:#616161,color:#000
    classDef publicz fill:#e8f5e9,stroke:#2e7d32,color:#000
    classDef authz fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef data fill:#fff8e1,stroke:#f9a825,color:#000
```

## Flujo de publicación de contenido

Cómo un contenido pasa del panel al sitio público **de forma segura** — protegido por dos controles independientes.

```mermaid
flowchart TB
    subgraph P1["1 · Publicación (administración)"]
        direction TB
        A(["Administrador / Administrativo"]):::actor
        B["Panel administrativo<br/>SPA React"]:::app
        C["POST / PUT<br/>/api/v1/comunicados"]:::authz
        D{"require_roles(...)"}:::controlAuth
        A --> B --> C --> D
    end

    E[("PostgreSQL")]:::data
    D -->|"autorizado · guarda es_publico=true"| E

    subgraph P2["2 · Consulta pública (más tarde)"]
        direction TB
        F(["Visitante"]):::actor
        G["Sitio público<br/>SPA React"]:::app
        H["GET<br/>/api/public/v1/news"]:::publicz
        I{"es_publico == true"}:::controlPub
        J["NewsItemOut<br/>serializador whitelist<br/>sin autor · sin audiencia"]:::publicz
        K["Renderizado<br/>en el sitio público"]:::publicz
        L["es_publico = false<br/>permanece interno"]:::authz
        F --> G --> H --> I
        I -->|"solo públicos"| J --> K
        I -->|"privado"| L
    end

    E -. "consulta posterior" .-> I

    classDef actor fill:#eceff1,stroke:#546e7a,color:#000
    classDef app fill:#f5f5f5,stroke:#616161,color:#000
    classDef publicz fill:#e8f5e9,stroke:#2e7d32,color:#000
    classDef authz fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef data fill:#fff8e1,stroke:#f9a825,color:#000
    classDef controlAuth fill:#e3f2fd,stroke:#000,stroke-width:3px,color:#000
    classDef controlPub fill:#e8f5e9,stroke:#000,stroke-width:3px,color:#000
```

## Autenticación y autorización (RBAC)

La autoridad vive **en el servidor**. El frontend solo organiza la navegación; nunca autoriza.

```mermaid
flowchart TB
    subgraph CLIENT["Cliente · solo UX (nunca autoriza)"]
        direction TB
        LOGIN["Formulario de login"]:::app
        LS["localStorage<br/>guarda el JWT"]:::app
        NAV["roles.ts<br/>solo navegación / UX"]:::app
    end

    subgraph SERVER["Servidor · autoridad real"]
        direction TB
        LOGINEP["POST /api/v1/auth/login"]:::authz
        VP["verify_password() · bcrypt"]:::authz
        D1{"¿Credenciales válidas?"}:::controlAuth
        JWT["JWT firmado<br/>(solo transporta identidad)"]:::authz
        GCU["get_current_user()"]:::authz
        D2{"¿JWT válido?"}:::controlAuth
        D3{"¿Usuario activo?"}:::controlAuth
        RR["require_roles()"]:::authz
        D4{"¿Rol permitido?"}:::controlAuth
        EP["Endpoint protegido<br/>ejecuta y responde"]:::authz
        R401["401 · rechazado"]:::reject
        R403["403 · rechazado"]:::reject
    end

    LOGIN -->|"POST"| LOGINEP
    LOGINEP --> VP --> D1
    D1 -->|"no"| R401
    D1 -->|"sí"| JWT
    JWT -->|"devuelto al cliente"| LS
    LS -->|"Authorization: Bearer · nueva petición"| GCU
    GCU --> D2
    D2 -->|"no"| R401
    D2 -->|"sí"| D3
    D3 -->|"no"| R401
    D3 -->|"sí"| RR
    RR --> D4
    D4 -->|"no"| R403
    D4 -->|"sí"| EP
    LS -. "identidad → navegación" .-> NAV

    classDef app fill:#f5f5f5,stroke:#616161,color:#000
    classDef authz fill:#e3f2fd,stroke:#1565c0,color:#000
    classDef controlAuth fill:#e3f2fd,stroke:#000,stroke-width:3px,color:#000
    classDef reject fill:#e3f2fd,stroke:#546e7a,stroke-dasharray:4 3,color:#000
```

## Stack

| Capa | Tecnologías |
|---|---|
| **Backend** | FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 · PostgreSQL 16 · PyJWT (HS256) · bcrypt |
| **Frontend** | React 19 · TypeScript 5 · Vite 7 · React Router 7 · Tailwind CSS 4 · Radix UI · Iconify |
| **Infraestructura** | Docker · Docker Compose (dev y prod) · Nginx (reverse proxy en prod) |

## Características

**Sitio público** — Hero, Historia e Identidad, Especialidades, Vida Estudiantil, Noticias, Calendario, Admisión, Contacto; SEO (meta/OG/Twitter/JSON-LD), responsive, estados vacíos.

**Panel administrativo** (por rol) — Estudiantes, Profesores, Administrativos, Encargados, Materias, Grupos, Subgrupos, Asistencia, Calificaciones, Reportes, Matrícula, Comunicados, Calendario, Especialidades. Dashboard con estadísticas en vivo.

**API pública** — `GET /api/public/v1/{news,calendar,specialties}`: solo lectura, paginada, filtrable, con envoltorio de error uniforme. Contrato en [`docs/API_PUBLICA.md`](docs/API_PUBLICA.md).

## Seguridad

- **JWT** (HS256) validado en el servidor; `SECRET_KEY` **obligatoria y validada** (la app no arranca con una clave insegura).
- **RBAC** con `require_roles` como **única autoridad**; el frontend (`roles.ts`) solo controla navegación.
- **IDOR** cerrado en Reportes (`_ids_permitidos` → 403).
- **API pública** sin autenticación, solo lectura, con serializadores en *whitelist* (nunca expone autor/audiencia).
- **CORS por entorno** (sin `localhost` incrustado), **rate limiting** por IP, y en producción **Nginx con CSP + cabeceras de seguridad**.

## Modelo de datos (simplificado)

Núcleo académico + identidad + publicación desacoplada. Modelo completo (19 tablas) en [`docs/`](docs/).

```mermaid
erDiagram
    USUARIO ||--o| ESTUDIANTE : "es"
    USUARIO ||--o{ COMUNICADO : "publica"
    ENCARGADO }o--o{ ESTUDIANTE : "es responsable de"
    ASIGNATURA ||--o{ GRUPO : "define"
    GRUPO ||--o{ ESTUDIANTE : "agrupa"
    GRUPO ||--o{ EVALUACION : "programa"
    EVALUACION ||--o{ NOTA : "contiene"
    ESTUDIANTE ||--o{ NOTA : "recibe"
    ESTUDIANTE ||--o{ ASISTENCIA : "registra"

    USUARIO { int id_usuario PK
        string correo_institucional
        bool activo }
    ESTUDIANTE { int id_estudiante PK
        string name_estudiante
        string num_documento_estudiante }
    ENCARGADO { int id_encargado PK
        string name_encargado
        string parentesco }
    ASIGNATURA { int id_asignatura PK
        string name_asignatura }
    GRUPO { int id_grupo PK
        string name_grupo }
    EVALUACION { int id_evaluacion PK
        string name_evaluacion
        decimal porcentaje }
    NOTA { int id_nota PK
        decimal valor }
    ASISTENCIA { int id_asistencia PK
        date fecha
        string estado }
    COMUNICADO { int id_comunicado PK
        string titulo
        bool es_publico }
```

> El modelo actual está pensado para **un colegio y un ciclo lectivo**; no incluye eje temporal (año lectivo) como entidad. Ver observaciones de dominio en [`docs/`](docs/).

## Infraestructura de producción

Un único punto de entrada; servicios internos aislados; prácticas reales (multi-stage, no-root, workers, migraciones al arranque, persistencia por volumen).

```mermaid
flowchart LR
    NET(["Internet"]):::actor

    subgraph BUILD["Build · multi-stage (solo en build, no runtime)"]
        direction LR
        NODE["Node"]:::build
        DIST["dist/ · estáticos"]:::build
        NODE --> DIST
    end

    subgraph HOST["Docker Host · red interna"]
        direction LR
        NGINX["Nginx<br/>sirve estáticos · reverse proxy"]:::app
        APP["FastAPI<br/>4 workers · no-root<br/>migra al iniciar"]:::app
        PG[("PostgreSQL<br/>red interna · no expuesto")]:::data
        NGINX -->|"proxy /api"| APP
        APP -->|"SQLAlchemy"| PG
    end

    VOL[("Volumen persistente")]:::data

    NET -->|"HTTP/HTTPS"| NGINX
    DIST -. "servido como estáticos" .-> NGINX
    PG -->|"Persistencia"| VOL

    classDef actor fill:#eceff1,stroke:#546e7a,color:#000
    classDef app fill:#f5f5f5,stroke:#616161,color:#000
    classDef data fill:#fff8e1,stroke:#f9a825,color:#000
    classDef build fill:#fafafa,stroke:#9e9e9e,stroke-dasharray:4 3,color:#000
```

## Cómo ejecutarlo (desarrollo)

**Backend + base de datos** (Docker):

```bash
cp backend/.env.example backend/.env   # completar SECRET_KEY (openssl rand -hex 32) y credenciales
docker compose up -d
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.db.seed
```

**Frontend** (Vite):

```bash
cd tailwind-admin-reactjs-free/package
npm install
npm run dev
```

El sitio público queda en `http://localhost:5173/inicio` y el panel en `http://localhost:5173` (login con el administrador del seed).

## Producción

Compose de producción independiente (Nginx + backend con workers + PostgreSQL cerrado):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Guía completa (variables, CORS, dominio, TLS, DNS, favicon/OG) en **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)**.

## Estructura del repositorio

```
backend/                     API FastAPI (models, schemas, api/v1, api/public, core, db)
tailwind-admin-reactjs-free/package/   Frontend React (src: views, components, layouts, lib, hooks, content)
docs/                        Arquitectura, API pública, despliegue, dominio, contenido
docker-compose.yml           Desarrollo (db + backend)
docker-compose.prod.yml      Producción (db + backend + web/nginx)
```

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/API_PUBLICA.md`](docs/API_PUBLICA.md) | Contrato de la API pública |
| [`docs/ARQUITECTURA-FRONTEND.md`](docs/ARQUITECTURA-FRONTEND.md) | Arquitectura del frontend |
| [`docs/ARQUITECTURA-SITIO-PUBLICO.md`](docs/ARQUITECTURA-SITIO-PUBLICO.md) | Arquitectura del sitio público |
| [`docs/CATALOGO-COMPONENTES.md`](docs/CATALOGO-COMPONENTES.md) | Capa de componentes institucionales |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) | Guía de contenido institucional |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Despliegue paso a paso |
| [`docs/DIAGRAMAS.md`](docs/DIAGRAMAS.md) | Diagramas técnicos (ERD completo, agregados, dev vs prod) |

## Alcance y limitaciones

**Alcance:** un colegio, un ciclo lectivo, gestión académica básica + comunicación pública. Construido sobre una base de plantilla de UI, con el código de aplicación (dominios, seguridad, sitio público, API) desarrollado a medida.

**Pendiente — solo depende de recursos externos:**
- Contenido e **imágenes reales** del colegio (hoy las secciones dinámicas muestran estados vacíos correctos).
- **Dominio oficial** (canonical/OG/sitemap — documentado en `DEPLOYMENT.md`).
- **TLS/despliegue** en infraestructura real.

**Deuda técnica conocida (no bloquea v1.0):** sin pruebas automatizadas ni CI; listas administrativas sin paginación server-side (adecuado a la escala de un colegio); modelo sin eje temporal (año lectivo) para evolución multi-ciclo.

## Licencia

MIT — ver [`LICENSE.md`](LICENSE.md).
