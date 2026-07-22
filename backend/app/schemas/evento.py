from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

TipoEvento = Literal[
    "Reunion", "Evaluacion", "Actividad", "Feriado", "Entrega", "Otro"
]


class EventoBase(BaseModel):
    titulo: str = Field(min_length=1, max_length=150)
    descripcion: str | None = None
    fecha_inicio: date
    fecha_fin: date | None = None
    tipo: TipoEvento

    @model_validator(mode="after")
    def _validar_fechas(self) -> "EventoBase":
        if self.fecha_fin is not None and self.fecha_fin < self.fecha_inicio:
            raise ValueError("La fecha de fin no puede ser anterior a la de inicio")
        return self


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    tipo: TipoEvento | None = None


class EventoOut(EventoBase):
    model_config = ConfigDict(from_attributes=True)

    id_evento: int
