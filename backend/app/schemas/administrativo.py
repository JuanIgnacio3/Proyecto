from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.usuario import UsuarioOut


class AdministrativoBase(BaseModel):
    name_administrativo: str = Field(min_length=1, max_length=100)
    sec_name_administrativo: str = Field(min_length=1, max_length=100)
    id_tipo_documento: int
    num_documento_administrativo: str = Field(min_length=1, max_length=30)
    phone_num_administrativo: str | None = Field(default=None, max_length=20)
    direction_administrativo: str | None = Field(default=None, max_length=255)
    cargo: str = Field(min_length=1, max_length=100)


class AdministrativoCreate(AdministrativoBase):
    correo_institucional: EmailStr
    password: str = Field(min_length=8)


class AdministrativoUpdate(BaseModel):
    name_administrativo: str | None = Field(default=None, min_length=1, max_length=100)
    sec_name_administrativo: str | None = Field(default=None, min_length=1, max_length=100)
    id_tipo_documento: int | None = None
    num_documento_administrativo: str | None = Field(default=None, min_length=1, max_length=30)
    phone_num_administrativo: str | None = Field(default=None, max_length=20)
    direction_administrativo: str | None = Field(default=None, max_length=255)
    cargo: str | None = Field(default=None, min_length=1, max_length=100)


class AdministrativoOut(AdministrativoBase):
    model_config = ConfigDict(from_attributes=True)

    id_administrativo: int
    usuario: UsuarioOut
