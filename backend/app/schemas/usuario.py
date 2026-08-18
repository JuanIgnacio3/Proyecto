from pydantic import BaseModel, ConfigDict, EmailStr


class RolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_rol: int
    name_rol: str


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    correo_institucional: EmailStr
    activo: bool
    rol: RolOut


class UsuarioAdminOut(BaseModel):
    """Fila del modulo de gestion de usuarios: la cuenta + su persona asociada."""

    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    correo_institucional: EmailStr
    activo: bool
    rol: RolOut
    # Tipo de perfil ("Estudiante", "Profesor", "Encargado", "Administrativo" o
    # "Sistema" si la cuenta no tiene persona) y nombre para mostrar.
    tipo: str
    nombre_completo: str


class UsuarioAdminUpdate(BaseModel):
    """Cambios que un administrador puede hacer sobre una cuenta: rol y estado."""

    id_rol: int | None = None
    activo: bool | None = None
