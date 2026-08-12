from pydantic import BaseModel, ConfigDict, Field


class EspecialidadBase(BaseModel):
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: str = Field(min_length=1)
    nivel: str = Field(min_length=1, max_length=80)
    salida_laboral: str | None = None
    imagen: str | None = None
    es_publico: bool = False
    orden: int = 0


class EspecialidadCreate(EspecialidadBase):
    pass


class EspecialidadUpdate(BaseModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=120)
    descripcion: str | None = Field(default=None, min_length=1)
    nivel: str | None = Field(default=None, min_length=1, max_length=80)
    salida_laboral: str | None = None
    imagen: str | None = None
    es_publico: bool | None = None
    orden: int | None = None
    activo: bool | None = None


class EspecialidadOut(EspecialidadBase):
    model_config = ConfigDict(from_attributes=True)

    id_especialidad: int
    activo: bool
