from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.asistencia import Asistencia
from app.models.estudiante import Estudiante
from app.models.grupo import Grupo
from app.models.usuario import Usuario
from app.schemas.asistencia import AsistenciaBatchIn, AsistenciaRosterOut

router = APIRouter()


def _ensure_grupo(db: Session, id_grupo: int) -> None:
    if db.get(Grupo, id_grupo) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="El grupo indicado no existe"
        )


@router.get("/", response_model=AsistenciaRosterOut)
def get_roster(
    id_grupo: int,
    fecha: date,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> AsistenciaRosterOut:
    _ensure_grupo(db, id_grupo)

    estudiantes = (
        db.query(Estudiante)
        .filter(Estudiante.id_grupo == id_grupo)
        .order_by(Estudiante.name_estudiante, Estudiante.sec_name_estudiante)
        .all()
    )
    registros_previos = {
        a.id_estudiante: a
        for a in db.query(Asistencia)
        .filter(Asistencia.id_grupo == id_grupo, Asistencia.fecha == fecha)
        .all()
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

    return AsistenciaRosterOut(id_grupo=id_grupo, fecha=fecha, registros=registros)


@router.put("/", response_model=AsistenciaRosterOut)
def save_roster(
    payload: AsistenciaBatchIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_roles("Administrador", "Profesor")),
) -> AsistenciaRosterOut:
    _ensure_grupo(db, payload.id_grupo)

    estudiantes_validos = {
        e.id_estudiante
        for e in db.query(Estudiante.id_estudiante)
        .filter(Estudiante.id_grupo == payload.id_grupo)
        .all()
    }

    existentes = {
        a.id_estudiante: a
        for a in db.query(Asistencia)
        .filter(Asistencia.id_grupo == payload.id_grupo, Asistencia.fecha == payload.fecha)
        .all()
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
                    id_grupo=payload.id_grupo,
                    fecha=payload.fecha,
                    estado=registro.estado,
                    observacion=registro.observacion,
                )
            )
        else:
            actual.estado = registro.estado
            actual.observacion = registro.observacion

    db.commit()

    return get_roster(payload.id_grupo, payload.fecha, db=db, _=_)
