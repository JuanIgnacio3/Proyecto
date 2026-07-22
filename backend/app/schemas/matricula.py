from pydantic import BaseModel, Field


class EstudianteMatricula(BaseModel):
    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str
    num_documento_estudiante: str
    id_grupo: int | None
    grupo: str | None


class MatriculaUpdate(BaseModel):
    id_grupo: int | None = None


class MatriculaMasiva(BaseModel):
    id_grupo: int
    estudiantes_ids: list[int] = Field(min_length=1)
