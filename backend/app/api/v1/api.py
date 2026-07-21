from fastapi import APIRouter

from app.api.v1.endpoints import (
    asignaturas,
    asistencia,
    auth,
    calificaciones,
    catalogos,
    encargados,
    estudiantes,
    grupos,
    profesores,
    stats,
    subgrupos,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    estudiantes.router, prefix="/estudiantes", tags=["estudiantes"]
)
api_router.include_router(profesores.router, prefix="/profesores", tags=["profesores"])
api_router.include_router(
    asignaturas.router, prefix="/asignaturas", tags=["asignaturas"]
)
api_router.include_router(grupos.router, prefix="/grupos", tags=["grupos"])
api_router.include_router(subgrupos.router, prefix="/subgrupos", tags=["subgrupos"])
api_router.include_router(asistencia.router, prefix="/asistencia", tags=["asistencia"])
api_router.include_router(
    calificaciones.router, prefix="/evaluaciones", tags=["calificaciones"]
)
api_router.include_router(encargados.router, prefix="/encargados", tags=["encargados"])
api_router.include_router(catalogos.router, prefix="/catalogos", tags=["catalogos"])
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
