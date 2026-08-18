from pydantic import BaseModel, ConfigDict, Field

from app.schemas.asignatura import AsignaturaOut


class GrupoBase(BaseModel):
    name_grupo: str = Field(min_length=1, max_length=100)
    grado: str | None = Field(default=None, max_length=20)


class GrupoCreate(GrupoBase):
    # La materia ya no se asigna en el grupo (se hace por profesor). Se acepta
    # opcional solo por compatibilidad.
    id_asignatura: int | None = None


class GrupoUpdate(BaseModel):
    name_grupo: str | None = Field(default=None, min_length=1, max_length=100)
    grado: str | None = Field(default=None, max_length=20)
    id_asignatura: int | None = None
    activo: bool | None = None


class GrupoOut(GrupoBase):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    activo: bool
    id_asignatura: int | None = None
    asignatura: AsignaturaOut | None = None
