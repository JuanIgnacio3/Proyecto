from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.asignatura import Asignatura
from app.models.asistencia import Asistencia
from app.models.encargado import Encargado
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.grupo import Grupo
from app.models.nota import Nota
from app.models.profesor import Profesor
from app.models.subgrupo import SubGrupo
from app.models.usuario import Usuario
from app.schemas.stats import (
    AsistenciaResumen,
    ConteoItem,
    DashboardStats,
)

router = APIRouter()


def _count_activos(db: Session, model) -> int:
    return (
        db.query(model)
        .join(Usuario, model.id_usuario == Usuario.id_usuario)
        .filter(Usuario.activo.is_(True))
        .count()
    )


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
) -> DashboardStats:
    total_asistencia = db.query(Asistencia).count()
    presentes = db.query(Asistencia).filter(Asistencia.estado == "Presente").count()
    porcentaje = round(presentes / total_asistencia * 100, 1) if total_asistencia else None

    distribucion = [
        ConteoItem(etiqueta=estado, cantidad=cantidad)
        for estado, cantidad in (
            db.query(Asistencia.estado, func.count(Asistencia.id_asistencia))
            .group_by(Asistencia.estado)
            .all()
        )
    ]

    por_grupo = [
        ConteoItem(etiqueta=nombre, cantidad=cantidad)
        for nombre, cantidad in (
            db.query(Grupo.name_grupo, func.count(Estudiante.id_estudiante))
            .join(Estudiante, Estudiante.id_grupo == Grupo.id_grupo)
            .group_by(Grupo.id_grupo, Grupo.name_grupo)
            .order_by(Grupo.name_grupo)
            .all()
        )
    ]

    promedio = db.query(func.avg(Nota.valor)).scalar()

    return DashboardStats(
        estudiantes_activos=_count_activos(db, Estudiante),
        profesores_activos=_count_activos(db, Profesor),
        encargados_activos=_count_activos(db, Encargado),
        grupos=db.query(Grupo).count(),
        materias=db.query(Asignatura).count(),
        subgrupos=db.query(SubGrupo).count(),
        evaluaciones=db.query(Evaluacion).count(),
        promedio_general_notas=round(float(promedio), 1) if promedio is not None else None,
        asistencia=AsistenciaResumen(
            total_registros=total_asistencia,
            presentes=presentes,
            porcentaje_presente=porcentaje,
        ),
        distribucion_asistencia=distribucion,
        estudiantes_por_grupo=por_grupo,
    )
