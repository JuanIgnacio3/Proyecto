from pydantic import BaseModel, ConfigDict, Field

from app.schemas.asignatura import AsignaturaOut


class GrupoBase(BaseModel):
    name_grupo: str = Field(min_length=1, max_length=100)
    id_asignatura: int


class GrupoCreate(GrupoBase):
    pass


class GrupoUpdate(BaseModel):
    name_grupo: str | None = Field(default=None, min_length=1, max_length=100)
    id_asignatura: int | None = None


class GrupoOut(GrupoBase):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    asignatura: AsignaturaOut
