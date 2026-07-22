from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Comunicado(Base):
    __tablename__ = "comunicado"

    id_comunicado: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    cuerpo: Mapped[str] = mapped_column(Text, nullable=False)
    dirigido_a: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    fecha_publicacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
    id_autor: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario"), nullable=False, index=True
    )

    autor: Mapped["Usuario"] = relationship()
