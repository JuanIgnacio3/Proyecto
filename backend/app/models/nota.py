from sqlalchemy import ForeignKey, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Nota(Base):
    __tablename__ = "nota"
    __table_args__ = (
        UniqueConstraint("id_evaluacion", "id_estudiante", name="uq_nota"),
    )

    id_nota: Mapped[int] = mapped_column(primary_key=True)
    id_evaluacion: Mapped[int] = mapped_column(
        ForeignKey("evaluacion.id_evaluacion"), nullable=False, index=True
    )
    id_estudiante: Mapped[int] = mapped_column(
        ForeignKey("estudiante.id_estudiante"), nullable=False, index=True
    )
    valor: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)

    evaluacion: Mapped["Evaluacion"] = relationship(back_populates="notas")
    estudiante: Mapped["Estudiante"] = relationship()
