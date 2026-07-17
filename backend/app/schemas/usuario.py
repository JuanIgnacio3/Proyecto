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
