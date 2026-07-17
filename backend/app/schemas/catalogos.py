from pydantic import BaseModel, ConfigDict


class TipoDocumentoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_tipo_documento: int
    name_tipo_documento: str


class GrupoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_grupo: int
    name_grupo: str
    id_asignatura: int
