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


class ItemNota(BaseModel):
    """Una evaluacion con la nota del estudiante y su aporte a la nota final."""

    id_evaluacion: int
    name_evaluacion: str
    porcentaje: float
    fecha: date | None
    valor: float | None
    contribucion: float | None  # valor * porcentaje / 100


class RubroReporte(BaseModel):
    tipo: str  # Examen | Tarea | Cotidiano
    peso: float  # suma de los % de sus evaluaciones
    items: list[ItemNota]
    contribucion: float | None  # suma de los aportes de las evaluaciones calificadas


class AsistenciaRubro(BaseModel):
    peso: float  # % de la asistencia en la nota (porcentaje_asistencia de la clase)
    total_registros: int
    presentes: int  # registros que NO son "Ausente"
    porcentaje_presente: float | None  # nota de asistencia (0-100)
    contribucion: float | None
    por_estado: list[ConteoEstado]


class PeriodoReporte(BaseModel):
    periodo: int
    rubros: list[RubroReporte]
    asistencia: AsistenciaRubro
    peso_total: float  # suma de todos los pesos (rubros + asistencia)
    nota_periodo: float | None  # nota ponderada (aportes calificados + asistencia)


class MateriaReporte(BaseModel):
    id_clase: int  # id_profesor_asignatura_grupo
    materia: str
    profesor: str
    porcentaje_asistencia: float
    periodos: list[PeriodoReporte]
    nota_final: float | None  # promedio de las notas de los periodos calificados


class ReporteEstudiante(BaseModel):
    id_estudiante: int
    name_estudiante: str
    sec_name_estudiante: str
    grupo: str | None
    materias: list[MateriaReporte]
