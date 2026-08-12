from sqlalchemy import Boolean, Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Especialidad(Base):
    """Especialidad tecnica administrable y publicable en el sitio publico.

    El `slug` NO se almacena: se deriva de forma determinista (nombre + id) en el
    endpoint publico, igual que Noticias y Calendario.
    """

    __tablename__ = "especialidad"

    id_especialidad: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    nivel: Mapped[str] = mapped_column(String(80), nullable=False)
    salida_laboral: Mapped[str | None] = mapped_column(Text, nullable=True)
    imagen: Mapped[str | None] = mapped_column(String(255), nullable=True)
    es_publico: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    orden: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
    )
    activo: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
