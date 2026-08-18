from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import authz
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.estudiante import Estudiante
from app.models.profesor_asignatura_grupo import ProfesorAsignaturaGrupo
from app.models.usuario import Usuario
from app.schemas.asistencia import AsistenciaBatchIn, AsistenciaRosterOut

router = APIRouter()


def _grupo_de_clase(db: Session, id_clase: int) -> int:
    """Valida la clase (asignacion profesor+materia+grupo) y devuelve su grupo."""
    asignacion = db.get(ProfesorAsignaturaGrupo, id_clase)
    if asignacion is None or not asignacion.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La clase indicada no existe o esta inactiva",
        )
    return asignacion.id_grupo


def _estudiantes_activos(db: Session, id_grupo: int):
    return (
        db.query(Estudiante)
        .filter(
            Estudiante.id_grupo == id_grupo,
            Estudiante.usuario.has(Usuario.activo.is_(True)),
        )
        .order_by(Estudiante.name_estudiante, Estudiante.sec_name_estudiante)
    )


@router.get("/", response_model=AsistenciaRosterOut)
def get_roster(
    id_profesor_asignatura_grupo: int,
    periodo: int,
    fecha: date,
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(
        authz.require(authz.Policy.GROUP, roles=("Administrador", "Profesor"))
    ),
) -> AsistenciaRosterOut:
    id_grupo = _grupo_de_clase(db, id_profesor_asignatura_grupo)
    ctx.assert_grupo(id_grupo)

    estudiantes = _estudiantes_activos(db, id_grupo).all()
    registros_previos = {
        a.id_estudiante: a
        for a in db.query(Asistencia).filter(
            Asistencia.id_profesor_asignatura_grupo == id_profesor_asignatura_grupo,
            Asistencia.fecha == fecha,
        )
    }

    registros = []
    for est in estudiantes:
        previo = registros_previos.get(est.id_estudiante)
        registros.append(
            {
                "id_estudiante": est.id_estudiante,
                "name_estudiante": est.name_estudiante,
                "sec_name_estudiante": est.sec_name_estudiante,
                "estado": previo.estado if previo else None,
                "observacion": previo.observacion if previo else None,
            }
        )

    return AsistenciaRosterOut(
        id_grupo=id_grupo,
        id_profesor_asignatura_grupo=id_profesor_asignatura_grupo,
        periodo=periodo,
        fecha=fecha,
        registros=registros,
    )


@router.put("/", response_model=AsistenciaRosterOut)
def save_roster(
    payload: AsistenciaBatchIn,
    db: Session = Depends(get_db),
    ctx: authz.AuthzContext = Depends(
        authz.require(authz.Policy.GROUP, roles=("Administrador", "Profesor"))
    ),
) -> AsistenciaRosterOut:
    id_clase = payload.id_profesor_asignatura_grupo
    id_grupo = _grupo_de_clase(db, id_clase)
    ctx.assert_grupo(id_grupo)

    estudiantes_validos = {e.id_estudiante for e in _estudiantes_activos(db, id_grupo).all()}
    existentes = {
        a.id_estudiante: a
        for a in db.query(Asistencia).filter(
            Asistencia.id_profesor_asignatura_grupo == id_clase,
            Asistencia.fecha == payload.fecha,
        )
    }

    for registro in payload.registros:
        if registro.id_estudiante not in estudiantes_validos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El estudiante {registro.id_estudiante} no pertenece a este grupo",
            )
        actual = existentes.get(registro.id_estudiante)
        if actual is None:
            db.add(
                Asistencia(
                    id_estudiante=registro.id_estudiante,
                    id_grupo=id_grupo,
                    id_profesor_asignatura_grupo=id_clase,
                    periodo=payload.periodo,
                    fecha=payload.fecha,
                    estado=registro.estado,
                    observacion=registro.observacion,
                )
            )
        else:
            actual.periodo = payload.periodo
            actual.estado = registro.estado
            actual.observacion = registro.observacion

    db.commit()

    return get_roster(id_clase, payload.periodo, payload.fecha, db=db, ctx=ctx)
