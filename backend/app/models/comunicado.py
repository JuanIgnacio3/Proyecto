from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, text
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
    # Visibilidad en el sitio publico (opt-in). Por defecto FALSE: ningun
    # comunicado se hace publico automaticamente. Distinto de `dirigido_a`
    # (audiencia interna por rol).
    es_publico: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    # Categoria publica (valores controlados por el enum CategoriaPublica en
    # los schemas). Nullable: solo aplica a comunicados publicos.
    categoria: Mapped[str | None] = mapped_column(String(20), nullable=True)

    autor: Mapped["Usuario"] = relationship()
