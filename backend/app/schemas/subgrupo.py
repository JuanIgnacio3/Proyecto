from pydantic import BaseModel, ConfigDict, Field


class GrupoMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    name_grupo: str


class ProfesorMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_profesor: int
    name_profesor: str
    sec_name_profesor: str


class EstudianteMini(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str


class SubGrupoBase(BaseModel):
    name_subgrupo: str = Field(min_length=1, max_length=100)
    tipo_subgrupo: str = Field(min_length=1, max_length=50)
    id_grupo: int


class SubGrupoCreate(SubGrupoBase):
    profesores_ids: list[int] = Field(default_factory=list)
    estudiantes_ids: list[int] = Field(default_factory=list)


class SubGrupoUpdate(BaseModel):
    name_subgrupo: str | None = Field(default=None, min_length=1, max_length=100)
    tipo_subgrupo: str | None = Field(default=None, min_length=1, max_length=50)
    id_grupo: int | None = None
    profesores_ids: list[int] | None = None
    estudiantes_ids: list[int] | None = None


class SubGrupoOut(SubGrupoBase):
    id_subgrupo: int
    grupo: GrupoMini
    profesores: list[ProfesorMini]
    estudiantes: list[EstudianteMini]
