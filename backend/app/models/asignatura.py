from sqlalchemy import Boolean, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Asignatura(Base):
    __tablename__ = "asignatura"

    id_asignatura: Mapped[int] = mapped_column(primary_key=True)
    name_asignatura: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    activo: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default=text("true")
    )

    grupos: Mapped[list["Grupo"]] = relationship(back_populates="asignatura")
