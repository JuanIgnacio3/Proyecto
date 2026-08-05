"""Endpoint publico de Especialidades: GET /api/public/v1/specialties.

Lectura publica, sin autenticacion. Lee directamente de la tabla `Especialidad`,
filtrando solo las marcadas como publicas. Mismo patron que Noticias/Calendario;
reutiliza la infraestructura comun de la Fase 5.5.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.public._common import DEFAULT_PAGE_SIZE, count_pages, validate_pagination
from app.core.slug import resource_slug
from app.db.session import get_db
from app.models.especialidad import Especialidad
from app.schemas.public import ImageOut, PageMeta, SpecialtyListResponse, SpecialtyOut

router = APIRouter()


def _to_specialty(e: Especialidad) -> SpecialtyOut:
    """Mapea Especialidad -> SpecialtyOut (contrato)."""
    return SpecialtyOut(
        id=str(e.id_especialidad),
        name=e.nombre,
        level=e.nivel,
        description=e.descripcion,
        salida_laboral=e.salida_laboral,
        slug=resource_slug(e.nombre, e.id_especialidad),
        image=ImageOut(url=e.imagen) if e.imagen else None,
    )


@router.get("/specialties", response_model=SpecialtyListResponse)
def list_public_specialties(
    db: Session = Depends(get_db),
    page: int = Query(default=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE),
):
    page_size, err = validate_pagination(page, page_size)
    if err is not None:
        return err

    query = db.query(Especialidad).filter(Especialidad.es_publico.is_(True))

    total = query.count()

    rows = (
        query.order_by(Especialidad.orden.asc(), Especialidad.id_especialidad.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return SpecialtyListResponse(
        data=[_to_specialty(e) for e in rows],
        meta=PageMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=count_pages(total, page_size),
        ),
    )
