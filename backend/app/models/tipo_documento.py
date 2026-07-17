from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TipoDocumento(Base):
    __tablename__ = "tipo_documento"

    id_tipo_documento: Mapped[int] = mapped_column(primary_key=True)
    name_tipo_documento: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)

    estudiantes: Mapped[list["Estudiante"]] = relationship(back_populates="tipo_documento")
    profesores: Mapped[list["Profesor"]] = relationship(back_populates="tipo_documento")
