"""Endpoint publico de Noticias: GET /api/public/v1/news.

Lectura publica, sin autenticacion. Lee directamente de la tabla `Comunicado`
(sin modelos ni servicios paralelos), filtrando solo los marcados como publicos.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.public._common import DEFAULT_PAGE_SIZE, count_pages, validate_pagination
from app.core.slug import resource_slug
from app.db.session import get_db
from app.models.comunicado import Comunicado
from app.schemas.public import NewsItemOut, NewsListResponse, PageMeta

router = APIRouter()

# Etiqueta por defecto cuando un comunicado publico no tiene categoria asignada
# (la columna es nullable). El contrato exige `tag` como string obligatorio.
DEFAULT_TAG = "Institucional"


def _to_news_item(c: Comunicado) -> NewsItemOut:
    """Mapea Comunicado -> NewsItemOut (contrato). Nunca expone autor/audiencia."""
    return NewsItemOut(
        id=str(c.id_comunicado),
        tag=c.categoria or DEFAULT_TAG,
        title=c.titulo,
        summary=c.cuerpo,
        date=c.fecha_publicacion,
        slug=resource_slug(c.titulo, c.id_comunicado),
        image=None,
    )


@router.get("/news", response_model=NewsListResponse)
def list_public_news(
    db: Session = Depends(get_db),
    page: int = Query(default=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE),
    categoria: str | None = Query(default=None),
):
    page_size, err = validate_pagination(page, page_size)
    if err is not None:
        return err

    query = db.query(Comunicado).filter(Comunicado.es_publico.is_(True))
    if categoria is not None:
        query = query.filter(Comunicado.categoria == categoria)

    total = query.count()

    rows = (
        query.order_by(
            Comunicado.fecha_publicacion.desc(),
            Comunicado.id_comunicado.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return NewsListResponse(
        data=[_to_news_item(c) for c in rows],
        meta=PageMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=count_pages(total, page_size),
        ),
    )
