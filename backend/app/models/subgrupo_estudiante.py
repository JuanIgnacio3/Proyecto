from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class SubGrupoEstudiante(Base):
    __tablename__ = "subgrupo_estudiante"
    __table_args__ = (UniqueConstraint("id_estudiante", "id_subgrupo", name="uq_subgrupo_estudiante"),)

    id_subgrupo_estudiante: Mapped[int] = mapped_column(primary_key=True)
    id_estudiante: Mapped[int] = mapped_column(ForeignKey("estudiante.id_estudiante"), nullable=False, index=True)
    id_subgrupo: Mapped[int] = mapped_column(ForeignKey("subgrupo.id_subgrupo"), nullable=False, index=True)

    estudiante: Mapped["Estudiante"] = relationship(back_populates="subgrupos")
    subgrupo: Mapped["SubGrupo"] = relationship(back_populates="estudiantes")
