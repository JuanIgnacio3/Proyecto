from sqlalchemy import Boolean, ForeignKey, Numeric, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class ProfesorAsignaturaGrupo(Base):
    """Asignacion de un profesor a un grupo para impartir una asignatura.

    Permite que un grupo tenga varios profesores (cada uno con su materia) y que
    un profesor imparta en varios grupos. Es la base del remodelado de grupos:
    a futuro reemplaza la materia fija en ``Grupo`` y el vinculo directo
    ``Profesor.id_grupo``. En esta fase convive con ambos sin romperlos.
    """

    __tablename__ = "profesor_asignatura_grupo"
    __table_args__ = (
        UniqueConstraint(
            "id_profesor",
            "id_grupo",
            "id_asignatura",
            name="uq_profesor_asignatura_grupo",
        ),
    )

    id_profesor_asignatura_grupo: Mapped[int] = mapped_column(primary_key=True)
    id_profesor: Mapped[int] = mapped_column(
        ForeignKey("profesor.id_profesor"), nullable=False, index=True
    )
    id_grupo: Mapped[int] = mapped_column(
        ForeignKey("grupo.id_grupo"), nullable=False, index=True
    )
    id_asignatura: Mapped[int] = mapped_column(
        ForeignKey("asignatura.id_asignatura"), nullable=False, index=True
    )
    activo: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )
    # Peso (%) de la asistencia en la nota de esta clase; el resto lo cubren las
    # evaluaciones. Todos los rubros deberian sumar 100 por periodo.
    porcentaje_asistencia: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False, default=0, server_default=text("0")
    )

    profesor: Mapped["Profesor"] = relationship()
    grupo: Mapped["Grupo"] = relationship()
    asignatura: Mapped["Asignatura"] = relationship()
