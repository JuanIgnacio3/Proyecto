from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Asignatura(Base):
    __tablename__ = "asignatura"

    id_asignatura: Mapped[int] = mapped_column(primary_key=True)
    name_asignatura: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    grupos: Mapped[list["Grupo"]] = relationship(back_populates="asignatura")
