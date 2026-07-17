# Backend - Sistema Institucional TCU

API construida con FastAPI + SQLAlchemy + PostgreSQL. Por ahora solo trae el
esqueleto: modelos de datos, migraciones y un endpoint `/health`. Todavia no
hay autenticacion ni endpoints de negocio (eso viene en los siguientes pasos).

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
