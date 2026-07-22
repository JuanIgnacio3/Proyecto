from datetime import date

from sqlalchemy import Date, String, Text
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
