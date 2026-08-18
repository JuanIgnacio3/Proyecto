from sqlalchemy import Boolean, ForeignKey, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Grupo(Base):
    __tablename__ = "grupo"

    id_grupo: Mapped[int] = mapped_column(primary_key=True)
    name_grupo: Mapped[str] = mapped_column(String(100), nullable=False)
    # Grado del grupo (7mo..12vo en un colegio tecnico). Se usa para filtrar.
    grado: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    # La materia ya no vive en el grupo: se asigna por profesor via
    # ProfesorAsignaturaGrupo. La columna queda nullable por compatibilidad con
    # los grupos creados antes del remodelado.
    id_asignatura: Mapped[int | None] = mapped_column(
        ForeignKey("asignatura.id_asignatura"), nullable=True, index=True
    )
    activo: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )

    asignatura: Mapped["Asignatura | None"] = relationship(back_populates="grupos")
    estudiantes: Mapped[list["Estudiante"]] = relationship(back_populates="grupo")
