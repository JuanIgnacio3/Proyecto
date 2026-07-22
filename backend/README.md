# Backend - Sistema Institucional TCU

API construida con FastAPI + SQLAlchemy + PostgreSQL. Expone la API del sistema
escolar bajo `/api/v1` con autenticacion JWT (OAuth2 password flow) y control de
acceso por roles.

## Autenticacion y roles

- `POST /api/v1/auth/login` (form) devuelve un JWT; `GET /api/v1/auth/me` retorna
  el usuario actual. El hash de contrasena usa bcrypt y el token PyJWT.
- Roles: `Administrador`, `Profesor`, `Administrativo`, `Encargado`, `Estudiante`.
  Cada endpoint valida el rol con la dependencia `require_roles(...)`.

## Modulos / endpoints

Personas: `estudiantes`, `profesores`, `administrativos`, `encargados`.
Academico: `asignaturas`, `grupos`, `subgrupos`, `matricula`, `asistencia`,
`evaluaciones` (calificaciones/notas). Institucional: `comunicados`, `eventos`
(calendario), `reportes`, `stats` (dashboard). Transversal: `auth`, `catalogos`.

Cada dominio sigue el patron `models/<dominio>.py` + `schemas/<dominio>.py` +
`api/v1/endpoints/<dominio>.py`, registrado en `app/api/v1/api.py`.

## Datos iniciales (seed)

Crea los roles base, tipos de documento y un usuario administrador de prueba:

```bash
docker compose exec backend python -m app.db.seed
```

> El admin del seed y los secretos de `.env.example` son solo para desarrollo
> local; cambielos antes de cualquier despliegue.

## Requisitos

- Docker + Docker Compose

## Levantar el entorno

Desde la raiz del repo (`Proyecto/`):

```bash
docker compose up --build
```

Esto levanta dos servicios:

- `db`: PostgreSQL 16
- `backend`: FastAPI en http://localhost:8000 (con auto-reload)

Docs interactivas (Swagger): http://localhost:8000/api/v1/openapi.json y
http://localhost:8000/docs

## Migraciones (Alembic)

Con los contenedores corriendo, generar y aplicar migraciones desde el
contenedor `backend`:

```bash
docker compose exec backend alembic revision --autogenerate -m "mensaje"
docker compose exec backend alembic upgrade head
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar si hace falta. `.env` no se
versiona (esta en `.gitignore`).

## Estructura

```
backend/
  app/
    core/config.py     # settings (env vars)
    db/                 # engine, sesion, Base declarativa
    models/              # entidades SQLAlchemy (una por archivo)
    main.py               # instancia de FastAPI
  alembic/                # migraciones
```
