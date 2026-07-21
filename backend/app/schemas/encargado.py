from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.usuario import UsuarioOut


class EstudianteMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str


class EncargadoBase(BaseModel):
    name_encargado: str = Field(min_length=1, max_length=100)
    sec_name_encargado: str = Field(min_length=1, max_length=100)
    id_tipo_documento: int
    num_documento_encargado: str = Field(min_length=1, max_length=30)
    phone_num_encargado: str | None = Field(default=None, max_length=20)
    direction_encargado: str | None = Field(default=None, max_length=255)
    parentesco: str = Field(min_length=1, max_length=50)


class EncargadoCreate(EncargadoBase):
    correo_institucional: EmailStr
    password: str = Field(min_length=8)
    estudiantes_ids: list[int] = Field(default_factory=list)


class EncargadoUpdate(BaseModel):
    name_encargado: str | None = Field(default=None, min_length=1, max_length=100)
    sec_name_encargado: str | None = Field(default=None, min_length=1, max_length=100)
    id_tipo_documento: int | None = None
    num_documento_encargado: str | None = Field(default=None, min_length=1, max_length=30)
    phone_num_encargado: str | None = Field(default=None, max_length=20)
    direction_encargado: str | None = Field(default=None, max_length=255)
    parentesco: str | None = Field(default=None, min_length=1, max_length=50)
    estudiantes_ids: list[int] | None = None


class EncargadoOut(EncargadoBase):
    model_config = ConfigDict(from_attributes=True)

    id_encargado: int
    usuario: UsuarioOut
    estudiantes: list[EstudianteMini]
