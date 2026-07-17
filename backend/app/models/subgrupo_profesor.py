from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class SubGrupoProfesor(Base):
    __tablename__ = "subgrupo_profesor"
    __table_args__ = (UniqueConstraint("id_profesor", "id_subgrupo", name="uq_subgrupo_profesor"),)

    id_subgrupo_profesor: Mapped[int] = mapped_column(primary_key=True)
    id_profesor: Mapped[int] = mapped_column(ForeignKey("profesor.id_profesor"), nullable=False, index=True)
    id_subgrupo: Mapped[int] = mapped_column(ForeignKey("subgrupo.id_subgrupo"), nullable=False, index=True)

    profesor: Mapped["Profesor"] = relationship(back_populates="subgrupos")
    subgrupo: Mapped["SubGrupo"] = relationship(back_populates="profesores")
