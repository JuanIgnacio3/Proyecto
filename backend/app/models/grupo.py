from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Grupo(Base):
    __tablename__ = "grupo"

    id_grupo: Mapped[int] = mapped_column(primary_key=True)
    name_grupo: Mapped[str] = mapped_column(String(100), nullable=False)
    id_asignatura: Mapped[int] = mapped_column(ForeignKey("asignatura.id_asignatura"), nullable=False, index=True)

    asignatura: Mapped["Asignatura"] = relationship(back_populates="grupos")
    estudiantes: Mapped[list["Estudiante"]] = relationship(back_populates="grupo")
    profesores: Mapped[list["Profesor"]] = relationship(back_populates="grupo")
    subgrupos: Mapped[list["SubGrupo"]] = relationship(back_populates="grupo")
