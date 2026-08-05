"""Schemas de la API PUBLICA (solo lectura).

Completamente separados de los schemas administrativos (ComunicadoOut). Mapean el
modelo interno al contrato de docs/API_PUBLICA.md. Nunca exponen campos sensibles
(autor, audiencia interna, ids de autor, etc.).
"""
from datetime import date, datetime

from pydantic import BaseModel


class ImageOut(BaseModel):
    """Forma de imagen del contrato. Hoy siempre `null` (sin almacenamiento aun)."""

    url: str
    thumbnail: str | None = None
    alt: str = ""
    width: int | None = None
    height: int | None = None


class NewsItemOut(BaseModel):
    """Item de noticia publica. Mapea Comunicado -> contrato (NewsItem)."""

    id: str
    tag: str
    title: str
    summary: str
    date: datetime
    slug: str
    image: ImageOut | None = None


class CalendarEventOut(BaseModel):
    """Evento publico del calendario. Mapea Evento -> contrato (§8)."""

    id: str
    title: str
    summary: str | None = None
    start: date
    end: date | None = None
    all_day: bool = True
    location: str | None = None
    tag: str | None = None
    slug: str
    image: ImageOut | None = None


class SpecialtyOut(BaseModel):
    """Especialidad publica. Mapea Especialidad -> contrato del sitio."""

    id: str
    name: str
    level: str
    description: str
    salida_laboral: str | None = None
    slug: str
    image: ImageOut | None = None


class PageMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class NewsListResponse(BaseModel):
    data: list[NewsItemOut]
    meta: PageMeta


class CalendarListResponse(BaseModel):
    data: list[CalendarEventOut]
    meta: PageMeta


class SpecialtyListResponse(BaseModel):
    data: list[SpecialtyOut]
    meta: PageMeta
