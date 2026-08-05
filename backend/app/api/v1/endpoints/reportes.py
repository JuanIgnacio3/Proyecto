from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api import authz
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.nota import Nota
from app.schemas.reportes import (
    AsistenciaReporte,
    ConteoEstado,
    EstudianteDisponible,
    NotaReporte,
    ReporteEstudiante,
)

router = APIRouter()


@router.get("/estudiantes-disponibles", response_model=list[EstudianteDisponible])
def estudiantes_disponibles(
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(authz.require(authz.Policy.STUDENT, roles=())),
) -> list[EstudianteDisponible]:
    query = ctx.scope_estudiantes(db.query(Estudiante))
    estudiantes = query.order_by(
        Estudiante.name_estudiante, Estudiante.sec_name_estudiante
    ).all()

    return [
        EstudianteDisponible(
            id_estudiante=e.id_estudiante,
            name_estudiante=e.name_estudiante,
            sec_name_estudiante=e.sec_name_estudiante,
            grupo=e.grupo.name_grupo if e.grupo else None,
        )
        for e in estudiantes
    ]


@router.get("/estudiante/{id_estudiante}", response_model=ReporteEstudiante)
def reporte_estudiante(
    id_estudiante: int,
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(authz.require(authz.Policy.STUDENT, roles=())),
) -> ReporteEstudiante:
    ctx.assert_estudiante(id_estudiante)

    estudiante = db.get(Estudiante, id_estudiante)
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
        )

    # Asistencia
    total_asistencia = (
        db.query(Asistencia).filter(Asistencia.id_estudiante == id_estudiante).count()
    )
    presentes = (
        db.query(Asistencia)
        .filter(
            Asistencia.id_estudiante == id_estudiante, Asistencia.estado == "Presente"
        )
        .count()
    )
    por_estado = [
        ConteoEstado(estado=estado, cantidad=cantidad)
        for estado, cantidad in (
            db.query(Asistencia.estado, func.count(Asistencia.id_asistencia))
            .filter(Asistencia.id_estudiante == id_estudiante)
            .group_by(Asistencia.estado)
            .all()
        )
    ]
    porcentaje = (
        round(presentes / total_asistencia * 100, 1) if total_asistencia else None
    )

    # Notas: evaluaciones del grupo del estudiante con su nota (o None)
    notas: list[NotaReporte] = []
    if estudiante.id_grupo is not None:
        filas = (
            db.query(Evaluacion, Nota.valor)
            .outerjoin(
                Nota,
                (Nota.id_evaluacion == Evaluacion.id_evaluacion)
                & (Nota.id_estudiante == id_estudiante),
            )
            .filter(Evaluacion.id_grupo == estudiante.id_grupo)
            .order_by(Evaluacion.periodo, Evaluacion.id_evaluacion)
            .all()
        )
        notas = [
            NotaReporte(
                id_evaluacion=ev.id_evaluacion,
                name_evaluacion=ev.name_evaluacion,
                periodo=ev.periodo,
                porcentaje=float(ev.porcentaje),
                fecha=ev.fecha,
                valor=float(valor) if valor is not None else None,
            )
            for ev, valor in filas
        ]

    return ReporteEstudiante(
        id_estudiante=estudiante.id_estudiante,
        name_estudiante=estudiante.name_estudiante,
        sec_name_estudiante=estudiante.sec_name_estudiante,
        grupo=estudiante.grupo.name_grupo if estudiante.grupo else None,
        asistencia=AsistenciaReporte(
            total_registros=total_asistencia,
            porcentaje_presente=porcentaje,
            por_estado=por_estado,
        ),
        notas=notas,
    )
