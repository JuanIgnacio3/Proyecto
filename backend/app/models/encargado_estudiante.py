from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class EncargadoEstudiante(Base):
    __tablename__ = "encargado_estudiante"
    __table_args__ = (
        UniqueConstraint("id_encargado", "id_estudiante", name="uq_encargado_estudiante"),
    )

    id_encargado_estudiante: Mapped[int] = mapped_column(primary_key=True)
    id_encargado: Mapped[int] = mapped_column(
        ForeignKey("encargado.id_encargado"), nullable=False, index=True
    )
    id_estudiante: Mapped[int] = mapped_column(
        ForeignKey("estudiante.id_estudiante"), nullable=False, index=True
    )

    encargado: Mapped["Encargado"] = relationship(back_populates="estudiantes_link")
    estudiante: Mapped["Estudiante"] = relationship()
