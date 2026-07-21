from datetime import date

from sqlalchemy import Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Asistencia(Base):
    __tablename__ = "asistencia"
    __table_args__ = (
        UniqueConstraint("id_estudiante", "id_grupo", "fecha", name="uq_asistencia"),
    )

    id_asistencia: Mapped[int] = mapped_column(primary_key=True)
    id_estudiante: Mapped[int] = mapped_column(
        ForeignKey("estudiante.id_estudiante"), nullable=False, index=True
    )
    id_grupo: Mapped[int] = mapped_column(
        ForeignKey("grupo.id_grupo"), nullable=False, index=True
    )
    fecha: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    estado: Mapped[str] = mapped_column(String(20), nullable=False)
    observacion: Mapped[str] = mapped_column(String(255), nullable=True)

    estudiante: Mapped["Estudiante"] = relationship()
    grupo: Mapped["Grupo"] = relationship()
