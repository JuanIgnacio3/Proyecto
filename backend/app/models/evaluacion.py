from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Evaluacion(Base):
    __tablename__ = "evaluacion"

    id_evaluacion: Mapped[int] = mapped_column(primary_key=True)
    id_grupo: Mapped[int] = mapped_column(
        ForeignKey("grupo.id_grupo"), nullable=False, index=True
    )
    name_evaluacion: Mapped[str] = mapped_column(String(100), nullable=False)
    periodo: Mapped[int] = mapped_column(Integer, nullable=False)
    porcentaje: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    fecha: Mapped[date | None] = mapped_column(Date, nullable=True)

    grupo: Mapped["Grupo"] = relationship()
    notas: Mapped[list["Nota"]] = relationship(
        back_populates="evaluacion", cascade="all, delete-orphan"
    )
