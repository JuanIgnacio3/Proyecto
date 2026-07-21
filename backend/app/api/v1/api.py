from fastapi import APIRouter

from app.api.v1.endpoints import asignaturas, auth, catalogos, estudiantes, profesores

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    estudiantes.router, prefix="/estudiantes", tags=["estudiantes"]
)
api_router.include_router(profesores.router, prefix="/profesores", tags=["profesores"])
api_router.include_router(
    asignaturas.router, prefix="/asignaturas", tags=["asignaturas"]
)
api_router.include_router(catalogos.router, prefix="/catalogos", tags=["catalogos"])
