from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(primary_key=True)
    correo_institucional: Mapped[str] = mapped_column(String(150), nullable=False, unique=True, index=True)
    id_rol: Mapped[int] = mapped_column(ForeignKey("rol.id_rol"), nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    rol: Mapped["Rol"] = relationship(back_populates="usuarios")
    estudiante: Mapped["Estudiante | None"] = relationship(back_populates="usuario", uselist=False)
    profesor: Mapped["Profesor | None"] = relationship(back_populates="usuario", uselist=False)
