from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

TipoRubro = Literal["Examen", "Tarea", "Cotidiano"]


class GrupoMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    name_grupo: str


class ProfesorMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_profesor: int
    name_profesor: str
    sec_name_profesor: str


class AsignaturaMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_asignatura: int
    name_asignatura: str


class AsignacionMini(BaseModel):
    """Profesor + materia de la asignacion a la que pertenece la evaluacion."""

    model_config = ConfigDict(from_attributes=True)

    id_profesor_asignatura_grupo: int
    profesor: ProfesorMini
    asignatura: AsignaturaMini


class EvaluacionBase(BaseModel):
    name_evaluacion: str = Field(min_length=1, max_length=100)
    tipo: TipoRubro = "Examen"
    periodo: int = Field(ge=1, le=4)
    porcentaje: float = Field(ge=0, le=100)
    fecha: date | None = None


class EvaluacionCreate(EvaluacionBase):
    # Se acepta la asignacion (nuevo modelo) o el grupo directo (compatibilidad).
    # Si viene la asignacion, el grupo se deriva de ella en el endpoint.
    id_grupo: int | None = None
    id_profesor_asignatura_grupo: int | None = None

    @model_validator(mode="after")
    def _requiere_grupo_o_asignacion(self) -> "EvaluacionCreate":
        if self.id_grupo is None and self.id_profesor_asignatura_grupo is None:
            raise ValueError(
                "Se requiere id_grupo o id_profesor_asignatura_grupo"
            )
        return self


class EvaluacionUpdate(BaseModel):
    name_evaluacion: str | None = Field(default=None, min_length=1, max_length=100)
    tipo: TipoRubro | None = None
    periodo: int | None = Field(default=None, ge=1, le=4)
    porcentaje: float | None = Field(default=None, ge=0, le=100)
    fecha: date | None = None
    id_grupo: int | None = None
    id_profesor_asignatura_grupo: int | None = None
    activo: bool | None = None


class EvaluacionOut(EvaluacionBase):
    model_config = ConfigDict(from_attributes=True)

    id_evaluacion: int
    id_grupo: int
    activo: bool
    grupo: GrupoMini
    id_profesor_asignatura_grupo: int | None = None
    asignacion: AsignacionMini | None = None


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
