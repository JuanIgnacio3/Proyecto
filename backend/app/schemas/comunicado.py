from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Audiencia = Literal["Todos", "Estudiantes", "Profesores", "Encargados"]


class ComunicadoBase(BaseModel):
    titulo: str = Field(min_length=1, max_length=150)
    cuerpo: str = Field(min_length=1)
    dirigido_a: Audiencia


class ComunicadoCreate(ComunicadoBase):
    pass


class ComunicadoUpdate(BaseModel):
    titulo: str | None = Field(default=None, min_length=1, max_length=150)
    cuerpo: str | None = Field(default=None, min_length=1)
    dirigido_a: Audiencia | None = None


class ComunicadoOut(ComunicadoBase):
    model_config = ConfigDict(from_attributes=True)

    id_comunicado: int
    fecha_publicacion: datetime
    id_autor: int
    autor_correo: str
