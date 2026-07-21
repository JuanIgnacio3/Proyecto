from sqlalchemy import ForeignKey, String
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Encargado(Base):
    __tablename__ = "encargado"

    id_encargado: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario"), nullable=False, unique=True, index=True
    )
    name_encargado: Mapped[str] = mapped_column(String(100), nullable=False)
    sec_name_encargado: Mapped[str] = mapped_column(String(100), nullable=False)
    id_tipo_documento: Mapped[int] = mapped_column(
        ForeignKey("tipo_documento.id_tipo_documento"), nullable=False, index=True
    )
    num_documento_encargado: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    phone_num_encargado: Mapped[str] = mapped_column(String(20), nullable=True)
    direction_encargado: Mapped[str] = mapped_column(String(255), nullable=True)
    parentesco: Mapped[str] = mapped_column(String(50), nullable=False)

    usuario: Mapped["Usuario"] = relationship()
    tipo_documento: Mapped["TipoDocumento"] = relationship()
    estudiantes_link: Mapped[list["EncargadoEstudiante"]] = relationship(
        back_populates="encargado", cascade="all, delete-orphan"
    )
    estudiantes: AssociationProxy[list["Estudiante"]] = association_proxy(
        "estudiantes_link", "estudiante"
    )
