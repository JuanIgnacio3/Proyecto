"""Endpoint publico de Calendario: GET /api/public/v1/calendar.

Lectura publica, sin autenticacion. Lee directamente de la tabla `Evento`
(sin modelos ni servicios paralelos), filtrando solo los marcados como publicos.
Mismo patron que el endpoint de Noticias.
"""
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.api.public._common import (
    DEFAULT_PAGE_SIZE,
    count_pages,
    error_response,
    validate_pagination,
)
from app.core.slug import resource_slug
from app.db.session import get_db
from app.models.evento import Evento
from app.schemas.public import CalendarEventOut, CalendarListResponse, PageMeta

router = APIRouter()


def _to_event(e: Evento) -> CalendarEventOut:
    """Mapea Evento -> CalendarEventOut (contrato). `tag` = tipo de evento."""
    return CalendarEventOut(
        id=str(e.id_evento),
        title=e.titulo,
        summary=e.descripcion,
        start=e.fecha_inicio,
        end=e.fecha_fin,
        all_day=True,
        location=None,
        tag=e.tipo,
        slug=resource_slug(e.titulo, e.id_evento),
        image=None,
    )


@router.get("/calendar", response_model=CalendarListResponse)
def list_public_calendar(
    db: Session = Depends(get_db),
    page: int = Query(default=1),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE),
    date_from: str | None = Query(default=None, alias="from"),
    date_to: str | None = Query(default=None, alias="to"),
    month: str | None = Query(default=None),
    tag: str | None = Query(default=None),
):
    page_size, err = validate_pagination(page, page_size)
    if err is not None:
        return err

    query = db.query(Evento).filter(Evento.es_publico.is_(True))

    # from: eventos con fecha_inicio >= from
    if date_from is not None:
        try:
            desde = date.fromisoformat(date_from)
        except ValueError:
            return error_response(400, "bad_request", "El parametro 'from' debe ser una fecha ISO (YYYY-MM-DD).")
        query = query.filter(Evento.fecha_inicio >= desde)

    # to: eventos con fecha_inicio <= to
    if date_to is not None:
        try:
            hasta = date.fromisoformat(date_to)
        except ValueError:
            return error_response(400, "bad_request", "El parametro 'to' debe ser una fecha ISO (YYYY-MM-DD).")
        query = query.filter(Evento.fecha_inicio <= hasta)

    # month: agenda mensual (YYYY-MM)
    if month is not None:
        try:
            anio_str, mes_str = month.split("-")
            anio, mes = int(anio_str), int(mes_str)
            if not 1 <= mes <= 12:
                raise ValueError
        except (ValueError, AttributeError):
            return error_response(400, "bad_request", "El parametro 'month' debe tener formato YYYY-MM.")
        query = query.filter(
            extract("year", Evento.fecha_inicio) == anio,
            extract("month", Evento.fecha_inicio) == mes,
        )

    # tag: categoria publica del evento (= tipo)
    if tag is not None:
        query = query.filter(Evento.tipo == tag)

    total = query.count()

    rows = (
        query.order_by(Evento.fecha_inicio.asc(), Evento.id_evento.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return CalendarListResponse(
        data=[_to_event(e) for e in rows],
        meta=PageMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=count_pages(total, page_size),
        ),
    )
