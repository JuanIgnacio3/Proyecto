from pydantic import BaseModel


class ConteoItem(BaseModel):
    etiqueta: str
    cantidad: int


class AsistenciaResumen(BaseModel):
    total_registros: int
    presentes: int
    porcentaje_presente: float | None


class DashboardStats(BaseModel):
    estudiantes_activos: int
    profesores_activos: int
    encargados_activos: int
    grupos: int
    materias: int
    subgrupos: int
    evaluaciones: int
    promedio_general_notas: float | None
    asistencia: AsistenciaResumen
    distribucion_asistencia: list[ConteoItem]
    estudiantes_por_grupo: list[ConteoItem]
