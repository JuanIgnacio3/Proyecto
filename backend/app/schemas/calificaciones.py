from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class GrupoMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    name_grupo: str


class EvaluacionBase(BaseModel):
    name_evaluacion: str = Field(min_length=1, max_length=100)
    periodo: int = Field(ge=1, le=3)
    porcentaje: float = Field(ge=0, le=100)
    fecha: date | None = None
    id_grupo: int


class EvaluacionCreate(EvaluacionBase):
    pass


class EvaluacionUpdate(BaseModel):
    name_evaluacion: str | None = Field(default=None, min_length=1, max_length=100)
    periodo: int | None = Field(default=None, ge=1, le=3)
    porcentaje: float | None = Field(default=None, ge=0, le=100)
    fecha: date | None = None
    id_grupo: int | None = None


class EvaluacionOut(EvaluacionBase):
    model_config = ConfigDict(from_attributes=True)

    id_evaluacion: int
    grupo: GrupoMini


class NotaRegistroIn(BaseModel):
    id_estudiante: int
    valor: float | None = Field(default=None, ge=0, le=100)


class NotasBatchIn(BaseModel):
    registros: list[NotaRegistroIn]


class NotaRosterItem(BaseModel):
    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str
    valor: float | None = None


class NotasRosterOut(BaseModel):
    id_evaluacion: int
    name_evaluacion: str
    registros: list[NotaRosterItem]
