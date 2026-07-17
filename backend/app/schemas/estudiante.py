from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.usuario import UsuarioOut


class EstudianteBase(BaseModel):
    name_estudiante: str = Field(min_length=1, max_length=100)
    sec_name_estudiante: str = Field(min_length=1, max_length=100)
    birthdate_estudiante: date
    direction_estudiante: str | None = Field(default=None, max_length=255)
    phone_num_estudiante: str | None = Field(default=None, max_length=20)
    id_tipo_documento: int
    num_documento_estudiante: str = Field(min_length=1, max_length=30)
    id_grupo: int | None = None


class EstudianteCreate(EstudianteBase):
    correo_institucional: EmailStr
    password: str = Field(min_length=8)


class EstudianteUpdate(BaseModel):
    name_estudiante: str | None = Field(default=None, min_length=1, max_length=100)
    sec_name_estudiante: str | None = Field(default=None, min_length=1, max_length=100)
    birthdate_estudiante: date | None = None
    direction_estudiante: str | None = Field(default=None, max_length=255)
    phone_num_estudiante: str | None = Field(default=None, max_length=20)
    id_tipo_documento: int | None = None
    num_documento_estudiante: str | None = Field(default=None, min_length=1, max_length=30)
    id_grupo: int | None = None


class EstudianteOut(EstudianteBase):
    model_config = ConfigDict(from_attributes=True)

    id_estudiante: int
    usuario: UsuarioOut
