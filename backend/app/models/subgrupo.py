from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class SubGrupo(Base):
    __tablename__ = "subgrupo"

    id_subgrupo: Mapped[int] = mapped_column(primary_key=True)
    name_subgrupo: Mapped[str] = mapped_column(String(100), nullable=False)
    tipo_subgrupo: Mapped[str] = mapped_column(String(50), nullable=False)
    id_grupo: Mapped[int] = mapped_column(ForeignKey("grupo.id_grupo"), nullable=False, index=True)

    grupo: Mapped["Grupo"] = relationship(back_populates="subgrupos")
    profesores: Mapped[list["SubGrupoProfesor"]] = relationship(
        back_populates="subgrupo", cascade="all, delete-orphan"
    )
    estudiantes: Mapped[list["SubGrupoEstudiante"]] = relationship(
        back_populates="subgrupo", cascade="all, delete-orphan"
    )
