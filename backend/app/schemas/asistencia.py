from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

EstadoAsistencia = Literal["Presente", "Ausente", "Tardia", "Justificado"]


class AsistenciaRegistroIn(BaseModel):
    id_estudiante: int
    estado: EstadoAsistencia
    observacion: str | None = Field(default=None, max_length=255)


class AsistenciaBatchIn(BaseModel):
    id_grupo: int
    fecha: date
    registros: list[AsistenciaRegistroIn]


class AsistenciaRosterItem(BaseModel):
    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str
    estado: EstadoAsistencia | None = None
    observacion: str | None = None


class AsistenciaRosterOut(BaseModel):
    id_grupo: int
    fecha: date
    registros: list[AsistenciaRosterItem]
