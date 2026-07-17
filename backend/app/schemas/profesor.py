from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.usuario import UsuarioOut


class ProfesorBase(BaseModel):
    name_profesor: str = Field(min_length=1, max_length=100)
    sec_name_profesor: str = Field(min_length=1, max_length=100)
    birthdate_profesor: date
    direction_profesor: str | None = Field(default=None, max_length=255)
    phone_num_profesor: str | None = Field(default=None, max_length=20)
    id_tipo_documento: int
    num_documento_profesor: str = Field(min_length=1, max_length=30)
    id_grupo: int | None = None


class ProfesorCreate(ProfesorBase):
    correo_institucional: EmailStr
    password: str = Field(min_length=8)


class ProfesorUpdate(BaseModel):
    name_profesor: str | None = Field(default=None, min_length=1, max_length=100)
    sec_name_profesor: str | None = Field(default=None, min_length=1, max_length=100)
    birthdate_profesor: date | None = None
    direction_profesor: str | None = Field(default=None, max_length=255)
    phone_num_profesor: str | None = Field(default=None, max_length=20)
    id_tipo_documento: int | None = None
    num_documento_profesor: str | None = Field(default=None, min_length=1, max_length=30)
    id_grupo: int | None = None


class ProfesorOut(ProfesorBase):
    model_config = ConfigDict(from_attributes=True)

    id_profesor: int
    usuario: UsuarioOut
