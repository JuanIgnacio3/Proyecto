from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Audiencia = Literal["Todos", "Estudiantes", "Profesores", "Encargados"]


class CategoriaPublica(str, Enum):
    """Categorias controladas para comunicados publicados en el sitio web.

    Valores fijos (no strings libres). En BD se almacena el valor (String);
    la validacion vive aqui.
    """

    INSTITUCIONAL = "Institucional"
    ACADEMICO = "Académico"
    ADMISION = "Admisión"
    EVENTOS = "Eventos"
    LOGROS = "Logros"


class ComunicadoBase(BaseModel):
    # use_enum_values: los enums se guardan/serializan como su valor (String),
    # de modo que el CRUD generico existente sigue funcionando sin cambios.
    model_config = ConfigDict(use_enum_values=True)

    titulo: str = Field(min_length=1, max_length=150)
    cuerpo: str = Field(min_length=1)
    dirigido_a: Audiencia
    es_publico: bool = False
    categoria: CategoriaPublica | None = None


class ComunicadoCreate(ComunicadoBase):
    pass


class ComunicadoUpdate(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    titulo: str | None = Field(default=None, min_length=1, max_length=150)
    cuerpo: str | None = Field(default=None, min_length=1)
    dirigido_a: Audiencia | None = None
    es_publico: bool | None = None
    categoria: CategoriaPublica | None = None
    activo: bool | None = None


class ComunicadoOut(ComunicadoBase):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id_comunicado: int
    fecha_publicacion: datetime
    id_autor: int
    autor_correo: str
    activo: bool
