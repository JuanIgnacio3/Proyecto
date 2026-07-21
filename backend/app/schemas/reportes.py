from datetime import date

from pydantic import BaseModel


class EstudianteDisponible(BaseModel):
    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str
    grupo: str | None = None


class ConteoEstado(BaseModel):
    estado: str
    cantidad: int


class AsistenciaReporte(BaseModel):
    total_registros: int
    porcentaje_presente: float | None
    por_estado: list[ConteoEstado]


class NotaReporte(BaseModel):
    id_evaluacion: int
    name_evaluacion: str
    periodo: int
    porcentaje: float
    fecha: date | None
    valor: float | None


class ReporteEstudiante(BaseModel):
    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str
    grupo: str | None
    asistencia: AsistenciaReporte
    notas: list[NotaReporte]
