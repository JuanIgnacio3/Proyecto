from pydantic import BaseModel, ConfigDict, Field


class ProfesorMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_profesor: int
    name_profesor: str
    sec_name_profesor: str


class AsignaturaMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_asignatura: int
    name_asignatura: str


class GrupoMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    name_grupo: str


class AsignacionCreate(BaseModel):
    id_profesor: int
    id_grupo: int
    id_asignatura: int
    porcentaje_asistencia: float = Field(default=0, ge=0, le=100)


class AsignacionUpdate(BaseModel):
    activo: bool | None = None
    porcentaje_asistencia: float | None = Field(default=None, ge=0, le=100)


class AsignacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_profesor_asignatura_grupo: int
    id_profesor: int
    id_grupo: int
    id_asignatura: int
    activo: bool
    porcentaje_asistencia: float
    profesor: ProfesorMini
    asignatura: AsignaturaMini
    grupo: GrupoMini
