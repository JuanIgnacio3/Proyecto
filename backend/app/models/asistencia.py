from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Asistencia(Base):
    __tablename__ = "asistencia"
    # La asistencia se toma por CLASE (asignacion profesor+materia+grupo) y fecha:
    # un estudiante puede tener varias listas en un dia (una por materia).
    __table_args__ = (
        UniqueConstraint(
            "id_estudiante",
            "id_profesor_asignatura_grupo",
            "fecha",
            name="uq_asistencia_clase",
        ),
    )

    id_asistencia: Mapped[int] = mapped_column(primary_key=True)
    id_estudiante: Mapped[int] = mapped_column(
        ForeignKey("estudiante.id_estudiante"), nullable=False, index=True
    )
    id_grupo: Mapped[int] = mapped_column(
        ForeignKey("grupo.id_grupo"), nullable=False, index=True
    )
    # Clase a la que pertenece la asistencia. Nullable por compatibilidad con los
    # registros previos (por grupo); el grupo se deriva de esta asignacion.
    id_profesor_asignatura_grupo: Mapped[int | None] = mapped_column(
        ForeignKey("profesor_asignatura_grupo.id_profesor_asignatura_grupo"),
        nullable=True,
        index=True,
    )
    # Periodo lectivo al que corresponde la fecha (para el reporte por periodo).
    periodo: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    fecha: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    estado: Mapped[str] = mapped_column(String(20), nullable=False)
    observacion: Mapped[str] = mapped_column(String(255), nullable=True)

    estudiante: Mapped["Estudiante"] = relationship()
    grupo: Mapped["Grupo"] = relationship()
    asignacion: Mapped["ProfesorAsignaturaGrupo | None"] = relationship()
