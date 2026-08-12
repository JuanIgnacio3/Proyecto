from datetime import date

from sqlalchemy import Boolean, Date, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Evento(Base):
    __tablename__ = "evento"

    id_evento: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    fecha_fin: Mapped[date | None] = mapped_column(Date, nullable=True)
    tipo: Mapped[str] = mapped_column(String(30), nullable=False)
    # Visibilidad en el sitio publico (opt-in). Por defecto FALSE: ningun evento
    # se hace publico automaticamente. Distinto de `tipo` (categoria interna).
    es_publico: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    activo: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
