from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.encargado import Encargado
from app.models.encargado_estudiante import EncargadoEstudiante
from app.models.estudiante import Estudiante
from app.models.evaluacion import Evaluacion
from app.models.nota import Nota
from app.models.usuario import Usuario
from app.schemas.reportes import (
    AsistenciaReporte,
    ConteoEstado,
    EstudianteDisponible,
    NotaReporte,
    ReporteEstudiante,
)

router = APIRouter()

ROLES_STAFF = {"Administrador", "Profesor"}


def _ids_permitidos(db: Session, current_user: Usuario) -> set[int] | None:
    """Devuelve el conjunto de id_estudiante que el usuario puede ver.

    None significa "todos" (Administrador/Profesor). Un Encargado ve a los
    estudiantes vinculados a el; un Estudiante ve solo su propio reporte.
    """
    if current_user.rol.name_rol in ROLES_STAFF:
        return None

    encargado = (
        db.query(Encargado).filter(Encargado.id_usuario == current_user.id_usuario).first()
    )
    if encargado is not None:
        return {
            link.id_estudiante
            for link in db.query(EncargadoEstudiante.id_estudiante).filter(
                EncargadoEstudiante.id_encargado == encargado.id_encargado
            )
        }

    estudiante = (
        db.query(Estudiante)
        .filter(Estudiante.id_usuario == current_user.id_usuario)
        .first()
    )
    if estudiante is not None:
        return {estudiante.id_estudiante}

    return set()


@router.get("/estudiantes-disponibles", response_model=list[EstudianteDisponible])
def estudiantes_disponibles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
) -> list[EstudianteDisponible]:
    permitidos = _ids_permitidos(db, current_user)

    query = db.query(Estudiante)
    if permitidos is not None:
        if not permitidos:
            return []
        query = query.filter(Estudiante.id_estudiante.in_(permitidos))

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
    current_user: Usuario = Depends(get_current_user),
) -> ReporteEstudiante:
    permitidos = _ids_permitidos(db, current_user)
    if permitidos is not None and id_estudiante not in permitidos:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permiso para ver el reporte de este estudiante",
        )

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
