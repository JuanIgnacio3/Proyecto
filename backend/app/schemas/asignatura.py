from pydantic import BaseModel, ConfigDict, Field


class AsignaturaBase(BaseModel):
    name_asignatura: str = Field(min_length=1, max_length=100)


class AsignaturaCreate(AsignaturaBase):
    pass


class AsignaturaUpdate(BaseModel):
    name_asignatura: str | None = Field(default=None, min_length=1, max_length=100)


class AsignaturaOut(AsignaturaBase):
    model_config = ConfigDict(from_attributes=True)

    id_asignatura: int
