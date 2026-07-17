from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Estudiante(Base):
    __tablename__ = "estudiante"

    id_estudiante: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario"), nullable=False, unique=True, index=True
    )
    name_estudiante: Mapped[str] = mapped_column(String(100), nullable=False)
    sec_name_estudiante: Mapped[str] = mapped_column(String(100), nullable=False)
    birthdate_estudiante: Mapped[date] = mapped_column(Date, nullable=False)
    direction_estudiante: Mapped[str] = mapped_column(String(255), nullable=True)
    phone_num_estudiante: Mapped[str] = mapped_column(String(20), nullable=True)
    id_tipo_documento: Mapped[int] = mapped_column(
        ForeignKey("tipo_documento.id_tipo_documento"), nullable=False, index=True
    )
    num_documento_estudiante: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    id_grupo: Mapped[int | None] = mapped_column(ForeignKey("grupo.id_grupo"), nullable=True, index=True)

    usuario: Mapped["Usuario"] = relationship(back_populates="estudiante")
    tipo_documento: Mapped["TipoDocumento"] = relationship(back_populates="estudiantes")
    grupo: Mapped["Grupo | None"] = relationship(back_populates="estudiantes")
    subgrupos: Mapped[list["SubGrupoEstudiante"]] = relationship(back_populates="estudiante")
