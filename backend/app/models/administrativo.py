from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Administrativo(Base):
    __tablename__ = "administrativo"

    id_administrativo: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario"), nullable=False, unique=True, index=True
    )
    name_administrativo: Mapped[str] = mapped_column(String(100), nullable=False)
    sec_name_administrativo: Mapped[str] = mapped_column(String(100), nullable=False)
    id_tipo_documento: Mapped[int] = mapped_column(
        ForeignKey("tipo_documento.id_tipo_documento"), nullable=False, index=True
    )
    num_documento_administrativo: Mapped[str] = mapped_column(
        String(30), nullable=False, unique=True
    )
    phone_num_administrativo: Mapped[str] = mapped_column(String(20), nullable=True)
    direction_administrativo: Mapped[str] = mapped_column(String(255), nullable=True)
    cargo: Mapped[str] = mapped_column(String(100), nullable=False)

    usuario: Mapped["Usuario"] = relationship()
    tipo_documento: Mapped["TipoDocumento"] = relationship()
