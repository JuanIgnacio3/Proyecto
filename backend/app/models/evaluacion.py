from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Evaluacion(Base):
    __tablename__ = "evaluacion"

    id_evaluacion: Mapped[int] = mapped_column(primary_key=True)
    id_grupo: Mapped[int] = mapped_column(
        ForeignKey("grupo.id_grupo"), nullable=False, index=True
    )
    # Asignacion profesor+materia a la que pertenece la evaluacion (Fase 2). Es
    # nullable: las evaluaciones previas al remodelado solo tienen grupo. En las
    # nuevas, id_grupo se deriva de esta asignacion y queda igualmente poblado.
    id_profesor_asignatura_grupo: Mapped[int | None] = mapped_column(
        ForeignKey("profesor_asignatura_grupo.id_profesor_asignatura_grupo"),
        nullable=True,
        index=True,
    )
    name_evaluacion: Mapped[str] = mapped_column(String(100), nullable=False)
    # Rubro de la evaluacion: Examen | Tarea | Cotidiano.
    tipo: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=text("'Examen'")
    )
    periodo: Mapped[int] = mapped_column(Integer, nullable=False)
    porcentaje: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    fecha: Mapped[date | None] = mapped_column(Date, nullable=True)
    activo: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )

    grupo: Mapped["Grupo"] = relationship()
    asignacion: Mapped["ProfesorAsignaturaGrupo | None"] = relationship()
    notas: Mapped[list["Nota"]] = relationship(
        back_populates="evaluacion", cascade="all, delete-orphan"
    )
